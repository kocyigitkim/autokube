const path = require("path");
global.__basedir = path.parse(__filename).dir;

const argsparser = require("./argsparser.js");
const process = require("process");
const ApplicationBuilder = require("./ApplicationBuilder.js");
const ServiceBackend = require("./ServiceBackend");
const schedule = require("node-schedule");

function DrawAutoKubeHeader() {
  var header =
    "DQrilpHilojilojilojilojilojilZfilpHilojilojilZfilpHilpHilpHilojilojilZfilojilojilojilojilojilojilojilojilZfilpHilojilojilojilojilojilZfilpHilojilojilZfilpHilpHilojilojilZfilojilojilZfilpHilpHilpHilojilojilZfilojilojilojilojilojilojilZfilpHilojilojilojilojilojilojilojilZcNCuKWiOKWiOKVlOKVkOKVkOKWiOKWiOKVl+KWiOKWiOKVkeKWkeKWkeKWkeKWiOKWiOKVkeKVmuKVkOKVkOKWiOKWiOKVlOKVkOKVkOKVneKWiOKWiOKVlOKVkOKVkOKWiOKWiOKVl+KWiOKWiOKVkeKWkeKWiOKWiOKVlOKVneKWiOKWiOKVkeKWkeKWkeKWkeKWiOKWiOKVkeKWiOKWiOKVlOKVkOKVkOKWiOKWiOKVl+KWiOKWiOKVlOKVkOKVkOKVkOKVkOKVnQ0K4paI4paI4paI4paI4paI4paI4paI4pWR4paI4paI4pWR4paR4paR4paR4paI4paI4pWR4paR4paR4paR4paI4paI4pWR4paR4paR4paR4paI4paI4pWR4paR4paR4paI4paI4pWR4paI4paI4paI4paI4paI4pWQ4pWd4paR4paI4paI4pWR4paR4paR4paR4paI4paI4pWR4paI4paI4paI4paI4paI4paI4pWm4pWd4paI4paI4paI4paI4paI4pWX4paR4paRDQrilojilojilZTilZDilZDilojilojilZHilojilojilZHilpHilpHilpHilojilojilZHilpHilpHilpHilojilojilZHilpHilpHilpHilojilojilZHilpHilpHilojilojilZHilojilojilZTilZDilojilojilZfilpHilojilojilZHilpHilpHilpHilojilojilZHilojilojilZTilZDilZDilojilojilZfilojilojilZTilZDilZDilZ3ilpHilpENCuKWiOKWiOKVkeKWkeKWkeKWiOKWiOKVkeKVmuKWiOKWiOKWiOKWiOKWiOKWiOKVlOKVneKWkeKWkeKWkeKWiOKWiOKVkeKWkeKWkeKWkeKVmuKWiOKWiOKWiOKWiOKWiOKVlOKVneKWiOKWiOKVkeKWkeKVmuKWiOKWiOKVl+KVmuKWiOKWiOKWiOKWiOKWiOKWiOKVlOKVneKWiOKWiOKWiOKWiOKWiOKWiOKVpuKVneKWiOKWiOKWiOKWiOKWiOKWiOKWiOKVlw0K4pWa4pWQ4pWd4paR4paR4pWa4pWQ4pWd4paR4pWa4pWQ4pWQ4pWQ4pWQ4pWQ4pWd4paR4paR4paR4paR4pWa4pWQ4pWd4paR4paR4paR4paR4pWa4pWQ4pWQ4pWQ4pWQ4pWd4paR4pWa4pWQ4pWd4paR4paR4pWa4pWQ4pWd4paR4pWa4pWQ4pWQ4pWQ4pWQ4pWQ4pWd4paR4pWa4pWQ4pWQ4pWQ4pWQ4pWQ4pWd4paR4pWa4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWd";
  console.log(Buffer.from(header, "base64").toString("utf-8"));
}

const actions = {
  build: (config, solution, release) => {
    var appBuilder = new ApplicationBuilder();
    var configRootPath = path.parse(config).dir;
    appBuilder.loadFromFile(config);
    appBuilder.install(release || "release", solution, configRootPath);
  },
  installdependencies: async()=>{
    console.log('## AutoKube Dependency Installer');
    console.log('## (Re)installing All Dependencies...');
    await require('./Kubernetes/DependencyInstaller')([], true);
    console.log('## Installation successfully.');
  },
 /* service: async () => {
    var _cronjob = async () => {
      await ServiceBackend();
    };

    var rule = new schedule.RecurrenceRule();
    rule.hour = 00;
    rule.minute = 00;
    rule.second = 00;
    schedule.scheduleJob(rule, () => {
      _cronjob();
    });
    console.log("## AutoKube Scheduled at 00:00 AM everyday");
    console.log("## Agent starting...");

    console.log("## Agent listening...");
  },*/
};

DrawAutoKubeHeader();
argsparser.functionExecutor(process.argv, actions);
