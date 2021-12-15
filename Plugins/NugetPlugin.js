const BuildContext = require("../Core/BuildContext");
const IPlugin = require("./Plugin");
const path = require("path");
const fs = require("fs");
const config = require('../config.json').plugins.nuget;

class NugetPlugin extends IPlugin {
  constructor() {
    super();
    this.images = ["DOTNETCORE", "DOTNETCORE-CRM", "ASPNETCORE", "ASPNETCORE-REACT", "ASPNETCORE-CRM", "ASPNETCORE-REACT-CRM"];
  }
  /**
   *
   * @param {BuildContext} context
   */
  beforebuild(context) {
    var nugetConfigPath = path.join(context.solutionPath || "", "nuget.config");
    var isNugetConfigExists = fs.existsSync(nugetConfigPath);

    var domainUser = config.user || context.getVariable("user");
    var PAT = config.pat || context.getVariable("system.accesstoken");

    const nugetConfigSource =`<?xml version="1.0" encoding="utf-8"?><configuration><packageSources><clear /><add key="NuGet official package source" value="https://api.nuget.org/v3/index.json" /><add key="${config.name}" value="${config.url}" /></packageSources><packageSourceCredentials><${config.name}><add key="Username" value="${domainuser}" /><add key="ClearTextPassword" value="${PAT}" /></${config.name}></packageSourceCredentials></configuration>`;

    fs.writeFileSync(nugetConfigPath, nugetConfigSource);
  }
}

module.exports = NugetPlugin;
