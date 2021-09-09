

# AutoKube
AutoKube Is Open-Source Automated Continuous Deployment Tool For Kubernetes. 

### How it works?
AutoKube have special config definition for deployment. You can import an existing application into the kubernetes environment in a simpler way, away from many unnecessary definitions. For this, you only need to specify the name, platform and version of the application.

#### For example;
	
Autokube uses "autokube.json" file format. When you define configuration file on project directory, Autokube automatically will find and deploy.

 ```json
 {
  "workingNamespace": "service",
  "projectName": "Example Console App",
  "name": "exampleconsoleapp",
  "platform": "DOTNETCORE",
  "version": "latest"
}
 ```

### How to use?
- Step by step:
	1) Open a new command line on project directory. 
	2) Type "node /autokube/index.js build" and run.
		-- /autokube: We are used this directory for example. You can move AutoKube to specific directory you want.
	AutoKube find docker & kubernetes easily on working os and start the deployment.

---
#### Configuration File Structure (autokube.json)
 ```js
{
   "workingNamespace":"Kubernetes Namespace (required)",
   "projectName":"(Required)",
   "name":" a-zA-Z0-9 ",
   "platform":" Platform Name (required) ", //For example: NODEJS
   "platformVersion": "Platform Version (required)", //For example: latest, any or specify version
   "configs":[ "Config file path", ...n ], // optional, you can use config files with configmap
   "endPoints":[ // endpoints are optional
      {
         "name":"PORT NAME",
         "in": Container Port ,
         "out": Service Port
      },
      ... // You can define n endpoint
   ],
   "secret":"SECRET NAME", //optional, you can define ssl certificates with this option
   "env":[ // You can define environment variables
      {
         "name":"KEY",
         "value":"VALUE"
      },
      ...
   ],
   "servicetype":"ClusterIP", // Optional, ClusterIP is default. You can choose one of ["NodePort", "LoadBalancer", "ClusterIP"]
   "nodeName": "Kubernetes Node Name", // Optional, You can use specified Kubernetes Node
   "ingress":{ // Optional, You can serve your web applications easily with this option
      "host":"example.com",
      "inputPath":"/.*",
      "port": 80, // Service Port
      "secret":"SECRET NAME", // Optional, You can define ssl certificates with this option. That's same with general secret option
      "isRegex":true, //Optional
      "pathRewrite": "/$1", //Optional
      "sslredirect": false //Optional (default: false)
   },
   "performance":{ 
   /* Optional, You can limit cpu & memory resources. Disabled as default
	You can choose one of [null, "lowest", "low", "medium", "high", "highest"]
	*/
      "cpu":{
         "request":"(Optional)",
         "limit":"(Optional)"
      },
      "memory":{
         "request":"(Optional)",
         "limit":"(Optional)"
      }
   },
   "health":{ // Optional, You can check the application's health status.
      "path":"Health Check Path (uses HTTP GET)",
      "port": 80, // Port
      "initial": 10, // Initial seconds. 
      "period": 5 // Kubernetes will check the application's health status each 5 seconds and it's will work when deployment completed
   },
   "deployment":{ // Optional
      "initialpod":1, // Initial pod count
      "min":1, // Minimum pod count
      "max":1, // Maximum pod count
      "cpuRequest":50 // Requested cpu ratio (% percentage)
   }
}
```

### What's next?
	- DaemonSet, CronJob, Job support
		Daemonsets work on all kubernetes nodes.
		CronJobs work on rule you defined.
		Job work one time when your kubernetes cluster first
	- PVC support
		AutoKube currently not supports pvc storages. We will support on next commit. 
	- Automated Version Control
		We aim to do version control automated. For now, all apps deploying as latest version.
	- Advanced Deployment Controller
		Kubernetes already have health check mechanism. But we though different than k8s. When docker images removes uncontrolled or careless, AutoKube will be prepared for re-deploy & use local registry for temporary if can't access pre-defined registry server.
	- PHP, Python, Java, Go, C++ language supports.
		AutoKube supports Node.JS & .NET for now. You can create and use your own dockerfiles. We aim to support all popular programming languages in the world. We will be supporting these programming languages as soon as possible.

---

Soon...
