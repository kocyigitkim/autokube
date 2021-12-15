const eventEmitter = require("events").EventEmitter;
const spawn = require("child_process").spawn;
const os = require("os");

class CommandLineHost {
  constructor(filepath, args, cwd, disableout) {
    if (!(args instanceof Array)) {
      args = [args];
    }
    args = args.map((p) => p.toString());
    this.disableout = false;// disableout;
    this.cwd = cwd;
    this.filepath = filepath;
    this.process = null;
    this.args = args;
    this.events = new eventEmitter();
    this.state = false;
  }
  create() {
    return new dotnetconnector(this.port);
  }
  onstderr() {
    this.events.emit("stderr", arguments);
  }
  onexit() {
    this.events.emit("exit", arguments);
    this.state = false;
  }
  onstdout(msg) {
    this.events.emit("stdout", msg);
  }
  async start() {
    console.log(this.filepath + " host starting...");
    console.log("- " + this.args.join(" "));
    if (os.platform() == "win32") {
      this.process = await spawn(this.filepath, this.args, { cwd: this.cwd });
    } else {
      this.process = await spawn("sudo", [this.filepath, ...this.args]);
    }
    this.state = true;
    this.process.on("exit", this.onexit.bind(this));
    this.process.unref();
    this.process.stderr.on(
      "data",
      ((data) => {
        const _message = data.toString();
        console.error(_message.trim());
        this.onstderr.bind(this)(_message);
      }).bind(this)
    );
    this.process.stdout.on(
      "data",
      ((data) => {
        const _message = data.toString();
        console.log(_message.trim());
        this.onstdout.bind(this)(_message);
      }).bind(this)
    );
    while (this.state) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    if (this.process.exitCode != 0) {
      throw new Error("Host exited with code: " + this.process.exitCode);
    }
    else {
      console.log(
        this.filepath + " host is exited with code: " + this.process.exitCode
      );
    }
  }
  stop() {
    console.log(this.filepath + " host is terminating...");
    this.process.kill();
  }
}

module.exports = CommandLineHost;
