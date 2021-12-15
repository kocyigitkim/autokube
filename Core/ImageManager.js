const fs = require("fs");
const path = require("path");
const Version = require("./Configuration/Version");

class ImageManager {
  constructor() {
    this.imageDefinitionDir = path.join(__basedir, "ImageDefinitions");
    this.imageDependencyDir = path.join(__basedir, "ImageDependencies");
    this.images = [];
    this.dependencies = [];
    this.scan();
  }
  scan() {
    if (!fs.existsSync(this.imageDefinitionDir)) { return; }
    try {
      var dirs = fs.readdirSync(this.imageDefinitionDir, {
        withFileTypes: true,
      });
      for (var dir of dirs) {
        if (dir.name.indexOf(".") === -1) {
          var def = JSON.parse(
            fs.readFileSync(
              path.join(this.imageDefinitionDir, dir.name, "Definition.json"),
              { encoding: "utf-8" }
            )
          );
          /*var dockerfile = fs.readFileSync(
            path.join(this.imageDefinitionDir, dir.name, "dockerfile"),
            { encoding: "utf-8" }
          );*/

          var dockerfiles = [];
          if (def.targetVersion == "multi") {
            for (var version in def.targetVersions) {
              var dockerfilepath = path.join(this.imageDefinitionDir, dir.name, def.targetVersions[version]);
              dockerfiles.push({
                version: version,
                dockerfile: fs.readFileSync(dockerfilepath, { encoding: "utf-8" }),
                dockerfilepath: dockerfilepath
              });
            }
          }
          else {
            var dockerfilepath = path.join(this.imageDefinitionDir, dir.name, "dockerfile");
            dockerfiles.push({
              version: def.version,
              dockerfile: fs.readFileSync(dockerfilepath, { encoding: "utf-8" }),
              dockerfilepath: dockerfilepath
            });
          }

          this.images.push({
            name: dir.name,
            dir: path.join(this.imageDefinitionDir, dir.name),
            image: def,
            version: new Version(def.targetVersion || def.version),
            dockerfiles: dockerfiles,
          });
        }
      }
      if (!fs.existsSync(this.imageDependencyDir)) { return; }
      dirs = fs.readdirSync(this.imageDependencyDir, {
        withFileTypes: true,
      });
      for (var dir of dirs) {
        if (dir.name.indexOf(".") === -1) {
          var def = JSON.parse(
            fs.readFileSync(
              path.join(this.imageDependencyDir, dir.name, "Definition.json"),
              { encoding: "utf-8" }
            )
          );
          var dockerfile = fs.readFileSync(
            path.join(this.imageDependencyDir, dir.name, "dockerfile"),
            { encoding: "utf-8" }
          );
          this.dependencies.push({
            name: dir.name,
            dir: path.join(this.imageDependencyDir, dir.name),
            version: new Version(def.targetVersion || def.version),
            sourcePath: path.join(this.imageDependencyDir, dir.name, "source"),
            definition: def,
            dockerfile: dockerfile,
            dockerfilepath: path.join(
              this.imageDependencyDir,
              dir.name,
              "dockerfile"
            ),
          });
        }
      }

      for (var image of this.images) {
        if (image.image.dependencies) {
          image.dependencies = [];
          for (var depname of image.image.dependencies) {
            image.dependencies.push(
              this.dependencies.filter(
                (p) => p.name.toLowerCase() == depname.toLowerCase()
              )[0]
            );
          }
        }
      }
    } catch (x) {
      console.log(x);
    }
  }
  getImage(name, version) {
    var isAny = version == "any";
    var isLatest = version == "latest";

    var images = this.images.filter((p) => {
      if (p.image.alias) {
        for (var a of p.image.alias) {
          if (a.toLowerCase() == name.toLowerCase()) {
            return true;
          }
        }
      }
      return p.name.toLowerCase() == name.toLowerCase();
    });
    var currentImageDefinition = images[0];
    var matchVersion = currentImageDefinition.dockerfiles.filter(p => new Version(p.version).toString() == new Version(version).toString())[0];
    if (!matchVersion && isAny) {
      matchVersion = currentImageDefinition.dockerfiles[0];
    }
    else if (!matchVersion && isLatest) {
      matchVersion = currentImageDefinition.dockerfiles[currentImageDefinition.dockerfiles.length - 1];
    }
    return {
      ...currentImageDefinition,
      ...matchVersion
    };
  }
}

module.exports = ImageManager;
