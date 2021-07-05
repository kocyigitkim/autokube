class Version {
  constructor(v, b) {
    this.major = 0;
    this.minor = 0;
    this.patch = 0;
    this.prefix = "";
    this.postfix = "";
    this.isTextual = false;
    this.textual = "";

    if (b) {
      this.isTextual = true;
      this.textual = v;
      return;
    }
    var parts = v.split("-");
    var versionIndex = parts.findIndex((p) => p.indexOf(".") > -1);

    var prefixIndex = versionIndex > 0 && parts.length >= 2 ? 0 : -1;
    var postfixIndex =
      parts.length >= 2 && versionIndex != parts.length - 1
        ? parts.length - 1
        : -1;

    if (prefixIndex > -1) {
      this.prefix = parts[prefixIndex];
    } else {
      this.prefix = null;
    }
    if (postfixIndex > -1) {
      this.postfix = parts[postfixIndex];
    } else {
      this.postfix = null;
    }
    if (versionIndex > -1) {
      var version = parts[versionIndex].split(".");
      this.major = parseInt(version[0]);
      this.minor = parseInt(version[1]);
      this.patch = parseInt(version[2]);
    }
  }
  toString() {
    if (this.isTextual) return this.textual;
    var v = [this.major || "0", this.minor || "0", this.patch || "0"].join(".");
    var prefix = this.prefix ? this.prefix + "-" : "";
    var postfix = this.postfix ? "-" + this.postfix : "";
    return prefix + v + postfix;
  }
  next() {
    var newVersion = { ...this };
    newVersion.patch++;
    if (newVersion.patch == 10) {
      newVersion.patch = 0;
      newVersion.minor = 1;
    }
    newVersion.minor += this.minor;
    if (newVersion.minor == 10) {
      newVersion.minor = 0;
      newVersion.major = 1;
    }

    newVersion.major += this.major;
    return newVersion;
  }
  previous() {
    var newVersion = { ...this };
    newVersion.patch--;
    if (newVersion.patch == -1) {
      newVersion.patch = 9;
      newVersion.minor--;
    }
    newVersion.minor += this.minor;
    if (newVersion.minor == -1) {
      newVersion.minor = 9;
      newVersion.major--;
    }

    newVersion.major += this.major;
    if (newVersion.major < 0) newVersion.major = 1;
    return newVersion;
  }
}
module.exports = Version;
