const Application = require("../../Core/Configuration/Application");

class ImageDescriptionResults {
    constructor() {
        this.application = new Application();
        this.success = false;
        this.message = null;
        this.dockerfile = null;
    }
}
class ImageDescriptor {
    describe() {
        return new ImageDescriptionResults();
    }
}

module.exports = {
    ImageDescriptionResults,
    ImageDescriptor
};