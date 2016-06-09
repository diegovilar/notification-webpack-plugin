"use strict";

var path = require("path");
var notifier = require("node-notifier");

var successIcon = path.join(__dirname, "success.png");
var failureIcon = path.join(__dirname, "failure.png");

function copy(target, source) {

    if (source) {
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }            
        }
    }

    return target;

}

var defualtOptions = {
    title: "Webpack",
    sound: true,
    successIcon: successIcon,
    failureIcon: failureIcon,
    message: function(stats) {
        var totalErros = stats.compilation.errors.length;
        var time = ((stats.endTime - stats.startTime) / 1000).toFixed(2);
        var msg = "Completed in " + time + " seconds";

        if (totalErros === 1) {
            msg += ", but with error: " + stats.compilation.errors[0].rawMessage;
        }
        else if (totalErros > 1) {
            msg += ", but with " + totalErros + " errors"
        }
        
        return msg;
    }
};

function NotificationPlugin(options) {

    this.options = copy({}, defualtOptions);
    this.options = copy(this.options, options);

}

NotificationPlugin.prototype._optionsFor = function(stats) {

    var runtimeOptions = copy({}, this.options);
    var success = stats.compilation.errors.length == 0;

    if (!success) {
        runtimeOptions.time = 0; // windows, infinity
        runtimeOptions.wait = true;
        runtimeOptions.sticky = true; // growl
    }

    runtimeOptions.icon = success ? runtimeOptions.successIcon : runtimeOptions.failureIcon;
    
    if (typeof runtimeOptions.title == "function") {
        runtimeOptions.title = runtimeOptions.title(stats);
    }

    if (typeof runtimeOptions.message == "function") {
        runtimeOptions.message = runtimeOptions.message(stats);
    }

    return runtimeOptions;

};

NotificationPlugin.prototype.apply = function(compiler) {

    var _this = this;
    compiler.plugin("done", function(stats) {

        var options = _this._optionsFor(stats);
        if (!options.wait) {
            notifier.notify(options);
        }
        else {
            notifier.notify(options, function() {});
        }
        
    });

};

module.exports = NotificationPlugin;