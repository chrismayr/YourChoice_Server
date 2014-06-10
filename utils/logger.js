var clc = require('cli-color'),
    log = clc.green,
    logBold = clc.green.bold,
    error = clc.red,
    errorBold = clc.red.bold,
    warn = clc.yellow,
    warnBold = clc.yellow.bold,
    margenta = clc.magenta;

module.exports = {
  log: function(text, req) {
    if (req) {
      var method = req.method,
          resource = req.url,
          body = JSON.stringify(req.body);

      console.log(log(resource) + logBold(' | ' + method + ' | ') + text);
      if (body != '{}') {
        console.log(margenta(body));
      }
    } else {
      console.log(logBold(text));
    }
  },
  error: function(text, req) {
    if (req) {
      var method = req.method,
          resource = req.url,
          body = JSON.stringify(req.body);

      console.log(error(resource) + errorBold(' | ' + method + ' | ') + text);
      if (body != '{}') {
        console.log(margenta(body));
      }
    } else {
      console.log(errorBold(text));
    }
  },
  warn: function(text, req) {
    if (req) {
      var method = req.method,
          resource = req.url,
          body = JSON.stringify(req.body);

      console.log(warn(resource) + warnBold(' | ' + method + ' | ') + text);
      if (body != '{}') {
        console.log(margenta(body));
      }
    } else {
      console.log(warnBold(text));
    }
  },
}