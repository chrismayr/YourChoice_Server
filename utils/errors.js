function NotFound(msg) {
    this.name = 'NotFound';
    this.message = msg;
    this.toJson = function() {
      return JSON.stringify(this);
    };
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
};
NotFound.prototype.__proto__ = Error.prototype;

function Unauthorized(msg) {
    this.name = this.message = 'Unauthorized';
    this.toJson = function() {
      return JSON.stringify(this);
    };
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}
Unauthorized.prototype.__proto__ = Error.prototype;

function BadRequest(msg) {
    this.name = 'BadRequest';
    this.message = msg;
    this.toJson = function() {
      return JSON.stringify(this);
    };
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}
BadRequest.prototype.__proto__ = Error.prototype;

module.exports = {
  notfound: NotFound,
  unauthorized: Unauthorized,
  badrequest: BadRequest
}