const KubeCLI = require("./KubernetesCLI");
const cmd = require("../Console/CommandLineHost");
const path = require("path");
const fs = require("fs");
const uuid = require("uuid").v4;

class CertificateInstaller {
  constructor(namespace, certificatepath) {
    this.namespace = namespace;
    this.certificatepath = certificatepath;
    var basepath = path.join(
      __basedir,
      "Certificates",
      certificatepath,
      "Definition.json"
    );
    var definition = null;
    var isExist = false;
    var definitionPath = null;
    if (fs.existsSync(basepath)) {
      definitionPath = basepath;
      isExist = true;
    } else {
      if (fs.existsSync(certificatepath)) {
        definitionPath = certificatepath;
        isExist = true;
      }
    }

    if (isExist) {
      definition = JSON.parse(fs.readFileSync(definitionPath, "utf-8"));
      var certificateFilePath = path.join(
        path.parse(definitionPath).dir,
        definition.filepath
      );
      this.definition = definition;
      this.certificateFilePath = certificateFilePath;
    }
  }
  async install() {
    if (this.definition) {
      if (this.definition.type == "pfx") {
        var secrets = await KubeCLI.GetSecrets(this.namespace);
        if (secrets.filter((p) => p.Name == this.definition.name).length == 0) {
          var outkeypath = path.join(__basedir, uuid() + ".key");
          var outcertpath = path.join(__basedir, uuid() + ".crt");
          console.log("## Generating key file...");
          //Generate Key File
          await new cmd(
            "openssl",
            [
              "pkcs12",
              "-in",
              this.certificateFilePath,
              "-nocerts",
              "-out",
              outkeypath,
              "-password",
              "pass:" + this.definition.password,
              "-passin",
              "pass:" + this.definition.password,
              "-passout",
              "pass:" + this.definition.password,
            ],
            null,
            true
          ).start();
          console.log("## Generating certificate file...");
          //Generate Cert File
          await new cmd(
            "openssl",
            [
              "pkcs12",
              "-in",
              this.certificateFilePath,
              "-clcerts",
              "-nokeys",
              "-out",
              outcertpath,
              "-password",
              "pass:" + this.definition.password,
              "-passin",
              "pass:" + this.definition.password,
              "-passout",
              "pass:" + this.definition.password,
            ],
            __basedir,
            true
          ).start();
          console.log("## Converting key file...");
          //Decode Key File
          await new cmd(
            "openssl",
            [
              "rsa",
              "-in",
              outkeypath,
              "-outform",
              "PEM",
              "-out",
              outkeypath,
              "-passin",
              "pass:" + this.definition.password,
              "-passout",
              "pass:" + this.definition.password,
            ],
            __basedir,
            true
          ).start();

          console.log("## Installing certificate...");
          await new cmd(
            "kubectl",
            [
              "create",
              "secret",
              "tls",
              this.definition.name,
              '--key="' + path.parse(outkeypath).name + '"',
              '--cert="' + path.parse(outcertpath).name + '"',
              "-n",
              this.namespace
            ],
            __basedir,
            false
          ).start();
          console.log("## Installation successfully.");

          fs.unlinkSync(outkeypath);
          fs.unlinkSync(outcertpath);
        }
      }
    } else {
      console.error(
        "Certificate can not loaded. Path: " + this.certificatepath
      );
    }
  }
}

module.exports = CertificateInstaller;
