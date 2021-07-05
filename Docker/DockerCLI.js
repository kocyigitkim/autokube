const cmd = require("../CommandLineHost");
const fs = require("fs");
const path = require("path");
const Application = require("../Core/Application");
const { cwd } = require("process");

class DockerCLI {
  static async Run(query, onstdout, cwd, disableout) {
    var _cmd = new cmd("docker", query, cwd, disableout);
    if (onstdout) {
      _cmd.events.on("stdout", onstdout);
    }
    await _cmd.start();
  }
  static async GetImages() {
    var dockerImages = [];
    var rawData = "";
    await DockerCLI.Run(
      "images",
      (data) => {
        rawData += data;
      },
      null,
      true
    );

    var lines = rawData.split("\n").filter((p) => p.trim().length > 0);
    for (var index = 1; index < lines.length; index++) {
      var line = lines[index].split("  ").filter((p) => p.trim().length > 0);
      dockerImages.push({
        Repository: (line[0] || "").trim(),
        Tag: (line[1] || "").trim(),
        ImageId: (line[2] || "").trim(),
        Created: (line[3] || "").trim(),
        Size: (line[4] || "").trim(),
      });
    }
    return dockerImages;
  }
  static async RemoveImage(img) {
    await DockerCLI.Run(["rmi", img.ImageId]);
  }
  /**
   *
   * @param {Application} app
   * @param {string} dockerfilepath
   * @param {string} solutionPath
   */
  static async BuildImage(
    app,
    releaseMode,
    dockerfilepath,
    solutionPath,
    registryaddress = "localhost:5000"
  ) {
    var targetPath = path.join(solutionPath || cwd(), "dockerfile");
    try {
      var dockerfilesource = fs.readFileSync(dockerfilepath, {
        encoding: "utf-8",
      });
      dockerfilesource = dockerfilesource.replace(
        /\%[pP]roject[nN]ame\%/g,
        app.projectName
      );
      dockerfilesource = dockerfilesource.replace(
        /\%[rR]egistry\%/g,
        registryaddress
      );
      fs.writeFileSync(targetPath, dockerfilesource, { encoding: "utf-8" });
    } catch {}

    var imageTag =
      registryaddress +
      "/" +
      app.name +
      (releaseMode ? "-" + releaseMode : "") +
      ":" +
      (app.version || app.targetVersion || "latest");
    try {
      await DockerCLI.Run(
        ["build", "--progress=plain", "-t", imageTag, "."],
        null,
        solutionPath || cwd(),
        false
      );
    } catch (err) {
      console.error(err);
    }
    try {
      await DockerCLI.Run(["push", imageTag], null, solutionPath, false);
    } catch (err) {
      console.error(err);
    }

    return imageTag;
  }
}

module.exports = DockerCLI;
