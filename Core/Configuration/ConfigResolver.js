const path = require("path");
const fs = require("fs");

module.exports.resolve = function (config) {
  var execDir = process.cwd();
  if (!config) config = "autokube.json";
  var currentDir = execDir;
  var configFile = path.join(currentDir, config);
  console.log("Looking for config file: " + configFile);
  if (fs.existsSync(configFile)) {
    return configFile;
  } else {
    console.error("Config file not found!!!");
    return null;
  }
};
