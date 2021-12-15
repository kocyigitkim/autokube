const fs = require('fs');
const path = require('path');
const { ImageDescriptor, ImageDescriptionResults } = require('./ImageDescriptor');

//retrieve relative file path if exists config.js or config.json
const getConfigPath = (filePath) => {
    const configPath = path.join(filePath, 'config.js');
    if (fs.existsSync(configPath)) {
        return configPath;
    }
    const configPath2 = path.join(filePath, 'config.json');
    if (fs.existsSync(configPath2)) {
        return configPath2;
    }
    return null;
}


class NodeJSImageDescriptor extends ImageDescriptor {
    constructor() {
        this.configurators = [];
        for (var configuratorPath of fs.readdirSync(path.resolve(__dirname, "NodeJSConfigurators"), { withFileTypes: true })) {
            this.configurators.push(require(configuratorPath));
        }
    }
    describe(solutionDir) {
        var result = new ImageDescriptionResults();
        var packagePath = path.join(solutionDir, 'package.json');
        if (fs.existsSync(packagePath)) {
            try {
                var packageJson = JSON.parse(fs.readFileSync(packagePath));
                if (packageJson.name && packageJson.version) {
                    var isSuccess = false;
                    for (var configurator of this.configurators) {
                        var configResult = configurator(packageJson);
                        if (configResult.success) {
                            result.application = configResult.app;
                            result.dockerfile = configResult.dockerfile;
                            isSuccess = true;
                            break;
                        }
                    }
                    if (isSuccess) {

                        var configPath = getConfigPath(solutionDir);
                        if (configPath) {
                            if (!Array.isArray(result.application.configs)) {
                                result.application.configs = [];
                            }
                            result.application.configs.push(configPath);
                        }

                        result.success = true;
                    }
                    else {
                        result.message = "No configuration found";
                    }
                }
                else {
                    result.message = 'package.json is missing name or version';
                }
            } catch (err) {
                result.message = err;
            }
        }
        else {
            result.message = "No package.json found";
        }
        return result;
    }
}

module.exports = NodeJSImageDescriptor;