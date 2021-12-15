class Stepper {
  constructor() {
    this.steps = [];
  }
  add(name, action) {
    this.steps.push({
      name: name,
      action: action,
    });
  }
  clear() {
    this.steps = [];
  }
  async run() {
    var stepCount = this.steps.length;
    var stepIndex = 0;
    for (var step of this.steps) {
      console.log(`## [${stepIndex + 1}/${stepCount}] RUN: ${step.name}`);
      var r = step.action();
      var isError = false;
      if (r instanceof Promise) {
        await r.catch((err) => {
          isError = true;
          console.error(err);
        });
      }
      if (isError) {
        console.error(`## [${stepIndex + 1}/${stepCount}] Failed: ${step.name}`);
        console.error('## [ERROR] Please check the log above.');
        break;
      }
      else {
        console.log(`## [${stepIndex + 1}/${stepCount}] COMPLETE: ${step.name}`);
      }
      stepIndex++;
    }
  }
}

module.exports = Stepper;
