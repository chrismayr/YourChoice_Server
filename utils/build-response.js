module.exports = function(resourceName, data) {
  var response = {};
  response[resourceName] = data;

  return response;
};