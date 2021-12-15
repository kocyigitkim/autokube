const DockerCLI = require("../Docker/DockerCLI.js");
const KubeCLI = require("../Kubernetes/KubernetesCLI");
const Application = require("./Configuration/Application");
const fs = require("fs");
const path = require("path");

const DeploymentBuilder = require("../Kubernetes/DeploymentBuilder");
const ServiceBuilder = require("../Kubernetes/ServiceBuilder");
const IngressBuilder = require("../Kubernetes/IngressBuilder");
const PVCInstaller = require("../Kubernetes/PVCInstaller");

const ImageManager = require("./ImageManager.js");
const { release } = require("os");
const { Console } = require("console");

const Config = require("../config.json");
const CertificateInstaller = require("../Kubernetes/CertificateInstaller.js");
const { cwd } = require("process");
const PluginManager = require("./PluginManager");
const BuildContext = require("./BuildContext.js");

class ApplicationBuilder {
  constructor() {
    this.app = new Application();
    this.configs = [];
    this.configMaps = [];
  }

  async loadFromFile(path, solutionPath) {
    this.app = JSON.parse(fs.readFileSync(path, { encoding: "utf-8" }));
    var pluginManager = new PluginManager();
    var plugin = pluginManager.getPluginByImage(this.app.platform);
    var context = new BuildContext(this, solutionPath);
    if (plugin && plugin.instance) {
      plugin.instance.beforebuild(context);
    }
    const registry = Config.registry;
    var dockerfilepath = "";
    var imageManager = new ImageManager();
    var imageDefinition = imageManager.getImage(
      this.app.platform,
      this.app.platformVersion
    );
    dockerfilepath = imageDefinition.dockerfilepath;
    if (imageDefinition.dependencies) {
      console.log("## Installing Dependencies...");
      await require("../Kubernetes/DependencyInstaller")(
        imageDefinition.dependencies,
        false
      );
    }

    this.dockerfilepath = dockerfilepath;
    this.pluginManager = pluginManager;
    this.registry = registry;
    this.plugin = plugin;
  }
  async buildImage(releaseMode, solutionPath) {
    var imageTag = null;
    const plugin = this.plugin;
    const ingress = this.ingress;
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
      this.dockerfilepath,
      solutionPath,
      this.registry
    );
    this.imageTag = imageTag;
    console.log("## Build image successfully.");
    console.log("## Image Tag:" + imageTag);
    if (plugin && plugin.instance) {
      plugin.instance.afterbuild(context);
    }
  }
  async createNamespace() {
    try {
      console.log(
        "## Creating working namespace: " + this.app.workingNamespace
      );
      await KubeCLI.CreateNamespace(this.app.workingNamespace);
      console.log("## Successfully.");
    } catch (err) {
      console.error(err);
    }
  }
  async createService(releaseMode) {
    if (this.app.endPoints) {
      try {
        console.log("## Configuring service...");
        this.configs.push(ServiceBuilder(this.app, releaseMode));
        console.log("## Service configured.");
      } catch (err) {

        console.error(err);
      }
    }
  }
  async createPVC() {
    try {
      console.log("## Configuring PVC");
      for (var config of PVCInstaller(this.app)) {
        this.configs.push(config);
      }
      console.log("## PVC configured.");
    } catch (err) {

      console.error(err);
    }
  }
  async createDeployment(releaseMode, configRootPath) {
    const imageTag = this.imageTag;
    try {
      console.log("## Configuring deployment...");
      for (var config of DeploymentBuilder(
        this.app,
        imageTag,
        releaseMode,
        configRootPath
      )) {
        if (config.kind.toLowerCase() == "configmap") {
          this.configMaps.push(config);
        } else {
          this.configs.push(config);
        }
      }
      console.log("## Deployment configured.");
    } catch (err) {
      console.error(err);
    }
  }
  async createConfigMap() {
    for (var configMap of this.configMaps) {
      try {
        console.log("## Installing ConfigMap: " + configMap.metadata.name);
        await KubeCLI.ApplyConfiguration(configMap, this.app.workingNamespace);
        console.log("## Installation successfully.");
      } catch (err) {
        console.error(err);

      }
    }
  }
  async createIngress(releaseMode) {
    var ingress =
      this.app.ingress && IngressBuilder(this.app, releaseMode);
    this.ingress = ingress;
    if (ingress) {
      console.log("## Configuring ingress...");

      try {
        await KubeCLI.ApplyConfiguration(ingress[0], this.app.workingNamespace);
        console.log("## Ingress configured.");
      } catch (err) {
        console.error(err);
      }
    }
  }
  async createAllConfigs() {
    for (var config of this.configs) {
      try {
        console.log(
          "## Installing " + config.kind + " : " + config.metadata.name
        );
        await KubeCLI.ApplyConfiguration(config, this.app.workingNamespace);
        console.log("## Installation successfully.");
      } catch (err) {
        console.error(err);

      }
    }
  }

  /*  uninstall() {}
  restart() {}
  stop() {}*/
}

module.exports = ApplicationBuilder;
