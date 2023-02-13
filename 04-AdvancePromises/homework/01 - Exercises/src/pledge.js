'use strict';
/*----------------------------------------------------------------
Promises Workshop: construye la libreria de ES6 promises, pledge.js
----------------------------------------------------------------*/

// // TU CÓDIGO AQUÍ:

const isFnc = (maybeFnc) => typeof maybeFnc === "function";

function $Promise(executor) {
  if (!isFnc(executor)) throw new TypeError("executor must be a function");

  this._state = "pending";
  this._value = undefined;
  this._handlerGroups = [];

  executor(this._internalResolve.bind(this), this._internalReject.bind(this));
}

$Promise.prototype._internalResolve = function (data) {
  if (this._state === "pending") this._internalStateChange("fulfilled", data);
};

$Promise.prototype._internalReject = function (reason) {
  if (this._state === "pending") this._internalStateChange("rejected", reason);
};

$Promise.prototype._internalStateChange = function (state, value) {
  this._state = state;
  this._value = value;
  this._callHandlers();
};

$Promise.prototype.then = function (successCb, errorCb) {
  const downstreamPromise = new $Promise(() => {});

  this._handlerGroups.push({
    successCb: isFnc(successCb) ? successCb : null,
    errorCb: isFnc(errorCb) ? errorCb : null,
    downstreamPromise,
  });

  if (this._state !== "pending") {
    this._callHandlers();
  }

  return downstreamPromise;
};

$Promise.prototype.catch = function (errorCb) {
  return this.then(null, errorCb);
};

$Promise.prototype._callHandlers = function () {
  while (this._handlerGroups.length) {
    const handler = this._handlerGroups.shift();
    const method = this._state === "fulfilled" ? "successCb" : "errorCb";
    const promise =
      this._state === "fulfilled" ? "_internalResolve" : "_internalReject";
    const downstream = handler.downstreamPromise;

    try {
      if (!handler[method]) {
        downstream[promise](this._value);
      } else {
        const handlerResult = handler[method](this._value);

        if (handlerResult instanceof $Promise) {
          handlerResult.then(
            (value) => {
              downstream._internalResolve(value);
            },
            (reason) => {
              downstream._internalReject(reason);
            }
          );
        } else {
          downstream._internalResolve(handlerResult);
        }
      }
    } catch (err) {
      downstream._internalReject(err);
    }
  }
};

$Promise.resolve = function (value) {
  if (value instanceof $Promise) return value;
  return new $Promise((resolve) => resolve(value));
};

$Promise.all = function (array) {
  if (!Array.isArray(array)) {
    throw new TypeError("$Promise.all only accepts arrays");
  }

  return new $Promise(function (res, rej) {
    var resolvedValues = [];
    var cont = 0;
    for (let i = 0; i < array.length; i++) {
      $Promise
        .resolve(array[i])
        .then((val) => {
          resolvedValues[i] = val;
          cont++;
          if (cont === array.length) {
            res(resolvedValues);
          }
        })
        .catch((err) => rej(err));
    }
  });
};

module.exports = $Promise;
/*-------------------------------------------------------
El spec fue diseñado para funcionar con Test'Em, por lo tanto no necesitamos
realmente usar module.exports. Pero aquí está para referencia:

module.exports = $Promise;

Entonces en proyectos Node podemos esribir cosas como estas:

var Promise = require('pledge');
…
var promise = new Promise(function (resolve, reject) { … });
--------------------------------------------------------*/
