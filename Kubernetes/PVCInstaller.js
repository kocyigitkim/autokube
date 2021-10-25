const Application = require("../Core/Application");

/**
    * @param {Application} app
*/
function Build(app) {
    var output = [];
    if (app.storage && Array.isArray(app.storage)) {
        for (var storage of app.storage) {
            output.push({
                apiVersion: "v1",
                kind: 'PersistentVolumeClaim',
                metadata: {
                    name: storage.name,
                    namespace: app.workingNamespace
                },
                spec: {
                    accessModes: [storage.accessMode || "ReadWriteOnce"],
                    resources: {
                        requests: {
                            storage: storage.size
                        }
                    },
                    ...(storage.storage ? { storageClassName: storage.storage } : {}),
                    volumeMode: storage.volumeMode || "Filesystem"
                }
            })
        }
    }
    return output;
}