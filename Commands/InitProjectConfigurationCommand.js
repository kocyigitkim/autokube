const fs = require("fs");
const path = require("path");
const Stepper = require("../Console/Stepper");
const ProjectConfigurationBuilder = require("../Core/ProjectConfigurationBuilder");


module.exports.command = async () => {
    var solutionDir = process.cwd();
    var stepper = new Stepper();
    stepper.add("Describe Project", async () => {
        var configurationBuilder = new ProjectConfigurationBuilder(solutionDir);
        var results = await configurationBuilder.describe();
        if (Array.isArray(results) && results.length > 0) {
            var result = results[0];
            var projectConfig = JSON.stringify(result.application);
            console.log("Project init success!");
            var autokubePath = path.join(solutionDir, "autokube.json");
            fs.writeFileSync(autokubePath, projectConfig);
            if (result.dockerfile) {
                console.log('Dockerfile generated');
                var dockerfilePath = path.join(solutionDir, "Dockerfile");
                fs.writeFileSync(dockerfilePath, result.dockerfile);
            }
            console.log('Project configuration completed!');
        }
    });
    await stepper.run();
};