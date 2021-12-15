const fs = require('fs');
const path = require('path');

class ProjectConfigurationBuilder{
    constructor(solutionDir) {
        this.solutionDir = solutionDir;
        this.descriptors = [];

        var localPath = path.join(__dirname, "./ImageDescriptors");
        for (var p of fs.readdirSync(localPath, { withFileTypes: true })) {
            if(p.name.endsWith("Descriptor.js")) {
                var descriptor = require(path.join(localPath, p.name));
                try {
                    this.descriptors.push(new descriptor());
                }catch(err){}
            }
        }
    }
    async describe() {
        var results = [];
        for (var descriptor of this.descriptors) {
            
            var result = await descriptor.describe(this.solutionDir);
            if(result.success) {
                results.push(result);
            }
        }
        return results;
    }
}

module.exports = ProjectConfigurationBuilder;