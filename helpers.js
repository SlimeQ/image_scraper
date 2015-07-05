var fs   = require('fs');
var path = require('path');

exports.hrsToSec = function(hr) {
  return hr * 60 * 60;
}
exports.timestamp = function() {
  return Math.round(+new Date()/1000);
}
exports.ensureExists = function(path, mask, cb) {
  if (typeof mask == 'function') {
    // allow the `mask` parameter to be optional
    cb = mask;
    mask = 0777;
  }
  fs.mkdir(path, mask, function(err) {
    if (err) {
      // ignore the error if the folder already exists
      if (err.code == 'EEXIST') {
        cb(null); 
      } else {
        // something else went wrong
        cb(err);
      }
    } else {
      // successfully created folder
      cb(null);
    }
  });
}