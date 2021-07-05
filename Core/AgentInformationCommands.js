const Agent = require("./Agent");

class AgentInformationCommands{
    /**
     * 
     * @param {Agent} agent 
     */
    constructor(agent){
        this.agent = agent;
        agent.addCommand("info", this.info.bind(this));
    }
    info(){
        return {
            startDate: this.agent.startDate,
            lastExecution: this.agent.lastExecutionDate,
            status: this.agent.status,
            accepted: this.agent.acceptCommand,
            success: this.agent.successedCommands,
            failed: this.agent.failedCommands
        };
    }
}

module.exports = AgentInformationCommands;