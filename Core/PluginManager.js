const path = require("path");
const fs = require("fs");

class PluginManager {
  constructor() {
    this.pluginDir = path.join(__basedir, "Plugins");
    this.plugins = [];
    this.scan();
  }
  scan() {
    var dirs = fs.readdirSync(this.pluginDir, { withFileTypes: true });
    for (var dir of dirs) {
      if (dir.name.indexOf(".") > -1) {
        var pluginDefinition = require(path.join(this.pluginDir, dir.name));
        var pluginInstance = new pluginDefinition();
        var pluginImages = pluginInstance.images;
        this.plugins.push({
            definition: pluginDefinition,
            instance: pluginInstance,
            images: pluginImages.map(p=>p.toLowerCase())
        });
      }
    }
  }
  getPluginByImage(imageName){
    return this.plugins.filter(p=> p.images.indexOf(imageName.toLowerCase()) !== -1 )[0];
  }
}

module.exports = PluginManager;
