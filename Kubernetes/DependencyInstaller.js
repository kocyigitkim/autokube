const DockerCLI = require("../Docker/DockerCLI");
const ImageManager = require("../Core/ImageManager");
const path=  require('path');

module.exports = async function InstallDependencies(
  dependencies = [],
  force = false
) {
  const registry = require("../config.json").registry;

  if (!dependencies || dependencies.length == 0) {
    var imageManager = new ImageManager();
    dependencies = imageManager.dependencies;
  }

  var installedImages = await DockerCLI.GetImages();
  for (var dependency of dependencies) {
    var installedImage = installedImages.filter(
      (p) =>
        p.Repository == registry + "/" + dependency.name.toLowerCase() &&
        p.Tag == "latest"
    )[0];
    if (installedImage) {
      if (!force) {
        console.log("## " + dependency.name + " is already installed.");
        continue;
      }
      else{
        await DockerCLI.RemoveImage(installedImage);
      }
    }
    console.log("## Installing: " + dependency.name);
    try {
      await DockerCLI.BuildImage(
        {
          name: dependency.name.toLowerCase(),
        },
        null,
        dependency.dockerfilepath,
        path.parse(dependency.dockerfilepath).dir,
        registry
      );
      console.log("## Installation successfully.");
    } catch (err) {
      errorCount++;
      console.error(err);
    }
  }
};
