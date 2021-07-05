const getArguments = require('es-arguments');

function parse(argv) {
    var args = argv.slice(2, argv.length);
    var actionName = args[0];
    var vargs = {};
    args.filter(p => p.indexOf("=") > -1 && (p.startsWith("-") || p.startsWith(":"))).forEach(p => {
        var kv = p.substr(1).split("=");
        if (kv.length == 1) return vargs[kv[0]] = null;
        var v = kv[1];
        if (v) v = v.trim();

        //Try parse number
        {
            var vfloat = parseFloat(v);
            if (!isNaN(vfloat)) v = vfloat;
        }
        //Try parse boolean
        {
            if (v == "true" || v == "false") v = (v == "true");
        }

        vargs[kv[0]] = v;
    });
    return {
        action: actionName,
        args: vargs
    };
}

function executor(argv, definitions) {
    if (argv.length <= 2) {
        console.error("Unknown command");
        return;
    }
    var target = parse(argv);

    if (target.action in definitions) {
        var action = definitions[target.action];
        var arglist = [];
        var actionArgs = getArguments(action);
        for(var argname of actionArgs){
            var value = null;
            if(argname in target.args){
                value = target.args[argname];
            }
            arglist.push(value);
        }
        action(...arglist);
    }
    else {
        console.error("Unknown command");
    }
}


module.exports.parse = parse;
module.exports.functionExecutor = executor;