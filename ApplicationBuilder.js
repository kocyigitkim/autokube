const DockerCLI = require("./Docker/DockerCLI.js");
const KubeCLI = require("./Kubernetes/KubernetesCLI");
const Application = require("./Core/Application");
const fs = require("fs");
const path = require("path");

const DeploymentBuilder = require("./Kubernetes/DeploymentBuilder");
const ServiceBuilder = require("./Kubernetes/ServiceBuilder");
const IngressBuilder = require("./Kubernetes/IngressBuilder");
const PVCInstaller = require("./Kubernetes/PVCInstaller");

const ImageManager = require("./ImageManager.js");
const { release } = require("os");
const { Console } = require("console");

const Config = require("./config.json");
const CertificateInstaller = require("./Kubernetes/CertificateInstaller.js");
const { cwd } = require("process");
const PluginManager = require("./PluginManager");
const BuildContext = require("./BuildContext.js");

class ApplicationBuilder {
  constructor() {
    this.app = new Application();
  }

  loadFromFile(path) {
    this.app = JSON.parse(fs.readFileSync(path, { encoding: "utf-8" }));
  }

  async install(releaseMode, solutionPath, configRootPath) {
    var pluginManager = new PluginManager();
    var plugin = pluginManager.getPluginByImage(this.app.platform);
    var context = new BuildContext(this, solutionPath);
    if (plugin && plugin.instance) {
      plugin.instance.beforebuild(context);
    }
    const registry = Config.registry;

    var errorCount = 0;

    var dockerfilepath = "";
    var imageManager = new ImageManager();
    var imageDefinition = imageManager.getImage(
      this.app.platform,
      this.app.platformVersion
    );
    dockerfilepath = imageDefinition.dockerfilepath;

    /* if (this.app.secret || (this.app.ingress && this.app.ingress.secret)) {
       var certificate = new CertificateInstaller(
         this.app.workingNamespace,
         this.app.secret || (this.app.ingress && this.app.ingress.secret)
       );
       if (certificate.definition) {
         try {
           await certificate.install();
           this.app.secret = certificate.definition.name;
         } catch (err) {
           console.error(err);
           errorCount++;
         }
       }
     }*/

    if (imageDefinition.dependencies) {
      console.log("## Installing Dependencies...");
      await require("./Kubernetes/DependencyInstaller")(
        imageDefinition.dependencies,
        false
      );
    }

    var ingress =
      this.app.ingress && IngressBuilder(this.app, imageTag, releaseMode);

    try {
      console.log(
        "## Creating working namespace: " + this.app.workingNamespace
      );
      await KubeCLI.CreateNamespace(this.app.workingNamespace);
      console.log("## Successfully.");
    } catch (err) {
      console.error(err);
    }
    var imageTag = null;
    try {
      console.log("## Building image...");
      if (ingress && ingress[1]) {
        console.log("## Creating Ingress Definition File");
        fs.writeFileSync(
          path.join(solutionPath || process.cwd(), "ingressdefinition.json"),
          JSON.stringify(ingress && ingress[1])
        );
      }
      if (plugin && plugin.instance) {
        plugin.instance.build(context);
      }
      imageTag = await DockerCLI.BuildImage(
        this.app,
        releaseMode,
        dockerfilepath,
        solutionPath,
        registry
      );
      console.log("## Build image successfully.");
      console.log("## Image Tag:" + imageTag);
      if (plugin && plugin.instance) {
        plugin.instance.afterbuild(context);
      }
    } catch (err) {
      console.error(err);
      return;
    }

    var configs = [];
    var configMaps = [];

    if (this.app.endPoints) {
      try {
        console.log("## Configuring service...");
        configs.push(ServiceBuilder(this.app, imageTag, releaseMode));
        console.log("## Service configured.");
      } catch (err) {
        errorCount++;
        console.error(err);
      }
    }
    try {
      console.log("## Configuring PVC");
      for (var config of PVCInstaller(this.app)) {
        configs.push(config);
      }
      console.log("## PVC configured.");
    } catch (err) {
      errorCount++;
      console.error(err);
    }
    try {
      console.log("## Configuring deployment...");
      for (var config of DeploymentBuilder(
        this.app,
        imageTag,
        releaseMode,
        configRootPath
      )) {
        if (config.kind.toLowerCase() == "configmap") {
          configMaps.push(config);
        } else {
          configs.push(config);
        }
      }
      console.log("## Deployment configured.");
    } catch (err) {
      errorCount++;
      console.error(err);
    }

    for (var configMap of configMaps) {
      // configMap.metadata.name
      try {
        console.log("## Installing ConfigMap: " + configMap.metadata.name);
        await KubeCLI.ApplyConfiguration(configMap, this.app.workingNamespace);
        console.log("## Installation successfully.");
      } catch (err) {
        console.error(err);
        errorCount++;
      }
    }

    try {
      console.log("## Applying Autoscale");
      await KubeCLI.Autoscale("deployment", this.app.name, this.app.workingNamespace, this.app.deployment.min, this.app.deployment.max, this.app.deployment.cpuRequest);
      console.log("## Deployment autoscale configured");
    } catch (err) {
      console.error(err);
      errorCount++;
    }

    for (var config of configs) {
      try {
        console.log(
          "## Installing " + config.kind + " : " + config.metadata.name
        );
        await KubeCLI.ApplyConfiguration(config, this.app.workingNamespace);
        console.log("## Installation successfully.");
      } catch (err) {
        console.error(err);
        errorCount++;
      }
    }

    if (this.app.ingress) {
      console.log("## Configuring ingress...");

      try {
        await KubeCLI.ApplyConfiguration(ingress[0], this.app.workingNamespace);
        console.log("## Ingress configured.");
      } catch (err) {
        console.error(err);
      }
    }

    console.log("## Rescheduling deployment...");
    try {
      await KubeCLI.RestartDeployment(
        this.app.name + "-" + releaseMode,
        this.app.workingNamespace
      );
      console.log("## Deployment rescheduled.");
    } catch (err) {
      console.log(err);
    }

    if (errorCount > 0) {
      console.error(
        "## Installation completed with " + errorCount + " errors."
      );
    } else {
      console.log("## Installation completed without errors.");
    }
  }
  uninstall() { }
  restart() { }
  stop() { }
}

module.exports = ApplicationBuilder;
