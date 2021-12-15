const Application = require("../Core/Configuration/Application");

/**
 * @param {Application} app
 */
function Build(app) {
  var output = [];
  if (app.storage && Array.isArray(app.storage)) {
    for (var storage of app.storage) {
      output.push({
        apiVersion: "v1",
        kind: "PersistentVolumeClaim",
        metadata: {
          name: app.name + "-" + storage.name + "-pvc",
          namespace: app.workingNamespace,
        },
        spec: {
          accessModes: [storage.accessMode || "ReadWriteOnce"],
          resources: {
            requests: {
              storage: storage.size,
            },
          },
          ...(storage.storage ? { storageClassName: storage.storage } : {}),
          volumeMode: storage.volumeMode || "Filesystem",
        },
      });
    }
  }
  return output;
}

module.exports = Build;
