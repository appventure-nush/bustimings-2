function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function renderer(data) {
  var html = "";
  var busStops = {
    "16991": "Front Gate",
    "17191": "Back Gate",
    "17129": "Back Gate Middle",
    "17121": "Back Gate Far"
  };

  var _iterator = _createForOfIteratorHelper(data),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var stop = _step.value;
      stop = stop.filter(function (_ref) {
        var ServiceNo = _ref.ServiceNo;
        return ServiceNo !== "963R" && ServiceNo !== "97e";
      });

      if (stop.length > 3) {
        // Break into 2 columns
        var stopA = stop.slice(0, Math.ceil(stop.length / 2));
        var stopB = stop.slice(Math.ceil(stop.length / 2), stop.length);
        html += "\n      <p class='stopName'>\n        ".concat(busStops[stop[0].stopId], "\n      </p>");
        html += "\n      <div class='stop-parent'><div class=\"float-left\">\n      <table class='stop'>";
        html += renderBusStop(stopA, busStops[stop[0].stopId]);
        html += "</div>\n      <div class=\"float-right\">\n      <table class='stop'>\n      ";
        html += renderBusStop(stopB, "<!-- Part B of ".concat(busStops[stop[0].stopId], " -->"));
        html += "</div></div>";
      } else {
        html += "\n      <p class='stopName'>\n        ".concat(busStops[stop[0].stopId], "\n      </p>\n      <div class='stop-parent'><div class='float-left'><table class='stop'>");
        html += renderBusStop(stop, busStops[stop[0].stopId]) + "</div></div>";
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return html + "<br><br>";
}

function getMins(time) {
  var currTime = new Date();

  if (!time instanceof Date) {
    return "--";
  }

  if (time - currTime < 0) {
    return "No data";
  } else if (time - currTime > 60000) {
    return Math.floor((time - currTime) / 60000);
  } else if (time - currTime < 60000) {
    return "Arr";
  } else {
    return "--";
  }
}

function getLoadClass(load) {
  if (!load) {
    return "load-unknown";
  }

  return "load-" + load;
}

function displayTiming(busNo, _ref2) {
  var load = _ref2.Load,
      arrival = _ref2.EstimatedArrival;
  var debug = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var arrivalMins = getMins(new Date(arrival));
  var html = "<td class='t1 ".concat(arrivalMins === "No data" ? "no-data" : getLoadClass(load), "'>\n      ").concat(arrivalMins);

  if (busNo) {
    html = "<td class='busNo'>".concat(busNo, "</td>") + html;
  }

  if (arrivalMins != 'Arr' && arrivalMins !== 'No data' && arrivalMins !== '--') {
    html += "<span class='m'>m</span>";
  }

  return html + (debug ? "<div class=\"small\">".concat(new Date(arrival).toLocaleTimeString(), "</div></td>") : "</td>");
}

function renderBusStop(services) {
  var debug = false;
  var html = "";

  var _iterator2 = _createForOfIteratorHelper(services),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var service = _step2.value;
      html += "<tr>\n      ".concat(displayTiming(service.ServiceNo, service.NextBus, debug), "\n      ").concat(displayTiming(null, service.NextBus2, debug), "\n      </tr>\n      ");
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  return html + "</table>";
}

if (typeof navigator === "undefined") {
  module.exports = renderer;
}
