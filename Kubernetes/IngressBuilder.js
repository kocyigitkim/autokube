const Application = require("../Core/Application");
const fs = require("fs");
const path = require("path");

/**
 *
 * @param {Application} app
 */
function Build(app, imagetag, releaseMode) {
  const appName = app.name + "-" + releaseMode;
  const __secret = app.secret || (app.ingress && app.ingress.secret);
  var _ingress = {
    kind: "Ingress",
    apiVersion: "extensions/v1beta1",
    metadata: {
      name: appName + "-ingress",
      annotations: {
        "kubernetes.io/ingress.class": "nginx",
        "nginx.ingress.kubernetes.io/proxy-read-timeout": '1200',
        "nginx.ingress.kubernetes.io/proxy-send-timeout": '1200',
        ...(app.ingress.pathRewrite
          ? {
            "nginx.ingress.kubernetes.io/rewrite-target":
              app.ingress.pathRewrite,
          }
          : {}),
        "nginx.ingress.kubernetes.io/use-regex": app.ingress.isRegex
          ? "true"
          : "false",
        ...(app.ingress.sslredirect
          ? {
            "nginx.ingress.kubernetes.io/force-ssl-redirect": "true",
            "nginx.ingress.kubernetes.io/ssl-redirect": "true",
          }
          : {
            "nginx.ingress.kubernetes.io/force-ssl-redirect": "false",
            "nginx.ingress.kubernetes.io/ssl-redirect": "false",
          }),
        ...(app.ingress.annotations ? app.ingress.annotations : {}),
      },
    },
    spec: {
      ...(__secret ? { tls: [{ secretName: __secret }] } : {}),
      rules: [
        {
          host: app.ingress.host,
          http: {
            paths: [
              {
                path: app.ingress.inputPath,
                backend: {
                  serviceName: appName,
                  servicePort: app.ingress.port,
                },
              },
            ],
          },
        },
      ],
    },
  };

  return [
    _ingress,
    {
      host: app.ingress.host,
      path: app.ingress.inputPath,
      serviceName: appName,
      servicePort: app.ingress.port,
      secret: __secret,
      regex: app.ingress.isRegex,
      target: app.ingress.pathRewrite,
    },
  ];
}

module.exports = Build;
