const Application = require("../Core/Configuration/Application");
const fs = require("fs");
const path = require("path");

/**
 *
 * @param {Application} app
 */
function Build(app, imagetag, releaseMode, configRootPath) {
  var output = [];
  const appName = app.name + "-" + releaseMode;
  app.publishedName = appName;
  const labels = {
    app: appName,
    release: releaseMode,
  };
  var _volumes = {volumes: []};
  var _volumeMounts = {volumeMounts: []};
  if (Array.isArray(app.configs) && app.configs.length > 0) {
    for (var config of app.configs) {
      var fname = path.parse(config).base;
      var configName = appName + "-" + fname.replace(/\./g, "");
      configName = configName.toLowerCase();
      var configBody = fs.readFileSync(
        path.join(configRootPath, config),
        "utf-8"
      );
      _volumes.volumes.push({
        configMap: { defaultMode: 511, name: configName },
        name: configName,
      });
      var configPath = config;
      if (app.configpath) {
        configPath = path.join(app.configpath, fname);
      }
      _volumeMounts.volumeMounts.push({
        mountPath: configPath,
        subPath: fname,
        name: configName,
      });
      var _data = {};
      _data[fname] = configBody;
      output.push({
        apiVersion: "v1",
        kind: "ConfigMap",
        metadata: {
          name: configName,
        },
        data: _data,
      });
    }
  }

  function GetCPUResource(v) {
    switch (v.toLowerCase()) {
      case "lowest":
        return "100m";
      case "low":
        return "250m";
      case "normal":
        return "500m";
      case "high":
        return "750m";
      case "highest":
        return "1000m";
      default:
        return "100m";
    }
  }
  function GetMemoryResource(v) {
    switch (v.toLowerCase()) {
      case "lowest":
        return "128Mi";
      case "low":
        return "256Mi";
      case "normal":
        return "512Mi";
      case "high":
        return "800Mi";
      case "highest":
        return "1200Mi";
      default:
        return "128Mi";
    }
  }
  // ? Storage
  if (app.storage && Array.isArray(app.storage)) {
    for (var storage of app.storage) {
      var storageName = storage.name;
      storageName = storageName.toLowerCase();
      _volumes.volumes.push({
        name: storageName,
        persistentVolumeClaim: { claimName: app.name + "-" + storage.name + "-pvc" },
      });
      _volumeMounts.volumeMounts.push({
        mountPath: storage.mount,
        name: storageName,
      });
    }
  }
  var deploymentResources = null;

  if (app.performance) {
    deploymentResources = {};
    if (
      (app.performance.cpu && app.performance.cpu.limit) ||
      (app.performance.memory && app.performance.memory.limit)
    )
      deploymentResources.limits = {};
    if (
      (app.performance.cpu && app.performance.cpu.request) ||
      (app.performance.memory && app.performance.memory.request)
    )
      deploymentResources.requests = {};

    if (app.performance.cpu && app.performance.cpu.limit)
      deploymentResources.limits.cpu = GetCPUResource(
        app.performance.cpu.limit
      );
    if (app.performance.memory && app.performance.memory.limit)
      deploymentResources.limits.memory = GetMemoryResource(
        app.performance.memory.limit
      );

    if (app.performance.cpu && app.performance.cpu.request)
      deploymentResources.requests.cpu = GetCPUResource(
        app.performance.cpu.request
      );
    if (app.performance.memory && app.performance.memory.request)
      deploymentResources.requests.memory = GetMemoryResource(
        app.performance.memory.request
      );
  }
  var publishKind = "Deployment";
  var publishVersion = "apps/v1";
  if (app.mode && app.mode.toLowerCase() === "daemonset") {
    publishKind = "DaemonSet";
    publishVersion = "apps/v1";
  }
  var strategyName =
    publishKind === "DaemonSet" ? "updateStrategy" : "strategy";
  var canAddReplicas = publishKind === "Deployment";

  var dep = {
    apiVersion: "apps/v1",
    kind: publishKind,
    metadata: {
      name: appName,
      labels: {
        ...labels,
        buildtime: "ISO_" + new Date().toISOString().replace(/[\:\.\-]/g, "_"),
      },
    },
    spec: {
      ...(canAddReplicas
        ? { replicas: (app.deployment && app.deployment.initialpod) || 1 }
        : {}),
      [strategyName]: {
        type: "RollingUpdate",
        rollingUpdate: {
          maxSurge: "100%",
          maxUnavailable: "75%",
        },
      },
      selector: {
        matchLabels: labels,
      },
      ...(app.strategy
        ? {
            [strategyName]: app.strategy,
          }
        : {
            [strategyName]: {
              type: "RollingUpdate",
              rollingUpdate: {
                maxSurge: "100%",
                maxUnavailable: "10%",
              },
            },
          }),
      template: {
        metadata: {
          labels: labels,
        },
        spec: {
          securityContext: {
            runAsNonRoot: false,
            runAsUser: 0,
          },
          ...(app.nodeName != null &&
          app.nodeName != undefined &&
          app.nodeName.length > 0
            ? { nodeName: app.nodeName }
            : {}),
          ...(_volumes || {}),
          ...({ dnsConfig: app.dns } || {}),
          restartPolicy: "Always",
          containers: [
            {
              name: app.name,
              image: imagetag,
              imagePullPolicy: "Always",
              ...(_volumeMounts || {}),
              ...(Array.isArray(app.endPoints) && {
                ports: app.endPoints.map((p) => ({
                  containerPort: p.in,
                  name:
                    p.name ||
                    (p.in == 80 ? "HTTP" : p.in == 443 ? "HTTPS" : "TCP"),
                  protocol: p.name.toUpperCase() == "UDP" ? "UDP" : "TCP",
                })),
              }),
              ...(app.health
                ? {
                    livenessProbe: {
                      httpGet: {
                        path: app.health.path,
                        port: app.health.port,
                      },
                      initialDelaySeconds: app.health.initial,
                      periodSeconds: app.health.period,
                    },
                    readinessProbe: {
                      httpGet: {
                        path: app.health.path,
                        port: app.health.port,
                      },
                      initialDelaySeconds: app.health.initial,
                      periodSeconds: app.health.period,
                    },
                  }
                : {}),
              resources: deploymentResources,
              env: (app.env || []).filter((p) => p.name.trim().length > 0),
            },
          ],
        },
      },
    },
  };
  output.push(dep);
  return output;
}

module.exports = Build;
