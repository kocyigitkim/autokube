const cmd = require("../CommandLineHost");
const yaml = require("yaml");
const fs = require("fs");
const path = require("path");
const uuid = require("uuid").v4;

class KubernetesCLI {
  static async Run(query, onstdout, disableout = false) {
    var _cmd = new cmd("kubectl", query, null, disableout);
    if (onstdout) {
      _cmd.events.on("stdout", onstdout);
    }
    await _cmd.start();
  }
  static async RestartDeployment(name, namespace = "default") {
    await KubernetesCLI.Run([
      "rollout",
      "restart",
      "deployment",
      name,
      "-n",
      namespace,
    ]);
  }
  static async Autoscale(type, name, namespace, min, max, cpuPercentage) {
    var _error = null;
    await KubernetesCLI.Run(["autoscale", type + "/" + name, "--min", min, "--max", max, "--cpu-percentage", cpuPercentage, "-n", namespace]).catch(err => _error = err);
    if (_error) { throw _error; }
  }
  static async ApplyConfiguration(config, namespace = "default") {
    try {
      var fsname = path.join(__basedir, "config_" + uuid() + ".yaml");
    } catch { }
    var _config = yaml.stringify(config);

    fs.writeFileSync(fsname, _config);
    var _error = null;
    try {
      await KubernetesCLI.Run(["apply", "-f", fsname, "-n", namespace]);
    } catch (err) {
      _error = err;
    }
    try {
      fs.unlinkSync(fsname);
    } catch { }
    if (_error) {
      throw _error;
    }
  }
  static async CreateNamespace(name) {
    try {
      var fsname = path.join(__basedir, "namespace_" + name + ".yaml");
    } catch { }
    var _config = yaml.stringify({
      apiVersion: "v1",
      kind: "Namespace",
      metadata: {
        name: name,
      },
    });

    fs.writeFileSync(fsname, _config);
    await KubernetesCLI.Run(["apply", "-f", fsname]);
    try {
      fs.unlinkSync(fsname);
    } catch { }
  }
  static async GetDeployments(namespace) {
    var rawData = "";
    await KubernetesCLI.Run(
      ["get", "deployment", "-o", "wide", "-n", namespace],
      (data) => {
        rawData += data;
      }
      , true);

    var lines = rawData.split("\n").filter((p) => p.trim().length > 0);
    var resources = [];
    for (var index = 1; index < lines.length; index++) {
      var line = lines[index].split("  ").filter((p) => p.trim().length > 0);
      resources.push({
        Namespace: (line[0] || "").trim(),
        Name: (line[1] || "").trim(),
        Ready: (line[2] || "").trim(),
        UpToDate: (line[3] || "").trim(),
        Available: (line[4] || "").trim(),
        Age: (line[5] || "").trim(),
        Containers: (line[6] || "").trim(),
      });
    }
    return resources;
  }
  static async GetPods(namespace) {
    var rawData = "";
    await KubernetesCLI.Run(
      ["get", "pod", "-o", "wide", "-n", namespace],
      (data) => {
        rawData += data;
      }
      , true);

    var lines = rawData.split("\n").filter((p) => p.trim().length > 0);
    var resources = [];
    for (var index = 1; index < lines.length; index++) {
      var line = lines[index].split("  ").filter((p) => p.trim().length > 0);

      resources.push({
        Namespace: (line[0] || "").trim(),
        Name: (line[1] || "").trim(),
        Ready: (line[2] || "").trim(),
        Status: (line[3] || "").trim(),
        Restarts: (line[4] || "").trim(),
        Age: (line[5] || "").trim(),
        Ip: (line[6] || "").trim(),
        Node: (line[7] || "").trim(),
        NominatedNode: (line[8] || "").trim(),
        ReadinessGates: (line[9] || "").trim(),
      });
    }
    return resources;
  }
  static async GetSecrets(namespace) {
    var rawData = "";
    await KubernetesCLI.Run(
      ["get", "secret", "-n", namespace],
      (data) => {
        rawData += data;
      }
      , true);

    var lines = rawData.split("\n").filter((p) => p.trim().length > 0);
    var resources = [];
    for (var index = 1; index < lines.length; index++) {
      var line = lines[index].split("  ").filter((p) => p.trim().length > 0);

      resources.push({
        Name: (line[0] || "").trim(),
        Type: (line[1] || "").trim(),
        Data: (line[2] || "").trim(),
        Age: (line[3] || "").trim()
      });
    }
    return resources;
  }
}

module.exports = KubernetesCLI;
