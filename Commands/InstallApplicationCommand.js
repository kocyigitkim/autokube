const ApplicationBuilder = require("../Core/ApplicationBuilder.js");
const ServiceBackend = require("../ServiceBackend");
const Stepper = require("../Console/Stepper");
const ConfigResolver = require("../Core/Configuration/ConfigResolver");
const path = require("path");
const KubernetesCLI = require("../Kubernetes/KubernetesCLI.js");

module.exports.command = async (config, solution, release) => {
  if (!release) release = "development";
  if (!solution) solution = ".";

  var appBuilder = new ApplicationBuilder();
  var configPath = ConfigResolver.resolve(config);
  var configRootPath = configPath ? path.parse(configPath).dir : process.cwd();
  console.log("Loading config file: " + configPath);
  var stepper = new Stepper();
  stepper.add("Loading Configuration", async () => {
    await appBuilder.loadFromFile(configPath, solution).catch(err => { throw err; });
  });

  stepper.add("Create Ingress", async () => {
    await appBuilder.createIngress(release).catch(err => { throw err; });
  });
  stepper.add("Build Image", async () => {
    await appBuilder.buildImage(release, solution).catch(err => { throw err; });
  });
  stepper.add("Create Namespace", async () => {
    await appBuilder.createNamespace().catch(err => { throw err; });
  });
  stepper.add("Create User Defined Configs", async () => {
    await appBuilder.createConfigMap().catch(err => { throw err; });
  });
  stepper.add("Create Service", async () => {
    await appBuilder.createService(release).catch(err => { throw err; });
  });
  stepper.add("Create Deployment", async () => {
    await appBuilder.createDeployment(release, configRootPath).catch(err => { throw err; });
  });
  stepper.add("Create PVC(s)", async () => {
    await appBuilder.createPVC().catch(err => { throw err; });
  });
  stepper.add("Install All Configurations", async () => {
    await appBuilder.createAllConfigs().catch(err => { throw err; });
  });
  stepper.add("Restart Application", async () => {
    await KubernetesCLI.RestartResource(appBuilder.app.mode || "deployment", appBuilder.app.publishedName, appBuilder.app.workingNamespace);
  })
  if (!configPath) {
    stepper.clear();
    stepper.add("ERROR", () => {
      console.error("Installation failure");
    });
  }
  await stepper.run();
};
