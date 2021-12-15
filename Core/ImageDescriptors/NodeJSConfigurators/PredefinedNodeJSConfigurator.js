const ConfigurationResult = require("../ConfigurationResult");

async function PredefinedNodeJSConfigurator(packageJson) {
    var result = new ConfigurationResult();
    if (packageJson.scripts && packageJson.scripts.start) {
        result.app = {
            workingNamespace: packageJson.namespace || "default",
            name: packageJson.name,
            version: packageJson.version,
            projectName: packageJson.displayName || packageJson.name,
            platform: "nodejs",
            platformVersion: "latest",
            configs: []
        };
        result.dockerfile = nul;
        result.success = true;
    }
    else {
        result.message = "No start script found";
    }
    return result;
}

module.exports = PredefinedNodeJSConfigurator;