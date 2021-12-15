const Application = require("../Core/Configuration/Application");
const fs = require("fs");
const path = require("path");

/**
 *
 * @param {Application} app
 */
function Build(app, releaseMode) {
  const appName = app.name + "-" + releaseMode;
  const labels = {
    app: appName,
    release: releaseMode,
  };

  return {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name: appName,
      labels: labels,
    },
    spec: {
      type: app.servicetype || "ClusterIP",
      ...(Array.isArray(app.endPoints) && {
        ports: app.endPoints.map((p) => ({
          port: p.out,
          targetPort: p.in,
          name: p.name || (p.in == 80 ? "HTTP" : p.in == 443 ? "HTTPS" : "TCP"),
          protocol: p.name.toUpperCase() == "UDP" ? "UDP" : "TCP",
        })),
      }),
      selector: labels,
    },
  };
}

module.exports = Build;
