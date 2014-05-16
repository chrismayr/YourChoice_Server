module.exports = function(collection, key, findValue) {
  return collection.filter(function(obj) {
    return obj[key] == findValue;
  });
};