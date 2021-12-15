module.exports.command = async () => {
  console.log("## AutoKube Dependency Installer");
  console.log("## Configuring Dependencies...");
  await require("./Kubernetes/DependencyInstaller")([], true);
  console.log("## Installation successfully.");
};