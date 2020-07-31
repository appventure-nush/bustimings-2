function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

Sentry.init({
  dsn: 'https://49b3a3016f6142528d355dc7042ef841@sentry.io/2322532'
});

function updateTime() {
  var hours = new Date().getHours();
  var minutes = new Date().getMinutes();
  var seconds = new Date().getSeconds();
  var time = (hours % 12).toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0') + (hours > 11 && hours !== 24 ? "pm" : "am");

  if (time === "08:44:12am") {
    // Refresh page daily
    location.reload();
  }

  document.getElementById("time").innerText = time;
}

updateTime();
setInterval(updateTime, 500);
var conn = io(location.origin, {
  secure: true,
  reconnectionDelay: 100,
  timeout: 3000,
  path: "/socket.io"
});
conn.on("connect", function () {
  new Promise(function (res, rej) {
    conn.emit("dataReq", function (err, data) {
      if (err) return rej(err);
      return res(data);
    });
  }).catch(function (error) {
    var json = getCachedData();
    document.getElementById("output").innerHTML = "\n    <p class=\"error\">\n      Error loading data from server. Arrival times are estimated.<br>\n      Last fetched: ".concat(new Date(json[0].lastUpdated).toLocaleTimeString(), "\n    </p>\n    ");
    document.getElementById("output").innerHTML += renderer(json);
    throw error;
  }).then(function (json) {
    console.log(json);
    setCachedData(json);
    return json;
  }).then(function (json) {
    document.getElementById("output").innerHTML = renderer(json);
  }); // Server pushes data

  conn.on("data", /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(data) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              console.log("Data pushed:", data);
              setCachedData(data);
              document.getElementById("output").innerHTML = renderer(data);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
  conn.on("reRender", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var data;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            data = getCachedData();
            document.getElementById("output").innerHTML = renderer(data);

          case 2:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  })));
});
conn.on("connect_error", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
  var json;
  return regeneratorRuntime.wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          console.log("Connection error");
          json = getCachedData();
          console.log("Locally cached:", json);
          document.getElementById("output").innerHTML = "\n  <p class=\"error\">\n    Error loading data from server. Arrival times are estimated.<br>\n    Last fetched: ".concat(new Date(json[0].lastUpdated).toLocaleTimeString(), "\n  </p>\n  ");
          document.getElementById("output").innerHTML += renderer(json);

        case 5:
        case "end":
          return _context3.stop();
      }
    }
  }, _callee3);
})));

function getCachedData() {
  var services = JSON.parse(localStorage.getItem("data")).map(function (_ref4) {
    var service = _ref4.service,
        lastUpdated = _ref4.lastUpdated;
    service.lastUpdated = lastUpdated;
    return service;
  }).sort(function (a, b) {
    return a.length - b.length;
  });

  var _iterator = _createForOfIteratorHelper(services),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var service = _step.value;

      var _iterator2 = _createForOfIteratorHelper(service),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var bus = _step2.value;

          // If next bus already arrived, move buses forward
          if (new Date(bus.NextBus2.EstimatedArrival).getTime() < new Date().getTime()) {
            bus.NextBus2 = bus.NextBus3;
            bus.NextBus3 = {
              EstimatedArrival: new Date(0)
            };
          }

          if (new Date(bus.NextBus.EstimatedArrival).getTime() < new Date().getTime()) {
            bus.NextBus = bus.NextBus2;
            bus.NextBus2 = bus.NextBus3;
            bus.NextBus3 = {
              EstimatedArrival: new Date(0)
            };
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return services;
}

function setCachedData(services) {
  var data = [];

  var _iterator3 = _createForOfIteratorHelper(services),
      _step3;

  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      var service = _step3.value;
      if (service.length === 0) continue;
      data.push({
        stopId: service[0].stopId,
        service: service,
        lastUpdated: new Date().getTime()
      });
    }
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }

  localStorage.setItem("data", JSON.stringify(data));
}
