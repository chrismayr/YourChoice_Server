module.exports = function arrayObjectIndexOf(collection, key, findValue) {
    for(var i = 0, len = collection.length; i < len; i++) {
        if (collection[i][key] === findValue) return i;
    }
    return -1;
};