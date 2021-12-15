const ApplicationBuilder = require("../Core/ApplicationBuilder");
const BuildContext = require("../Core/BuildContext");

class IPlugin {
  constructor() {
    this.images = [];
  }
  /**
   *
   * @param {BuildContext} context
   */
  beforebuild(context) {}
  /**
   *
   * @param {BuildContext} context
   */
  build(context) {}
  /**
   *
   * @param {BuildContext} context
   */
  afterbuild(context) {}
}

module.exports = IPlugin;
