const ApplicationBuilder = require("../ApplicationBuilder");
const Version = require("./Version");

class Application {
  constructor() {
    this.workingNamespace = "";
    this.projectName = "";
    this.name = "";
    this.platform = "";
    this.platformVersion = new Version("1.0.0");
    this.osPlatform = "";
    this.configs = [""];
    this.endPoints = [{ name: "", in: 0, out: 0 }];
    this.secret = "";
    this.configpath = "";
    this.env = [{ name: '', value: '' }];
    this.servicetype = "ClusterIP";
    this.nodeName = null;
    this.dns = {
      nameservers: [],
      searches: []
    };
    this.ingress = {
      host: "",
      inputPath: "",
      port: 0,
      secret: "",
      isRegex: false,
      pathRewrite: "",
      sslredirect: false,
      annotations: {}
    };
    this.performance = {
      cpu: { request: "", limit: "" },
      memory: { request: "", limit: "" },
    };
    this.health = { path: "", port: 0, initial: 0, period: 0 };
    this.deployment = {
      initialpod: 1,
      initial: 1,
      min: 1,
      max: 1,
      cpuRequest: 50
    };
    this.storage = [
      {
        name: "",
        pvc: "",
        mount: "",
        size: "",
        accessMode: "",
        storage: "",
        volumeMode: ""
      }
    ];
    this.dependencies = [
      {
        name: "",
        path: ""
      }
    ];
    this.minReadySeconds = 10;
    this.strategy = {
      type: 'RollingUpdate/Recreate',
      rollingUpdate: {
        maxUnavailable: 0,
        maxSurge: 0
      },
    };
  }
}

module.exports = Application;
