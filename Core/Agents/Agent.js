const express = require("express");
const bodyparser = require("body-parser");
class AgentOptions {
  constructor() {
    this.port = 3001;
  }
}

class AgentStatus {}
AgentStatus.NotWorking = -1;
AgentStatus.Success = 1;
AgentStatus.OnPending = 1;
AgentStatus.Idle = 2;
AgentStatus.Busy = 3;
AgentStatus.UnknownCommand = 4;
AgentStatus.ForbiddenCommand = 5;

class AgentResponse {
  constructor() {
    this.status = AgentStatus.None;
    this.message = null;
    this.parameters = {};
  }
}

class Agent {
  /**
   *
   * @param {AgentOptions} options
   */
  constructor(options) {
    this.options = options;
    this.thread = null;
    this.commands = [];
    this.startDate = new Date();
    this.lastExecutionDate = new Date();
    this.status = AgentStatus.NotWorking;
  }
  start() {
    this.status = AgentStatus.OnPending;
    const agentapp = express();
    this.app = agentapp;
    agentapp.use(bodyparser.json());
    agentapp.use(bodyparser.text());
    agentapp.use(bodyparser.urlencoded());
    agentapp.use("/*", this.acceptCommand);
    this.status = AgentStatus.Idle;
    this.acceptedCommands = 0;
    this.failedCommands = 0;
    this.successedCommands = 0;
  }
  acceptCommand(req, res, next) {
    this.acceptCommand++;
    this.lastExecutionDate = new Date();
    var commandName = req.query.cmd;
    var commandArguments = req.body;
    var acceptedCommand = this.commands.filter((p) => p.name == commandName)[0];
    var response = new AgentResponse();
    if (acceptedCommand) {
      try {
        response.parameters = acceptedCommand.action(commandArguments);
        response.status = AgentStatus.Success;
        this.successedCommands++;
      } catch (x) {
        response.status = AgentStatus.ForbiddenCommand;
        response.parameters = [commandName, commandArguments];
        this.failedCommands++;
      }
    } else {
      response.status = AgentStatus.UnknownCommand;
      response.message = "Unknown command excepted";
      this.failedCommands++;
    }
    res.json(response);
  }
  addCommand(name, action) {
    this.commands.push({ name: name, action: action });
  }
}

module.exports = Agent;
