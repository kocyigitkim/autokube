class IstioStringMatch {
  constructor() {
    this.exact = null;
    this.prefix = null;
    this.regex = null;
  }
}

class IstioHttpMatchRequest {
  constructor() {
    this.uri = new IstioStringMatch();
    this.scheme = new IstioStringMatch();
    this.authority = new IstioStringMatch();
    this.method = new IstioStringMatch();
    this.headers = [{ key: null, match: new IstioStringMatch() }];
    this.port = null;
    this.sourceLabels = [{ key: null, value: "" }];
    this.gateways = [""];
    this.queryParams = [{ key: null, match: new IstioStringMatch() }];
    this.ignoreUriCase = false;
    this.withoutHeaders = [{ key: null, match: new IstioStringMatch() }];
    this.sourceNamespace = "";
  }
}

class IstioHttpHeaderOperations {
  constructor() {
    this.add = [{ key: null, value: "" }];
    this.remove = [{ key: null }];
    this.set = [{ key: null, value: "" }];
  }
}

class IstioHttpRouteDestination {
  constructor() {
    this.weight = null;
    this.destination = new IstioDestination();
    this.headers = [
      {
        request: new IstioHttpHeaderOperations(),
        response: new IstioHttpHeaderOperations(),
      },
    ];
  }
}

class IstioHttpRedirect {
  constructor() {
    this.uri = "";
    this.authority = "";
    this.redirectCode = "";
    this.port = "";
    this.scheme = "";
    this.derivePort = "";
  }
}

class IstioHttpDelegate {
  constructor() {
    this.name = "";
    this.namespace = "";
  }
}

class IstioHttpRewrite {
  constructor() {
    this.uri = "";
    this.authority = "";
  }
}
class IstioDuration {
  constructor() {
    this.seconds = "";
    this.nanos = "";
  }
}

class IstioRetries {
  constructor() {
    this.attempts = "";
    this.perTryTimeout = new IstioDuration();
    this.retryOn = "";
    this.retryRemoteLocalities = [false];
  }
}
class IstioDelay {
  constructor() {
    this.fixedDelay = new IstioDuration();
    this.percentage = "";
    this.percent = 0;
  }
}
class IstioAbort {
  constructor() {
    this.httpStatus = "";
    this.percentage = 0;
  }
}
class IstioFault {
  constructor() {
    this.abort = new IstioAbort();
    this.delay = new IstioDelay();
  }
}
class IstioCorsPolicy {
  constructor() {
    this.allowCredentials = false;
    this.allowHeaders = [""];
    this.allowMethods = [""];
    this.allowOrigin = [""];
    this.exposeHeaders = [""];
    this.maxAge = new IstioDuration();
  }
}
class IstioHttpRoute {
  constructor() {
    this.match = [new IstioHttpMatchRequest()];
    this.route = [new IstioHttpRouteDestination()];
    this.redirect = new IstioHttpRedirect();
    this.delegate = new IstioHttpDelegate();
    this.rewrite = new IstioHttpRewrite();
    this.timeout = new IstioDuration();
    this.retries = new IstioRetries();
    this.fault = new IstioFault();
    this.mirror = new IstioDestination();
    this.mirrorPercentage = null;
    this.corsPolicy = new IstioCorsPolicy();
    this.headers = [
      {
        request: new IstioHttpHeaderOperations(),
        response: new IstioHttpHeaderOperations(),
      },
    ];
  }
}
class IstioTLSMatchRequest {
  constructor() {
    this.sniHosts = [""];
    this.destinationSubnets = [""];
    this.port = 0;
    this.sourceLabels = [{ key: null, value: "" }];
    this.gateways = [""];
    this.sourceNamespace = "";
  }
}
class IstioTLSRoute {
  constructor() {
    this.match = [new IstioTLSMatchRequest()];
    this.route = [new IstioHttpRouteDestination()];
  }
}
class IstioTCPRoute {
  constructor() {
    this.name = "";
    this.uri = new IstioStringMatch();
    this.scheme = new IstioStringMatch();
    this.method = new IstioStringMatch();
    this.headers = [{ key: null, match: new IstioStringMatch() }];
    this.authority = new IstioStringMatch();
    this.sourceLabels = [{ key: null, value: "" }];
    this.port = null;
    this.sourceNamespace = "";
    this.gateways = [""];
    this.queryParams = [{ key: null, match: new IstioStringMatch() }];
    this.ignoreUriCase = false;
    this.withoutHeaders = [{ key: null, match: new IstioStringMatch() }];
  }
}
class IstioLoadBalancer{
    constructor() {
        this.simple = "";
        
    }
}
class IstioTrafficPolicy{
    constructor() {
        this.loadBalancer = new IstioLoadBalancer();
    }
}
class IstioDestinationRule{
    constructor() {
        this.host = "";
        this.subsets = [""];
        this.trafficPolicy = new IstioTrafficPolicy();
        this.http = new IstioHttpRoute();
        this.tls = new IstioTLSRoute();
        this.tcp = new IstioTCPRoute();
    }
}
class IstioDefinition {
  constructor() {
    this.service = {
      hosts: [""],
      gateways: [""],
      http: [new IstioHttpRoute()],
      tls: [new IstioTLSRoute()],
      tcp: [new IstioTCPRoute()],
      exportTo: [""],
      };
      this.destination = [new IstioDestinationRule()];
  }
}

class IstioDestination {
  constructor() {
    this.host = "";
    this.port = null;
    this.subset = "";
  }
}

module.exports = IstioDefinition;
