const ApplicationBuilder = require("./ApplicationBuilder");

class BuildContext{
    /**
     * 
     * @param {ApplicationBuilder} appbuilder 
     * @param {String} solutionPath
     */
    constructor(appbuilder, solutionPath){
        this.appbuilder = appbuilder;
        this.solutionPath = solutionPath;
        this.variables = {};
        for(var key in process.env){
            this.variables[key.toLowerCase()] = process.env[key];
        }
    }
    getVariableName(name){
        name = name.toLowerCase();
        name = name.replace(/\./g, "_");
        return name;
    }
    hasVariable(name){
        name = this.getVariableName(name);
        return name in this.variables;
    }
    getVariable(name){
        name = this.getVariableName(name);
        return this.variables[name];
    }
}

module.exports = BuildContext;