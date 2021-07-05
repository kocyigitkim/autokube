const DockerCLI = require("./Docker/DockerCLI.js");

module.exports = async function ServiceBackend(){
    console.log("## Optimization started...");
      console.log("## Image prune");
      await DockerCLI.Run(["image", "prune", "-f"]);
      var removeCount = 0;
      var images = await DockerCLI.GetImages();
      var noneimages = images.filter((p) => p.Repository == "<none>");
      for (var noneimage of noneimages) {
        try {
          await DockerCLI.RemoveImage(noneimage);
          removeCount++;
        } catch (err) {
          console.error(err);
        }
      }
      console.log("## System prune");
      await DockerCLI.Run(["system", "prune", "-f"]);
      console.log(
        removeCount +
          " unused image removed. " +
          (noneimages.length - removeCount) +
          " image can not removed!"
      );
};