var path = require('path');

module.exports = function(filename) {
  return filename.slice(filename.lastIndexOf(path.sep)+1).replace('.js', '');
};