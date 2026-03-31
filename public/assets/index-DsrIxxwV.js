const __vite__mapDeps = (i, m = __vite__mapDeps, d = m.f || (m.f = ["assets/exceljs.min-D_N-FMmF.js", "assets/exceljs-BMcsBZ_F.js", "assets/excelExport-CFUKVLbe.js", "assets/arquero-6vuVcGup.js"])) => i.map(i => d[i]);
import { g as Jc, c as Ll } from "./exceljs-BMcsBZ_F.js";
import { _ as _a } from "./arquero-6vuVcGup.js";
(function () {
  const s = document.createElement("link").relList;
  if (s && s.supports && s.supports("modulepreload")) return;
  for (const p of document.querySelectorAll('link[rel="modulepreload"]')) d(p);
  new MutationObserver(p => {
    for (const m of p) if (m.type === "childList") for (const x of m.addedNodes) x.tagName === "LINK" && x.rel === "modulepreload" && d(x);
  }).observe(document, {
    childList: !0,
    subtree: !0
  });
  function u(p) {
    const m = {};
    return p.integrity && (m.integrity = p.integrity), p.referrerPolicy && (m.referrerPolicy = p.referrerPolicy), p.crossOrigin === "use-credentials" ? m.credentials = "include" : p.crossOrigin === "anonymous" ? m.credentials = "omit" : m.credentials = "same-origin", m;
  }
  function d(p) {
    if (p.ep) return;
    p.ep = !0;
    const m = u(p);
    fetch(p.href, m);
  }
})();
var Ec = {
    exports: {}
  },
  ui = {},
  Cc = {
    exports: {}
  },
  He = {}; /**
           * @license React
           * react.production.min.js
           *
           * Copyright (c) Facebook, Inc. and its affiliates.
           *
           * This source code is licensed under the MIT license found in the
           * LICENSE file in the root directory of this source tree.
           */
var Yd;
function xm() {
  if (Yd) return He;
  Yd = 1;
  var a = Symbol.for("react.element"),
    s = Symbol.for("react.portal"),
    u = Symbol.for("react.fragment"),
    d = Symbol.for("react.strict_mode"),
    p = Symbol.for("react.profiler"),
    m = Symbol.for("react.provider"),
    x = Symbol.for("react.context"),
    b = Symbol.for("react.forward_ref"),
    D = Symbol.for("react.suspense"),
    j = Symbol.for("react.memo"),
    E = Symbol.for("react.lazy"),
    R = Symbol.iterator;
  function C(y) {
    return y === null || typeof y != "object" ? null : (y = R && y[R] || y["@@iterator"], typeof y == "function" ? y : null);
  }
  var J = {
      isMounted: function () {
        return !1;
      },
      enqueueForceUpdate: function () {},
      enqueueReplaceState: function () {},
      enqueueSetState: function () {}
    },
    pe = Object.assign,
    oe = {};
  function K(y, _, Ne) {
    this.props = y, this.context = _, this.refs = oe, this.updater = Ne || J;
  }
  K.prototype.isReactComponent = {}, K.prototype.setState = function (y, _) {
    if (typeof y != "object" && typeof y != "function" && y != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, y, _, "setState");
  }, K.prototype.forceUpdate = function (y) {
    this.updater.enqueueForceUpdate(this, y, "forceUpdate");
  };
  function z() {}
  z.prototype = K.prototype;
  function Q(y, _, Ne) {
    this.props = y, this.context = _, this.refs = oe, this.updater = Ne || J;
  }
  var B = Q.prototype = new z();
  B.constructor = Q, pe(B, K.prototype), B.isPureReactComponent = !0;
  var $ = Array.isArray,
    ie = Object.prototype.hasOwnProperty,
    Y = {
      current: null
    },
    ne = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    };
  function Z(y, _, Ne) {
    var ue,
      ke = {},
      Se = null,
      Ce = null;
    if (_ != null) for (ue in _.ref !== void 0 && (Ce = _.ref), _.key !== void 0 && (Se = "" + _.key), _) ie.call(_, ue) && !ne.hasOwnProperty(ue) && (ke[ue] = _[ue]);
    var ze = arguments.length - 2;
    if (ze === 1) ke.children = Ne;else if (1 < ze) {
      for (var We = Array(ze), rt = 0; rt < ze; rt++) We[rt] = arguments[rt + 2];
      ke.children = We;
    }
    if (y && y.defaultProps) for (ue in ze = y.defaultProps, ze) ke[ue] === void 0 && (ke[ue] = ze[ue]);
    return {
      $$typeof: a,
      type: y,
      key: Se,
      ref: Ce,
      props: ke,
      _owner: Y.current
    };
  }
  function fe(y, _) {
    return {
      $$typeof: a,
      type: y.type,
      key: _,
      ref: y.ref,
      props: y.props,
      _owner: y._owner
    };
  }
  function le(y) {
    return typeof y == "object" && y !== null && y.$$typeof === a;
  }
  function H(y) {
    var _ = {
      "=": "=0",
      ":": "=2"
    };
    return "$" + y.replace(/[=:]/g, function (Ne) {
      return _[Ne];
    });
  }
  var U = /\/+/g;
  function W(y, _) {
    return typeof y == "object" && y !== null && y.key != null ? H("" + y.key) : _.toString(36);
  }
  function q(y, _, Ne, ue, ke) {
    var Se = typeof y;
    (Se === "undefined" || Se === "boolean") && (y = null);
    var Ce = !1;
    if (y === null) Ce = !0;else switch (Se) {
      case "string":
      case "number":
        Ce = !0;
        break;
      case "object":
        switch (y.$$typeof) {
          case a:
          case s:
            Ce = !0;
        }
    }
    if (Ce) return Ce = y, ke = ke(Ce), y = ue === "" ? "." + W(Ce, 0) : ue, $(ke) ? (Ne = "", y != null && (Ne = y.replace(U, "$&/") + "/"), q(ke, _, Ne, "", function (rt) {
      return rt;
    })) : ke != null && (le(ke) && (ke = fe(ke, Ne + (!ke.key || Ce && Ce.key === ke.key ? "" : ("" + ke.key).replace(U, "$&/") + "/") + y)), _.push(ke)), 1;
    if (Ce = 0, ue = ue === "" ? "." : ue + ":", $(y)) for (var ze = 0; ze < y.length; ze++) {
      Se = y[ze];
      var We = ue + W(Se, ze);
      Ce += q(Se, _, Ne, We, ke);
    } else if (We = C(y), typeof We == "function") for (y = We.call(y), ze = 0; !(Se = y.next()).done;) Se = Se.value, We = ue + W(Se, ze++), Ce += q(Se, _, Ne, We, ke);else if (Se === "object") throw _ = String(y), Error("Objects are not valid as a React child (found: " + (_ === "[object Object]" ? "object with keys {" + Object.keys(y).join(", ") + "}" : _) + "). If you meant to render a collection of children, use an array instead.");
    return Ce;
  }
  function se(y, _, Ne) {
    if (y == null) return y;
    var ue = [],
      ke = 0;
    return q(y, ue, "", "", function (Se) {
      return _.call(Ne, Se, ke++);
    }), ue;
  }
  function de(y) {
    if (y._status === -1) {
      var _ = y._result;
      _ = _(), _.then(function (Ne) {
        (y._status === 0 || y._status === -1) && (y._status = 1, y._result = Ne);
      }, function (Ne) {
        (y._status === 0 || y._status === -1) && (y._status = 2, y._result = Ne);
      }), y._status === -1 && (y._status = 0, y._result = _);
    }
    if (y._status === 1) return y._result.default;
    throw y._result;
  }
  var ge = {
      current: null
    },
    A = {
      transition: null
    },
    G = {
      ReactCurrentDispatcher: ge,
      ReactCurrentBatchConfig: A,
      ReactCurrentOwner: Y
    };
  function re() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return He.Children = {
    map: se,
    forEach: function (y, _, Ne) {
      se(y, function () {
        _.apply(this, arguments);
      }, Ne);
    },
    count: function (y) {
      var _ = 0;
      return se(y, function () {
        _++;
      }), _;
    },
    toArray: function (y) {
      return se(y, function (_) {
        return _;
      }) || [];
    },
    only: function (y) {
      if (!le(y)) throw Error("React.Children.only expected to receive a single React element child.");
      return y;
    }
  }, He.Component = K, He.Fragment = u, He.Profiler = p, He.PureComponent = Q, He.StrictMode = d, He.Suspense = D, He.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = G, He.act = re, He.cloneElement = function (y, _, Ne) {
    if (y == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + y + ".");
    var ue = pe({}, y.props),
      ke = y.key,
      Se = y.ref,
      Ce = y._owner;
    if (_ != null) {
      if (_.ref !== void 0 && (Se = _.ref, Ce = Y.current), _.key !== void 0 && (ke = "" + _.key), y.type && y.type.defaultProps) var ze = y.type.defaultProps;
      for (We in _) ie.call(_, We) && !ne.hasOwnProperty(We) && (ue[We] = _[We] === void 0 && ze !== void 0 ? ze[We] : _[We]);
    }
    var We = arguments.length - 2;
    if (We === 1) ue.children = Ne;else if (1 < We) {
      ze = Array(We);
      for (var rt = 0; rt < We; rt++) ze[rt] = arguments[rt + 2];
      ue.children = ze;
    }
    return {
      $$typeof: a,
      type: y.type,
      key: ke,
      ref: Se,
      props: ue,
      _owner: Ce
    };
  }, He.createContext = function (y) {
    return y = {
      $$typeof: x,
      _currentValue: y,
      _currentValue2: y,
      _threadCount: 0,
      Provider: null,
      Consumer: null,
      _defaultValue: null,
      _globalName: null
    }, y.Provider = {
      $$typeof: m,
      _context: y
    }, y.Consumer = y;
  }, He.createElement = Z, He.createFactory = function (y) {
    var _ = Z.bind(null, y);
    return _.type = y, _;
  }, He.createRef = function () {
    return {
      current: null
    };
  }, He.forwardRef = function (y) {
    return {
      $$typeof: b,
      render: y
    };
  }, He.isValidElement = le, He.lazy = function (y) {
    return {
      $$typeof: E,
      _payload: {
        _status: -1,
        _result: y
      },
      _init: de
    };
  }, He.memo = function (y, _) {
    return {
      $$typeof: j,
      type: y,
      compare: _ === void 0 ? null : _
    };
  }, He.startTransition = function (y) {
    var _ = A.transition;
    A.transition = {};
    try {
      y();
    } finally {
      A.transition = _;
    }
  }, He.unstable_act = re, He.useCallback = function (y, _) {
    return ge.current.useCallback(y, _);
  }, He.useContext = function (y) {
    return ge.current.useContext(y);
  }, He.useDebugValue = function () {}, He.useDeferredValue = function (y) {
    return ge.current.useDeferredValue(y);
  }, He.useEffect = function (y, _) {
    return ge.current.useEffect(y, _);
  }, He.useId = function () {
    return ge.current.useId();
  }, He.useImperativeHandle = function (y, _, Ne) {
    return ge.current.useImperativeHandle(y, _, Ne);
  }, He.useInsertionEffect = function (y, _) {
    return ge.current.useInsertionEffect(y, _);
  }, He.useLayoutEffect = function (y, _) {
    return ge.current.useLayoutEffect(y, _);
  }, He.useMemo = function (y, _) {
    return ge.current.useMemo(y, _);
  }, He.useReducer = function (y, _, Ne) {
    return ge.current.useReducer(y, _, Ne);
  }, He.useRef = function (y) {
    return ge.current.useRef(y);
  }, He.useState = function (y) {
    return ge.current.useState(y);
  }, He.useSyncExternalStore = function (y, _, Ne) {
    return ge.current.useSyncExternalStore(y, _, Ne);
  }, He.useTransition = function () {
    return ge.current.useTransition();
  }, He.version = "18.3.1", He;
}
var Zd;
function Xc() {
  return Zd || (Zd = 1, Cc.exports = xm()), Cc.exports;
} /**
  * @license React
  * react-jsx-runtime.production.min.js
  *
  * Copyright (c) Facebook, Inc. and its affiliates.
  *
  * This source code is licensed under the MIT license found in the
  * LICENSE file in the root directory of this source tree.
  */
var ep;
function vm() {
  if (ep) return ui;
  ep = 1;
  var a = Xc(),
    s = Symbol.for("react.element"),
    u = Symbol.for("react.fragment"),
    d = Object.prototype.hasOwnProperty,
    p = a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
    m = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    };
  function x(b, D, j) {
    var E,
      R = {},
      C = null,
      J = null;
    j !== void 0 && (C = "" + j), D.key !== void 0 && (C = "" + D.key), D.ref !== void 0 && (J = D.ref);
    for (E in D) d.call(D, E) && !m.hasOwnProperty(E) && (R[E] = D[E]);
    if (b && b.defaultProps) for (E in D = b.defaultProps, D) R[E] === void 0 && (R[E] = D[E]);
    return {
      $$typeof: s,
      type: b,
      key: C,
      ref: J,
      props: R,
      _owner: p.current
    };
  }
  return ui.Fragment = u, ui.jsx = x, ui.jsxs = x, ui;
}
var tp;
function wm() {
  return tp || (tp = 1, Ec.exports = vm()), Ec.exports;
}
var l = wm(),
  M = Xc();
const ym = Jc(M);
var Pl = {},
  _c = {
    exports: {}
  },
  gn = {},
  Dc = {
    exports: {}
  },
  Tc = {}; /**
           * @license React
           * scheduler.production.min.js
           *
           * Copyright (c) Facebook, Inc. and its affiliates.
           *
           * This source code is licensed under the MIT license found in the
           * LICENSE file in the root directory of this source tree.
           */
var np;
function bm() {
  return np || (np = 1, function (a) {
    function s(A, G) {
      var re = A.length;
      A.push(G);
      e: for (; 0 < re;) {
        var y = re - 1 >>> 1,
          _ = A[y];
        if (0 < p(_, G)) A[y] = G, A[re] = _, re = y;else break e;
      }
    }
    function u(A) {
      return A.length === 0 ? null : A[0];
    }
    function d(A) {
      if (A.length === 0) return null;
      var G = A[0],
        re = A.pop();
      if (re !== G) {
        A[0] = re;
        e: for (var y = 0, _ = A.length, Ne = _ >>> 1; y < Ne;) {
          var ue = 2 * (y + 1) - 1,
            ke = A[ue],
            Se = ue + 1,
            Ce = A[Se];
          if (0 > p(ke, re)) Se < _ && 0 > p(Ce, ke) ? (A[y] = Ce, A[Se] = re, y = Se) : (A[y] = ke, A[ue] = re, y = ue);else if (Se < _ && 0 > p(Ce, re)) A[y] = Ce, A[Se] = re, y = Se;else break e;
        }
      }
      return G;
    }
    function p(A, G) {
      var re = A.sortIndex - G.sortIndex;
      return re !== 0 ? re : A.id - G.id;
    }
    if (typeof performance == "object" && typeof performance.now == "function") {
      var m = performance;
      a.unstable_now = function () {
        return m.now();
      };
    } else {
      var x = Date,
        b = x.now();
      a.unstable_now = function () {
        return x.now() - b;
      };
    }
    var D = [],
      j = [],
      E = 1,
      R = null,
      C = 3,
      J = !1,
      pe = !1,
      oe = !1,
      K = typeof setTimeout == "function" ? setTimeout : null,
      z = typeof clearTimeout == "function" ? clearTimeout : null,
      Q = typeof setImmediate < "u" ? setImmediate : null;
    typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function B(A) {
      for (var G = u(j); G !== null;) {
        if (G.callback === null) d(j);else if (G.startTime <= A) d(j), G.sortIndex = G.expirationTime, s(D, G);else break;
        G = u(j);
      }
    }
    function $(A) {
      if (oe = !1, B(A), !pe) if (u(D) !== null) pe = !0, de(ie);else {
        var G = u(j);
        G !== null && ge($, G.startTime - A);
      }
    }
    function ie(A, G) {
      pe = !1, oe && (oe = !1, z(Z), Z = -1), J = !0;
      var re = C;
      try {
        for (B(G), R = u(D); R !== null && (!(R.expirationTime > G) || A && !H());) {
          var y = R.callback;
          if (typeof y == "function") {
            R.callback = null, C = R.priorityLevel;
            var _ = y(R.expirationTime <= G);
            G = a.unstable_now(), typeof _ == "function" ? R.callback = _ : R === u(D) && d(D), B(G);
          } else d(D);
          R = u(D);
        }
        if (R !== null) var Ne = !0;else {
          var ue = u(j);
          ue !== null && ge($, ue.startTime - G), Ne = !1;
        }
        return Ne;
      } finally {
        R = null, C = re, J = !1;
      }
    }
    var Y = !1,
      ne = null,
      Z = -1,
      fe = 5,
      le = -1;
    function H() {
      return !(a.unstable_now() - le < fe);
    }
    function U() {
      if (ne !== null) {
        var A = a.unstable_now();
        le = A;
        var G = !0;
        try {
          G = ne(!0, A);
        } finally {
          G ? W() : (Y = !1, ne = null);
        }
      } else Y = !1;
    }
    var W;
    if (typeof Q == "function") W = function () {
      Q(U);
    };else if (typeof MessageChannel < "u") {
      var q = new MessageChannel(),
        se = q.port2;
      q.port1.onmessage = U, W = function () {
        se.postMessage(null);
      };
    } else W = function () {
      K(U, 0);
    };
    function de(A) {
      ne = A, Y || (Y = !0, W());
    }
    function ge(A, G) {
      Z = K(function () {
        A(a.unstable_now());
      }, G);
    }
    a.unstable_IdlePriority = 5, a.unstable_ImmediatePriority = 1, a.unstable_LowPriority = 4, a.unstable_NormalPriority = 3, a.unstable_Profiling = null, a.unstable_UserBlockingPriority = 2, a.unstable_cancelCallback = function (A) {
      A.callback = null;
    }, a.unstable_continueExecution = function () {
      pe || J || (pe = !0, de(ie));
    }, a.unstable_forceFrameRate = function (A) {
      0 > A || 125 < A ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : fe = 0 < A ? Math.floor(1e3 / A) : 5;
    }, a.unstable_getCurrentPriorityLevel = function () {
      return C;
    }, a.unstable_getFirstCallbackNode = function () {
      return u(D);
    }, a.unstable_next = function (A) {
      switch (C) {
        case 1:
        case 2:
        case 3:
          var G = 3;
          break;
        default:
          G = C;
      }
      var re = C;
      C = G;
      try {
        return A();
      } finally {
        C = re;
      }
    }, a.unstable_pauseExecution = function () {}, a.unstable_requestPaint = function () {}, a.unstable_runWithPriority = function (A, G) {
      switch (A) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          A = 3;
      }
      var re = C;
      C = A;
      try {
        return G();
      } finally {
        C = re;
      }
    }, a.unstable_scheduleCallback = function (A, G, re) {
      var y = a.unstable_now();
      switch (typeof re == "object" && re !== null ? (re = re.delay, re = typeof re == "number" && 0 < re ? y + re : y) : re = y, A) {
        case 1:
          var _ = -1;
          break;
        case 2:
          _ = 250;
          break;
        case 5:
          _ = 1073741823;
          break;
        case 4:
          _ = 1e4;
          break;
        default:
          _ = 5e3;
      }
      return _ = re + _, A = {
        id: E++,
        callback: G,
        priorityLevel: A,
        startTime: re,
        expirationTime: _,
        sortIndex: -1
      }, re > y ? (A.sortIndex = re, s(j, A), u(D) === null && A === u(j) && (oe ? (z(Z), Z = -1) : oe = !0, ge($, re - y))) : (A.sortIndex = _, s(D, A), pe || J || (pe = !0, de(ie))), A;
    }, a.unstable_shouldYield = H, a.unstable_wrapCallback = function (A) {
      var G = C;
      return function () {
        var re = C;
        C = G;
        try {
          return A.apply(this, arguments);
        } finally {
          C = re;
        }
      };
    };
  }(Tc)), Tc;
}
var rp;
function km() {
  return rp || (rp = 1, Dc.exports = bm()), Dc.exports;
} /**
  * @license React
  * react-dom.production.min.js
  *
  * Copyright (c) Facebook, Inc. and its affiliates.
  *
  * This source code is licensed under the MIT license found in the
  * LICENSE file in the root directory of this source tree.
  */
var ap;
function Sm() {
  if (ap) return gn;
  ap = 1;
  var a = Xc(),
    s = km();
  function u(e) {
    for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
    return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  var d = new Set(),
    p = {};
  function m(e, t) {
    x(e, t), x(e + "Capture", t);
  }
  function x(e, t) {
    for (p[e] = t, e = 0; e < t.length; e++) d.add(t[e]);
  }
  var b = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"),
    D = Object.prototype.hasOwnProperty,
    j = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
    E = {},
    R = {};
  function C(e) {
    return D.call(R, e) ? !0 : D.call(E, e) ? !1 : j.test(e) ? R[e] = !0 : (E[e] = !0, !1);
  }
  function J(e, t, n, r) {
    if (n !== null && n.type === 0) return !1;
    switch (typeof t) {
      case "function":
      case "symbol":
        return !0;
      case "boolean":
        return r ? !1 : n !== null ? !n.acceptsBooleans : (e = e.toLowerCase().slice(0, 5), e !== "data-" && e !== "aria-");
      default:
        return !1;
    }
  }
  function pe(e, t, n, r) {
    if (t === null || typeof t > "u" || J(e, t, n, r)) return !0;
    if (r) return !1;
    if (n !== null) switch (n.type) {
      case 3:
        return !t;
      case 4:
        return t === !1;
      case 5:
        return isNaN(t);
      case 6:
        return isNaN(t) || 1 > t;
    }
    return !1;
  }
  function oe(e, t, n, r, o, c, h) {
    this.acceptsBooleans = t === 2 || t === 3 || t === 4, this.attributeName = r, this.attributeNamespace = o, this.mustUseProperty = n, this.propertyName = e, this.type = t, this.sanitizeURL = c, this.removeEmptyString = h;
  }
  var K = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function (e) {
    K[e] = new oe(e, 0, !1, e, null, !1, !1);
  }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function (e) {
    var t = e[0];
    K[t] = new oe(t, 1, !1, e[1], null, !1, !1);
  }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function (e) {
    K[e] = new oe(e, 2, !1, e.toLowerCase(), null, !1, !1);
  }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function (e) {
    K[e] = new oe(e, 2, !1, e, null, !1, !1);
  }), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function (e) {
    K[e] = new oe(e, 3, !1, e.toLowerCase(), null, !1, !1);
  }), ["checked", "multiple", "muted", "selected"].forEach(function (e) {
    K[e] = new oe(e, 3, !0, e, null, !1, !1);
  }), ["capture", "download"].forEach(function (e) {
    K[e] = new oe(e, 4, !1, e, null, !1, !1);
  }), ["cols", "rows", "size", "span"].forEach(function (e) {
    K[e] = new oe(e, 6, !1, e, null, !1, !1);
  }), ["rowSpan", "start"].forEach(function (e) {
    K[e] = new oe(e, 5, !1, e.toLowerCase(), null, !1, !1);
  });
  var z = /[\-:]([a-z])/g;
  function Q(e) {
    return e[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function (e) {
    var t = e.replace(z, Q);
    K[t] = new oe(t, 1, !1, e, null, !1, !1);
  }), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function (e) {
    var t = e.replace(z, Q);
    K[t] = new oe(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
  }), ["xml:base", "xml:lang", "xml:space"].forEach(function (e) {
    var t = e.replace(z, Q);
    K[t] = new oe(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
  }), ["tabIndex", "crossOrigin"].forEach(function (e) {
    K[e] = new oe(e, 1, !1, e.toLowerCase(), null, !1, !1);
  }), K.xlinkHref = new oe("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1), ["src", "href", "action", "formAction"].forEach(function (e) {
    K[e] = new oe(e, 1, !1, e.toLowerCase(), null, !0, !0);
  });
  function B(e, t, n, r) {
    var o = K.hasOwnProperty(t) ? K[t] : null;
    (o !== null ? o.type !== 0 : r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (pe(t, n, o, r) && (n = null), r || o === null ? C(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : o.mustUseProperty ? e[o.propertyName] = n === null ? o.type === 3 ? !1 : "" : n : (t = o.attributeName, r = o.attributeNamespace, n === null ? e.removeAttribute(t) : (o = o.type, n = o === 3 || o === 4 && n === !0 ? "" : "" + n, r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
  }
  var $ = a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
    ie = Symbol.for("react.element"),
    Y = Symbol.for("react.portal"),
    ne = Symbol.for("react.fragment"),
    Z = Symbol.for("react.strict_mode"),
    fe = Symbol.for("react.profiler"),
    le = Symbol.for("react.provider"),
    H = Symbol.for("react.context"),
    U = Symbol.for("react.forward_ref"),
    W = Symbol.for("react.suspense"),
    q = Symbol.for("react.suspense_list"),
    se = Symbol.for("react.memo"),
    de = Symbol.for("react.lazy"),
    ge = Symbol.for("react.offscreen"),
    A = Symbol.iterator;
  function G(e) {
    return e === null || typeof e != "object" ? null : (e = A && e[A] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var re = Object.assign,
    y;
  function _(e) {
    if (y === void 0) try {
      throw Error();
    } catch (n) {
      var t = n.stack.trim().match(/\n( *(at )?)/);
      y = t && t[1] || "";
    }
    return `
` + y + e;
  }
  var Ne = !1;
  function ue(e, t) {
    if (!e || Ne) return "";
    Ne = !0;
    var n = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      if (t) {
        if (t = function () {
          throw Error();
        }, Object.defineProperty(t.prototype, "props", {
          set: function () {
            throw Error();
          }
        }), typeof Reflect == "object" && Reflect.construct) {
          try {
            Reflect.construct(t, []);
          } catch (V) {
            var r = V;
          }
          Reflect.construct(e, [], t);
        } else {
          try {
            t.call();
          } catch (V) {
            r = V;
          }
          e.call(t.prototype);
        }
      } else {
        try {
          throw Error();
        } catch (V) {
          r = V;
        }
        e();
      }
    } catch (V) {
      if (V && r && typeof V.stack == "string") {
        for (var o = V.stack.split(`
`), c = r.stack.split(`
`), h = o.length - 1, v = c.length - 1; 1 <= h && 0 <= v && o[h] !== c[v];) v--;
        for (; 1 <= h && 0 <= v; h--, v--) if (o[h] !== c[v]) {
          if (h !== 1 || v !== 1) do if (h--, v--, 0 > v || o[h] !== c[v]) {
            var k = `
` + o[h].replace(" at new ", " at ");
            return e.displayName && k.includes("<anonymous>") && (k = k.replace("<anonymous>", e.displayName)), k;
          } while (1 <= h && 0 <= v);
          break;
        }
      }
    } finally {
      Ne = !1, Error.prepareStackTrace = n;
    }
    return (e = e ? e.displayName || e.name : "") ? _(e) : "";
  }
  function ke(e) {
    switch (e.tag) {
      case 5:
        return _(e.type);
      case 16:
        return _("Lazy");
      case 13:
        return _("Suspense");
      case 19:
        return _("SuspenseList");
      case 0:
      case 2:
      case 15:
        return e = ue(e.type, !1), e;
      case 11:
        return e = ue(e.type.render, !1), e;
      case 1:
        return e = ue(e.type, !0), e;
      default:
        return "";
    }
  }
  function Se(e) {
    if (e == null) return null;
    if (typeof e == "function") return e.displayName || e.name || null;
    if (typeof e == "string") return e;
    switch (e) {
      case ne:
        return "Fragment";
      case Y:
        return "Portal";
      case fe:
        return "Profiler";
      case Z:
        return "StrictMode";
      case W:
        return "Suspense";
      case q:
        return "SuspenseList";
    }
    if (typeof e == "object") switch (e.$$typeof) {
      case H:
        return (e.displayName || "Context") + ".Consumer";
      case le:
        return (e._context.displayName || "Context") + ".Provider";
      case U:
        var t = e.render;
        return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
      case se:
        return t = e.displayName || null, t !== null ? t : Se(e.type) || "Memo";
      case de:
        t = e._payload, e = e._init;
        try {
          return Se(e(t));
        } catch {}
    }
    return null;
  }
  function Ce(e) {
    var t = e.type;
    switch (e.tag) {
      case 24:
        return "Cache";
      case 9:
        return (t.displayName || "Context") + ".Consumer";
      case 10:
        return (t._context.displayName || "Context") + ".Provider";
      case 18:
        return "DehydratedFragment";
      case 11:
        return e = t.render, e = e.displayName || e.name || "", t.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef");
      case 7:
        return "Fragment";
      case 5:
        return t;
      case 4:
        return "Portal";
      case 3:
        return "Root";
      case 6:
        return "Text";
      case 16:
        return Se(t);
      case 8:
        return t === Z ? "StrictMode" : "Mode";
      case 22:
        return "Offscreen";
      case 12:
        return "Profiler";
      case 21:
        return "Scope";
      case 13:
        return "Suspense";
      case 19:
        return "SuspenseList";
      case 25:
        return "TracingMarker";
      case 1:
      case 0:
      case 17:
      case 2:
      case 14:
      case 15:
        if (typeof t == "function") return t.displayName || t.name || null;
        if (typeof t == "string") return t;
    }
    return null;
  }
  function ze(e) {
    switch (typeof e) {
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return e;
      case "object":
        return e;
      default:
        return "";
    }
  }
  function We(e) {
    var t = e.type;
    return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
  }
  function rt(e) {
    var t = We(e) ? "checked" : "value",
      n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t),
      r = "" + e[t];
    if (!e.hasOwnProperty(t) && typeof n < "u" && typeof n.get == "function" && typeof n.set == "function") {
      var o = n.get,
        c = n.set;
      return Object.defineProperty(e, t, {
        configurable: !0,
        get: function () {
          return o.call(this);
        },
        set: function (h) {
          r = "" + h, c.call(this, h);
        }
      }), Object.defineProperty(e, t, {
        enumerable: n.enumerable
      }), {
        getValue: function () {
          return r;
        },
        setValue: function (h) {
          r = "" + h;
        },
        stopTracking: function () {
          e._valueTracker = null, delete e[t];
        }
      };
    }
  }
  function $t(e) {
    e._valueTracker || (e._valueTracker = rt(e));
  }
  function An(e) {
    if (!e) return !1;
    var t = e._valueTracker;
    if (!t) return !0;
    var n = t.getValue(),
      r = "";
    return e && (r = We(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n ? (t.setValue(e), !0) : !1;
  }
  function Vt(e) {
    if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
    try {
      return e.activeElement || e.body;
    } catch {
      return e.body;
    }
  }
  function hr(e, t) {
    var n = t.checked;
    return re({}, t, {
      defaultChecked: void 0,
      defaultValue: void 0,
      value: void 0,
      checked: n ?? e._wrapperState.initialChecked
    });
  }
  function gr(e, t) {
    var n = t.defaultValue == null ? "" : t.defaultValue,
      r = t.checked != null ? t.checked : t.defaultChecked;
    n = ze(t.value != null ? t.value : n), e._wrapperState = {
      initialChecked: r,
      initialValue: n,
      controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null
    };
  }
  function ta(e, t) {
    t = t.checked, t != null && B(e, "checked", t, !1);
  }
  function Cn(e, t) {
    ta(e, t);
    var n = ze(t.value),
      r = t.type;
    if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);else if (r === "submit" || r === "reset") {
      e.removeAttribute("value");
      return;
    }
    t.hasOwnProperty("value") ? Bn(e, t.type, n) : t.hasOwnProperty("defaultValue") && Bn(e, t.type, ze(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
  }
  function _n(e, t, n) {
    if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
      var r = t.type;
      if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
      t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
    }
    n = e.name, n !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
  }
  function Bn(e, t, n) {
    (t !== "number" || Vt(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
  }
  var ut = Array.isArray;
  function Pt(e, t, n, r) {
    if (e = e.options, t) {
      t = {};
      for (var o = 0; o < n.length; o++) t["$" + n[o]] = !0;
      for (n = 0; n < e.length; n++) o = t.hasOwnProperty("$" + e[n].value), e[n].selected !== o && (e[n].selected = o), o && r && (e[n].defaultSelected = !0);
    } else {
      for (n = "" + ze(n), t = null, o = 0; o < e.length; o++) {
        if (e[o].value === n) {
          e[o].selected = !0, r && (e[o].defaultSelected = !0);
          return;
        }
        t !== null || e[o].disabled || (t = e[o]);
      }
      t !== null && (t.selected = !0);
    }
  }
  function $n(e, t) {
    if (t.dangerouslySetInnerHTML != null) throw Error(u(91));
    return re({}, t, {
      value: void 0,
      defaultValue: void 0,
      children: "" + e._wrapperState.initialValue
    });
  }
  function Dn(e, t) {
    var n = t.value;
    if (n == null) {
      if (n = t.children, t = t.defaultValue, n != null) {
        if (t != null) throw Error(u(92));
        if (ut(n)) {
          if (1 < n.length) throw Error(u(93));
          n = n[0];
        }
        t = n;
      }
      t == null && (t = ""), n = t;
    }
    e._wrapperState = {
      initialValue: ze(n)
    };
  }
  function Da(e, t) {
    var n = ze(t.value),
      r = ze(t.defaultValue);
    n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
  }
  function he(e) {
    var t = e.textContent;
    t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
  }
  function Re(e) {
    switch (e) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function Ke(e, t) {
    return e == null || e === "http://www.w3.org/1999/xhtml" ? Re(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
  }
  var qe,
    at = function (e) {
      return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function (t, n, r, o) {
        MSApp.execUnsafeLocalFunction(function () {
          return e(t, n, r, o);
        });
      } : e;
    }(function (e, t) {
      if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;else {
        for (qe = qe || document.createElement("div"), qe.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = qe.firstChild; e.firstChild;) e.removeChild(e.firstChild);
        for (; t.firstChild;) e.appendChild(t.firstChild);
      }
    });
  function Nt(e, t) {
    if (t) {
      var n = e.firstChild;
      if (n && n === e.lastChild && n.nodeType === 3) {
        n.nodeValue = t;
        return;
      }
    }
    e.textContent = t;
  }
  var vt = {
      animationIterationCount: !0,
      aspectRatio: !0,
      borderImageOutset: !0,
      borderImageSlice: !0,
      borderImageWidth: !0,
      boxFlex: !0,
      boxFlexGroup: !0,
      boxOrdinalGroup: !0,
      columnCount: !0,
      columns: !0,
      flex: !0,
      flexGrow: !0,
      flexPositive: !0,
      flexShrink: !0,
      flexNegative: !0,
      flexOrder: !0,
      gridArea: !0,
      gridRow: !0,
      gridRowEnd: !0,
      gridRowSpan: !0,
      gridRowStart: !0,
      gridColumn: !0,
      gridColumnEnd: !0,
      gridColumnSpan: !0,
      gridColumnStart: !0,
      fontWeight: !0,
      lineClamp: !0,
      lineHeight: !0,
      opacity: !0,
      order: !0,
      orphans: !0,
      tabSize: !0,
      widows: !0,
      zIndex: !0,
      zoom: !0,
      fillOpacity: !0,
      floodOpacity: !0,
      stopOpacity: !0,
      strokeDasharray: !0,
      strokeDashoffset: !0,
      strokeMiterlimit: !0,
      strokeOpacity: !0,
      strokeWidth: !0
    },
    na = ["Webkit", "ms", "Moz", "O"];
  Object.keys(vt).forEach(function (e) {
    na.forEach(function (t) {
      t = t + e.charAt(0).toUpperCase() + e.substring(1), vt[t] = vt[e];
    });
  });
  function nn(e, t, n) {
    return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || vt.hasOwnProperty(e) && vt[e] ? ("" + t).trim() : t + "px";
  }
  function Ye(e, t) {
    e = e.style;
    for (var n in t) if (t.hasOwnProperty(n)) {
      var r = n.indexOf("--") === 0,
        o = nn(n, t[n], r);
      n === "float" && (n = "cssFloat"), r ? e.setProperty(n, o) : e[n] = o;
    }
  }
  var Rt = re({
    menuitem: !0
  }, {
    area: !0,
    base: !0,
    br: !0,
    col: !0,
    embed: !0,
    hr: !0,
    img: !0,
    input: !0,
    keygen: !0,
    link: !0,
    meta: !0,
    param: !0,
    source: !0,
    track: !0,
    wbr: !0
  });
  function Un(e, t) {
    if (t) {
      if (Rt[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(u(137, e));
      if (t.dangerouslySetInnerHTML != null) {
        if (t.children != null) throw Error(u(60));
        if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(u(61));
      }
      if (t.style != null && typeof t.style != "object") throw Error(u(62));
    }
  }
  function Xt(e, t) {
    if (e.indexOf("-") === -1) return typeof t.is == "string";
    switch (e) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var ot = null;
  function rn(e) {
    return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
  }
  var Ut = null,
    Yt = null,
    _t = null;
  function Ta(e) {
    if (e = Qo(e)) {
      if (typeof Ut != "function") throw Error(u(280));
      var t = e.stateNode;
      t && (t = Gi(t), Ut(e.stateNode, e.type, t));
    }
  }
  function xn(e) {
    Yt ? _t ? _t.push(e) : _t = [e] : Yt = e;
  }
  function an() {
    if (Yt) {
      var e = Yt,
        t = _t;
      if (_t = Yt = null, Ta(e), t) for (e = 0; e < t.length; e++) Ta(t[e]);
    }
  }
  function Wn(e, t) {
    return e(t);
  }
  function Pr() {}
  var on = !1;
  function ln(e, t, n) {
    if (on) return e(t, n);
    on = !0;
    try {
      return Wn(e, t, n);
    } finally {
      on = !1, (Yt !== null || _t !== null) && (Pr(), an());
    }
  }
  function xr(e, t) {
    var n = e.stateNode;
    if (n === null) return null;
    var r = Gi(n);
    if (r === null) return null;
    n = r[t];
    e: switch (t) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (r = !r.disabled) || (e = e.type, r = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !r;
        break e;
      default:
        e = !1;
    }
    if (e) return null;
    if (n && typeof n != "function") throw Error(u(231, t, typeof n));
    return n;
  }
  var La = !1;
  if (b) try {
    var Hn = {};
    Object.defineProperty(Hn, "passive", {
      get: function () {
        La = !0;
      }
    }), window.addEventListener("test", Hn, Hn), window.removeEventListener("test", Hn, Hn);
  } catch {
    La = !1;
  }
  function Pa(e, t, n, r, o, c, h, v, k) {
    var V = Array.prototype.slice.call(arguments, 3);
    try {
      t.apply(n, V);
    } catch (te) {
      this.onError(te);
    }
  }
  var Zt = !1,
    vr = null,
    Rr = !1,
    Fr = null,
    Tn = {
      onError: function (e) {
        Zt = !0, vr = e;
      }
    };
  function Mr(e, t, n, r, o, c, h, v, k) {
    Zt = !1, vr = null, Pa.apply(Tn, arguments);
  }
  function Gn(e, t, n, r, o, c, h, v, k) {
    if (Mr.apply(this, arguments), Zt) {
      if (Zt) {
        var V = vr;
        Zt = !1, vr = null;
      } else throw Error(u(198));
      Rr || (Rr = !0, Fr = V);
    }
  }
  function Ln(e) {
    var t = e,
      n = e;
    if (e.alternate) for (; t.return;) t = t.return;else {
      e = t;
      do t = e, (t.flags & 4098) !== 0 && (n = t.return), e = t.return; while (e);
    }
    return t.tag === 3 ? n : null;
  }
  function xi(e) {
    if (e.tag === 13) {
      var t = e.memoizedState;
      if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
    }
    return null;
  }
  function Ir(e) {
    if (Ln(e) !== e) throw Error(u(188));
  }
  function Gl(e) {
    var t = e.alternate;
    if (!t) {
      if (t = Ln(e), t === null) throw Error(u(188));
      return t !== e ? null : e;
    }
    for (var n = e, r = t;;) {
      var o = n.return;
      if (o === null) break;
      var c = o.alternate;
      if (c === null) {
        if (r = o.return, r !== null) {
          n = r;
          continue;
        }
        break;
      }
      if (o.child === c.child) {
        for (c = o.child; c;) {
          if (c === n) return Ir(o), e;
          if (c === r) return Ir(o), t;
          c = c.sibling;
        }
        throw Error(u(188));
      }
      if (n.return !== r.return) n = o, r = c;else {
        for (var h = !1, v = o.child; v;) {
          if (v === n) {
            h = !0, n = o, r = c;
            break;
          }
          if (v === r) {
            h = !0, r = o, n = c;
            break;
          }
          v = v.sibling;
        }
        if (!h) {
          for (v = c.child; v;) {
            if (v === n) {
              h = !0, n = c, r = o;
              break;
            }
            if (v === r) {
              h = !0, r = c, n = o;
              break;
            }
            v = v.sibling;
          }
          if (!h) throw Error(u(189));
        }
      }
      if (n.alternate !== r) throw Error(u(190));
    }
    if (n.tag !== 3) throw Error(u(188));
    return n.stateNode.current === n ? e : t;
  }
  function vi(e) {
    return e = Gl(e), e !== null ? wi(e) : null;
  }
  function wi(e) {
    if (e.tag === 5 || e.tag === 6) return e;
    for (e = e.child; e !== null;) {
      var t = wi(e);
      if (t !== null) return t;
      e = e.sibling;
    }
    return null;
  }
  var No = s.unstable_scheduleCallback,
    De = s.unstable_cancelCallback,
    jo = s.unstable_shouldYield,
    Ra = s.unstable_requestPaint,
    dt = s.unstable_now,
    Kl = s.unstable_getCurrentPriorityLevel,
    wr = s.unstable_ImmediatePriority,
    ra = s.unstable_UserBlockingPriority,
    Fa = s.unstable_NormalPriority,
    ql = s.unstable_LowPriority,
    Eo = s.unstable_IdlePriority,
    Ma = null,
    tt = null;
  function yi(e) {
    if (tt && typeof tt.onCommitFiberRoot == "function") try {
      tt.onCommitFiberRoot(Ma, e, void 0, (e.current.flags & 128) === 128);
    } catch {}
  }
  var sn = Math.clz32 ? Math.clz32 : bi,
    Ia = Math.log,
    Oa = Math.LN2;
  function bi(e) {
    return e >>>= 0, e === 0 ? 32 : 31 - (Ia(e) / Oa | 0) | 0;
  }
  var aa = 64,
    vn = 4194304;
  function ar(e) {
    switch (e & -e) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return e & 4194240;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return e & 130023424;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 1073741824;
      default:
        return e;
    }
  }
  function wn(e, t) {
    var n = e.pendingLanes;
    if (n === 0) return 0;
    var r = 0,
      o = e.suspendedLanes,
      c = e.pingedLanes,
      h = n & 268435455;
    if (h !== 0) {
      var v = h & ~o;
      v !== 0 ? r = ar(v) : (c &= h, c !== 0 && (r = ar(c)));
    } else h = n & ~o, h !== 0 ? r = ar(h) : c !== 0 && (r = ar(c));
    if (r === 0) return 0;
    if (t !== 0 && t !== r && (t & o) === 0 && (o = r & -r, c = t & -t, o >= c || o === 16 && (c & 4194240) !== 0)) return t;
    if ((r & 4) !== 0 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t;) n = 31 - sn(t), o = 1 << n, r |= e[n], t &= ~o;
    return r;
  }
  function Va(e, t) {
    switch (e) {
      case 1:
      case 2:
      case 4:
        return t + 250;
      case 8:
      case 16:
      case 32:
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return t + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return -1;
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function Ql(e, t) {
    for (var n = e.suspendedLanes, r = e.pingedLanes, o = e.expirationTimes, c = e.pendingLanes; 0 < c;) {
      var h = 31 - sn(c),
        v = 1 << h,
        k = o[h];
      k === -1 ? ((v & n) === 0 || (v & r) !== 0) && (o[h] = Va(v, t)) : k <= t && (e.expiredLanes |= v), c &= ~v;
    }
  }
  function za(e) {
    return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
  }
  function Co() {
    var e = aa;
    return aa <<= 1, (aa & 4194240) === 0 && (aa = 64), e;
  }
  function Wt(e) {
    for (var t = [], n = 0; 31 > n; n++) t.push(e);
    return t;
  }
  function yn(e, t, n) {
    e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - sn(t), e[t] = n;
  }
  function Pn(e, t) {
    var n = e.pendingLanes & ~t;
    e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
    var r = e.eventTimes;
    for (e = e.expirationTimes; 0 < n;) {
      var o = 31 - sn(n),
        c = 1 << o;
      t[o] = 0, r[o] = -1, e[o] = -1, n &= ~c;
    }
  }
  function Aa(e, t) {
    var n = e.entangledLanes |= t;
    for (e = e.entanglements; n;) {
      var r = 31 - sn(n),
        o = 1 << r;
      o & t | e[r] & t && (e[r] |= t), n &= ~o;
    }
  }
  var Ze = 0;
  function Ba(e) {
    return e &= -e, 1 < e ? 4 < e ? (e & 268435455) !== 0 ? 16 : 536870912 : 4 : 1;
  }
  var _o,
    Do,
    ki,
    Si,
    or,
    To = !1,
    oa = [],
    ir = null,
    lr = null,
    Kn = null,
    bn = new Map(),
    cn = new Map(),
    qn = [],
    Ni = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
  function ji(e, t) {
    switch (e) {
      case "focusin":
      case "focusout":
        ir = null;
        break;
      case "dragenter":
      case "dragleave":
        lr = null;
        break;
      case "mouseover":
      case "mouseout":
        Kn = null;
        break;
      case "pointerover":
      case "pointerout":
        bn.delete(t.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        cn.delete(t.pointerId);
    }
  }
  function ia(e, t, n, r, o, c) {
    return e === null || e.nativeEvent !== c ? (e = {
      blockedOn: t,
      domEventName: n,
      eventSystemFlags: r,
      nativeEvent: c,
      targetContainers: [o]
    }, t !== null && (t = Qo(t), t !== null && Do(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, o !== null && t.indexOf(o) === -1 && t.push(o), e);
  }
  function Ei(e, t, n, r, o) {
    switch (t) {
      case "focusin":
        return ir = ia(ir, e, t, n, r, o), !0;
      case "dragenter":
        return lr = ia(lr, e, t, n, r, o), !0;
      case "mouseover":
        return Kn = ia(Kn, e, t, n, r, o), !0;
      case "pointerover":
        var c = o.pointerId;
        return bn.set(c, ia(bn.get(c) || null, e, t, n, r, o)), !0;
      case "gotpointercapture":
        return c = o.pointerId, cn.set(c, ia(cn.get(c) || null, e, t, n, r, o)), !0;
    }
    return !1;
  }
  function Ci(e) {
    var t = fa(e.target);
    if (t !== null) {
      var n = Ln(t);
      if (n !== null) {
        if (t = n.tag, t === 13) {
          if (t = xi(n), t !== null) {
            e.blockedOn = t, or(e.priority, function () {
              ki(n);
            });
            return;
          }
        } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
          e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
          return;
        }
      }
    }
    e.blockedOn = null;
  }
  function $a(e) {
    if (e.blockedOn !== null) return !1;
    for (var t = e.targetContainers; 0 < t.length;) {
      var n = Ro(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
      if (n === null) {
        n = e.nativeEvent;
        var r = new n.constructor(n.type, n);
        ot = r, n.target.dispatchEvent(r), ot = null;
      } else return t = Qo(n), t !== null && Do(t), e.blockedOn = n, !1;
      t.shift();
    }
    return !0;
  }
  function _i(e, t, n) {
    $a(e) && n.delete(t);
  }
  function Di() {
    To = !1, ir !== null && $a(ir) && (ir = null), lr !== null && $a(lr) && (lr = null), Kn !== null && $a(Kn) && (Kn = null), bn.forEach(_i), cn.forEach(_i);
  }
  function la(e, t) {
    e.blockedOn === t && (e.blockedOn = null, To || (To = !0, s.unstable_scheduleCallback(s.unstable_NormalPriority, Di)));
  }
  function sa(e) {
    function t(o) {
      return la(o, e);
    }
    if (0 < oa.length) {
      la(oa[0], e);
      for (var n = 1; n < oa.length; n++) {
        var r = oa[n];
        r.blockedOn === e && (r.blockedOn = null);
      }
    }
    for (ir !== null && la(ir, e), lr !== null && la(lr, e), Kn !== null && la(Kn, e), bn.forEach(t), cn.forEach(t), n = 0; n < qn.length; n++) r = qn[n], r.blockedOn === e && (r.blockedOn = null);
    for (; 0 < qn.length && (n = qn[0], n.blockedOn === null);) Ci(n), n.blockedOn === null && qn.shift();
  }
  var Qn = $.ReactCurrentBatchConfig,
    kt = !0;
  function Lo(e, t, n, r) {
    var o = Ze,
      c = Qn.transition;
    Qn.transition = null;
    try {
      Ze = 1, Po(e, t, n, r);
    } finally {
      Ze = o, Qn.transition = c;
    }
  }
  function Jl(e, t, n, r) {
    var o = Ze,
      c = Qn.transition;
    Qn.transition = null;
    try {
      Ze = 4, Po(e, t, n, r);
    } finally {
      Ze = o, Qn.transition = c;
    }
  }
  function Po(e, t, n, r) {
    if (kt) {
      var o = Ro(e, t, n, r);
      if (o === null) gs(e, t, r, Ua, n), ji(e, r);else if (Ei(o, e, t, n, r)) r.stopPropagation();else if (ji(e, r), t & 4 && -1 < Ni.indexOf(e)) {
        for (; o !== null;) {
          var c = Qo(o);
          if (c !== null && _o(c), c = Ro(e, t, n, r), c === null && gs(e, t, r, Ua, n), c === o) break;
          o = c;
        }
        o !== null && r.stopPropagation();
      } else gs(e, t, r, null, n);
    }
  }
  var Ua = null;
  function Ro(e, t, n, r) {
    if (Ua = null, e = rn(r), e = fa(e), e !== null) if (t = Ln(e), t === null) e = null;else if (n = t.tag, n === 13) {
      if (e = xi(t), e !== null) return e;
      e = null;
    } else if (n === 3) {
      if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
      e = null;
    } else t !== e && (e = null);
    return Ua = e, null;
  }
  function Fo(e) {
    switch (e) {
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 1;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "toggle":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 4;
      case "message":
        switch (Kl()) {
          case wr:
            return 1;
          case ra:
            return 4;
          case Fa:
          case ql:
            return 16;
          case Eo:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var un = null,
    Wa = null,
    Or = null;
  function Mo() {
    if (Or) return Or;
    var e,
      t = Wa,
      n = t.length,
      r,
      o = "value" in un ? un.value : un.textContent,
      c = o.length;
    for (e = 0; e < n && t[e] === o[e]; e++);
    var h = n - e;
    for (r = 1; r <= h && t[n - r] === o[c - r]; r++);
    return Or = o.slice(e, 1 < r ? 1 - r : void 0);
  }
  function Ha(e) {
    var t = e.keyCode;
    return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
  }
  function Ga() {
    return !0;
  }
  function Io() {
    return !1;
  }
  function zt(e) {
    function t(n, r, o, c, h) {
      this._reactName = n, this._targetInst = o, this.type = r, this.nativeEvent = c, this.target = h, this.currentTarget = null;
      for (var v in e) e.hasOwnProperty(v) && (n = e[v], this[v] = n ? n(c) : c[v]);
      return this.isDefaultPrevented = (c.defaultPrevented != null ? c.defaultPrevented : c.returnValue === !1) ? Ga : Io, this.isPropagationStopped = Io, this;
    }
    return re(t.prototype, {
      preventDefault: function () {
        this.defaultPrevented = !0;
        var n = this.nativeEvent;
        n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = Ga);
      },
      stopPropagation: function () {
        var n = this.nativeEvent;
        n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = Ga);
      },
      persist: function () {},
      isPersistent: Ga
    }), t;
  }
  var Dt = {
      eventPhase: 0,
      bubbles: 0,
      cancelable: 0,
      timeStamp: function (e) {
        return e.timeStamp || Date.now();
      },
      defaultPrevented: 0,
      isTrusted: 0
    },
    kn = zt(Dt),
    ca = re({}, Dt, {
      view: 0,
      detail: 0
    }),
    Xl = zt(ca),
    Oo,
    Sn,
    ua,
    Jn = re({}, ca, {
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      getModifierState: Ao,
      button: 0,
      buttons: 0,
      relatedTarget: function (e) {
        return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
      },
      movementX: function (e) {
        return "movementX" in e ? e.movementX : (e !== ua && (ua && e.type === "mousemove" ? (Oo = e.screenX - ua.screenX, Sn = e.screenY - ua.screenY) : Sn = Oo = 0, ua = e), Oo);
      },
      movementY: function (e) {
        return "movementY" in e ? e.movementY : Sn;
      }
    }),
    yr = zt(Jn),
    sr = re({}, Jn, {
      dataTransfer: 0
    }),
    Yl = zt(sr),
    Ti = re({}, ca, {
      relatedTarget: 0
    }),
    Vo = zt(Ti),
    Li = re({}, Dt, {
      animationName: 0,
      elapsedTime: 0,
      pseudoElement: 0
    }),
    Zl = zt(Li),
    Pi = re({}, Dt, {
      clipboardData: function (e) {
        return "clipboardData" in e ? e.clipboardData : window.clipboardData;
      }
    }),
    Ri = zt(Pi),
    es = re({}, Dt, {
      data: 0
    }),
    Fi = zt(es),
    Ka = {
      Esc: "Escape",
      Spacebar: " ",
      Left: "ArrowLeft",
      Up: "ArrowUp",
      Right: "ArrowRight",
      Down: "ArrowDown",
      Del: "Delete",
      Win: "OS",
      Menu: "ContextMenu",
      Apps: "ContextMenu",
      Scroll: "ScrollLock",
      MozPrintableKey: "Unidentified"
    },
    zo = {
      8: "Backspace",
      9: "Tab",
      12: "Clear",
      13: "Enter",
      16: "Shift",
      17: "Control",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Escape",
      32: " ",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "ArrowLeft",
      38: "ArrowUp",
      39: "ArrowRight",
      40: "ArrowDown",
      45: "Insert",
      46: "Delete",
      112: "F1",
      113: "F2",
      114: "F3",
      115: "F4",
      116: "F5",
      117: "F6",
      118: "F7",
      119: "F8",
      120: "F9",
      121: "F10",
      122: "F11",
      123: "F12",
      144: "NumLock",
      145: "ScrollLock",
      224: "Meta"
    },
    ts = {
      Alt: "altKey",
      Control: "ctrlKey",
      Meta: "metaKey",
      Shift: "shiftKey"
    };
  function ns(e) {
    var t = this.nativeEvent;
    return t.getModifierState ? t.getModifierState(e) : (e = ts[e]) ? !!t[e] : !1;
  }
  function Ao() {
    return ns;
  }
  var rs = re({}, ca, {
      key: function (e) {
        if (e.key) {
          var t = Ka[e.key] || e.key;
          if (t !== "Unidentified") return t;
        }
        return e.type === "keypress" ? (e = Ha(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? zo[e.keyCode] || "Unidentified" : "";
      },
      code: 0,
      location: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      repeat: 0,
      locale: 0,
      getModifierState: Ao,
      charCode: function (e) {
        return e.type === "keypress" ? Ha(e) : 0;
      },
      keyCode: function (e) {
        return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
      },
      which: function (e) {
        return e.type === "keypress" ? Ha(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
      }
    }),
    as = zt(rs),
    qa = re({}, Jn, {
      pointerId: 0,
      width: 0,
      height: 0,
      pressure: 0,
      tangentialPressure: 0,
      tiltX: 0,
      tiltY: 0,
      twist: 0,
      pointerType: 0,
      isPrimary: 0
    }),
    Mi = zt(qa),
    os = re({}, ca, {
      touches: 0,
      targetTouches: 0,
      changedTouches: 0,
      altKey: 0,
      metaKey: 0,
      ctrlKey: 0,
      shiftKey: 0,
      getModifierState: Ao
    }),
    is = zt(os),
    ls = re({}, Dt, {
      propertyName: 0,
      elapsedTime: 0,
      pseudoElement: 0
    }),
    ss = zt(ls),
    cs = re({}, Jn, {
      deltaX: function (e) {
        return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
      },
      deltaY: function (e) {
        return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
      },
      deltaZ: 0,
      deltaMode: 0
    }),
    us = zt(cs),
    ds = [9, 13, 27, 32],
    Bo = b && "CompositionEvent" in window,
    Vr = null;
  b && "documentMode" in document && (Vr = document.documentMode);
  var Ii = b && "TextEvent" in window && !Vr,
    $o = b && (!Bo || Vr && 8 < Vr && 11 >= Vr),
    Oi = " ",
    Vi = !1;
  function Uo(e, t) {
    switch (e) {
      case "keyup":
        return ds.indexOf(t.keyCode) !== -1;
      case "keydown":
        return t.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function da(e) {
    return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
  }
  var zr = !1;
  function Qa(e, t) {
    switch (e) {
      case "compositionend":
        return da(t);
      case "keypress":
        return t.which !== 32 ? null : (Vi = !0, Oi);
      case "textInput":
        return e = t.data, e === Oi && Vi ? null : e;
      default:
        return null;
    }
  }
  function Wo(e, t) {
    if (zr) return e === "compositionend" || !Bo && Uo(e, t) ? (e = Mo(), Or = Wa = un = null, zr = !1, e) : null;
    switch (e) {
      case "paste":
        return null;
      case "keypress":
        if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
          if (t.char && 1 < t.char.length) return t.char;
          if (t.which) return String.fromCharCode(t.which);
        }
        return null;
      case "compositionend":
        return $o && t.locale !== "ko" ? null : t.data;
      default:
        return null;
    }
  }
  var ps = {
    color: !0,
    date: !0,
    datetime: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0
  };
  function zi(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t === "input" ? !!ps[e.type] : t === "textarea";
  }
  function Ai(e, t, n, r) {
    xn(r), t = Ui(t, "onChange"), 0 < t.length && (n = new kn("onChange", "change", null, n, r), e.push({
      event: n,
      listeners: t
    }));
  }
  var pt = null,
    pa = null;
  function i(e) {
    mu(e, 0);
  }
  function f(e) {
    var t = Ya(e);
    if (An(t)) return e;
  }
  function g(e, t) {
    if (e === "change") return t;
  }
  var w = !1;
  if (b) {
    var N;
    if (b) {
      var F = "oninput" in document;
      if (!F) {
        var O = document.createElement("div");
        O.setAttribute("oninput", "return;"), F = typeof O.oninput == "function";
      }
      N = F;
    } else N = !1;
    w = N && (!document.documentMode || 9 < document.documentMode);
  }
  function T() {
    pt && (pt.detachEvent("onpropertychange", X), pa = pt = null);
  }
  function X(e) {
    if (e.propertyName === "value" && f(pa)) {
      var t = [];
      Ai(t, pa, e, rn(e)), ln(i, t);
    }
  }
  function xe(e, t, n) {
    e === "focusin" ? (T(), pt = t, pa = n, pt.attachEvent("onpropertychange", X)) : e === "focusout" && T();
  }
  function ye(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown") return f(pa);
  }
  function Ee(e, t) {
    if (e === "click") return f(t);
  }
  function ve(e, t) {
    if (e === "input" || e === "change") return f(t);
  }
  function Fe(e, t) {
    return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
  }
  var Le = typeof Object.is == "function" ? Object.is : Fe;
  function $e(e, t) {
    if (Le(e, t)) return !0;
    if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
    var n = Object.keys(e),
      r = Object.keys(t);
    if (n.length !== r.length) return !1;
    for (r = 0; r < n.length; r++) {
      var o = n[r];
      if (!D.call(t, o) || !Le(e[o], t[o])) return !1;
    }
    return !0;
  }
  function Be(e) {
    for (; e && e.firstChild;) e = e.firstChild;
    return e;
  }
  function me(e, t) {
    var n = Be(e);
    e = 0;
    for (var r; n;) {
      if (n.nodeType === 3) {
        if (r = e + n.textContent.length, e <= t && r >= t) return {
          node: n,
          offset: t - e
        };
        e = r;
      }
      e: {
        for (; n;) {
          if (n.nextSibling) {
            n = n.nextSibling;
            break e;
          }
          n = n.parentNode;
        }
        n = void 0;
      }
      n = Be(n);
    }
  }
  function L(e, t) {
    return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? L(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
  }
  function we() {
    for (var e = window, t = Vt(); t instanceof e.HTMLIFrameElement;) {
      try {
        var n = typeof t.contentWindow.location.href == "string";
      } catch {
        n = !1;
      }
      if (n) e = t.contentWindow;else break;
      t = Vt(e.document);
    }
    return t;
  }
  function Ue(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
  }
  function Ge(e) {
    var t = we(),
      n = e.focusedElem,
      r = e.selectionRange;
    if (t !== n && n && n.ownerDocument && L(n.ownerDocument.documentElement, n)) {
      if (r !== null && Ue(n)) {
        if (t = r.start, e = r.end, e === void 0 && (e = t), "selectionStart" in n) n.selectionStart = t, n.selectionEnd = Math.min(e, n.value.length);else if (e = (t = n.ownerDocument || document) && t.defaultView || window, e.getSelection) {
          e = e.getSelection();
          var o = n.textContent.length,
            c = Math.min(r.start, o);
          r = r.end === void 0 ? c : Math.min(r.end, o), !e.extend && c > r && (o = r, r = c, c = o), o = me(n, c);
          var h = me(n, r);
          o && h && (e.rangeCount !== 1 || e.anchorNode !== o.node || e.anchorOffset !== o.offset || e.focusNode !== h.node || e.focusOffset !== h.offset) && (t = t.createRange(), t.setStart(o.node, o.offset), e.removeAllRanges(), c > r ? (e.addRange(t), e.extend(h.node, h.offset)) : (t.setEnd(h.node, h.offset), e.addRange(t)));
        }
      }
      for (t = [], e = n; e = e.parentNode;) e.nodeType === 1 && t.push({
        element: e,
        left: e.scrollLeft,
        top: e.scrollTop
      });
      for (typeof n.focus == "function" && n.focus(), n = 0; n < t.length; n++) e = t[n], e.element.scrollLeft = e.left, e.element.scrollTop = e.top;
    }
  }
  var Qe = b && "documentMode" in document && 11 >= document.documentMode,
    Me = null,
    it = null,
    nt = null,
    Ve = !1;
  function Et(e, t, n) {
    var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
    Ve || Me == null || Me !== Vt(r) || (r = Me, "selectionStart" in r && Ue(r) ? r = {
      start: r.selectionStart,
      end: r.selectionEnd
    } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
      anchorNode: r.anchorNode,
      anchorOffset: r.anchorOffset,
      focusNode: r.focusNode,
      focusOffset: r.focusOffset
    }), nt && $e(nt, r) || (nt = r, r = Ui(it, "onSelect"), 0 < r.length && (t = new kn("onSelect", "select", null, t, n), e.push({
      event: t,
      listeners: r
    }), t.target = Me)));
  }
  function Ft(e, t) {
    var n = {};
    return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
  }
  var Ht = {
      animationend: Ft("Animation", "AnimationEnd"),
      animationiteration: Ft("Animation", "AnimationIteration"),
      animationstart: Ft("Animation", "AnimationStart"),
      transitionend: Ft("Transition", "TransitionEnd")
    },
    Xn = {},
    iu = {};
  b && (iu = document.createElement("div").style, "AnimationEvent" in window || (delete Ht.animationend.animation, delete Ht.animationiteration.animation, delete Ht.animationstart.animation), "TransitionEvent" in window || delete Ht.transitionend.transition);
  function Bi(e) {
    if (Xn[e]) return Xn[e];
    if (!Ht[e]) return e;
    var t = Ht[e],
      n;
    for (n in t) if (t.hasOwnProperty(n) && n in iu) return Xn[e] = t[n];
    return e;
  }
  var lu = Bi("animationend"),
    su = Bi("animationiteration"),
    cu = Bi("animationstart"),
    uu = Bi("transitionend"),
    du = new Map(),
    pu = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  function Ar(e, t) {
    du.set(e, t), m(t, [e]);
  }
  for (var fs = 0; fs < pu.length; fs++) {
    var ms = pu[fs],
      Ef = ms.toLowerCase(),
      Cf = ms[0].toUpperCase() + ms.slice(1);
    Ar(Ef, "on" + Cf);
  }
  Ar(lu, "onAnimationEnd"), Ar(su, "onAnimationIteration"), Ar(cu, "onAnimationStart"), Ar("dblclick", "onDoubleClick"), Ar("focusin", "onFocus"), Ar("focusout", "onBlur"), Ar(uu, "onTransitionEnd"), x("onMouseEnter", ["mouseout", "mouseover"]), x("onMouseLeave", ["mouseout", "mouseover"]), x("onPointerEnter", ["pointerout", "pointerover"]), x("onPointerLeave", ["pointerout", "pointerover"]), m("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), m("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), m("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), m("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), m("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), m("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var Ho = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),
    _f = new Set("cancel close invalid load scroll toggle".split(" ").concat(Ho));
  function fu(e, t, n) {
    var r = e.type || "unknown-event";
    e.currentTarget = n, Gn(r, t, void 0, e), e.currentTarget = null;
  }
  function mu(e, t) {
    t = (t & 4) !== 0;
    for (var n = 0; n < e.length; n++) {
      var r = e[n],
        o = r.event;
      r = r.listeners;
      e: {
        var c = void 0;
        if (t) for (var h = r.length - 1; 0 <= h; h--) {
          var v = r[h],
            k = v.instance,
            V = v.currentTarget;
          if (v = v.listener, k !== c && o.isPropagationStopped()) break e;
          fu(o, v, V), c = k;
        } else for (h = 0; h < r.length; h++) {
          if (v = r[h], k = v.instance, V = v.currentTarget, v = v.listener, k !== c && o.isPropagationStopped()) break e;
          fu(o, v, V), c = k;
        }
      }
    }
    if (Rr) throw e = Fr, Rr = !1, Fr = null, e;
  }
  function ft(e, t) {
    var n = t[ks];
    n === void 0 && (n = t[ks] = new Set());
    var r = e + "__bubble";
    n.has(r) || (hu(t, e, 2, !1), n.add(r));
  }
  function hs(e, t, n) {
    var r = 0;
    t && (r |= 4), hu(n, e, r, t);
  }
  var $i = "_reactListening" + Math.random().toString(36).slice(2);
  function Go(e) {
    if (!e[$i]) {
      e[$i] = !0, d.forEach(function (n) {
        n !== "selectionchange" && (_f.has(n) || hs(n, !1, e), hs(n, !0, e));
      });
      var t = e.nodeType === 9 ? e : e.ownerDocument;
      t === null || t[$i] || (t[$i] = !0, hs("selectionchange", !1, t));
    }
  }
  function hu(e, t, n, r) {
    switch (Fo(t)) {
      case 1:
        var o = Lo;
        break;
      case 4:
        o = Jl;
        break;
      default:
        o = Po;
    }
    n = o.bind(null, t, n, e), o = void 0, !La || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (o = !0), r ? o !== void 0 ? e.addEventListener(t, n, {
      capture: !0,
      passive: o
    }) : e.addEventListener(t, n, !0) : o !== void 0 ? e.addEventListener(t, n, {
      passive: o
    }) : e.addEventListener(t, n, !1);
  }
  function gs(e, t, n, r, o) {
    var c = r;
    if ((t & 1) === 0 && (t & 2) === 0 && r !== null) e: for (;;) {
      if (r === null) return;
      var h = r.tag;
      if (h === 3 || h === 4) {
        var v = r.stateNode.containerInfo;
        if (v === o || v.nodeType === 8 && v.parentNode === o) break;
        if (h === 4) for (h = r.return; h !== null;) {
          var k = h.tag;
          if ((k === 3 || k === 4) && (k = h.stateNode.containerInfo, k === o || k.nodeType === 8 && k.parentNode === o)) return;
          h = h.return;
        }
        for (; v !== null;) {
          if (h = fa(v), h === null) return;
          if (k = h.tag, k === 5 || k === 6) {
            r = c = h;
            continue e;
          }
          v = v.parentNode;
        }
      }
      r = r.return;
    }
    ln(function () {
      var V = c,
        te = rn(n),
        ae = [];
      e: {
        var ee = du.get(e);
        if (ee !== void 0) {
          var be = kn,
            _e = e;
          switch (e) {
            case "keypress":
              if (Ha(n) === 0) break e;
            case "keydown":
            case "keyup":
              be = as;
              break;
            case "focusin":
              _e = "focus", be = Vo;
              break;
            case "focusout":
              _e = "blur", be = Vo;
              break;
            case "beforeblur":
            case "afterblur":
              be = Vo;
              break;
            case "click":
              if (n.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              be = yr;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              be = Yl;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              be = is;
              break;
            case lu:
            case su:
            case cu:
              be = Zl;
              break;
            case uu:
              be = ss;
              break;
            case "scroll":
              be = Xl;
              break;
            case "wheel":
              be = us;
              break;
            case "copy":
            case "cut":
            case "paste":
              be = Ri;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              be = Mi;
          }
          var Te = (t & 4) !== 0,
            jt = !Te && e === "scroll",
            P = Te ? ee !== null ? ee + "Capture" : null : ee;
          Te = [];
          for (var S = V, I; S !== null;) {
            I = S;
            var ce = I.stateNode;
            if (I.tag === 5 && ce !== null && (I = ce, P !== null && (ce = xr(S, P), ce != null && Te.push(Ko(S, ce, I)))), jt) break;
            S = S.return;
          }
          0 < Te.length && (ee = new be(ee, _e, null, n, te), ae.push({
            event: ee,
            listeners: Te
          }));
        }
      }
      if ((t & 7) === 0) {
        e: {
          if (ee = e === "mouseover" || e === "pointerover", be = e === "mouseout" || e === "pointerout", ee && n !== ot && (_e = n.relatedTarget || n.fromElement) && (fa(_e) || _e[br])) break e;
          if ((be || ee) && (ee = te.window === te ? te : (ee = te.ownerDocument) ? ee.defaultView || ee.parentWindow : window, be ? (_e = n.relatedTarget || n.toElement, be = V, _e = _e ? fa(_e) : null, _e !== null && (jt = Ln(_e), _e !== jt || _e.tag !== 5 && _e.tag !== 6) && (_e = null)) : (be = null, _e = V), be !== _e)) {
            if (Te = yr, ce = "onMouseLeave", P = "onMouseEnter", S = "mouse", (e === "pointerout" || e === "pointerover") && (Te = Mi, ce = "onPointerLeave", P = "onPointerEnter", S = "pointer"), jt = be == null ? ee : Ya(be), I = _e == null ? ee : Ya(_e), ee = new Te(ce, S + "leave", be, n, te), ee.target = jt, ee.relatedTarget = I, ce = null, fa(te) === V && (Te = new Te(P, S + "enter", _e, n, te), Te.target = I, Te.relatedTarget = jt, ce = Te), jt = ce, be && _e) t: {
              for (Te = be, P = _e, S = 0, I = Te; I; I = Ja(I)) S++;
              for (I = 0, ce = P; ce; ce = Ja(ce)) I++;
              for (; 0 < S - I;) Te = Ja(Te), S--;
              for (; 0 < I - S;) P = Ja(P), I--;
              for (; S--;) {
                if (Te === P || P !== null && Te === P.alternate) break t;
                Te = Ja(Te), P = Ja(P);
              }
              Te = null;
            } else Te = null;
            be !== null && gu(ae, ee, be, Te, !1), _e !== null && jt !== null && gu(ae, jt, _e, Te, !0);
          }
        }
        e: {
          if (ee = V ? Ya(V) : window, be = ee.nodeName && ee.nodeName.toLowerCase(), be === "select" || be === "input" && ee.type === "file") var Pe = g;else if (zi(ee)) {
            if (w) Pe = ve;else {
              Pe = ye;
              var Ie = xe;
            }
          } else (be = ee.nodeName) && be.toLowerCase() === "input" && (ee.type === "checkbox" || ee.type === "radio") && (Pe = Ee);
          if (Pe && (Pe = Pe(e, V))) {
            Ai(ae, Pe, n, te);
            break e;
          }
          Ie && Ie(e, ee, V), e === "focusout" && (Ie = ee._wrapperState) && Ie.controlled && ee.type === "number" && Bn(ee, "number", ee.value);
        }
        switch (Ie = V ? Ya(V) : window, e) {
          case "focusin":
            (zi(Ie) || Ie.contentEditable === "true") && (Me = Ie, it = V, nt = null);
            break;
          case "focusout":
            nt = it = Me = null;
            break;
          case "mousedown":
            Ve = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Ve = !1, Et(ae, n, te);
            break;
          case "selectionchange":
            if (Qe) break;
          case "keydown":
          case "keyup":
            Et(ae, n, te);
        }
        var Oe;
        if (Bo) e: {
          switch (e) {
            case "compositionstart":
              var Ae = "onCompositionStart";
              break e;
            case "compositionend":
              Ae = "onCompositionEnd";
              break e;
            case "compositionupdate":
              Ae = "onCompositionUpdate";
              break e;
          }
          Ae = void 0;
        } else zr ? Uo(e, n) && (Ae = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (Ae = "onCompositionStart");
        Ae && ($o && n.locale !== "ko" && (zr || Ae !== "onCompositionStart" ? Ae === "onCompositionEnd" && zr && (Oe = Mo()) : (un = te, Wa = "value" in un ? un.value : un.textContent, zr = !0)), Ie = Ui(V, Ae), 0 < Ie.length && (Ae = new Fi(Ae, e, null, n, te), ae.push({
          event: Ae,
          listeners: Ie
        }), Oe ? Ae.data = Oe : (Oe = da(n), Oe !== null && (Ae.data = Oe)))), (Oe = Ii ? Qa(e, n) : Wo(e, n)) && (V = Ui(V, "onBeforeInput"), 0 < V.length && (te = new Fi("onBeforeInput", "beforeinput", null, n, te), ae.push({
          event: te,
          listeners: V
        }), te.data = Oe));
      }
      mu(ae, t);
    });
  }
  function Ko(e, t, n) {
    return {
      instance: e,
      listener: t,
      currentTarget: n
    };
  }
  function Ui(e, t) {
    for (var n = t + "Capture", r = []; e !== null;) {
      var o = e,
        c = o.stateNode;
      o.tag === 5 && c !== null && (o = c, c = xr(e, n), c != null && r.unshift(Ko(e, c, o)), c = xr(e, t), c != null && r.push(Ko(e, c, o))), e = e.return;
    }
    return r;
  }
  function Ja(e) {
    if (e === null) return null;
    do e = e.return; while (e && e.tag !== 5);
    return e || null;
  }
  function gu(e, t, n, r, o) {
    for (var c = t._reactName, h = []; n !== null && n !== r;) {
      var v = n,
        k = v.alternate,
        V = v.stateNode;
      if (k !== null && k === r) break;
      v.tag === 5 && V !== null && (v = V, o ? (k = xr(n, c), k != null && h.unshift(Ko(n, k, v))) : o || (k = xr(n, c), k != null && h.push(Ko(n, k, v)))), n = n.return;
    }
    h.length !== 0 && e.push({
      event: t,
      listeners: h
    });
  }
  var Df = /\r\n?/g,
    Tf = /\u0000|\uFFFD/g;
  function xu(e) {
    return (typeof e == "string" ? e : "" + e).replace(Df, `
`).replace(Tf, "");
  }
  function Wi(e, t, n) {
    if (t = xu(t), xu(e) !== t && n) throw Error(u(425));
  }
  function Hi() {}
  var xs = null,
    vs = null;
  function ws(e, t) {
    return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
  }
  var ys = typeof setTimeout == "function" ? setTimeout : void 0,
    Lf = typeof clearTimeout == "function" ? clearTimeout : void 0,
    vu = typeof Promise == "function" ? Promise : void 0,
    Pf = typeof queueMicrotask == "function" ? queueMicrotask : typeof vu < "u" ? function (e) {
      return vu.resolve(null).then(e).catch(Rf);
    } : ys;
  function Rf(e) {
    setTimeout(function () {
      throw e;
    });
  }
  function bs(e, t) {
    var n = t,
      r = 0;
    do {
      var o = n.nextSibling;
      if (e.removeChild(n), o && o.nodeType === 8) if (n = o.data, n === "/$") {
        if (r === 0) {
          e.removeChild(o), sa(t);
          return;
        }
        r--;
      } else n !== "$" && n !== "$?" && n !== "$!" || r++;
      n = o;
    } while (n);
    sa(t);
  }
  function Br(e) {
    for (; e != null; e = e.nextSibling) {
      var t = e.nodeType;
      if (t === 1 || t === 3) break;
      if (t === 8) {
        if (t = e.data, t === "$" || t === "$!" || t === "$?") break;
        if (t === "/$") return null;
      }
    }
    return e;
  }
  function wu(e) {
    e = e.previousSibling;
    for (var t = 0; e;) {
      if (e.nodeType === 8) {
        var n = e.data;
        if (n === "$" || n === "$!" || n === "$?") {
          if (t === 0) return e;
          t--;
        } else n === "/$" && t++;
      }
      e = e.previousSibling;
    }
    return null;
  }
  var Xa = Math.random().toString(36).slice(2),
    cr = "__reactFiber$" + Xa,
    qo = "__reactProps$" + Xa,
    br = "__reactContainer$" + Xa,
    ks = "__reactEvents$" + Xa,
    Ff = "__reactListeners$" + Xa,
    Mf = "__reactHandles$" + Xa;
  function fa(e) {
    var t = e[cr];
    if (t) return t;
    for (var n = e.parentNode; n;) {
      if (t = n[br] || n[cr]) {
        if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = wu(e); e !== null;) {
          if (n = e[cr]) return n;
          e = wu(e);
        }
        return t;
      }
      e = n, n = e.parentNode;
    }
    return null;
  }
  function Qo(e) {
    return e = e[cr] || e[br], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
  }
  function Ya(e) {
    if (e.tag === 5 || e.tag === 6) return e.stateNode;
    throw Error(u(33));
  }
  function Gi(e) {
    return e[qo] || null;
  }
  var Ss = [],
    Za = -1;
  function $r(e) {
    return {
      current: e
    };
  }
  function mt(e) {
    0 > Za || (e.current = Ss[Za], Ss[Za] = null, Za--);
  }
  function st(e, t) {
    Za++, Ss[Za] = e.current, e.current = t;
  }
  var Ur = {},
    Gt = $r(Ur),
    dn = $r(!1),
    ma = Ur;
  function eo(e, t) {
    var n = e.type.contextTypes;
    if (!n) return Ur;
    var r = e.stateNode;
    if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
    var o = {},
      c;
    for (c in n) o[c] = t[c];
    return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = o), o;
  }
  function pn(e) {
    return e = e.childContextTypes, e != null;
  }
  function Ki() {
    mt(dn), mt(Gt);
  }
  function yu(e, t, n) {
    if (Gt.current !== Ur) throw Error(u(168));
    st(Gt, t), st(dn, n);
  }
  function bu(e, t, n) {
    var r = e.stateNode;
    if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
    r = r.getChildContext();
    for (var o in r) if (!(o in t)) throw Error(u(108, Ce(e) || "Unknown", o));
    return re({}, n, r);
  }
  function qi(e) {
    return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || Ur, ma = Gt.current, st(Gt, e), st(dn, dn.current), !0;
  }
  function ku(e, t, n) {
    var r = e.stateNode;
    if (!r) throw Error(u(169));
    n ? (e = bu(e, t, ma), r.__reactInternalMemoizedMergedChildContext = e, mt(dn), mt(Gt), st(Gt, e)) : mt(dn), st(dn, n);
  }
  var kr = null,
    Qi = !1,
    Ns = !1;
  function Su(e) {
    kr === null ? kr = [e] : kr.push(e);
  }
  function If(e) {
    Qi = !0, Su(e);
  }
  function Wr() {
    if (!Ns && kr !== null) {
      Ns = !0;
      var e = 0,
        t = Ze;
      try {
        var n = kr;
        for (Ze = 1; e < n.length; e++) {
          var r = n[e];
          do r = r(!0); while (r !== null);
        }
        kr = null, Qi = !1;
      } catch (o) {
        throw kr !== null && (kr = kr.slice(e + 1)), No(wr, Wr), o;
      } finally {
        Ze = t, Ns = !1;
      }
    }
    return null;
  }
  var to = [],
    no = 0,
    Ji = null,
    Xi = 0,
    Rn = [],
    Fn = 0,
    ha = null,
    Sr = 1,
    Nr = "";
  function ga(e, t) {
    to[no++] = Xi, to[no++] = Ji, Ji = e, Xi = t;
  }
  function Nu(e, t, n) {
    Rn[Fn++] = Sr, Rn[Fn++] = Nr, Rn[Fn++] = ha, ha = e;
    var r = Sr;
    e = Nr;
    var o = 32 - sn(r) - 1;
    r &= ~(1 << o), n += 1;
    var c = 32 - sn(t) + o;
    if (30 < c) {
      var h = o - o % 5;
      c = (r & (1 << h) - 1).toString(32), r >>= h, o -= h, Sr = 1 << 32 - sn(t) + o | n << o | r, Nr = c + e;
    } else Sr = 1 << c | n << o | r, Nr = e;
  }
  function js(e) {
    e.return !== null && (ga(e, 1), Nu(e, 1, 0));
  }
  function Es(e) {
    for (; e === Ji;) Ji = to[--no], to[no] = null, Xi = to[--no], to[no] = null;
    for (; e === ha;) ha = Rn[--Fn], Rn[Fn] = null, Nr = Rn[--Fn], Rn[Fn] = null, Sr = Rn[--Fn], Rn[Fn] = null;
  }
  var Nn = null,
    jn = null,
    xt = !1,
    Yn = null;
  function ju(e, t) {
    var n = Vn(5, null, null, 0);
    n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
  }
  function Eu(e, t) {
    switch (e.tag) {
      case 5:
        var n = e.type;
        return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null ? (e.stateNode = t, Nn = e, jn = Br(t.firstChild), !0) : !1;
      case 6:
        return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null ? (e.stateNode = t, Nn = e, jn = null, !0) : !1;
      case 13:
        return t = t.nodeType !== 8 ? null : t, t !== null ? (n = ha !== null ? {
          id: Sr,
          overflow: Nr
        } : null, e.memoizedState = {
          dehydrated: t,
          treeContext: n,
          retryLane: 1073741824
        }, n = Vn(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, Nn = e, jn = null, !0) : !1;
      default:
        return !1;
    }
  }
  function Cs(e) {
    return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
  }
  function _s(e) {
    if (xt) {
      var t = jn;
      if (t) {
        var n = t;
        if (!Eu(e, t)) {
          if (Cs(e)) throw Error(u(418));
          t = Br(n.nextSibling);
          var r = Nn;
          t && Eu(e, t) ? ju(r, n) : (e.flags = e.flags & -4097 | 2, xt = !1, Nn = e);
        }
      } else {
        if (Cs(e)) throw Error(u(418));
        e.flags = e.flags & -4097 | 2, xt = !1, Nn = e;
      }
    }
  }
  function Cu(e) {
    for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13;) e = e.return;
    Nn = e;
  }
  function Yi(e) {
    if (e !== Nn) return !1;
    if (!xt) return Cu(e), xt = !0, !1;
    var t;
    if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !ws(e.type, e.memoizedProps)), t && (t = jn)) {
      if (Cs(e)) throw _u(), Error(u(418));
      for (; t;) ju(e, t), t = Br(t.nextSibling);
    }
    if (Cu(e), e.tag === 13) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(u(317));
      e: {
        for (e = e.nextSibling, t = 0; e;) {
          if (e.nodeType === 8) {
            var n = e.data;
            if (n === "/$") {
              if (t === 0) {
                jn = Br(e.nextSibling);
                break e;
              }
              t--;
            } else n !== "$" && n !== "$!" && n !== "$?" || t++;
          }
          e = e.nextSibling;
        }
        jn = null;
      }
    } else jn = Nn ? Br(e.stateNode.nextSibling) : null;
    return !0;
  }
  function _u() {
    for (var e = jn; e;) e = Br(e.nextSibling);
  }
  function ro() {
    jn = Nn = null, xt = !1;
  }
  function Ds(e) {
    Yn === null ? Yn = [e] : Yn.push(e);
  }
  var Of = $.ReactCurrentBatchConfig;
  function Jo(e, t, n) {
    if (e = n.ref, e !== null && typeof e != "function" && typeof e != "object") {
      if (n._owner) {
        if (n = n._owner, n) {
          if (n.tag !== 1) throw Error(u(309));
          var r = n.stateNode;
        }
        if (!r) throw Error(u(147, e));
        var o = r,
          c = "" + e;
        return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === c ? t.ref : (t = function (h) {
          var v = o.refs;
          h === null ? delete v[c] : v[c] = h;
        }, t._stringRef = c, t);
      }
      if (typeof e != "string") throw Error(u(284));
      if (!n._owner) throw Error(u(290, e));
    }
    return e;
  }
  function Zi(e, t) {
    throw e = Object.prototype.toString.call(t), Error(u(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
  }
  function Du(e) {
    var t = e._init;
    return t(e._payload);
  }
  function Tu(e) {
    function t(P, S) {
      if (e) {
        var I = P.deletions;
        I === null ? (P.deletions = [S], P.flags |= 16) : I.push(S);
      }
    }
    function n(P, S) {
      if (!e) return null;
      for (; S !== null;) t(P, S), S = S.sibling;
      return null;
    }
    function r(P, S) {
      for (P = new Map(); S !== null;) S.key !== null ? P.set(S.key, S) : P.set(S.index, S), S = S.sibling;
      return P;
    }
    function o(P, S) {
      return P = Yr(P, S), P.index = 0, P.sibling = null, P;
    }
    function c(P, S, I) {
      return P.index = I, e ? (I = P.alternate, I !== null ? (I = I.index, I < S ? (P.flags |= 2, S) : I) : (P.flags |= 2, S)) : (P.flags |= 1048576, S);
    }
    function h(P) {
      return e && P.alternate === null && (P.flags |= 2), P;
    }
    function v(P, S, I, ce) {
      return S === null || S.tag !== 6 ? (S = yc(I, P.mode, ce), S.return = P, S) : (S = o(S, I), S.return = P, S);
    }
    function k(P, S, I, ce) {
      var Pe = I.type;
      return Pe === ne ? te(P, S, I.props.children, ce, I.key) : S !== null && (S.elementType === Pe || typeof Pe == "object" && Pe !== null && Pe.$$typeof === de && Du(Pe) === S.type) ? (ce = o(S, I.props), ce.ref = Jo(P, S, I), ce.return = P, ce) : (ce = Sl(I.type, I.key, I.props, null, P.mode, ce), ce.ref = Jo(P, S, I), ce.return = P, ce);
    }
    function V(P, S, I, ce) {
      return S === null || S.tag !== 4 || S.stateNode.containerInfo !== I.containerInfo || S.stateNode.implementation !== I.implementation ? (S = bc(I, P.mode, ce), S.return = P, S) : (S = o(S, I.children || []), S.return = P, S);
    }
    function te(P, S, I, ce, Pe) {
      return S === null || S.tag !== 7 ? (S = Na(I, P.mode, ce, Pe), S.return = P, S) : (S = o(S, I), S.return = P, S);
    }
    function ae(P, S, I) {
      if (typeof S == "string" && S !== "" || typeof S == "number") return S = yc("" + S, P.mode, I), S.return = P, S;
      if (typeof S == "object" && S !== null) {
        switch (S.$$typeof) {
          case ie:
            return I = Sl(S.type, S.key, S.props, null, P.mode, I), I.ref = Jo(P, null, S), I.return = P, I;
          case Y:
            return S = bc(S, P.mode, I), S.return = P, S;
          case de:
            var ce = S._init;
            return ae(P, ce(S._payload), I);
        }
        if (ut(S) || G(S)) return S = Na(S, P.mode, I, null), S.return = P, S;
        Zi(P, S);
      }
      return null;
    }
    function ee(P, S, I, ce) {
      var Pe = S !== null ? S.key : null;
      if (typeof I == "string" && I !== "" || typeof I == "number") return Pe !== null ? null : v(P, S, "" + I, ce);
      if (typeof I == "object" && I !== null) {
        switch (I.$$typeof) {
          case ie:
            return I.key === Pe ? k(P, S, I, ce) : null;
          case Y:
            return I.key === Pe ? V(P, S, I, ce) : null;
          case de:
            return Pe = I._init, ee(P, S, Pe(I._payload), ce);
        }
        if (ut(I) || G(I)) return Pe !== null ? null : te(P, S, I, ce, null);
        Zi(P, I);
      }
      return null;
    }
    function be(P, S, I, ce, Pe) {
      if (typeof ce == "string" && ce !== "" || typeof ce == "number") return P = P.get(I) || null, v(S, P, "" + ce, Pe);
      if (typeof ce == "object" && ce !== null) {
        switch (ce.$$typeof) {
          case ie:
            return P = P.get(ce.key === null ? I : ce.key) || null, k(S, P, ce, Pe);
          case Y:
            return P = P.get(ce.key === null ? I : ce.key) || null, V(S, P, ce, Pe);
          case de:
            var Ie = ce._init;
            return be(P, S, I, Ie(ce._payload), Pe);
        }
        if (ut(ce) || G(ce)) return P = P.get(I) || null, te(S, P, ce, Pe, null);
        Zi(S, ce);
      }
      return null;
    }
    function _e(P, S, I, ce) {
      for (var Pe = null, Ie = null, Oe = S, Ae = S = 0, Ot = null; Oe !== null && Ae < I.length; Ae++) {
        Oe.index > Ae ? (Ot = Oe, Oe = null) : Ot = Oe.sibling;
        var et = ee(P, Oe, I[Ae], ce);
        if (et === null) {
          Oe === null && (Oe = Ot);
          break;
        }
        e && Oe && et.alternate === null && t(P, Oe), S = c(et, S, Ae), Ie === null ? Pe = et : Ie.sibling = et, Ie = et, Oe = Ot;
      }
      if (Ae === I.length) return n(P, Oe), xt && ga(P, Ae), Pe;
      if (Oe === null) {
        for (; Ae < I.length; Ae++) Oe = ae(P, I[Ae], ce), Oe !== null && (S = c(Oe, S, Ae), Ie === null ? Pe = Oe : Ie.sibling = Oe, Ie = Oe);
        return xt && ga(P, Ae), Pe;
      }
      for (Oe = r(P, Oe); Ae < I.length; Ae++) Ot = be(Oe, P, Ae, I[Ae], ce), Ot !== null && (e && Ot.alternate !== null && Oe.delete(Ot.key === null ? Ae : Ot.key), S = c(Ot, S, Ae), Ie === null ? Pe = Ot : Ie.sibling = Ot, Ie = Ot);
      return e && Oe.forEach(function (Zr) {
        return t(P, Zr);
      }), xt && ga(P, Ae), Pe;
    }
    function Te(P, S, I, ce) {
      var Pe = G(I);
      if (typeof Pe != "function") throw Error(u(150));
      if (I = Pe.call(I), I == null) throw Error(u(151));
      for (var Ie = Pe = null, Oe = S, Ae = S = 0, Ot = null, et = I.next(); Oe !== null && !et.done; Ae++, et = I.next()) {
        Oe.index > Ae ? (Ot = Oe, Oe = null) : Ot = Oe.sibling;
        var Zr = ee(P, Oe, et.value, ce);
        if (Zr === null) {
          Oe === null && (Oe = Ot);
          break;
        }
        e && Oe && Zr.alternate === null && t(P, Oe), S = c(Zr, S, Ae), Ie === null ? Pe = Zr : Ie.sibling = Zr, Ie = Zr, Oe = Ot;
      }
      if (et.done) return n(P, Oe), xt && ga(P, Ae), Pe;
      if (Oe === null) {
        for (; !et.done; Ae++, et = I.next()) et = ae(P, et.value, ce), et !== null && (S = c(et, S, Ae), Ie === null ? Pe = et : Ie.sibling = et, Ie = et);
        return xt && ga(P, Ae), Pe;
      }
      for (Oe = r(P, Oe); !et.done; Ae++, et = I.next()) et = be(Oe, P, Ae, et.value, ce), et !== null && (e && et.alternate !== null && Oe.delete(et.key === null ? Ae : et.key), S = c(et, S, Ae), Ie === null ? Pe = et : Ie.sibling = et, Ie = et);
      return e && Oe.forEach(function (gm) {
        return t(P, gm);
      }), xt && ga(P, Ae), Pe;
    }
    function jt(P, S, I, ce) {
      if (typeof I == "object" && I !== null && I.type === ne && I.key === null && (I = I.props.children), typeof I == "object" && I !== null) {
        switch (I.$$typeof) {
          case ie:
            e: {
              for (var Pe = I.key, Ie = S; Ie !== null;) {
                if (Ie.key === Pe) {
                  if (Pe = I.type, Pe === ne) {
                    if (Ie.tag === 7) {
                      n(P, Ie.sibling), S = o(Ie, I.props.children), S.return = P, P = S;
                      break e;
                    }
                  } else if (Ie.elementType === Pe || typeof Pe == "object" && Pe !== null && Pe.$$typeof === de && Du(Pe) === Ie.type) {
                    n(P, Ie.sibling), S = o(Ie, I.props), S.ref = Jo(P, Ie, I), S.return = P, P = S;
                    break e;
                  }
                  n(P, Ie);
                  break;
                } else t(P, Ie);
                Ie = Ie.sibling;
              }
              I.type === ne ? (S = Na(I.props.children, P.mode, ce, I.key), S.return = P, P = S) : (ce = Sl(I.type, I.key, I.props, null, P.mode, ce), ce.ref = Jo(P, S, I), ce.return = P, P = ce);
            }
            return h(P);
          case Y:
            e: {
              for (Ie = I.key; S !== null;) {
                if (S.key === Ie) {
                  if (S.tag === 4 && S.stateNode.containerInfo === I.containerInfo && S.stateNode.implementation === I.implementation) {
                    n(P, S.sibling), S = o(S, I.children || []), S.return = P, P = S;
                    break e;
                  } else {
                    n(P, S);
                    break;
                  }
                } else t(P, S);
                S = S.sibling;
              }
              S = bc(I, P.mode, ce), S.return = P, P = S;
            }
            return h(P);
          case de:
            return Ie = I._init, jt(P, S, Ie(I._payload), ce);
        }
        if (ut(I)) return _e(P, S, I, ce);
        if (G(I)) return Te(P, S, I, ce);
        Zi(P, I);
      }
      return typeof I == "string" && I !== "" || typeof I == "number" ? (I = "" + I, S !== null && S.tag === 6 ? (n(P, S.sibling), S = o(S, I), S.return = P, P = S) : (n(P, S), S = yc(I, P.mode, ce), S.return = P, P = S), h(P)) : n(P, S);
    }
    return jt;
  }
  var ao = Tu(!0),
    Lu = Tu(!1),
    el = $r(null),
    tl = null,
    oo = null,
    Ts = null;
  function Ls() {
    Ts = oo = tl = null;
  }
  function Ps(e) {
    var t = el.current;
    mt(el), e._currentValue = t;
  }
  function Rs(e, t, n) {
    for (; e !== null;) {
      var r = e.alternate;
      if ((e.childLanes & t) !== t ? (e.childLanes |= t, r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t), e === n) break;
      e = e.return;
    }
  }
  function io(e, t) {
    tl = e, Ts = oo = null, e = e.dependencies, e !== null && e.firstContext !== null && ((e.lanes & t) !== 0 && (fn = !0), e.firstContext = null);
  }
  function Mn(e) {
    var t = e._currentValue;
    if (Ts !== e) if (e = {
      context: e,
      memoizedValue: t,
      next: null
    }, oo === null) {
      if (tl === null) throw Error(u(308));
      oo = e, tl.dependencies = {
        lanes: 0,
        firstContext: e
      };
    } else oo = oo.next = e;
    return t;
  }
  var xa = null;
  function Fs(e) {
    xa === null ? xa = [e] : xa.push(e);
  }
  function Pu(e, t, n, r) {
    var o = t.interleaved;
    return o === null ? (n.next = n, Fs(t)) : (n.next = o.next, o.next = n), t.interleaved = n, jr(e, r);
  }
  function jr(e, t) {
    e.lanes |= t;
    var n = e.alternate;
    for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null;) e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
    return n.tag === 3 ? n.stateNode : null;
  }
  var Hr = !1;
  function Ms(e) {
    e.updateQueue = {
      baseState: e.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: {
        pending: null,
        interleaved: null,
        lanes: 0
      },
      effects: null
    };
  }
  function Ru(e, t) {
    e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
      baseState: e.baseState,
      firstBaseUpdate: e.firstBaseUpdate,
      lastBaseUpdate: e.lastBaseUpdate,
      shared: e.shared,
      effects: e.effects
    });
  }
  function Er(e, t) {
    return {
      eventTime: e,
      lane: t,
      tag: 0,
      payload: null,
      callback: null,
      next: null
    };
  }
  function Gr(e, t, n) {
    var r = e.updateQueue;
    if (r === null) return null;
    if (r = r.shared, (Je & 2) !== 0) {
      var o = r.pending;
      return o === null ? t.next = t : (t.next = o.next, o.next = t), r.pending = t, jr(e, n);
    }
    return o = r.interleaved, o === null ? (t.next = t, Fs(r)) : (t.next = o.next, o.next = t), r.interleaved = t, jr(e, n);
  }
  function nl(e, t, n) {
    if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194240) !== 0)) {
      var r = t.lanes;
      r &= e.pendingLanes, n |= r, t.lanes = n, Aa(e, n);
    }
  }
  function Fu(e, t) {
    var n = e.updateQueue,
      r = e.alternate;
    if (r !== null && (r = r.updateQueue, n === r)) {
      var o = null,
        c = null;
      if (n = n.firstBaseUpdate, n !== null) {
        do {
          var h = {
            eventTime: n.eventTime,
            lane: n.lane,
            tag: n.tag,
            payload: n.payload,
            callback: n.callback,
            next: null
          };
          c === null ? o = c = h : c = c.next = h, n = n.next;
        } while (n !== null);
        c === null ? o = c = t : c = c.next = t;
      } else o = c = t;
      n = {
        baseState: r.baseState,
        firstBaseUpdate: o,
        lastBaseUpdate: c,
        shared: r.shared,
        effects: r.effects
      }, e.updateQueue = n;
      return;
    }
    e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
  }
  function rl(e, t, n, r) {
    var o = e.updateQueue;
    Hr = !1;
    var c = o.firstBaseUpdate,
      h = o.lastBaseUpdate,
      v = o.shared.pending;
    if (v !== null) {
      o.shared.pending = null;
      var k = v,
        V = k.next;
      k.next = null, h === null ? c = V : h.next = V, h = k;
      var te = e.alternate;
      te !== null && (te = te.updateQueue, v = te.lastBaseUpdate, v !== h && (v === null ? te.firstBaseUpdate = V : v.next = V, te.lastBaseUpdate = k));
    }
    if (c !== null) {
      var ae = o.baseState;
      h = 0, te = V = k = null, v = c;
      do {
        var ee = v.lane,
          be = v.eventTime;
        if ((r & ee) === ee) {
          te !== null && (te = te.next = {
            eventTime: be,
            lane: 0,
            tag: v.tag,
            payload: v.payload,
            callback: v.callback,
            next: null
          });
          e: {
            var _e = e,
              Te = v;
            switch (ee = t, be = n, Te.tag) {
              case 1:
                if (_e = Te.payload, typeof _e == "function") {
                  ae = _e.call(be, ae, ee);
                  break e;
                }
                ae = _e;
                break e;
              case 3:
                _e.flags = _e.flags & -65537 | 128;
              case 0:
                if (_e = Te.payload, ee = typeof _e == "function" ? _e.call(be, ae, ee) : _e, ee == null) break e;
                ae = re({}, ae, ee);
                break e;
              case 2:
                Hr = !0;
            }
          }
          v.callback !== null && v.lane !== 0 && (e.flags |= 64, ee = o.effects, ee === null ? o.effects = [v] : ee.push(v));
        } else be = {
          eventTime: be,
          lane: ee,
          tag: v.tag,
          payload: v.payload,
          callback: v.callback,
          next: null
        }, te === null ? (V = te = be, k = ae) : te = te.next = be, h |= ee;
        if (v = v.next, v === null) {
          if (v = o.shared.pending, v === null) break;
          ee = v, v = ee.next, ee.next = null, o.lastBaseUpdate = ee, o.shared.pending = null;
        }
      } while (!0);
      if (te === null && (k = ae), o.baseState = k, o.firstBaseUpdate = V, o.lastBaseUpdate = te, t = o.shared.interleaved, t !== null) {
        o = t;
        do h |= o.lane, o = o.next; while (o !== t);
      } else c === null && (o.shared.lanes = 0);
      ya |= h, e.lanes = h, e.memoizedState = ae;
    }
  }
  function Mu(e, t, n) {
    if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
      var r = e[t],
        o = r.callback;
      if (o !== null) {
        if (r.callback = null, r = n, typeof o != "function") throw Error(u(191, o));
        o.call(r);
      }
    }
  }
  var Xo = {},
    ur = $r(Xo),
    Yo = $r(Xo),
    Zo = $r(Xo);
  function va(e) {
    if (e === Xo) throw Error(u(174));
    return e;
  }
  function Is(e, t) {
    switch (st(Zo, t), st(Yo, e), st(ur, Xo), e = t.nodeType, e) {
      case 9:
      case 11:
        t = (t = t.documentElement) ? t.namespaceURI : Ke(null, "");
        break;
      default:
        e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = Ke(t, e);
    }
    mt(ur), st(ur, t);
  }
  function lo() {
    mt(ur), mt(Yo), mt(Zo);
  }
  function Iu(e) {
    va(Zo.current);
    var t = va(ur.current),
      n = Ke(t, e.type);
    t !== n && (st(Yo, e), st(ur, n));
  }
  function Os(e) {
    Yo.current === e && (mt(ur), mt(Yo));
  }
  var wt = $r(0);
  function al(e) {
    for (var t = e; t !== null;) {
      if (t.tag === 13) {
        var n = t.memoizedState;
        if (n !== null && (n = n.dehydrated, n === null || n.data === "$?" || n.data === "$!")) return t;
      } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
        if ((t.flags & 128) !== 0) return t;
      } else if (t.child !== null) {
        t.child.return = t, t = t.child;
        continue;
      }
      if (t === e) break;
      for (; t.sibling === null;) {
        if (t.return === null || t.return === e) return null;
        t = t.return;
      }
      t.sibling.return = t.return, t = t.sibling;
    }
    return null;
  }
  var Vs = [];
  function zs() {
    for (var e = 0; e < Vs.length; e++) Vs[e]._workInProgressVersionPrimary = null;
    Vs.length = 0;
  }
  var ol = $.ReactCurrentDispatcher,
    As = $.ReactCurrentBatchConfig,
    wa = 0,
    yt = null,
    Tt = null,
    Mt = null,
    il = !1,
    ei = !1,
    ti = 0,
    Vf = 0;
  function Kt() {
    throw Error(u(321));
  }
  function Bs(e, t) {
    if (t === null) return !1;
    for (var n = 0; n < t.length && n < e.length; n++) if (!Le(e[n], t[n])) return !1;
    return !0;
  }
  function $s(e, t, n, r, o, c) {
    if (wa = c, yt = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, ol.current = e === null || e.memoizedState === null ? $f : Uf, e = n(r, o), ei) {
      c = 0;
      do {
        if (ei = !1, ti = 0, 25 <= c) throw Error(u(301));
        c += 1, Mt = Tt = null, t.updateQueue = null, ol.current = Wf, e = n(r, o);
      } while (ei);
    }
    if (ol.current = cl, t = Tt !== null && Tt.next !== null, wa = 0, Mt = Tt = yt = null, il = !1, t) throw Error(u(300));
    return e;
  }
  function Us() {
    var e = ti !== 0;
    return ti = 0, e;
  }
  function dr() {
    var e = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null
    };
    return Mt === null ? yt.memoizedState = Mt = e : Mt = Mt.next = e, Mt;
  }
  function In() {
    if (Tt === null) {
      var e = yt.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = Tt.next;
    var t = Mt === null ? yt.memoizedState : Mt.next;
    if (t !== null) Mt = t, Tt = e;else {
      if (e === null) throw Error(u(310));
      Tt = e, e = {
        memoizedState: Tt.memoizedState,
        baseState: Tt.baseState,
        baseQueue: Tt.baseQueue,
        queue: Tt.queue,
        next: null
      }, Mt === null ? yt.memoizedState = Mt = e : Mt = Mt.next = e;
    }
    return Mt;
  }
  function ni(e, t) {
    return typeof t == "function" ? t(e) : t;
  }
  function Ws(e) {
    var t = In(),
      n = t.queue;
    if (n === null) throw Error(u(311));
    n.lastRenderedReducer = e;
    var r = Tt,
      o = r.baseQueue,
      c = n.pending;
    if (c !== null) {
      if (o !== null) {
        var h = o.next;
        o.next = c.next, c.next = h;
      }
      r.baseQueue = o = c, n.pending = null;
    }
    if (o !== null) {
      c = o.next, r = r.baseState;
      var v = h = null,
        k = null,
        V = c;
      do {
        var te = V.lane;
        if ((wa & te) === te) k !== null && (k = k.next = {
          lane: 0,
          action: V.action,
          hasEagerState: V.hasEagerState,
          eagerState: V.eagerState,
          next: null
        }), r = V.hasEagerState ? V.eagerState : e(r, V.action);else {
          var ae = {
            lane: te,
            action: V.action,
            hasEagerState: V.hasEagerState,
            eagerState: V.eagerState,
            next: null
          };
          k === null ? (v = k = ae, h = r) : k = k.next = ae, yt.lanes |= te, ya |= te;
        }
        V = V.next;
      } while (V !== null && V !== c);
      k === null ? h = r : k.next = v, Le(r, t.memoizedState) || (fn = !0), t.memoizedState = r, t.baseState = h, t.baseQueue = k, n.lastRenderedState = r;
    }
    if (e = n.interleaved, e !== null) {
      o = e;
      do c = o.lane, yt.lanes |= c, ya |= c, o = o.next; while (o !== e);
    } else o === null && (n.lanes = 0);
    return [t.memoizedState, n.dispatch];
  }
  function Hs(e) {
    var t = In(),
      n = t.queue;
    if (n === null) throw Error(u(311));
    n.lastRenderedReducer = e;
    var r = n.dispatch,
      o = n.pending,
      c = t.memoizedState;
    if (o !== null) {
      n.pending = null;
      var h = o = o.next;
      do c = e(c, h.action), h = h.next; while (h !== o);
      Le(c, t.memoizedState) || (fn = !0), t.memoizedState = c, t.baseQueue === null && (t.baseState = c), n.lastRenderedState = c;
    }
    return [c, r];
  }
  function Ou() {}
  function Vu(e, t) {
    var n = yt,
      r = In(),
      o = t(),
      c = !Le(r.memoizedState, o);
    if (c && (r.memoizedState = o, fn = !0), r = r.queue, Gs(Bu.bind(null, n, r, e), [e]), r.getSnapshot !== t || c || Mt !== null && Mt.memoizedState.tag & 1) {
      if (n.flags |= 2048, ri(9, Au.bind(null, n, r, o, t), void 0, null), It === null) throw Error(u(349));
      (wa & 30) !== 0 || zu(n, t, o);
    }
    return o;
  }
  function zu(e, t, n) {
    e.flags |= 16384, e = {
      getSnapshot: t,
      value: n
    }, t = yt.updateQueue, t === null ? (t = {
      lastEffect: null,
      stores: null
    }, yt.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
  }
  function Au(e, t, n, r) {
    t.value = n, t.getSnapshot = r, $u(t) && Uu(e);
  }
  function Bu(e, t, n) {
    return n(function () {
      $u(t) && Uu(e);
    });
  }
  function $u(e) {
    var t = e.getSnapshot;
    e = e.value;
    try {
      var n = t();
      return !Le(e, n);
    } catch {
      return !0;
    }
  }
  function Uu(e) {
    var t = jr(e, 1);
    t !== null && nr(t, e, 1, -1);
  }
  function Wu(e) {
    var t = dr();
    return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = {
      pending: null,
      interleaved: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: ni,
      lastRenderedState: e
    }, t.queue = e, e = e.dispatch = Bf.bind(null, yt, e), [t.memoizedState, e];
  }
  function ri(e, t, n, r) {
    return e = {
      tag: e,
      create: t,
      destroy: n,
      deps: r,
      next: null
    }, t = yt.updateQueue, t === null ? (t = {
      lastEffect: null,
      stores: null
    }, yt.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
  }
  function Hu() {
    return In().memoizedState;
  }
  function ll(e, t, n, r) {
    var o = dr();
    yt.flags |= e, o.memoizedState = ri(1 | t, n, void 0, r === void 0 ? null : r);
  }
  function sl(e, t, n, r) {
    var o = In();
    r = r === void 0 ? null : r;
    var c = void 0;
    if (Tt !== null) {
      var h = Tt.memoizedState;
      if (c = h.destroy, r !== null && Bs(r, h.deps)) {
        o.memoizedState = ri(t, n, c, r);
        return;
      }
    }
    yt.flags |= e, o.memoizedState = ri(1 | t, n, c, r);
  }
  function Gu(e, t) {
    return ll(8390656, 8, e, t);
  }
  function Gs(e, t) {
    return sl(2048, 8, e, t);
  }
  function Ku(e, t) {
    return sl(4, 2, e, t);
  }
  function qu(e, t) {
    return sl(4, 4, e, t);
  }
  function Qu(e, t) {
    if (typeof t == "function") return e = e(), t(e), function () {
      t(null);
    };
    if (t != null) return e = e(), t.current = e, function () {
      t.current = null;
    };
  }
  function Ju(e, t, n) {
    return n = n != null ? n.concat([e]) : null, sl(4, 4, Qu.bind(null, t, e), n);
  }
  function Ks() {}
  function Xu(e, t) {
    var n = In();
    t = t === void 0 ? null : t;
    var r = n.memoizedState;
    return r !== null && t !== null && Bs(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
  }
  function Yu(e, t) {
    var n = In();
    t = t === void 0 ? null : t;
    var r = n.memoizedState;
    return r !== null && t !== null && Bs(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
  }
  function Zu(e, t, n) {
    return (wa & 21) === 0 ? (e.baseState && (e.baseState = !1, fn = !0), e.memoizedState = n) : (Le(n, t) || (n = Co(), yt.lanes |= n, ya |= n, e.baseState = !0), t);
  }
  function zf(e, t) {
    var n = Ze;
    Ze = n !== 0 && 4 > n ? n : 4, e(!0);
    var r = As.transition;
    As.transition = {};
    try {
      e(!1), t();
    } finally {
      Ze = n, As.transition = r;
    }
  }
  function ed() {
    return In().memoizedState;
  }
  function Af(e, t, n) {
    var r = Jr(e);
    if (n = {
      lane: r,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, td(e)) nd(t, n);else if (n = Pu(e, t, n, r), n !== null) {
      var o = tn();
      nr(n, e, r, o), rd(n, t, r);
    }
  }
  function Bf(e, t, n) {
    var r = Jr(e),
      o = {
        lane: r,
        action: n,
        hasEagerState: !1,
        eagerState: null,
        next: null
      };
    if (td(e)) nd(t, o);else {
      var c = e.alternate;
      if (e.lanes === 0 && (c === null || c.lanes === 0) && (c = t.lastRenderedReducer, c !== null)) try {
        var h = t.lastRenderedState,
          v = c(h, n);
        if (o.hasEagerState = !0, o.eagerState = v, Le(v, h)) {
          var k = t.interleaved;
          k === null ? (o.next = o, Fs(t)) : (o.next = k.next, k.next = o), t.interleaved = o;
          return;
        }
      } catch {} finally {}
      n = Pu(e, t, o, r), n !== null && (o = tn(), nr(n, e, r, o), rd(n, t, r));
    }
  }
  function td(e) {
    var t = e.alternate;
    return e === yt || t !== null && t === yt;
  }
  function nd(e, t) {
    ei = il = !0;
    var n = e.pending;
    n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
  }
  function rd(e, t, n) {
    if ((n & 4194240) !== 0) {
      var r = t.lanes;
      r &= e.pendingLanes, n |= r, t.lanes = n, Aa(e, n);
    }
  }
  var cl = {
      readContext: Mn,
      useCallback: Kt,
      useContext: Kt,
      useEffect: Kt,
      useImperativeHandle: Kt,
      useInsertionEffect: Kt,
      useLayoutEffect: Kt,
      useMemo: Kt,
      useReducer: Kt,
      useRef: Kt,
      useState: Kt,
      useDebugValue: Kt,
      useDeferredValue: Kt,
      useTransition: Kt,
      useMutableSource: Kt,
      useSyncExternalStore: Kt,
      useId: Kt,
      unstable_isNewReconciler: !1
    },
    $f = {
      readContext: Mn,
      useCallback: function (e, t) {
        return dr().memoizedState = [e, t === void 0 ? null : t], e;
      },
      useContext: Mn,
      useEffect: Gu,
      useImperativeHandle: function (e, t, n) {
        return n = n != null ? n.concat([e]) : null, ll(4194308, 4, Qu.bind(null, t, e), n);
      },
      useLayoutEffect: function (e, t) {
        return ll(4194308, 4, e, t);
      },
      useInsertionEffect: function (e, t) {
        return ll(4, 2, e, t);
      },
      useMemo: function (e, t) {
        var n = dr();
        return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
      },
      useReducer: function (e, t, n) {
        var r = dr();
        return t = n !== void 0 ? n(t) : t, r.memoizedState = r.baseState = t, e = {
          pending: null,
          interleaved: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: e,
          lastRenderedState: t
        }, r.queue = e, e = e.dispatch = Af.bind(null, yt, e), [r.memoizedState, e];
      },
      useRef: function (e) {
        var t = dr();
        return e = {
          current: e
        }, t.memoizedState = e;
      },
      useState: Wu,
      useDebugValue: Ks,
      useDeferredValue: function (e) {
        return dr().memoizedState = e;
      },
      useTransition: function () {
        var e = Wu(!1),
          t = e[0];
        return e = zf.bind(null, e[1]), dr().memoizedState = e, [t, e];
      },
      useMutableSource: function () {},
      useSyncExternalStore: function (e, t, n) {
        var r = yt,
          o = dr();
        if (xt) {
          if (n === void 0) throw Error(u(407));
          n = n();
        } else {
          if (n = t(), It === null) throw Error(u(349));
          (wa & 30) !== 0 || zu(r, t, n);
        }
        o.memoizedState = n;
        var c = {
          value: n,
          getSnapshot: t
        };
        return o.queue = c, Gu(Bu.bind(null, r, c, e), [e]), r.flags |= 2048, ri(9, Au.bind(null, r, c, n, t), void 0, null), n;
      },
      useId: function () {
        var e = dr(),
          t = It.identifierPrefix;
        if (xt) {
          var n = Nr,
            r = Sr;
          n = (r & ~(1 << 32 - sn(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = ti++, 0 < n && (t += "H" + n.toString(32)), t += ":";
        } else n = Vf++, t = ":" + t + "r" + n.toString(32) + ":";
        return e.memoizedState = t;
      },
      unstable_isNewReconciler: !1
    },
    Uf = {
      readContext: Mn,
      useCallback: Xu,
      useContext: Mn,
      useEffect: Gs,
      useImperativeHandle: Ju,
      useInsertionEffect: Ku,
      useLayoutEffect: qu,
      useMemo: Yu,
      useReducer: Ws,
      useRef: Hu,
      useState: function () {
        return Ws(ni);
      },
      useDebugValue: Ks,
      useDeferredValue: function (e) {
        var t = In();
        return Zu(t, Tt.memoizedState, e);
      },
      useTransition: function () {
        var e = Ws(ni)[0],
          t = In().memoizedState;
        return [e, t];
      },
      useMutableSource: Ou,
      useSyncExternalStore: Vu,
      useId: ed,
      unstable_isNewReconciler: !1
    },
    Wf = {
      readContext: Mn,
      useCallback: Xu,
      useContext: Mn,
      useEffect: Gs,
      useImperativeHandle: Ju,
      useInsertionEffect: Ku,
      useLayoutEffect: qu,
      useMemo: Yu,
      useReducer: Hs,
      useRef: Hu,
      useState: function () {
        return Hs(ni);
      },
      useDebugValue: Ks,
      useDeferredValue: function (e) {
        var t = In();
        return Tt === null ? t.memoizedState = e : Zu(t, Tt.memoizedState, e);
      },
      useTransition: function () {
        var e = Hs(ni)[0],
          t = In().memoizedState;
        return [e, t];
      },
      useMutableSource: Ou,
      useSyncExternalStore: Vu,
      useId: ed,
      unstable_isNewReconciler: !1
    };
  function Zn(e, t) {
    if (e && e.defaultProps) {
      t = re({}, t), e = e.defaultProps;
      for (var n in e) t[n] === void 0 && (t[n] = e[n]);
      return t;
    }
    return t;
  }
  function qs(e, t, n, r) {
    t = e.memoizedState, n = n(r, t), n = n == null ? t : re({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
  }
  var ul = {
    isMounted: function (e) {
      return (e = e._reactInternals) ? Ln(e) === e : !1;
    },
    enqueueSetState: function (e, t, n) {
      e = e._reactInternals;
      var r = tn(),
        o = Jr(e),
        c = Er(r, o);
      c.payload = t, n != null && (c.callback = n), t = Gr(e, c, o), t !== null && (nr(t, e, o, r), nl(t, e, o));
    },
    enqueueReplaceState: function (e, t, n) {
      e = e._reactInternals;
      var r = tn(),
        o = Jr(e),
        c = Er(r, o);
      c.tag = 1, c.payload = t, n != null && (c.callback = n), t = Gr(e, c, o), t !== null && (nr(t, e, o, r), nl(t, e, o));
    },
    enqueueForceUpdate: function (e, t) {
      e = e._reactInternals;
      var n = tn(),
        r = Jr(e),
        o = Er(n, r);
      o.tag = 2, t != null && (o.callback = t), t = Gr(e, o, r), t !== null && (nr(t, e, r, n), nl(t, e, r));
    }
  };
  function ad(e, t, n, r, o, c, h) {
    return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, c, h) : t.prototype && t.prototype.isPureReactComponent ? !$e(n, r) || !$e(o, c) : !0;
  }
  function od(e, t, n) {
    var r = !1,
      o = Ur,
      c = t.contextType;
    return typeof c == "object" && c !== null ? c = Mn(c) : (o = pn(t) ? ma : Gt.current, r = t.contextTypes, c = (r = r != null) ? eo(e, o) : Ur), t = new t(n, c), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = ul, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = o, e.__reactInternalMemoizedMaskedChildContext = c), t;
  }
  function id(e, t, n, r) {
    e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && ul.enqueueReplaceState(t, t.state, null);
  }
  function Qs(e, t, n, r) {
    var o = e.stateNode;
    o.props = n, o.state = e.memoizedState, o.refs = {}, Ms(e);
    var c = t.contextType;
    typeof c == "object" && c !== null ? o.context = Mn(c) : (c = pn(t) ? ma : Gt.current, o.context = eo(e, c)), o.state = e.memoizedState, c = t.getDerivedStateFromProps, typeof c == "function" && (qs(e, t, c, n), o.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof o.getSnapshotBeforeUpdate == "function" || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (t = o.state, typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount(), t !== o.state && ul.enqueueReplaceState(o, o.state, null), rl(e, n, o, r), o.state = e.memoizedState), typeof o.componentDidMount == "function" && (e.flags |= 4194308);
  }
  function so(e, t) {
    try {
      var n = "",
        r = t;
      do n += ke(r), r = r.return; while (r);
      var o = n;
    } catch (c) {
      o = `
Error generating stack: ` + c.message + `
` + c.stack;
    }
    return {
      value: e,
      source: t,
      stack: o,
      digest: null
    };
  }
  function Js(e, t, n) {
    return {
      value: e,
      source: null,
      stack: n ?? null,
      digest: t ?? null
    };
  }
  function Xs(e, t) {
    try {
      console.error(t.value);
    } catch (n) {
      setTimeout(function () {
        throw n;
      });
    }
  }
  var Hf = typeof WeakMap == "function" ? WeakMap : Map;
  function ld(e, t, n) {
    n = Er(-1, n), n.tag = 3, n.payload = {
      element: null
    };
    var r = t.value;
    return n.callback = function () {
      xl || (xl = !0, pc = r), Xs(e, t);
    }, n;
  }
  function sd(e, t, n) {
    n = Er(-1, n), n.tag = 3;
    var r = e.type.getDerivedStateFromError;
    if (typeof r == "function") {
      var o = t.value;
      n.payload = function () {
        return r(o);
      }, n.callback = function () {
        Xs(e, t);
      };
    }
    var c = e.stateNode;
    return c !== null && typeof c.componentDidCatch == "function" && (n.callback = function () {
      Xs(e, t), typeof r != "function" && (qr === null ? qr = new Set([this]) : qr.add(this));
      var h = t.stack;
      this.componentDidCatch(t.value, {
        componentStack: h !== null ? h : ""
      });
    }), n;
  }
  function cd(e, t, n) {
    var r = e.pingCache;
    if (r === null) {
      r = e.pingCache = new Hf();
      var o = new Set();
      r.set(t, o);
    } else o = r.get(t), o === void 0 && (o = new Set(), r.set(t, o));
    o.has(n) || (o.add(n), e = om.bind(null, e, t, n), t.then(e, e));
  }
  function ud(e) {
    do {
      var t;
      if ((t = e.tag === 13) && (t = e.memoizedState, t = t !== null ? t.dehydrated !== null : !0), t) return e;
      e = e.return;
    } while (e !== null);
    return null;
  }
  function dd(e, t, n, r, o) {
    return (e.mode & 1) === 0 ? (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = Er(-1, 1), t.tag = 2, Gr(n, t, 1))), n.lanes |= 1), e) : (e.flags |= 65536, e.lanes = o, e);
  }
  var Gf = $.ReactCurrentOwner,
    fn = !1;
  function en(e, t, n, r) {
    t.child = e === null ? Lu(t, null, n, r) : ao(t, e.child, n, r);
  }
  function pd(e, t, n, r, o) {
    n = n.render;
    var c = t.ref;
    return io(t, o), r = $s(e, t, n, r, c, o), n = Us(), e !== null && !fn ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~o, Cr(e, t, o)) : (xt && n && js(t), t.flags |= 1, en(e, t, r, o), t.child);
  }
  function fd(e, t, n, r, o) {
    if (e === null) {
      var c = n.type;
      return typeof c == "function" && !wc(c) && c.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = c, md(e, t, c, r, o)) : (e = Sl(n.type, null, r, t, t.mode, o), e.ref = t.ref, e.return = t, t.child = e);
    }
    if (c = e.child, (e.lanes & o) === 0) {
      var h = c.memoizedProps;
      if (n = n.compare, n = n !== null ? n : $e, n(h, r) && e.ref === t.ref) return Cr(e, t, o);
    }
    return t.flags |= 1, e = Yr(c, r), e.ref = t.ref, e.return = t, t.child = e;
  }
  function md(e, t, n, r, o) {
    if (e !== null) {
      var c = e.memoizedProps;
      if ($e(c, r) && e.ref === t.ref) if (fn = !1, t.pendingProps = r = c, (e.lanes & o) !== 0) (e.flags & 131072) !== 0 && (fn = !0);else return t.lanes = e.lanes, Cr(e, t, o);
    }
    return Ys(e, t, n, r, o);
  }
  function hd(e, t, n) {
    var r = t.pendingProps,
      o = r.children,
      c = e !== null ? e.memoizedState : null;
    if (r.mode === "hidden") {
      if ((t.mode & 1) === 0) t.memoizedState = {
        baseLanes: 0,
        cachePool: null,
        transitions: null
      }, st(uo, En), En |= n;else {
        if ((n & 1073741824) === 0) return e = c !== null ? c.baseLanes | n : n, t.lanes = t.childLanes = 1073741824, t.memoizedState = {
          baseLanes: e,
          cachePool: null,
          transitions: null
        }, t.updateQueue = null, st(uo, En), En |= e, null;
        t.memoizedState = {
          baseLanes: 0,
          cachePool: null,
          transitions: null
        }, r = c !== null ? c.baseLanes : n, st(uo, En), En |= r;
      }
    } else c !== null ? (r = c.baseLanes | n, t.memoizedState = null) : r = n, st(uo, En), En |= r;
    return en(e, t, o, n), t.child;
  }
  function gd(e, t) {
    var n = t.ref;
    (e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
  }
  function Ys(e, t, n, r, o) {
    var c = pn(n) ? ma : Gt.current;
    return c = eo(t, c), io(t, o), n = $s(e, t, n, r, c, o), r = Us(), e !== null && !fn ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~o, Cr(e, t, o)) : (xt && r && js(t), t.flags |= 1, en(e, t, n, o), t.child);
  }
  function xd(e, t, n, r, o) {
    if (pn(n)) {
      var c = !0;
      qi(t);
    } else c = !1;
    if (io(t, o), t.stateNode === null) pl(e, t), od(t, n, r), Qs(t, n, r, o), r = !0;else if (e === null) {
      var h = t.stateNode,
        v = t.memoizedProps;
      h.props = v;
      var k = h.context,
        V = n.contextType;
      typeof V == "object" && V !== null ? V = Mn(V) : (V = pn(n) ? ma : Gt.current, V = eo(t, V));
      var te = n.getDerivedStateFromProps,
        ae = typeof te == "function" || typeof h.getSnapshotBeforeUpdate == "function";
      ae || typeof h.UNSAFE_componentWillReceiveProps != "function" && typeof h.componentWillReceiveProps != "function" || (v !== r || k !== V) && id(t, h, r, V), Hr = !1;
      var ee = t.memoizedState;
      h.state = ee, rl(t, r, h, o), k = t.memoizedState, v !== r || ee !== k || dn.current || Hr ? (typeof te == "function" && (qs(t, n, te, r), k = t.memoizedState), (v = Hr || ad(t, n, v, r, ee, k, V)) ? (ae || typeof h.UNSAFE_componentWillMount != "function" && typeof h.componentWillMount != "function" || (typeof h.componentWillMount == "function" && h.componentWillMount(), typeof h.UNSAFE_componentWillMount == "function" && h.UNSAFE_componentWillMount()), typeof h.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof h.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = k), h.props = r, h.state = k, h.context = V, r = v) : (typeof h.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
    } else {
      h = t.stateNode, Ru(e, t), v = t.memoizedProps, V = t.type === t.elementType ? v : Zn(t.type, v), h.props = V, ae = t.pendingProps, ee = h.context, k = n.contextType, typeof k == "object" && k !== null ? k = Mn(k) : (k = pn(n) ? ma : Gt.current, k = eo(t, k));
      var be = n.getDerivedStateFromProps;
      (te = typeof be == "function" || typeof h.getSnapshotBeforeUpdate == "function") || typeof h.UNSAFE_componentWillReceiveProps != "function" && typeof h.componentWillReceiveProps != "function" || (v !== ae || ee !== k) && id(t, h, r, k), Hr = !1, ee = t.memoizedState, h.state = ee, rl(t, r, h, o);
      var _e = t.memoizedState;
      v !== ae || ee !== _e || dn.current || Hr ? (typeof be == "function" && (qs(t, n, be, r), _e = t.memoizedState), (V = Hr || ad(t, n, V, r, ee, _e, k) || !1) ? (te || typeof h.UNSAFE_componentWillUpdate != "function" && typeof h.componentWillUpdate != "function" || (typeof h.componentWillUpdate == "function" && h.componentWillUpdate(r, _e, k), typeof h.UNSAFE_componentWillUpdate == "function" && h.UNSAFE_componentWillUpdate(r, _e, k)), typeof h.componentDidUpdate == "function" && (t.flags |= 4), typeof h.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof h.componentDidUpdate != "function" || v === e.memoizedProps && ee === e.memoizedState || (t.flags |= 4), typeof h.getSnapshotBeforeUpdate != "function" || v === e.memoizedProps && ee === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = _e), h.props = r, h.state = _e, h.context = k, r = V) : (typeof h.componentDidUpdate != "function" || v === e.memoizedProps && ee === e.memoizedState || (t.flags |= 4), typeof h.getSnapshotBeforeUpdate != "function" || v === e.memoizedProps && ee === e.memoizedState || (t.flags |= 1024), r = !1);
    }
    return Zs(e, t, n, r, c, o);
  }
  function Zs(e, t, n, r, o, c) {
    gd(e, t);
    var h = (t.flags & 128) !== 0;
    if (!r && !h) return o && ku(t, n, !1), Cr(e, t, c);
    r = t.stateNode, Gf.current = t;
    var v = h && typeof n.getDerivedStateFromError != "function" ? null : r.render();
    return t.flags |= 1, e !== null && h ? (t.child = ao(t, e.child, null, c), t.child = ao(t, null, v, c)) : en(e, t, v, c), t.memoizedState = r.state, o && ku(t, n, !0), t.child;
  }
  function vd(e) {
    var t = e.stateNode;
    t.pendingContext ? yu(e, t.pendingContext, t.pendingContext !== t.context) : t.context && yu(e, t.context, !1), Is(e, t.containerInfo);
  }
  function wd(e, t, n, r, o) {
    return ro(), Ds(o), t.flags |= 256, en(e, t, n, r), t.child;
  }
  var ec = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0
  };
  function tc(e) {
    return {
      baseLanes: e,
      cachePool: null,
      transitions: null
    };
  }
  function yd(e, t, n) {
    var r = t.pendingProps,
      o = wt.current,
      c = !1,
      h = (t.flags & 128) !== 0,
      v;
    if ((v = h) || (v = e !== null && e.memoizedState === null ? !1 : (o & 2) !== 0), v ? (c = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (o |= 1), st(wt, o & 1), e === null) return _s(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? ((t.mode & 1) === 0 ? t.lanes = 1 : e.data === "$!" ? t.lanes = 8 : t.lanes = 1073741824, null) : (h = r.children, e = r.fallback, c ? (r = t.mode, c = t.child, h = {
      mode: "hidden",
      children: h
    }, (r & 1) === 0 && c !== null ? (c.childLanes = 0, c.pendingProps = h) : c = Nl(h, r, 0, null), e = Na(e, r, n, null), c.return = t, e.return = t, c.sibling = e, t.child = c, t.child.memoizedState = tc(n), t.memoizedState = ec, e) : nc(t, h));
    if (o = e.memoizedState, o !== null && (v = o.dehydrated, v !== null)) return Kf(e, t, h, r, v, o, n);
    if (c) {
      c = r.fallback, h = t.mode, o = e.child, v = o.sibling;
      var k = {
        mode: "hidden",
        children: r.children
      };
      return (h & 1) === 0 && t.child !== o ? (r = t.child, r.childLanes = 0, r.pendingProps = k, t.deletions = null) : (r = Yr(o, k), r.subtreeFlags = o.subtreeFlags & 14680064), v !== null ? c = Yr(v, c) : (c = Na(c, h, n, null), c.flags |= 2), c.return = t, r.return = t, r.sibling = c, t.child = r, r = c, c = t.child, h = e.child.memoizedState, h = h === null ? tc(n) : {
        baseLanes: h.baseLanes | n,
        cachePool: null,
        transitions: h.transitions
      }, c.memoizedState = h, c.childLanes = e.childLanes & ~n, t.memoizedState = ec, r;
    }
    return c = e.child, e = c.sibling, r = Yr(c, {
      mode: "visible",
      children: r.children
    }), (t.mode & 1) === 0 && (r.lanes = n), r.return = t, r.sibling = null, e !== null && (n = t.deletions, n === null ? (t.deletions = [e], t.flags |= 16) : n.push(e)), t.child = r, t.memoizedState = null, r;
  }
  function nc(e, t) {
    return t = Nl({
      mode: "visible",
      children: t
    }, e.mode, 0, null), t.return = e, e.child = t;
  }
  function dl(e, t, n, r) {
    return r !== null && Ds(r), ao(t, e.child, null, n), e = nc(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
  }
  function Kf(e, t, n, r, o, c, h) {
    if (n) return t.flags & 256 ? (t.flags &= -257, r = Js(Error(u(422))), dl(e, t, h, r)) : t.memoizedState !== null ? (t.child = e.child, t.flags |= 128, null) : (c = r.fallback, o = t.mode, r = Nl({
      mode: "visible",
      children: r.children
    }, o, 0, null), c = Na(c, o, h, null), c.flags |= 2, r.return = t, c.return = t, r.sibling = c, t.child = r, (t.mode & 1) !== 0 && ao(t, e.child, null, h), t.child.memoizedState = tc(h), t.memoizedState = ec, c);
    if ((t.mode & 1) === 0) return dl(e, t, h, null);
    if (o.data === "$!") {
      if (r = o.nextSibling && o.nextSibling.dataset, r) var v = r.dgst;
      return r = v, c = Error(u(419)), r = Js(c, r, void 0), dl(e, t, h, r);
    }
    if (v = (h & e.childLanes) !== 0, fn || v) {
      if (r = It, r !== null) {
        switch (h & -h) {
          case 4:
            o = 2;
            break;
          case 16:
            o = 8;
            break;
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
            o = 32;
            break;
          case 536870912:
            o = 268435456;
            break;
          default:
            o = 0;
        }
        o = (o & (r.suspendedLanes | h)) !== 0 ? 0 : o, o !== 0 && o !== c.retryLane && (c.retryLane = o, jr(e, o), nr(r, e, o, -1));
      }
      return vc(), r = Js(Error(u(421))), dl(e, t, h, r);
    }
    return o.data === "$?" ? (t.flags |= 128, t.child = e.child, t = im.bind(null, e), o._reactRetry = t, null) : (e = c.treeContext, jn = Br(o.nextSibling), Nn = t, xt = !0, Yn = null, e !== null && (Rn[Fn++] = Sr, Rn[Fn++] = Nr, Rn[Fn++] = ha, Sr = e.id, Nr = e.overflow, ha = t), t = nc(t, r.children), t.flags |= 4096, t);
  }
  function bd(e, t, n) {
    e.lanes |= t;
    var r = e.alternate;
    r !== null && (r.lanes |= t), Rs(e.return, t, n);
  }
  function rc(e, t, n, r, o) {
    var c = e.memoizedState;
    c === null ? e.memoizedState = {
      isBackwards: t,
      rendering: null,
      renderingStartTime: 0,
      last: r,
      tail: n,
      tailMode: o
    } : (c.isBackwards = t, c.rendering = null, c.renderingStartTime = 0, c.last = r, c.tail = n, c.tailMode = o);
  }
  function kd(e, t, n) {
    var r = t.pendingProps,
      o = r.revealOrder,
      c = r.tail;
    if (en(e, t, r.children, n), r = wt.current, (r & 2) !== 0) r = r & 1 | 2, t.flags |= 128;else {
      if (e !== null && (e.flags & 128) !== 0) e: for (e = t.child; e !== null;) {
        if (e.tag === 13) e.memoizedState !== null && bd(e, n, t);else if (e.tag === 19) bd(e, n, t);else if (e.child !== null) {
          e.child.return = e, e = e.child;
          continue;
        }
        if (e === t) break e;
        for (; e.sibling === null;) {
          if (e.return === null || e.return === t) break e;
          e = e.return;
        }
        e.sibling.return = e.return, e = e.sibling;
      }
      r &= 1;
    }
    if (st(wt, r), (t.mode & 1) === 0) t.memoizedState = null;else switch (o) {
      case "forwards":
        for (n = t.child, o = null; n !== null;) e = n.alternate, e !== null && al(e) === null && (o = n), n = n.sibling;
        n = o, n === null ? (o = t.child, t.child = null) : (o = n.sibling, n.sibling = null), rc(t, !1, o, n, c);
        break;
      case "backwards":
        for (n = null, o = t.child, t.child = null; o !== null;) {
          if (e = o.alternate, e !== null && al(e) === null) {
            t.child = o;
            break;
          }
          e = o.sibling, o.sibling = n, n = o, o = e;
        }
        rc(t, !0, n, null, c);
        break;
      case "together":
        rc(t, !1, null, null, void 0);
        break;
      default:
        t.memoizedState = null;
    }
    return t.child;
  }
  function pl(e, t) {
    (t.mode & 1) === 0 && e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2);
  }
  function Cr(e, t, n) {
    if (e !== null && (t.dependencies = e.dependencies), ya |= t.lanes, (n & t.childLanes) === 0) return null;
    if (e !== null && t.child !== e.child) throw Error(u(153));
    if (t.child !== null) {
      for (e = t.child, n = Yr(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = Yr(e, e.pendingProps), n.return = t;
      n.sibling = null;
    }
    return t.child;
  }
  function qf(e, t, n) {
    switch (t.tag) {
      case 3:
        vd(t), ro();
        break;
      case 5:
        Iu(t);
        break;
      case 1:
        pn(t.type) && qi(t);
        break;
      case 4:
        Is(t, t.stateNode.containerInfo);
        break;
      case 10:
        var r = t.type._context,
          o = t.memoizedProps.value;
        st(el, r._currentValue), r._currentValue = o;
        break;
      case 13:
        if (r = t.memoizedState, r !== null) return r.dehydrated !== null ? (st(wt, wt.current & 1), t.flags |= 128, null) : (n & t.child.childLanes) !== 0 ? yd(e, t, n) : (st(wt, wt.current & 1), e = Cr(e, t, n), e !== null ? e.sibling : null);
        st(wt, wt.current & 1);
        break;
      case 19:
        if (r = (n & t.childLanes) !== 0, (e.flags & 128) !== 0) {
          if (r) return kd(e, t, n);
          t.flags |= 128;
        }
        if (o = t.memoizedState, o !== null && (o.rendering = null, o.tail = null, o.lastEffect = null), st(wt, wt.current), r) break;
        return null;
      case 22:
      case 23:
        return t.lanes = 0, hd(e, t, n);
    }
    return Cr(e, t, n);
  }
  var Sd, ac, Nd, jd;
  Sd = function (e, t) {
    for (var n = t.child; n !== null;) {
      if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);else if (n.tag !== 4 && n.child !== null) {
        n.child.return = n, n = n.child;
        continue;
      }
      if (n === t) break;
      for (; n.sibling === null;) {
        if (n.return === null || n.return === t) return;
        n = n.return;
      }
      n.sibling.return = n.return, n = n.sibling;
    }
  }, ac = function () {}, Nd = function (e, t, n, r) {
    var o = e.memoizedProps;
    if (o !== r) {
      e = t.stateNode, va(ur.current);
      var c = null;
      switch (n) {
        case "input":
          o = hr(e, o), r = hr(e, r), c = [];
          break;
        case "select":
          o = re({}, o, {
            value: void 0
          }), r = re({}, r, {
            value: void 0
          }), c = [];
          break;
        case "textarea":
          o = $n(e, o), r = $n(e, r), c = [];
          break;
        default:
          typeof o.onClick != "function" && typeof r.onClick == "function" && (e.onclick = Hi);
      }
      Un(n, r);
      var h;
      n = null;
      for (V in o) if (!r.hasOwnProperty(V) && o.hasOwnProperty(V) && o[V] != null) if (V === "style") {
        var v = o[V];
        for (h in v) v.hasOwnProperty(h) && (n || (n = {}), n[h] = "");
      } else V !== "dangerouslySetInnerHTML" && V !== "children" && V !== "suppressContentEditableWarning" && V !== "suppressHydrationWarning" && V !== "autoFocus" && (p.hasOwnProperty(V) ? c || (c = []) : (c = c || []).push(V, null));
      for (V in r) {
        var k = r[V];
        if (v = o?.[V], r.hasOwnProperty(V) && k !== v && (k != null || v != null)) if (V === "style") {
          if (v) {
            for (h in v) !v.hasOwnProperty(h) || k && k.hasOwnProperty(h) || (n || (n = {}), n[h] = "");
            for (h in k) k.hasOwnProperty(h) && v[h] !== k[h] && (n || (n = {}), n[h] = k[h]);
          } else n || (c || (c = []), c.push(V, n)), n = k;
        } else V === "dangerouslySetInnerHTML" ? (k = k ? k.__html : void 0, v = v ? v.__html : void 0, k != null && v !== k && (c = c || []).push(V, k)) : V === "children" ? typeof k != "string" && typeof k != "number" || (c = c || []).push(V, "" + k) : V !== "suppressContentEditableWarning" && V !== "suppressHydrationWarning" && (p.hasOwnProperty(V) ? (k != null && V === "onScroll" && ft("scroll", e), c || v === k || (c = [])) : (c = c || []).push(V, k));
      }
      n && (c = c || []).push("style", n);
      var V = c;
      (t.updateQueue = V) && (t.flags |= 4);
    }
  }, jd = function (e, t, n, r) {
    n !== r && (t.flags |= 4);
  };
  function ai(e, t) {
    if (!xt) switch (e.tailMode) {
      case "hidden":
        t = e.tail;
        for (var n = null; t !== null;) t.alternate !== null && (n = t), t = t.sibling;
        n === null ? e.tail = null : n.sibling = null;
        break;
      case "collapsed":
        n = e.tail;
        for (var r = null; n !== null;) n.alternate !== null && (r = n), n = n.sibling;
        r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
    }
  }
  function qt(e) {
    var t = e.alternate !== null && e.alternate.child === e.child,
      n = 0,
      r = 0;
    if (t) for (var o = e.child; o !== null;) n |= o.lanes | o.childLanes, r |= o.subtreeFlags & 14680064, r |= o.flags & 14680064, o.return = e, o = o.sibling;else for (o = e.child; o !== null;) n |= o.lanes | o.childLanes, r |= o.subtreeFlags, r |= o.flags, o.return = e, o = o.sibling;
    return e.subtreeFlags |= r, e.childLanes = n, t;
  }
  function Qf(e, t, n) {
    var r = t.pendingProps;
    switch (Es(t), t.tag) {
      case 2:
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return qt(t), null;
      case 1:
        return pn(t.type) && Ki(), qt(t), null;
      case 3:
        return r = t.stateNode, lo(), mt(dn), mt(Gt), zs(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (Yi(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024, Yn !== null && (hc(Yn), Yn = null))), ac(e, t), qt(t), null;
      case 5:
        Os(t);
        var o = va(Zo.current);
        if (n = t.type, e !== null && t.stateNode != null) Nd(e, t, n, r, o), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);else {
          if (!r) {
            if (t.stateNode === null) throw Error(u(166));
            return qt(t), null;
          }
          if (e = va(ur.current), Yi(t)) {
            r = t.stateNode, n = t.type;
            var c = t.memoizedProps;
            switch (r[cr] = t, r[qo] = c, e = (t.mode & 1) !== 0, n) {
              case "dialog":
                ft("cancel", r), ft("close", r);
                break;
              case "iframe":
              case "object":
              case "embed":
                ft("load", r);
                break;
              case "video":
              case "audio":
                for (o = 0; o < Ho.length; o++) ft(Ho[o], r);
                break;
              case "source":
                ft("error", r);
                break;
              case "img":
              case "image":
              case "link":
                ft("error", r), ft("load", r);
                break;
              case "details":
                ft("toggle", r);
                break;
              case "input":
                gr(r, c), ft("invalid", r);
                break;
              case "select":
                r._wrapperState = {
                  wasMultiple: !!c.multiple
                }, ft("invalid", r);
                break;
              case "textarea":
                Dn(r, c), ft("invalid", r);
            }
            Un(n, c), o = null;
            for (var h in c) if (c.hasOwnProperty(h)) {
              var v = c[h];
              h === "children" ? typeof v == "string" ? r.textContent !== v && (c.suppressHydrationWarning !== !0 && Wi(r.textContent, v, e), o = ["children", v]) : typeof v == "number" && r.textContent !== "" + v && (c.suppressHydrationWarning !== !0 && Wi(r.textContent, v, e), o = ["children", "" + v]) : p.hasOwnProperty(h) && v != null && h === "onScroll" && ft("scroll", r);
            }
            switch (n) {
              case "input":
                $t(r), _n(r, c, !0);
                break;
              case "textarea":
                $t(r), he(r);
                break;
              case "select":
              case "option":
                break;
              default:
                typeof c.onClick == "function" && (r.onclick = Hi);
            }
            r = o, t.updateQueue = r, r !== null && (t.flags |= 4);
          } else {
            h = o.nodeType === 9 ? o : o.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = Re(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = h.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = h.createElement(n, {
              is: r.is
            }) : (e = h.createElement(n), n === "select" && (h = e, r.multiple ? h.multiple = !0 : r.size && (h.size = r.size))) : e = h.createElementNS(e, n), e[cr] = t, e[qo] = r, Sd(e, t, !1, !1), t.stateNode = e;
            e: {
              switch (h = Xt(n, r), n) {
                case "dialog":
                  ft("cancel", e), ft("close", e), o = r;
                  break;
                case "iframe":
                case "object":
                case "embed":
                  ft("load", e), o = r;
                  break;
                case "video":
                case "audio":
                  for (o = 0; o < Ho.length; o++) ft(Ho[o], e);
                  o = r;
                  break;
                case "source":
                  ft("error", e), o = r;
                  break;
                case "img":
                case "image":
                case "link":
                  ft("error", e), ft("load", e), o = r;
                  break;
                case "details":
                  ft("toggle", e), o = r;
                  break;
                case "input":
                  gr(e, r), o = hr(e, r), ft("invalid", e);
                  break;
                case "option":
                  o = r;
                  break;
                case "select":
                  e._wrapperState = {
                    wasMultiple: !!r.multiple
                  }, o = re({}, r, {
                    value: void 0
                  }), ft("invalid", e);
                  break;
                case "textarea":
                  Dn(e, r), o = $n(e, r), ft("invalid", e);
                  break;
                default:
                  o = r;
              }
              Un(n, o), v = o;
              for (c in v) if (v.hasOwnProperty(c)) {
                var k = v[c];
                c === "style" ? Ye(e, k) : c === "dangerouslySetInnerHTML" ? (k = k ? k.__html : void 0, k != null && at(e, k)) : c === "children" ? typeof k == "string" ? (n !== "textarea" || k !== "") && Nt(e, k) : typeof k == "number" && Nt(e, "" + k) : c !== "suppressContentEditableWarning" && c !== "suppressHydrationWarning" && c !== "autoFocus" && (p.hasOwnProperty(c) ? k != null && c === "onScroll" && ft("scroll", e) : k != null && B(e, c, k, h));
              }
              switch (n) {
                case "input":
                  $t(e), _n(e, r, !1);
                  break;
                case "textarea":
                  $t(e), he(e);
                  break;
                case "option":
                  r.value != null && e.setAttribute("value", "" + ze(r.value));
                  break;
                case "select":
                  e.multiple = !!r.multiple, c = r.value, c != null ? Pt(e, !!r.multiple, c, !1) : r.defaultValue != null && Pt(e, !!r.multiple, r.defaultValue, !0);
                  break;
                default:
                  typeof o.onClick == "function" && (e.onclick = Hi);
              }
              switch (n) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  r = !!r.autoFocus;
                  break e;
                case "img":
                  r = !0;
                  break e;
                default:
                  r = !1;
              }
            }
            r && (t.flags |= 4);
          }
          t.ref !== null && (t.flags |= 512, t.flags |= 2097152);
        }
        return qt(t), null;
      case 6:
        if (e && t.stateNode != null) jd(e, t, e.memoizedProps, r);else {
          if (typeof r != "string" && t.stateNode === null) throw Error(u(166));
          if (n = va(Zo.current), va(ur.current), Yi(t)) {
            if (r = t.stateNode, n = t.memoizedProps, r[cr] = t, (c = r.nodeValue !== n) && (e = Nn, e !== null)) switch (e.tag) {
              case 3:
                Wi(r.nodeValue, n, (e.mode & 1) !== 0);
                break;
              case 5:
                e.memoizedProps.suppressHydrationWarning !== !0 && Wi(r.nodeValue, n, (e.mode & 1) !== 0);
            }
            c && (t.flags |= 4);
          } else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[cr] = t, t.stateNode = r;
        }
        return qt(t), null;
      case 13:
        if (mt(wt), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
          if (xt && jn !== null && (t.mode & 1) !== 0 && (t.flags & 128) === 0) _u(), ro(), t.flags |= 98560, c = !1;else if (c = Yi(t), r !== null && r.dehydrated !== null) {
            if (e === null) {
              if (!c) throw Error(u(318));
              if (c = t.memoizedState, c = c !== null ? c.dehydrated : null, !c) throw Error(u(317));
              c[cr] = t;
            } else ro(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            qt(t), c = !1;
          } else Yn !== null && (hc(Yn), Yn = null), c = !0;
          if (!c) return t.flags & 65536 ? t : null;
        }
        return (t.flags & 128) !== 0 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, (t.mode & 1) !== 0 && (e === null || (wt.current & 1) !== 0 ? Lt === 0 && (Lt = 3) : vc())), t.updateQueue !== null && (t.flags |= 4), qt(t), null);
      case 4:
        return lo(), ac(e, t), e === null && Go(t.stateNode.containerInfo), qt(t), null;
      case 10:
        return Ps(t.type._context), qt(t), null;
      case 17:
        return pn(t.type) && Ki(), qt(t), null;
      case 19:
        if (mt(wt), c = t.memoizedState, c === null) return qt(t), null;
        if (r = (t.flags & 128) !== 0, h = c.rendering, h === null) {
          if (r) ai(c, !1);else {
            if (Lt !== 0 || e !== null && (e.flags & 128) !== 0) for (e = t.child; e !== null;) {
              if (h = al(e), h !== null) {
                for (t.flags |= 128, ai(c, !1), r = h.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null;) c = n, e = r, c.flags &= 14680066, h = c.alternate, h === null ? (c.childLanes = 0, c.lanes = e, c.child = null, c.subtreeFlags = 0, c.memoizedProps = null, c.memoizedState = null, c.updateQueue = null, c.dependencies = null, c.stateNode = null) : (c.childLanes = h.childLanes, c.lanes = h.lanes, c.child = h.child, c.subtreeFlags = 0, c.deletions = null, c.memoizedProps = h.memoizedProps, c.memoizedState = h.memoizedState, c.updateQueue = h.updateQueue, c.type = h.type, e = h.dependencies, c.dependencies = e === null ? null : {
                  lanes: e.lanes,
                  firstContext: e.firstContext
                }), n = n.sibling;
                return st(wt, wt.current & 1 | 2), t.child;
              }
              e = e.sibling;
            }
            c.tail !== null && dt() > po && (t.flags |= 128, r = !0, ai(c, !1), t.lanes = 4194304);
          }
        } else {
          if (!r) if (e = al(h), e !== null) {
            if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), ai(c, !0), c.tail === null && c.tailMode === "hidden" && !h.alternate && !xt) return qt(t), null;
          } else 2 * dt() - c.renderingStartTime > po && n !== 1073741824 && (t.flags |= 128, r = !0, ai(c, !1), t.lanes = 4194304);
          c.isBackwards ? (h.sibling = t.child, t.child = h) : (n = c.last, n !== null ? n.sibling = h : t.child = h, c.last = h);
        }
        return c.tail !== null ? (t = c.tail, c.rendering = t, c.tail = t.sibling, c.renderingStartTime = dt(), t.sibling = null, n = wt.current, st(wt, r ? n & 1 | 2 : n & 1), t) : (qt(t), null);
      case 22:
      case 23:
        return xc(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && (t.mode & 1) !== 0 ? (En & 1073741824) !== 0 && (qt(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : qt(t), null;
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(u(156, t.tag));
  }
  function Jf(e, t) {
    switch (Es(t), t.tag) {
      case 1:
        return pn(t.type) && Ki(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 3:
        return lo(), mt(dn), mt(Gt), zs(), e = t.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (t.flags = e & -65537 | 128, t) : null;
      case 5:
        return Os(t), null;
      case 13:
        if (mt(wt), e = t.memoizedState, e !== null && e.dehydrated !== null) {
          if (t.alternate === null) throw Error(u(340));
          ro();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 19:
        return mt(wt), null;
      case 4:
        return lo(), null;
      case 10:
        return Ps(t.type._context), null;
      case 22:
      case 23:
        return xc(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var fl = !1,
    Qt = !1,
    Xf = typeof WeakSet == "function" ? WeakSet : Set,
    je = null;
  function co(e, t) {
    var n = e.ref;
    if (n !== null) if (typeof n == "function") try {
      n(null);
    } catch (r) {
      St(e, t, r);
    } else n.current = null;
  }
  function oc(e, t, n) {
    try {
      n();
    } catch (r) {
      St(e, t, r);
    }
  }
  var Ed = !1;
  function Yf(e, t) {
    if (xs = kt, e = we(), Ue(e)) {
      if ("selectionStart" in e) var n = {
        start: e.selectionStart,
        end: e.selectionEnd
      };else e: {
        n = (n = e.ownerDocument) && n.defaultView || window;
        var r = n.getSelection && n.getSelection();
        if (r && r.rangeCount !== 0) {
          n = r.anchorNode;
          var o = r.anchorOffset,
            c = r.focusNode;
          r = r.focusOffset;
          try {
            n.nodeType, c.nodeType;
          } catch {
            n = null;
            break e;
          }
          var h = 0,
            v = -1,
            k = -1,
            V = 0,
            te = 0,
            ae = e,
            ee = null;
          t: for (;;) {
            for (var be; ae !== n || o !== 0 && ae.nodeType !== 3 || (v = h + o), ae !== c || r !== 0 && ae.nodeType !== 3 || (k = h + r), ae.nodeType === 3 && (h += ae.nodeValue.length), (be = ae.firstChild) !== null;) ee = ae, ae = be;
            for (;;) {
              if (ae === e) break t;
              if (ee === n && ++V === o && (v = h), ee === c && ++te === r && (k = h), (be = ae.nextSibling) !== null) break;
              ae = ee, ee = ae.parentNode;
            }
            ae = be;
          }
          n = v === -1 || k === -1 ? null : {
            start: v,
            end: k
          };
        } else n = null;
      }
      n = n || {
        start: 0,
        end: 0
      };
    } else n = null;
    for (vs = {
      focusedElem: e,
      selectionRange: n
    }, kt = !1, je = t; je !== null;) if (t = je, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null) e.return = t, je = e;else for (; je !== null;) {
      t = je;
      try {
        var _e = t.alternate;
        if ((t.flags & 1024) !== 0) switch (t.tag) {
          case 0:
          case 11:
          case 15:
            break;
          case 1:
            if (_e !== null) {
              var Te = _e.memoizedProps,
                jt = _e.memoizedState,
                P = t.stateNode,
                S = P.getSnapshotBeforeUpdate(t.elementType === t.type ? Te : Zn(t.type, Te), jt);
              P.__reactInternalSnapshotBeforeUpdate = S;
            }
            break;
          case 3:
            var I = t.stateNode.containerInfo;
            I.nodeType === 1 ? I.textContent = "" : I.nodeType === 9 && I.documentElement && I.removeChild(I.documentElement);
            break;
          case 5:
          case 6:
          case 4:
          case 17:
            break;
          default:
            throw Error(u(163));
        }
      } catch (ce) {
        St(t, t.return, ce);
      }
      if (e = t.sibling, e !== null) {
        e.return = t.return, je = e;
        break;
      }
      je = t.return;
    }
    return _e = Ed, Ed = !1, _e;
  }
  function oi(e, t, n) {
    var r = t.updateQueue;
    if (r = r !== null ? r.lastEffect : null, r !== null) {
      var o = r = r.next;
      do {
        if ((o.tag & e) === e) {
          var c = o.destroy;
          o.destroy = void 0, c !== void 0 && oc(t, n, c);
        }
        o = o.next;
      } while (o !== r);
    }
  }
  function ml(e, t) {
    if (t = t.updateQueue, t = t !== null ? t.lastEffect : null, t !== null) {
      var n = t = t.next;
      do {
        if ((n.tag & e) === e) {
          var r = n.create;
          n.destroy = r();
        }
        n = n.next;
      } while (n !== t);
    }
  }
  function ic(e) {
    var t = e.ref;
    if (t !== null) {
      var n = e.stateNode;
      switch (e.tag) {
        case 5:
          e = n;
          break;
        default:
          e = n;
      }
      typeof t == "function" ? t(e) : t.current = e;
    }
  }
  function Cd(e) {
    var t = e.alternate;
    t !== null && (e.alternate = null, Cd(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[cr], delete t[qo], delete t[ks], delete t[Ff], delete t[Mf])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
  }
  function _d(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 4;
  }
  function Dd(e) {
    e: for (;;) {
      for (; e.sibling === null;) {
        if (e.return === null || _d(e.return)) return null;
        e = e.return;
      }
      for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
        if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
        e.child.return = e, e = e.child;
      }
      if (!(e.flags & 2)) return e.stateNode;
    }
  }
  function lc(e, t, n) {
    var r = e.tag;
    if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Hi));else if (r !== 4 && (e = e.child, e !== null)) for (lc(e, t, n), e = e.sibling; e !== null;) lc(e, t, n), e = e.sibling;
  }
  function sc(e, t, n) {
    var r = e.tag;
    if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);else if (r !== 4 && (e = e.child, e !== null)) for (sc(e, t, n), e = e.sibling; e !== null;) sc(e, t, n), e = e.sibling;
  }
  var At = null,
    er = !1;
  function Kr(e, t, n) {
    for (n = n.child; n !== null;) Td(e, t, n), n = n.sibling;
  }
  function Td(e, t, n) {
    if (tt && typeof tt.onCommitFiberUnmount == "function") try {
      tt.onCommitFiberUnmount(Ma, n);
    } catch {}
    switch (n.tag) {
      case 5:
        Qt || co(n, t);
      case 6:
        var r = At,
          o = er;
        At = null, Kr(e, t, n), At = r, er = o, At !== null && (er ? (e = At, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : At.removeChild(n.stateNode));
        break;
      case 18:
        At !== null && (er ? (e = At, n = n.stateNode, e.nodeType === 8 ? bs(e.parentNode, n) : e.nodeType === 1 && bs(e, n), sa(e)) : bs(At, n.stateNode));
        break;
      case 4:
        r = At, o = er, At = n.stateNode.containerInfo, er = !0, Kr(e, t, n), At = r, er = o;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (!Qt && (r = n.updateQueue, r !== null && (r = r.lastEffect, r !== null))) {
          o = r = r.next;
          do {
            var c = o,
              h = c.destroy;
            c = c.tag, h !== void 0 && ((c & 2) !== 0 || (c & 4) !== 0) && oc(n, t, h), o = o.next;
          } while (o !== r);
        }
        Kr(e, t, n);
        break;
      case 1:
        if (!Qt && (co(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function")) try {
          r.props = n.memoizedProps, r.state = n.memoizedState, r.componentWillUnmount();
        } catch (v) {
          St(n, t, v);
        }
        Kr(e, t, n);
        break;
      case 21:
        Kr(e, t, n);
        break;
      case 22:
        n.mode & 1 ? (Qt = (r = Qt) || n.memoizedState !== null, Kr(e, t, n), Qt = r) : Kr(e, t, n);
        break;
      default:
        Kr(e, t, n);
    }
  }
  function Ld(e) {
    var t = e.updateQueue;
    if (t !== null) {
      e.updateQueue = null;
      var n = e.stateNode;
      n === null && (n = e.stateNode = new Xf()), t.forEach(function (r) {
        var o = lm.bind(null, e, r);
        n.has(r) || (n.add(r), r.then(o, o));
      });
    }
  }
  function tr(e, t) {
    var n = t.deletions;
    if (n !== null) for (var r = 0; r < n.length; r++) {
      var o = n[r];
      try {
        var c = e,
          h = t,
          v = h;
        e: for (; v !== null;) {
          switch (v.tag) {
            case 5:
              At = v.stateNode, er = !1;
              break e;
            case 3:
              At = v.stateNode.containerInfo, er = !0;
              break e;
            case 4:
              At = v.stateNode.containerInfo, er = !0;
              break e;
          }
          v = v.return;
        }
        if (At === null) throw Error(u(160));
        Td(c, h, o), At = null, er = !1;
        var k = o.alternate;
        k !== null && (k.return = null), o.return = null;
      } catch (V) {
        St(o, t, V);
      }
    }
    if (t.subtreeFlags & 12854) for (t = t.child; t !== null;) Pd(t, e), t = t.sibling;
  }
  function Pd(e, t) {
    var n = e.alternate,
      r = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (tr(t, e), pr(e), r & 4) {
          try {
            oi(3, e, e.return), ml(3, e);
          } catch (Te) {
            St(e, e.return, Te);
          }
          try {
            oi(5, e, e.return);
          } catch (Te) {
            St(e, e.return, Te);
          }
        }
        break;
      case 1:
        tr(t, e), pr(e), r & 512 && n !== null && co(n, n.return);
        break;
      case 5:
        if (tr(t, e), pr(e), r & 512 && n !== null && co(n, n.return), e.flags & 32) {
          var o = e.stateNode;
          try {
            Nt(o, "");
          } catch (Te) {
            St(e, e.return, Te);
          }
        }
        if (r & 4 && (o = e.stateNode, o != null)) {
          var c = e.memoizedProps,
            h = n !== null ? n.memoizedProps : c,
            v = e.type,
            k = e.updateQueue;
          if (e.updateQueue = null, k !== null) try {
            v === "input" && c.type === "radio" && c.name != null && ta(o, c), Xt(v, h);
            var V = Xt(v, c);
            for (h = 0; h < k.length; h += 2) {
              var te = k[h],
                ae = k[h + 1];
              te === "style" ? Ye(o, ae) : te === "dangerouslySetInnerHTML" ? at(o, ae) : te === "children" ? Nt(o, ae) : B(o, te, ae, V);
            }
            switch (v) {
              case "input":
                Cn(o, c);
                break;
              case "textarea":
                Da(o, c);
                break;
              case "select":
                var ee = o._wrapperState.wasMultiple;
                o._wrapperState.wasMultiple = !!c.multiple;
                var be = c.value;
                be != null ? Pt(o, !!c.multiple, be, !1) : ee !== !!c.multiple && (c.defaultValue != null ? Pt(o, !!c.multiple, c.defaultValue, !0) : Pt(o, !!c.multiple, c.multiple ? [] : "", !1));
            }
            o[qo] = c;
          } catch (Te) {
            St(e, e.return, Te);
          }
        }
        break;
      case 6:
        if (tr(t, e), pr(e), r & 4) {
          if (e.stateNode === null) throw Error(u(162));
          o = e.stateNode, c = e.memoizedProps;
          try {
            o.nodeValue = c;
          } catch (Te) {
            St(e, e.return, Te);
          }
        }
        break;
      case 3:
        if (tr(t, e), pr(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
          sa(t.containerInfo);
        } catch (Te) {
          St(e, e.return, Te);
        }
        break;
      case 4:
        tr(t, e), pr(e);
        break;
      case 13:
        tr(t, e), pr(e), o = e.child, o.flags & 8192 && (c = o.memoizedState !== null, o.stateNode.isHidden = c, !c || o.alternate !== null && o.alternate.memoizedState !== null || (dc = dt())), r & 4 && Ld(e);
        break;
      case 22:
        if (te = n !== null && n.memoizedState !== null, e.mode & 1 ? (Qt = (V = Qt) || te, tr(t, e), Qt = V) : tr(t, e), pr(e), r & 8192) {
          if (V = e.memoizedState !== null, (e.stateNode.isHidden = V) && !te && (e.mode & 1) !== 0) for (je = e, te = e.child; te !== null;) {
            for (ae = je = te; je !== null;) {
              switch (ee = je, be = ee.child, ee.tag) {
                case 0:
                case 11:
                case 14:
                case 15:
                  oi(4, ee, ee.return);
                  break;
                case 1:
                  co(ee, ee.return);
                  var _e = ee.stateNode;
                  if (typeof _e.componentWillUnmount == "function") {
                    r = ee, n = ee.return;
                    try {
                      t = r, _e.props = t.memoizedProps, _e.state = t.memoizedState, _e.componentWillUnmount();
                    } catch (Te) {
                      St(r, n, Te);
                    }
                  }
                  break;
                case 5:
                  co(ee, ee.return);
                  break;
                case 22:
                  if (ee.memoizedState !== null) {
                    Md(ae);
                    continue;
                  }
              }
              be !== null ? (be.return = ee, je = be) : Md(ae);
            }
            te = te.sibling;
          }
          e: for (te = null, ae = e;;) {
            if (ae.tag === 5) {
              if (te === null) {
                te = ae;
                try {
                  o = ae.stateNode, V ? (c = o.style, typeof c.setProperty == "function" ? c.setProperty("display", "none", "important") : c.display = "none") : (v = ae.stateNode, k = ae.memoizedProps.style, h = k != null && k.hasOwnProperty("display") ? k.display : null, v.style.display = nn("display", h));
                } catch (Te) {
                  St(e, e.return, Te);
                }
              }
            } else if (ae.tag === 6) {
              if (te === null) try {
                ae.stateNode.nodeValue = V ? "" : ae.memoizedProps;
              } catch (Te) {
                St(e, e.return, Te);
              }
            } else if ((ae.tag !== 22 && ae.tag !== 23 || ae.memoizedState === null || ae === e) && ae.child !== null) {
              ae.child.return = ae, ae = ae.child;
              continue;
            }
            if (ae === e) break e;
            for (; ae.sibling === null;) {
              if (ae.return === null || ae.return === e) break e;
              te === ae && (te = null), ae = ae.return;
            }
            te === ae && (te = null), ae.sibling.return = ae.return, ae = ae.sibling;
          }
        }
        break;
      case 19:
        tr(t, e), pr(e), r & 4 && Ld(e);
        break;
      case 21:
        break;
      default:
        tr(t, e), pr(e);
    }
  }
  function pr(e) {
    var t = e.flags;
    if (t & 2) {
      try {
        e: {
          for (var n = e.return; n !== null;) {
            if (_d(n)) {
              var r = n;
              break e;
            }
            n = n.return;
          }
          throw Error(u(160));
        }
        switch (r.tag) {
          case 5:
            var o = r.stateNode;
            r.flags & 32 && (Nt(o, ""), r.flags &= -33);
            var c = Dd(e);
            sc(e, c, o);
            break;
          case 3:
          case 4:
            var h = r.stateNode.containerInfo,
              v = Dd(e);
            lc(e, v, h);
            break;
          default:
            throw Error(u(161));
        }
      } catch (k) {
        St(e, e.return, k);
      }
      e.flags &= -3;
    }
    t & 4096 && (e.flags &= -4097);
  }
  function Zf(e, t, n) {
    je = e, Rd(e);
  }
  function Rd(e, t, n) {
    for (var r = (e.mode & 1) !== 0; je !== null;) {
      var o = je,
        c = o.child;
      if (o.tag === 22 && r) {
        var h = o.memoizedState !== null || fl;
        if (!h) {
          var v = o.alternate,
            k = v !== null && v.memoizedState !== null || Qt;
          v = fl;
          var V = Qt;
          if (fl = h, (Qt = k) && !V) for (je = o; je !== null;) h = je, k = h.child, h.tag === 22 && h.memoizedState !== null ? Id(o) : k !== null ? (k.return = h, je = k) : Id(o);
          for (; c !== null;) je = c, Rd(c), c = c.sibling;
          je = o, fl = v, Qt = V;
        }
        Fd(e);
      } else (o.subtreeFlags & 8772) !== 0 && c !== null ? (c.return = o, je = c) : Fd(e);
    }
  }
  function Fd(e) {
    for (; je !== null;) {
      var t = je;
      if ((t.flags & 8772) !== 0) {
        var n = t.alternate;
        try {
          if ((t.flags & 8772) !== 0) switch (t.tag) {
            case 0:
            case 11:
            case 15:
              Qt || ml(5, t);
              break;
            case 1:
              var r = t.stateNode;
              if (t.flags & 4 && !Qt) if (n === null) r.componentDidMount();else {
                var o = t.elementType === t.type ? n.memoizedProps : Zn(t.type, n.memoizedProps);
                r.componentDidUpdate(o, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
              }
              var c = t.updateQueue;
              c !== null && Mu(t, c, r);
              break;
            case 3:
              var h = t.updateQueue;
              if (h !== null) {
                if (n = null, t.child !== null) switch (t.child.tag) {
                  case 5:
                    n = t.child.stateNode;
                    break;
                  case 1:
                    n = t.child.stateNode;
                }
                Mu(t, h, n);
              }
              break;
            case 5:
              var v = t.stateNode;
              if (n === null && t.flags & 4) {
                n = v;
                var k = t.memoizedProps;
                switch (t.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    k.autoFocus && n.focus();
                    break;
                  case "img":
                    k.src && (n.src = k.src);
                }
              }
              break;
            case 6:
              break;
            case 4:
              break;
            case 12:
              break;
            case 13:
              if (t.memoizedState === null) {
                var V = t.alternate;
                if (V !== null) {
                  var te = V.memoizedState;
                  if (te !== null) {
                    var ae = te.dehydrated;
                    ae !== null && sa(ae);
                  }
                }
              }
              break;
            case 19:
            case 17:
            case 21:
            case 22:
            case 23:
            case 25:
              break;
            default:
              throw Error(u(163));
          }
          Qt || t.flags & 512 && ic(t);
        } catch (ee) {
          St(t, t.return, ee);
        }
      }
      if (t === e) {
        je = null;
        break;
      }
      if (n = t.sibling, n !== null) {
        n.return = t.return, je = n;
        break;
      }
      je = t.return;
    }
  }
  function Md(e) {
    for (; je !== null;) {
      var t = je;
      if (t === e) {
        je = null;
        break;
      }
      var n = t.sibling;
      if (n !== null) {
        n.return = t.return, je = n;
        break;
      }
      je = t.return;
    }
  }
  function Id(e) {
    for (; je !== null;) {
      var t = je;
      try {
        switch (t.tag) {
          case 0:
          case 11:
          case 15:
            var n = t.return;
            try {
              ml(4, t);
            } catch (k) {
              St(t, n, k);
            }
            break;
          case 1:
            var r = t.stateNode;
            if (typeof r.componentDidMount == "function") {
              var o = t.return;
              try {
                r.componentDidMount();
              } catch (k) {
                St(t, o, k);
              }
            }
            var c = t.return;
            try {
              ic(t);
            } catch (k) {
              St(t, c, k);
            }
            break;
          case 5:
            var h = t.return;
            try {
              ic(t);
            } catch (k) {
              St(t, h, k);
            }
        }
      } catch (k) {
        St(t, t.return, k);
      }
      if (t === e) {
        je = null;
        break;
      }
      var v = t.sibling;
      if (v !== null) {
        v.return = t.return, je = v;
        break;
      }
      je = t.return;
    }
  }
  var em = Math.ceil,
    hl = $.ReactCurrentDispatcher,
    cc = $.ReactCurrentOwner,
    On = $.ReactCurrentBatchConfig,
    Je = 0,
    It = null,
    Ct = null,
    Bt = 0,
    En = 0,
    uo = $r(0),
    Lt = 0,
    ii = null,
    ya = 0,
    gl = 0,
    uc = 0,
    li = null,
    mn = null,
    dc = 0,
    po = 1 / 0,
    _r = null,
    xl = !1,
    pc = null,
    qr = null,
    vl = !1,
    Qr = null,
    wl = 0,
    si = 0,
    fc = null,
    yl = -1,
    bl = 0;
  function tn() {
    return (Je & 6) !== 0 ? dt() : yl !== -1 ? yl : yl = dt();
  }
  function Jr(e) {
    return (e.mode & 1) === 0 ? 1 : (Je & 2) !== 0 && Bt !== 0 ? Bt & -Bt : Of.transition !== null ? (bl === 0 && (bl = Co()), bl) : (e = Ze, e !== 0 || (e = window.event, e = e === void 0 ? 16 : Fo(e.type)), e);
  }
  function nr(e, t, n, r) {
    if (50 < si) throw si = 0, fc = null, Error(u(185));
    yn(e, n, r), ((Je & 2) === 0 || e !== It) && (e === It && ((Je & 2) === 0 && (gl |= n), Lt === 4 && Xr(e, Bt)), hn(e, r), n === 1 && Je === 0 && (t.mode & 1) === 0 && (po = dt() + 500, Qi && Wr()));
  }
  function hn(e, t) {
    var n = e.callbackNode;
    Ql(e, t);
    var r = wn(e, e === It ? Bt : 0);
    if (r === 0) n !== null && De(n), e.callbackNode = null, e.callbackPriority = 0;else if (t = r & -r, e.callbackPriority !== t) {
      if (n != null && De(n), t === 1) e.tag === 0 ? If(Vd.bind(null, e)) : Su(Vd.bind(null, e)), Pf(function () {
        (Je & 6) === 0 && Wr();
      }), n = null;else {
        switch (Ba(r)) {
          case 1:
            n = wr;
            break;
          case 4:
            n = ra;
            break;
          case 16:
            n = Fa;
            break;
          case 536870912:
            n = Eo;
            break;
          default:
            n = Fa;
        }
        n = Gd(n, Od.bind(null, e));
      }
      e.callbackPriority = t, e.callbackNode = n;
    }
  }
  function Od(e, t) {
    if (yl = -1, bl = 0, (Je & 6) !== 0) throw Error(u(327));
    var n = e.callbackNode;
    if (fo() && e.callbackNode !== n) return null;
    var r = wn(e, e === It ? Bt : 0);
    if (r === 0) return null;
    if ((r & 30) !== 0 || (r & e.expiredLanes) !== 0 || t) t = kl(e, r);else {
      t = r;
      var o = Je;
      Je |= 2;
      var c = Ad();
      (It !== e || Bt !== t) && (_r = null, po = dt() + 500, ka(e, t));
      do try {
        rm();
        break;
      } catch (v) {
        zd(e, v);
      } while (!0);
      Ls(), hl.current = c, Je = o, Ct !== null ? t = 0 : (It = null, Bt = 0, t = Lt);
    }
    if (t !== 0) {
      if (t === 2 && (o = za(e), o !== 0 && (r = o, t = mc(e, o))), t === 1) throw n = ii, ka(e, 0), Xr(e, r), hn(e, dt()), n;
      if (t === 6) Xr(e, r);else {
        if (o = e.current.alternate, (r & 30) === 0 && !tm(o) && (t = kl(e, r), t === 2 && (c = za(e), c !== 0 && (r = c, t = mc(e, c))), t === 1)) throw n = ii, ka(e, 0), Xr(e, r), hn(e, dt()), n;
        switch (e.finishedWork = o, e.finishedLanes = r, t) {
          case 0:
          case 1:
            throw Error(u(345));
          case 2:
            Sa(e, mn, _r);
            break;
          case 3:
            if (Xr(e, r), (r & 130023424) === r && (t = dc + 500 - dt(), 10 < t)) {
              if (wn(e, 0) !== 0) break;
              if (o = e.suspendedLanes, (o & r) !== r) {
                tn(), e.pingedLanes |= e.suspendedLanes & o;
                break;
              }
              e.timeoutHandle = ys(Sa.bind(null, e, mn, _r), t);
              break;
            }
            Sa(e, mn, _r);
            break;
          case 4:
            if (Xr(e, r), (r & 4194240) === r) break;
            for (t = e.eventTimes, o = -1; 0 < r;) {
              var h = 31 - sn(r);
              c = 1 << h, h = t[h], h > o && (o = h), r &= ~c;
            }
            if (r = o, r = dt() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * em(r / 1960)) - r, 10 < r) {
              e.timeoutHandle = ys(Sa.bind(null, e, mn, _r), r);
              break;
            }
            Sa(e, mn, _r);
            break;
          case 5:
            Sa(e, mn, _r);
            break;
          default:
            throw Error(u(329));
        }
      }
    }
    return hn(e, dt()), e.callbackNode === n ? Od.bind(null, e) : null;
  }
  function mc(e, t) {
    var n = li;
    return e.current.memoizedState.isDehydrated && (ka(e, t).flags |= 256), e = kl(e, t), e !== 2 && (t = mn, mn = n, t !== null && hc(t)), e;
  }
  function hc(e) {
    mn === null ? mn = e : mn.push.apply(mn, e);
  }
  function tm(e) {
    for (var t = e;;) {
      if (t.flags & 16384) {
        var n = t.updateQueue;
        if (n !== null && (n = n.stores, n !== null)) for (var r = 0; r < n.length; r++) {
          var o = n[r],
            c = o.getSnapshot;
          o = o.value;
          try {
            if (!Le(c(), o)) return !1;
          } catch {
            return !1;
          }
        }
      }
      if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;else {
        if (t === e) break;
        for (; t.sibling === null;) {
          if (t.return === null || t.return === e) return !0;
          t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
      }
    }
    return !0;
  }
  function Xr(e, t) {
    for (t &= ~uc, t &= ~gl, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t;) {
      var n = 31 - sn(t),
        r = 1 << n;
      e[n] = -1, t &= ~r;
    }
  }
  function Vd(e) {
    if ((Je & 6) !== 0) throw Error(u(327));
    fo();
    var t = wn(e, 0);
    if ((t & 1) === 0) return hn(e, dt()), null;
    var n = kl(e, t);
    if (e.tag !== 0 && n === 2) {
      var r = za(e);
      r !== 0 && (t = r, n = mc(e, r));
    }
    if (n === 1) throw n = ii, ka(e, 0), Xr(e, t), hn(e, dt()), n;
    if (n === 6) throw Error(u(345));
    return e.finishedWork = e.current.alternate, e.finishedLanes = t, Sa(e, mn, _r), hn(e, dt()), null;
  }
  function gc(e, t) {
    var n = Je;
    Je |= 1;
    try {
      return e(t);
    } finally {
      Je = n, Je === 0 && (po = dt() + 500, Qi && Wr());
    }
  }
  function ba(e) {
    Qr !== null && Qr.tag === 0 && (Je & 6) === 0 && fo();
    var t = Je;
    Je |= 1;
    var n = On.transition,
      r = Ze;
    try {
      if (On.transition = null, Ze = 1, e) return e();
    } finally {
      Ze = r, On.transition = n, Je = t, (Je & 6) === 0 && Wr();
    }
  }
  function xc() {
    En = uo.current, mt(uo);
  }
  function ka(e, t) {
    e.finishedWork = null, e.finishedLanes = 0;
    var n = e.timeoutHandle;
    if (n !== -1 && (e.timeoutHandle = -1, Lf(n)), Ct !== null) for (n = Ct.return; n !== null;) {
      var r = n;
      switch (Es(r), r.tag) {
        case 1:
          r = r.type.childContextTypes, r != null && Ki();
          break;
        case 3:
          lo(), mt(dn), mt(Gt), zs();
          break;
        case 5:
          Os(r);
          break;
        case 4:
          lo();
          break;
        case 13:
          mt(wt);
          break;
        case 19:
          mt(wt);
          break;
        case 10:
          Ps(r.type._context);
          break;
        case 22:
        case 23:
          xc();
      }
      n = n.return;
    }
    if (It = e, Ct = e = Yr(e.current, null), Bt = En = t, Lt = 0, ii = null, uc = gl = ya = 0, mn = li = null, xa !== null) {
      for (t = 0; t < xa.length; t++) if (n = xa[t], r = n.interleaved, r !== null) {
        n.interleaved = null;
        var o = r.next,
          c = n.pending;
        if (c !== null) {
          var h = c.next;
          c.next = o, r.next = h;
        }
        n.pending = r;
      }
      xa = null;
    }
    return e;
  }
  function zd(e, t) {
    do {
      var n = Ct;
      try {
        if (Ls(), ol.current = cl, il) {
          for (var r = yt.memoizedState; r !== null;) {
            var o = r.queue;
            o !== null && (o.pending = null), r = r.next;
          }
          il = !1;
        }
        if (wa = 0, Mt = Tt = yt = null, ei = !1, ti = 0, cc.current = null, n === null || n.return === null) {
          Lt = 1, ii = t, Ct = null;
          break;
        }
        e: {
          var c = e,
            h = n.return,
            v = n,
            k = t;
          if (t = Bt, v.flags |= 32768, k !== null && typeof k == "object" && typeof k.then == "function") {
            var V = k,
              te = v,
              ae = te.tag;
            if ((te.mode & 1) === 0 && (ae === 0 || ae === 11 || ae === 15)) {
              var ee = te.alternate;
              ee ? (te.updateQueue = ee.updateQueue, te.memoizedState = ee.memoizedState, te.lanes = ee.lanes) : (te.updateQueue = null, te.memoizedState = null);
            }
            var be = ud(h);
            if (be !== null) {
              be.flags &= -257, dd(be, h, v, c, t), be.mode & 1 && cd(c, V, t), t = be, k = V;
              var _e = t.updateQueue;
              if (_e === null) {
                var Te = new Set();
                Te.add(k), t.updateQueue = Te;
              } else _e.add(k);
              break e;
            } else {
              if ((t & 1) === 0) {
                cd(c, V, t), vc();
                break e;
              }
              k = Error(u(426));
            }
          } else if (xt && v.mode & 1) {
            var jt = ud(h);
            if (jt !== null) {
              (jt.flags & 65536) === 0 && (jt.flags |= 256), dd(jt, h, v, c, t), Ds(so(k, v));
              break e;
            }
          }
          c = k = so(k, v), Lt !== 4 && (Lt = 2), li === null ? li = [c] : li.push(c), c = h;
          do {
            switch (c.tag) {
              case 3:
                c.flags |= 65536, t &= -t, c.lanes |= t;
                var P = ld(c, k, t);
                Fu(c, P);
                break e;
              case 1:
                v = k;
                var S = c.type,
                  I = c.stateNode;
                if ((c.flags & 128) === 0 && (typeof S.getDerivedStateFromError == "function" || I !== null && typeof I.componentDidCatch == "function" && (qr === null || !qr.has(I)))) {
                  c.flags |= 65536, t &= -t, c.lanes |= t;
                  var ce = sd(c, v, t);
                  Fu(c, ce);
                  break e;
                }
            }
            c = c.return;
          } while (c !== null);
        }
        $d(n);
      } catch (Pe) {
        t = Pe, Ct === n && n !== null && (Ct = n = n.return);
        continue;
      }
      break;
    } while (!0);
  }
  function Ad() {
    var e = hl.current;
    return hl.current = cl, e === null ? cl : e;
  }
  function vc() {
    (Lt === 0 || Lt === 3 || Lt === 2) && (Lt = 4), It === null || (ya & 268435455) === 0 && (gl & 268435455) === 0 || Xr(It, Bt);
  }
  function kl(e, t) {
    var n = Je;
    Je |= 2;
    var r = Ad();
    (It !== e || Bt !== t) && (_r = null, ka(e, t));
    do try {
      nm();
      break;
    } catch (o) {
      zd(e, o);
    } while (!0);
    if (Ls(), Je = n, hl.current = r, Ct !== null) throw Error(u(261));
    return It = null, Bt = 0, Lt;
  }
  function nm() {
    for (; Ct !== null;) Bd(Ct);
  }
  function rm() {
    for (; Ct !== null && !jo();) Bd(Ct);
  }
  function Bd(e) {
    var t = Hd(e.alternate, e, En);
    e.memoizedProps = e.pendingProps, t === null ? $d(e) : Ct = t, cc.current = null;
  }
  function $d(e) {
    var t = e;
    do {
      var n = t.alternate;
      if (e = t.return, (t.flags & 32768) === 0) {
        if (n = Qf(n, t, En), n !== null) {
          Ct = n;
          return;
        }
      } else {
        if (n = Jf(n, t), n !== null) {
          n.flags &= 32767, Ct = n;
          return;
        }
        if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;else {
          Lt = 6, Ct = null;
          return;
        }
      }
      if (t = t.sibling, t !== null) {
        Ct = t;
        return;
      }
      Ct = t = e;
    } while (t !== null);
    Lt === 0 && (Lt = 5);
  }
  function Sa(e, t, n) {
    var r = Ze,
      o = On.transition;
    try {
      On.transition = null, Ze = 1, am(e, t, n, r);
    } finally {
      On.transition = o, Ze = r;
    }
    return null;
  }
  function am(e, t, n, r) {
    do fo(); while (Qr !== null);
    if ((Je & 6) !== 0) throw Error(u(327));
    n = e.finishedWork;
    var o = e.finishedLanes;
    if (n === null) return null;
    if (e.finishedWork = null, e.finishedLanes = 0, n === e.current) throw Error(u(177));
    e.callbackNode = null, e.callbackPriority = 0;
    var c = n.lanes | n.childLanes;
    if (Pn(e, c), e === It && (Ct = It = null, Bt = 0), (n.subtreeFlags & 2064) === 0 && (n.flags & 2064) === 0 || vl || (vl = !0, Gd(Fa, function () {
      return fo(), null;
    })), c = (n.flags & 15990) !== 0, (n.subtreeFlags & 15990) !== 0 || c) {
      c = On.transition, On.transition = null;
      var h = Ze;
      Ze = 1;
      var v = Je;
      Je |= 4, cc.current = null, Yf(e, n), Pd(n, e), Ge(vs), kt = !!xs, vs = xs = null, e.current = n, Zf(n), Ra(), Je = v, Ze = h, On.transition = c;
    } else e.current = n;
    if (vl && (vl = !1, Qr = e, wl = o), c = e.pendingLanes, c === 0 && (qr = null), yi(n.stateNode), hn(e, dt()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) o = t[n], r(o.value, {
      componentStack: o.stack,
      digest: o.digest
    });
    if (xl) throw xl = !1, e = pc, pc = null, e;
    return (wl & 1) !== 0 && e.tag !== 0 && fo(), c = e.pendingLanes, (c & 1) !== 0 ? e === fc ? si++ : (si = 0, fc = e) : si = 0, Wr(), null;
  }
  function fo() {
    if (Qr !== null) {
      var e = Ba(wl),
        t = On.transition,
        n = Ze;
      try {
        if (On.transition = null, Ze = 16 > e ? 16 : e, Qr === null) var r = !1;else {
          if (e = Qr, Qr = null, wl = 0, (Je & 6) !== 0) throw Error(u(331));
          var o = Je;
          for (Je |= 4, je = e.current; je !== null;) {
            var c = je,
              h = c.child;
            if ((je.flags & 16) !== 0) {
              var v = c.deletions;
              if (v !== null) {
                for (var k = 0; k < v.length; k++) {
                  var V = v[k];
                  for (je = V; je !== null;) {
                    var te = je;
                    switch (te.tag) {
                      case 0:
                      case 11:
                      case 15:
                        oi(8, te, c);
                    }
                    var ae = te.child;
                    if (ae !== null) ae.return = te, je = ae;else for (; je !== null;) {
                      te = je;
                      var ee = te.sibling,
                        be = te.return;
                      if (Cd(te), te === V) {
                        je = null;
                        break;
                      }
                      if (ee !== null) {
                        ee.return = be, je = ee;
                        break;
                      }
                      je = be;
                    }
                  }
                }
                var _e = c.alternate;
                if (_e !== null) {
                  var Te = _e.child;
                  if (Te !== null) {
                    _e.child = null;
                    do {
                      var jt = Te.sibling;
                      Te.sibling = null, Te = jt;
                    } while (Te !== null);
                  }
                }
                je = c;
              }
            }
            if ((c.subtreeFlags & 2064) !== 0 && h !== null) h.return = c, je = h;else e: for (; je !== null;) {
              if (c = je, (c.flags & 2048) !== 0) switch (c.tag) {
                case 0:
                case 11:
                case 15:
                  oi(9, c, c.return);
              }
              var P = c.sibling;
              if (P !== null) {
                P.return = c.return, je = P;
                break e;
              }
              je = c.return;
            }
          }
          var S = e.current;
          for (je = S; je !== null;) {
            h = je;
            var I = h.child;
            if ((h.subtreeFlags & 2064) !== 0 && I !== null) I.return = h, je = I;else e: for (h = S; je !== null;) {
              if (v = je, (v.flags & 2048) !== 0) try {
                switch (v.tag) {
                  case 0:
                  case 11:
                  case 15:
                    ml(9, v);
                }
              } catch (Pe) {
                St(v, v.return, Pe);
              }
              if (v === h) {
                je = null;
                break e;
              }
              var ce = v.sibling;
              if (ce !== null) {
                ce.return = v.return, je = ce;
                break e;
              }
              je = v.return;
            }
          }
          if (Je = o, Wr(), tt && typeof tt.onPostCommitFiberRoot == "function") try {
            tt.onPostCommitFiberRoot(Ma, e);
          } catch {}
          r = !0;
        }
        return r;
      } finally {
        Ze = n, On.transition = t;
      }
    }
    return !1;
  }
  function Ud(e, t, n) {
    t = so(n, t), t = ld(e, t, 1), e = Gr(e, t, 1), t = tn(), e !== null && (yn(e, 1, t), hn(e, t));
  }
  function St(e, t, n) {
    if (e.tag === 3) Ud(e, e, n);else for (; t !== null;) {
      if (t.tag === 3) {
        Ud(t, e, n);
        break;
      } else if (t.tag === 1) {
        var r = t.stateNode;
        if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (qr === null || !qr.has(r))) {
          e = so(n, e), e = sd(t, e, 1), t = Gr(t, e, 1), e = tn(), t !== null && (yn(t, 1, e), hn(t, e));
          break;
        }
      }
      t = t.return;
    }
  }
  function om(e, t, n) {
    var r = e.pingCache;
    r !== null && r.delete(t), t = tn(), e.pingedLanes |= e.suspendedLanes & n, It === e && (Bt & n) === n && (Lt === 4 || Lt === 3 && (Bt & 130023424) === Bt && 500 > dt() - dc ? ka(e, 0) : uc |= n), hn(e, t);
  }
  function Wd(e, t) {
    t === 0 && ((e.mode & 1) === 0 ? t = 1 : (t = vn, vn <<= 1, (vn & 130023424) === 0 && (vn = 4194304)));
    var n = tn();
    e = jr(e, t), e !== null && (yn(e, t, n), hn(e, n));
  }
  function im(e) {
    var t = e.memoizedState,
      n = 0;
    t !== null && (n = t.retryLane), Wd(e, n);
  }
  function lm(e, t) {
    var n = 0;
    switch (e.tag) {
      case 13:
        var r = e.stateNode,
          o = e.memoizedState;
        o !== null && (n = o.retryLane);
        break;
      case 19:
        r = e.stateNode;
        break;
      default:
        throw Error(u(314));
    }
    r !== null && r.delete(t), Wd(e, n);
  }
  var Hd;
  Hd = function (e, t, n) {
    if (e !== null) {
      if (e.memoizedProps !== t.pendingProps || dn.current) fn = !0;else {
        if ((e.lanes & n) === 0 && (t.flags & 128) === 0) return fn = !1, qf(e, t, n);
        fn = (e.flags & 131072) !== 0;
      }
    } else fn = !1, xt && (t.flags & 1048576) !== 0 && Nu(t, Xi, t.index);
    switch (t.lanes = 0, t.tag) {
      case 2:
        var r = t.type;
        pl(e, t), e = t.pendingProps;
        var o = eo(t, Gt.current);
        io(t, n), o = $s(null, t, r, e, o, n);
        var c = Us();
        return t.flags |= 1, typeof o == "object" && o !== null && typeof o.render == "function" && o.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, pn(r) ? (c = !0, qi(t)) : c = !1, t.memoizedState = o.state !== null && o.state !== void 0 ? o.state : null, Ms(t), o.updater = ul, t.stateNode = o, o._reactInternals = t, Qs(t, r, e, n), t = Zs(null, t, r, !0, c, n)) : (t.tag = 0, xt && c && js(t), en(null, t, o, n), t = t.child), t;
      case 16:
        r = t.elementType;
        e: {
          switch (pl(e, t), e = t.pendingProps, o = r._init, r = o(r._payload), t.type = r, o = t.tag = cm(r), e = Zn(r, e), o) {
            case 0:
              t = Ys(null, t, r, e, n);
              break e;
            case 1:
              t = xd(null, t, r, e, n);
              break e;
            case 11:
              t = pd(null, t, r, e, n);
              break e;
            case 14:
              t = fd(null, t, r, Zn(r.type, e), n);
              break e;
          }
          throw Error(u(306, r, ""));
        }
        return t;
      case 0:
        return r = t.type, o = t.pendingProps, o = t.elementType === r ? o : Zn(r, o), Ys(e, t, r, o, n);
      case 1:
        return r = t.type, o = t.pendingProps, o = t.elementType === r ? o : Zn(r, o), xd(e, t, r, o, n);
      case 3:
        e: {
          if (vd(t), e === null) throw Error(u(387));
          r = t.pendingProps, c = t.memoizedState, o = c.element, Ru(e, t), rl(t, r, null, n);
          var h = t.memoizedState;
          if (r = h.element, c.isDehydrated) {
            if (c = {
              element: r,
              isDehydrated: !1,
              cache: h.cache,
              pendingSuspenseBoundaries: h.pendingSuspenseBoundaries,
              transitions: h.transitions
            }, t.updateQueue.baseState = c, t.memoizedState = c, t.flags & 256) {
              o = so(Error(u(423)), t), t = wd(e, t, r, n, o);
              break e;
            } else if (r !== o) {
              o = so(Error(u(424)), t), t = wd(e, t, r, n, o);
              break e;
            } else for (jn = Br(t.stateNode.containerInfo.firstChild), Nn = t, xt = !0, Yn = null, n = Lu(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 4096, n = n.sibling;
          } else {
            if (ro(), r === o) {
              t = Cr(e, t, n);
              break e;
            }
            en(e, t, r, n);
          }
          t = t.child;
        }
        return t;
      case 5:
        return Iu(t), e === null && _s(t), r = t.type, o = t.pendingProps, c = e !== null ? e.memoizedProps : null, h = o.children, ws(r, o) ? h = null : c !== null && ws(r, c) && (t.flags |= 32), gd(e, t), en(e, t, h, n), t.child;
      case 6:
        return e === null && _s(t), null;
      case 13:
        return yd(e, t, n);
      case 4:
        return Is(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = ao(t, null, r, n) : en(e, t, r, n), t.child;
      case 11:
        return r = t.type, o = t.pendingProps, o = t.elementType === r ? o : Zn(r, o), pd(e, t, r, o, n);
      case 7:
        return en(e, t, t.pendingProps, n), t.child;
      case 8:
        return en(e, t, t.pendingProps.children, n), t.child;
      case 12:
        return en(e, t, t.pendingProps.children, n), t.child;
      case 10:
        e: {
          if (r = t.type._context, o = t.pendingProps, c = t.memoizedProps, h = o.value, st(el, r._currentValue), r._currentValue = h, c !== null) if (Le(c.value, h)) {
            if (c.children === o.children && !dn.current) {
              t = Cr(e, t, n);
              break e;
            }
          } else for (c = t.child, c !== null && (c.return = t); c !== null;) {
            var v = c.dependencies;
            if (v !== null) {
              h = c.child;
              for (var k = v.firstContext; k !== null;) {
                if (k.context === r) {
                  if (c.tag === 1) {
                    k = Er(-1, n & -n), k.tag = 2;
                    var V = c.updateQueue;
                    if (V !== null) {
                      V = V.shared;
                      var te = V.pending;
                      te === null ? k.next = k : (k.next = te.next, te.next = k), V.pending = k;
                    }
                  }
                  c.lanes |= n, k = c.alternate, k !== null && (k.lanes |= n), Rs(c.return, n, t), v.lanes |= n;
                  break;
                }
                k = k.next;
              }
            } else if (c.tag === 10) h = c.type === t.type ? null : c.child;else if (c.tag === 18) {
              if (h = c.return, h === null) throw Error(u(341));
              h.lanes |= n, v = h.alternate, v !== null && (v.lanes |= n), Rs(h, n, t), h = c.sibling;
            } else h = c.child;
            if (h !== null) h.return = c;else for (h = c; h !== null;) {
              if (h === t) {
                h = null;
                break;
              }
              if (c = h.sibling, c !== null) {
                c.return = h.return, h = c;
                break;
              }
              h = h.return;
            }
            c = h;
          }
          en(e, t, o.children, n), t = t.child;
        }
        return t;
      case 9:
        return o = t.type, r = t.pendingProps.children, io(t, n), o = Mn(o), r = r(o), t.flags |= 1, en(e, t, r, n), t.child;
      case 14:
        return r = t.type, o = Zn(r, t.pendingProps), o = Zn(r.type, o), fd(e, t, r, o, n);
      case 15:
        return md(e, t, t.type, t.pendingProps, n);
      case 17:
        return r = t.type, o = t.pendingProps, o = t.elementType === r ? o : Zn(r, o), pl(e, t), t.tag = 1, pn(r) ? (e = !0, qi(t)) : e = !1, io(t, n), od(t, r, o), Qs(t, r, o, n), Zs(null, t, r, !0, e, n);
      case 19:
        return kd(e, t, n);
      case 22:
        return hd(e, t, n);
    }
    throw Error(u(156, t.tag));
  };
  function Gd(e, t) {
    return No(e, t);
  }
  function sm(e, t, n, r) {
    this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Vn(e, t, n, r) {
    return new sm(e, t, n, r);
  }
  function wc(e) {
    return e = e.prototype, !(!e || !e.isReactComponent);
  }
  function cm(e) {
    if (typeof e == "function") return wc(e) ? 1 : 0;
    if (e != null) {
      if (e = e.$$typeof, e === U) return 11;
      if (e === se) return 14;
    }
    return 2;
  }
  function Yr(e, t) {
    var n = e.alternate;
    return n === null ? (n = Vn(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 14680064, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
      lanes: t.lanes,
      firstContext: t.firstContext
    }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n;
  }
  function Sl(e, t, n, r, o, c) {
    var h = 2;
    if (r = e, typeof e == "function") wc(e) && (h = 1);else if (typeof e == "string") h = 5;else e: switch (e) {
      case ne:
        return Na(n.children, o, c, t);
      case Z:
        h = 8, o |= 8;
        break;
      case fe:
        return e = Vn(12, n, t, o | 2), e.elementType = fe, e.lanes = c, e;
      case W:
        return e = Vn(13, n, t, o), e.elementType = W, e.lanes = c, e;
      case q:
        return e = Vn(19, n, t, o), e.elementType = q, e.lanes = c, e;
      case ge:
        return Nl(n, o, c, t);
      default:
        if (typeof e == "object" && e !== null) switch (e.$$typeof) {
          case le:
            h = 10;
            break e;
          case H:
            h = 9;
            break e;
          case U:
            h = 11;
            break e;
          case se:
            h = 14;
            break e;
          case de:
            h = 16, r = null;
            break e;
        }
        throw Error(u(130, e == null ? e : typeof e, ""));
    }
    return t = Vn(h, n, t, o), t.elementType = e, t.type = r, t.lanes = c, t;
  }
  function Na(e, t, n, r) {
    return e = Vn(7, e, r, t), e.lanes = n, e;
  }
  function Nl(e, t, n, r) {
    return e = Vn(22, e, r, t), e.elementType = ge, e.lanes = n, e.stateNode = {
      isHidden: !1
    }, e;
  }
  function yc(e, t, n) {
    return e = Vn(6, e, null, t), e.lanes = n, e;
  }
  function bc(e, t, n) {
    return t = Vn(4, e.children !== null ? e.children : [], e.key, t), t.lanes = n, t.stateNode = {
      containerInfo: e.containerInfo,
      pendingChildren: null,
      implementation: e.implementation
    }, t;
  }
  function um(e, t, n, r, o) {
    this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Wt(0), this.expirationTimes = Wt(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Wt(0), this.identifierPrefix = r, this.onRecoverableError = o, this.mutableSourceEagerHydrationData = null;
  }
  function kc(e, t, n, r, o, c, h, v, k) {
    return e = new um(e, t, n, v, k), t === 1 ? (t = 1, c === !0 && (t |= 8)) : t = 0, c = Vn(3, null, null, t), e.current = c, c.stateNode = e, c.memoizedState = {
      element: r,
      isDehydrated: n,
      cache: null,
      transitions: null,
      pendingSuspenseBoundaries: null
    }, Ms(c), e;
  }
  function dm(e, t, n) {
    var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: Y,
      key: r == null ? null : "" + r,
      children: e,
      containerInfo: t,
      implementation: n
    };
  }
  function Kd(e) {
    if (!e) return Ur;
    e = e._reactInternals;
    e: {
      if (Ln(e) !== e || e.tag !== 1) throw Error(u(170));
      var t = e;
      do {
        switch (t.tag) {
          case 3:
            t = t.stateNode.context;
            break e;
          case 1:
            if (pn(t.type)) {
              t = t.stateNode.__reactInternalMemoizedMergedChildContext;
              break e;
            }
        }
        t = t.return;
      } while (t !== null);
      throw Error(u(171));
    }
    if (e.tag === 1) {
      var n = e.type;
      if (pn(n)) return bu(e, n, t);
    }
    return t;
  }
  function qd(e, t, n, r, o, c, h, v, k) {
    return e = kc(n, r, !0, e, o, c, h, v, k), e.context = Kd(null), n = e.current, r = tn(), o = Jr(n), c = Er(r, o), c.callback = t ?? null, Gr(n, c, o), e.current.lanes = o, yn(e, o, r), hn(e, r), e;
  }
  function jl(e, t, n, r) {
    var o = t.current,
      c = tn(),
      h = Jr(o);
    return n = Kd(n), t.context === null ? t.context = n : t.pendingContext = n, t = Er(c, h), t.payload = {
      element: e
    }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = Gr(o, t, h), e !== null && (nr(e, o, h, c), nl(e, o, h)), h;
  }
  function El(e) {
    if (e = e.current, !e.child) return null;
    switch (e.child.tag) {
      case 5:
        return e.child.stateNode;
      default:
        return e.child.stateNode;
    }
  }
  function Qd(e, t) {
    if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
      var n = e.retryLane;
      e.retryLane = n !== 0 && n < t ? n : t;
    }
  }
  function Sc(e, t) {
    Qd(e, t), (e = e.alternate) && Qd(e, t);
  }
  function pm() {
    return null;
  }
  var Jd = typeof reportError == "function" ? reportError : function (e) {
    console.error(e);
  };
  function Nc(e) {
    this._internalRoot = e;
  }
  Cl.prototype.render = Nc.prototype.render = function (e) {
    var t = this._internalRoot;
    if (t === null) throw Error(u(409));
    jl(e, t, null, null);
  }, Cl.prototype.unmount = Nc.prototype.unmount = function () {
    var e = this._internalRoot;
    if (e !== null) {
      this._internalRoot = null;
      var t = e.containerInfo;
      ba(function () {
        jl(null, e, null, null);
      }), t[br] = null;
    }
  };
  function Cl(e) {
    this._internalRoot = e;
  }
  Cl.prototype.unstable_scheduleHydration = function (e) {
    if (e) {
      var t = Si();
      e = {
        blockedOn: null,
        target: e,
        priority: t
      };
      for (var n = 0; n < qn.length && t !== 0 && t < qn[n].priority; n++);
      qn.splice(n, 0, e), n === 0 && Ci(e);
    }
  };
  function jc(e) {
    return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
  }
  function _l(e) {
    return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
  }
  function Xd() {}
  function fm(e, t, n, r, o) {
    if (o) {
      if (typeof r == "function") {
        var c = r;
        r = function () {
          var V = El(h);
          c.call(V);
        };
      }
      var h = qd(t, r, e, 0, null, !1, !1, "", Xd);
      return e._reactRootContainer = h, e[br] = h.current, Go(e.nodeType === 8 ? e.parentNode : e), ba(), h;
    }
    for (; o = e.lastChild;) e.removeChild(o);
    if (typeof r == "function") {
      var v = r;
      r = function () {
        var V = El(k);
        v.call(V);
      };
    }
    var k = kc(e, 0, !1, null, null, !1, !1, "", Xd);
    return e._reactRootContainer = k, e[br] = k.current, Go(e.nodeType === 8 ? e.parentNode : e), ba(function () {
      jl(t, k, n, r);
    }), k;
  }
  function Dl(e, t, n, r, o) {
    var c = n._reactRootContainer;
    if (c) {
      var h = c;
      if (typeof o == "function") {
        var v = o;
        o = function () {
          var k = El(h);
          v.call(k);
        };
      }
      jl(t, h, e, o);
    } else h = fm(n, t, e, o, r);
    return El(h);
  }
  _o = function (e) {
    switch (e.tag) {
      case 3:
        var t = e.stateNode;
        if (t.current.memoizedState.isDehydrated) {
          var n = ar(t.pendingLanes);
          n !== 0 && (Aa(t, n | 1), hn(t, dt()), (Je & 6) === 0 && (po = dt() + 500, Wr()));
        }
        break;
      case 13:
        ba(function () {
          var r = jr(e, 1);
          if (r !== null) {
            var o = tn();
            nr(r, e, 1, o);
          }
        }), Sc(e, 1);
    }
  }, Do = function (e) {
    if (e.tag === 13) {
      var t = jr(e, 134217728);
      if (t !== null) {
        var n = tn();
        nr(t, e, 134217728, n);
      }
      Sc(e, 134217728);
    }
  }, ki = function (e) {
    if (e.tag === 13) {
      var t = Jr(e),
        n = jr(e, t);
      if (n !== null) {
        var r = tn();
        nr(n, e, t, r);
      }
      Sc(e, t);
    }
  }, Si = function () {
    return Ze;
  }, or = function (e, t) {
    var n = Ze;
    try {
      return Ze = e, t();
    } finally {
      Ze = n;
    }
  }, Ut = function (e, t, n) {
    switch (t) {
      case "input":
        if (Cn(e, n), t = n.name, n.type === "radio" && t != null) {
          for (n = e; n.parentNode;) n = n.parentNode;
          for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'), t = 0; t < n.length; t++) {
            var r = n[t];
            if (r !== e && r.form === e.form) {
              var o = Gi(r);
              if (!o) throw Error(u(90));
              An(r), Cn(r, o);
            }
          }
        }
        break;
      case "textarea":
        Da(e, n);
        break;
      case "select":
        t = n.value, t != null && Pt(e, !!n.multiple, t, !1);
    }
  }, Wn = gc, Pr = ba;
  var mm = {
      usingClientEntryPoint: !1,
      Events: [Qo, Ya, Gi, xn, an, gc]
    },
    ci = {
      findFiberByHostInstance: fa,
      bundleType: 0,
      version: "18.3.1",
      rendererPackageName: "react-dom"
    },
    hm = {
      bundleType: ci.bundleType,
      version: ci.version,
      rendererPackageName: ci.rendererPackageName,
      rendererConfig: ci.rendererConfig,
      overrideHookState: null,
      overrideHookStateDeletePath: null,
      overrideHookStateRenamePath: null,
      overrideProps: null,
      overridePropsDeletePath: null,
      overridePropsRenamePath: null,
      setErrorHandler: null,
      setSuspenseHandler: null,
      scheduleUpdate: null,
      currentDispatcherRef: $.ReactCurrentDispatcher,
      findHostInstanceByFiber: function (e) {
        return e = vi(e), e === null ? null : e.stateNode;
      },
      findFiberByHostInstance: ci.findFiberByHostInstance || pm,
      findHostInstancesForRefresh: null,
      scheduleRefresh: null,
      scheduleRoot: null,
      setRefreshHandler: null,
      getCurrentFiber: null,
      reconcilerVersion: "18.3.1-next-f1338f8080-20240426"
    };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Tl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Tl.isDisabled && Tl.supportsFiber) try {
      Ma = Tl.inject(hm), tt = Tl;
    } catch {}
  }
  return gn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = mm, gn.createPortal = function (e, t) {
    var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!jc(t)) throw Error(u(200));
    return dm(e, t, null, n);
  }, gn.createRoot = function (e, t) {
    if (!jc(e)) throw Error(u(299));
    var n = !1,
      r = "",
      o = Jd;
    return t != null && (t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (o = t.onRecoverableError)), t = kc(e, 1, !1, null, null, n, !1, r, o), e[br] = t.current, Go(e.nodeType === 8 ? e.parentNode : e), new Nc(t);
  }, gn.findDOMNode = function (e) {
    if (e == null) return null;
    if (e.nodeType === 1) return e;
    var t = e._reactInternals;
    if (t === void 0) throw typeof e.render == "function" ? Error(u(188)) : (e = Object.keys(e).join(","), Error(u(268, e)));
    return e = vi(t), e = e === null ? null : e.stateNode, e;
  }, gn.flushSync = function (e) {
    return ba(e);
  }, gn.hydrate = function (e, t, n) {
    if (!_l(t)) throw Error(u(200));
    return Dl(null, e, t, !0, n);
  }, gn.hydrateRoot = function (e, t, n) {
    if (!jc(e)) throw Error(u(405));
    var r = n != null && n.hydratedSources || null,
      o = !1,
      c = "",
      h = Jd;
    if (n != null && (n.unstable_strictMode === !0 && (o = !0), n.identifierPrefix !== void 0 && (c = n.identifierPrefix), n.onRecoverableError !== void 0 && (h = n.onRecoverableError)), t = qd(t, null, e, 1, n ?? null, o, !1, c, h), e[br] = t.current, Go(e), r) for (e = 0; e < r.length; e++) n = r[e], o = n._getVersion, o = o(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, o] : t.mutableSourceEagerHydrationData.push(n, o);
    return new Cl(t);
  }, gn.render = function (e, t, n) {
    if (!_l(t)) throw Error(u(200));
    return Dl(null, e, t, !1, n);
  }, gn.unmountComponentAtNode = function (e) {
    if (!_l(e)) throw Error(u(40));
    return e._reactRootContainer ? (ba(function () {
      Dl(null, null, e, !1, function () {
        e._reactRootContainer = null, e[br] = null;
      });
    }), !0) : !1;
  }, gn.unstable_batchedUpdates = gc, gn.unstable_renderSubtreeIntoContainer = function (e, t, n, r) {
    if (!_l(n)) throw Error(u(200));
    if (e == null || e._reactInternals === void 0) throw Error(u(38));
    return Dl(e, t, n, !1, r);
  }, gn.version = "18.3.1-next-f1338f8080-20240426", gn;
}
var op;
function Nm() {
  if (op) return _c.exports;
  op = 1;
  function a() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(a);
    } catch (s) {
      console.error(s);
    }
  }
  return a(), _c.exports = Sm(), _c.exports;
}
var ip;
function jm() {
  if (ip) return Pl;
  ip = 1;
  var a = Nm();
  return Pl.createRoot = a.createRoot, Pl.hydrateRoot = a.hydrateRoot, Pl;
}
var Em = jm();
const Cm = "modulepreload",
  _m = function (a) {
    return "/" + a;
  },
  lp = {},
  Yc = function (s, u, d) {
    let p = Promise.resolve();
    if (u && u.length > 0) {
      let x = function (j) {
        return Promise.all(j.map(E => Promise.resolve(E).then(R => ({
          status: "fulfilled",
          value: R
        }), R => ({
          status: "rejected",
          reason: R
        }))));
      };
      document.getElementsByTagName("link");
      const b = document.querySelector("meta[property=csp-nonce]"),
        D = b?.nonce || b?.getAttribute("nonce");
      p = x(u.map(j => {
        if (j = _m(j), j in lp) return;
        lp[j] = !0;
        const E = j.endsWith(".css"),
          R = E ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${j}"]${R}`)) return;
        const C = document.createElement("link");
        if (C.rel = E ? "stylesheet" : Cm, E || (C.as = "script"), C.crossOrigin = "", C.href = j, D && C.setAttribute("nonce", D), document.head.appendChild(C), E) return new Promise((J, pe) => {
          C.addEventListener("load", J), C.addEventListener("error", () => pe(new Error(`Unable to preload CSS for ${j}`)));
        });
      }));
    }
    function m(x) {
      const b = new Event("vite:preloadError", {
        cancelable: !0
      });
      if (b.payload = x, window.dispatchEvent(b), !b.defaultPrevented) throw x;
    }
    return p.then(x => {
      for (const b of x || []) b.status === "rejected" && m(b.reason);
      return s().catch(m);
    });
  };
var Lc = {
    exports: {}
  },
  Pc,
  sp;
function Dm() {
  if (sp) return Pc;
  sp = 1;
  var a = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
  return Pc = a, Pc;
}
var Rc, cp;
function Tm() {
  if (cp) return Rc;
  cp = 1;
  var a = Dm();
  function s() {}
  function u() {}
  return u.resetWarningCache = s, Rc = function () {
    function d(x, b, D, j, E, R) {
      if (R !== a) {
        var C = new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");
        throw C.name = "Invariant Violation", C;
      }
    }
    d.isRequired = d;
    function p() {
      return d;
    }
    var m = {
      array: d,
      bigint: d,
      bool: d,
      func: d,
      number: d,
      object: d,
      string: d,
      symbol: d,
      any: d,
      arrayOf: p,
      element: d,
      elementType: d,
      instanceOf: p,
      node: d,
      objectOf: p,
      oneOf: p,
      oneOfType: p,
      shape: p,
      exact: p,
      checkPropTypes: u,
      resetWarningCache: s
    };
    return m.PropTypes = m, m;
  }, Rc;
}
var up;
function Lm() {
  return up || (up = 1, Lc.exports = Tm()()), Lc.exports;
}
var Pm = Lm();
const lt = Jc(Pm),
  Rm = new Map([["1km", "application/vnd.1000minds.decision-model+xml"], ["3dml", "text/vnd.in3d.3dml"], ["3ds", "image/x-3ds"], ["3g2", "video/3gpp2"], ["3gp", "video/3gp"], ["3gpp", "video/3gpp"], ["3mf", "model/3mf"], ["7z", "application/x-7z-compressed"], ["7zip", "application/x-7z-compressed"], ["123", "application/vnd.lotus-1-2-3"], ["aab", "application/x-authorware-bin"], ["aac", "audio/x-acc"], ["aam", "application/x-authorware-map"], ["aas", "application/x-authorware-seg"], ["abw", "application/x-abiword"], ["ac", "application/vnd.nokia.n-gage.ac+xml"], ["ac3", "audio/ac3"], ["acc", "application/vnd.americandynamics.acc"], ["ace", "application/x-ace-compressed"], ["acu", "application/vnd.acucobol"], ["acutc", "application/vnd.acucorp"], ["adp", "audio/adpcm"], ["aep", "application/vnd.audiograph"], ["afm", "application/x-font-type1"], ["afp", "application/vnd.ibm.modcap"], ["ahead", "application/vnd.ahead.space"], ["ai", "application/pdf"], ["aif", "audio/x-aiff"], ["aifc", "audio/x-aiff"], ["aiff", "audio/x-aiff"], ["air", "application/vnd.adobe.air-application-installer-package+zip"], ["ait", "application/vnd.dvb.ait"], ["ami", "application/vnd.amiga.ami"], ["amr", "audio/amr"], ["apk", "application/vnd.android.package-archive"], ["apng", "image/apng"], ["appcache", "text/cache-manifest"], ["application", "application/x-ms-application"], ["apr", "application/vnd.lotus-approach"], ["arc", "application/x-freearc"], ["arj", "application/x-arj"], ["asc", "application/pgp-signature"], ["asf", "video/x-ms-asf"], ["asm", "text/x-asm"], ["aso", "application/vnd.accpac.simply.aso"], ["asx", "video/x-ms-asf"], ["atc", "application/vnd.acucorp"], ["atom", "application/atom+xml"], ["atomcat", "application/atomcat+xml"], ["atomdeleted", "application/atomdeleted+xml"], ["atomsvc", "application/atomsvc+xml"], ["atx", "application/vnd.antix.game-component"], ["au", "audio/x-au"], ["avi", "video/x-msvideo"], ["avif", "image/avif"], ["aw", "application/applixware"], ["azf", "application/vnd.airzip.filesecure.azf"], ["azs", "application/vnd.airzip.filesecure.azs"], ["azv", "image/vnd.airzip.accelerator.azv"], ["azw", "application/vnd.amazon.ebook"], ["b16", "image/vnd.pco.b16"], ["bat", "application/x-msdownload"], ["bcpio", "application/x-bcpio"], ["bdf", "application/x-font-bdf"], ["bdm", "application/vnd.syncml.dm+wbxml"], ["bdoc", "application/x-bdoc"], ["bed", "application/vnd.realvnc.bed"], ["bh2", "application/vnd.fujitsu.oasysprs"], ["bin", "application/octet-stream"], ["blb", "application/x-blorb"], ["blorb", "application/x-blorb"], ["bmi", "application/vnd.bmi"], ["bmml", "application/vnd.balsamiq.bmml+xml"], ["bmp", "image/bmp"], ["book", "application/vnd.framemaker"], ["box", "application/vnd.previewsystems.box"], ["boz", "application/x-bzip2"], ["bpk", "application/octet-stream"], ["bpmn", "application/octet-stream"], ["bsp", "model/vnd.valve.source.compiled-map"], ["btif", "image/prs.btif"], ["buffer", "application/octet-stream"], ["bz", "application/x-bzip"], ["bz2", "application/x-bzip2"], ["c", "text/x-c"], ["c4d", "application/vnd.clonk.c4group"], ["c4f", "application/vnd.clonk.c4group"], ["c4g", "application/vnd.clonk.c4group"], ["c4p", "application/vnd.clonk.c4group"], ["c4u", "application/vnd.clonk.c4group"], ["c11amc", "application/vnd.cluetrust.cartomobile-config"], ["c11amz", "application/vnd.cluetrust.cartomobile-config-pkg"], ["cab", "application/vnd.ms-cab-compressed"], ["caf", "audio/x-caf"], ["cap", "application/vnd.tcpdump.pcap"], ["car", "application/vnd.curl.car"], ["cat", "application/vnd.ms-pki.seccat"], ["cb7", "application/x-cbr"], ["cba", "application/x-cbr"], ["cbr", "application/x-cbr"], ["cbt", "application/x-cbr"], ["cbz", "application/x-cbr"], ["cc", "text/x-c"], ["cco", "application/x-cocoa"], ["cct", "application/x-director"], ["ccxml", "application/ccxml+xml"], ["cdbcmsg", "application/vnd.contact.cmsg"], ["cda", "application/x-cdf"], ["cdf", "application/x-netcdf"], ["cdfx", "application/cdfx+xml"], ["cdkey", "application/vnd.mediastation.cdkey"], ["cdmia", "application/cdmi-capability"], ["cdmic", "application/cdmi-container"], ["cdmid", "application/cdmi-domain"], ["cdmio", "application/cdmi-object"], ["cdmiq", "application/cdmi-queue"], ["cdr", "application/cdr"], ["cdx", "chemical/x-cdx"], ["cdxml", "application/vnd.chemdraw+xml"], ["cdy", "application/vnd.cinderella"], ["cer", "application/pkix-cert"], ["cfs", "application/x-cfs-compressed"], ["cgm", "image/cgm"], ["chat", "application/x-chat"], ["chm", "application/vnd.ms-htmlhelp"], ["chrt", "application/vnd.kde.kchart"], ["cif", "chemical/x-cif"], ["cii", "application/vnd.anser-web-certificate-issue-initiation"], ["cil", "application/vnd.ms-artgalry"], ["cjs", "application/node"], ["cla", "application/vnd.claymore"], ["class", "application/octet-stream"], ["clkk", "application/vnd.crick.clicker.keyboard"], ["clkp", "application/vnd.crick.clicker.palette"], ["clkt", "application/vnd.crick.clicker.template"], ["clkw", "application/vnd.crick.clicker.wordbank"], ["clkx", "application/vnd.crick.clicker"], ["clp", "application/x-msclip"], ["cmc", "application/vnd.cosmocaller"], ["cmdf", "chemical/x-cmdf"], ["cml", "chemical/x-cml"], ["cmp", "application/vnd.yellowriver-custom-menu"], ["cmx", "image/x-cmx"], ["cod", "application/vnd.rim.cod"], ["coffee", "text/coffeescript"], ["com", "application/x-msdownload"], ["conf", "text/plain"], ["cpio", "application/x-cpio"], ["cpp", "text/x-c"], ["cpt", "application/mac-compactpro"], ["crd", "application/x-mscardfile"], ["crl", "application/pkix-crl"], ["crt", "application/x-x509-ca-cert"], ["crx", "application/x-chrome-extension"], ["cryptonote", "application/vnd.rig.cryptonote"], ["csh", "application/x-csh"], ["csl", "application/vnd.citationstyles.style+xml"], ["csml", "chemical/x-csml"], ["csp", "application/vnd.commonspace"], ["csr", "application/octet-stream"], ["css", "text/css"], ["cst", "application/x-director"], ["csv", "text/csv"], ["cu", "application/cu-seeme"], ["curl", "text/vnd.curl"], ["cww", "application/prs.cww"], ["cxt", "application/x-director"], ["cxx", "text/x-c"], ["dae", "model/vnd.collada+xml"], ["daf", "application/vnd.mobius.daf"], ["dart", "application/vnd.dart"], ["dataless", "application/vnd.fdsn.seed"], ["davmount", "application/davmount+xml"], ["dbf", "application/vnd.dbf"], ["dbk", "application/docbook+xml"], ["dcr", "application/x-director"], ["dcurl", "text/vnd.curl.dcurl"], ["dd2", "application/vnd.oma.dd2+xml"], ["ddd", "application/vnd.fujixerox.ddd"], ["ddf", "application/vnd.syncml.dmddf+xml"], ["dds", "image/vnd.ms-dds"], ["deb", "application/x-debian-package"], ["def", "text/plain"], ["deploy", "application/octet-stream"], ["der", "application/x-x509-ca-cert"], ["dfac", "application/vnd.dreamfactory"], ["dgc", "application/x-dgc-compressed"], ["dic", "text/x-c"], ["dir", "application/x-director"], ["dis", "application/vnd.mobius.dis"], ["disposition-notification", "message/disposition-notification"], ["dist", "application/octet-stream"], ["distz", "application/octet-stream"], ["djv", "image/vnd.djvu"], ["djvu", "image/vnd.djvu"], ["dll", "application/octet-stream"], ["dmg", "application/x-apple-diskimage"], ["dmn", "application/octet-stream"], ["dmp", "application/vnd.tcpdump.pcap"], ["dms", "application/octet-stream"], ["dna", "application/vnd.dna"], ["doc", "application/msword"], ["docm", "application/vnd.ms-word.template.macroEnabled.12"], ["docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"], ["dot", "application/msword"], ["dotm", "application/vnd.ms-word.template.macroEnabled.12"], ["dotx", "application/vnd.openxmlformats-officedocument.wordprocessingml.template"], ["dp", "application/vnd.osgi.dp"], ["dpg", "application/vnd.dpgraph"], ["dra", "audio/vnd.dra"], ["drle", "image/dicom-rle"], ["dsc", "text/prs.lines.tag"], ["dssc", "application/dssc+der"], ["dtb", "application/x-dtbook+xml"], ["dtd", "application/xml-dtd"], ["dts", "audio/vnd.dts"], ["dtshd", "audio/vnd.dts.hd"], ["dump", "application/octet-stream"], ["dvb", "video/vnd.dvb.file"], ["dvi", "application/x-dvi"], ["dwd", "application/atsc-dwd+xml"], ["dwf", "model/vnd.dwf"], ["dwg", "image/vnd.dwg"], ["dxf", "image/vnd.dxf"], ["dxp", "application/vnd.spotfire.dxp"], ["dxr", "application/x-director"], ["ear", "application/java-archive"], ["ecelp4800", "audio/vnd.nuera.ecelp4800"], ["ecelp7470", "audio/vnd.nuera.ecelp7470"], ["ecelp9600", "audio/vnd.nuera.ecelp9600"], ["ecma", "application/ecmascript"], ["edm", "application/vnd.novadigm.edm"], ["edx", "application/vnd.novadigm.edx"], ["efif", "application/vnd.picsel"], ["ei6", "application/vnd.pg.osasli"], ["elc", "application/octet-stream"], ["emf", "image/emf"], ["eml", "message/rfc822"], ["emma", "application/emma+xml"], ["emotionml", "application/emotionml+xml"], ["emz", "application/x-msmetafile"], ["eol", "audio/vnd.digital-winds"], ["eot", "application/vnd.ms-fontobject"], ["eps", "application/postscript"], ["epub", "application/epub+zip"], ["es", "application/ecmascript"], ["es3", "application/vnd.eszigno3+xml"], ["esa", "application/vnd.osgi.subsystem"], ["esf", "application/vnd.epson.esf"], ["et3", "application/vnd.eszigno3+xml"], ["etx", "text/x-setext"], ["eva", "application/x-eva"], ["evy", "application/x-envoy"], ["exe", "application/octet-stream"], ["exi", "application/exi"], ["exp", "application/express"], ["exr", "image/aces"], ["ext", "application/vnd.novadigm.ext"], ["ez", "application/andrew-inset"], ["ez2", "application/vnd.ezpix-album"], ["ez3", "application/vnd.ezpix-package"], ["f", "text/x-fortran"], ["f4v", "video/mp4"], ["f77", "text/x-fortran"], ["f90", "text/x-fortran"], ["fbs", "image/vnd.fastbidsheet"], ["fcdt", "application/vnd.adobe.formscentral.fcdt"], ["fcs", "application/vnd.isac.fcs"], ["fdf", "application/vnd.fdf"], ["fdt", "application/fdt+xml"], ["fe_launch", "application/vnd.denovo.fcselayout-link"], ["fg5", "application/vnd.fujitsu.oasysgp"], ["fgd", "application/x-director"], ["fh", "image/x-freehand"], ["fh4", "image/x-freehand"], ["fh5", "image/x-freehand"], ["fh7", "image/x-freehand"], ["fhc", "image/x-freehand"], ["fig", "application/x-xfig"], ["fits", "image/fits"], ["flac", "audio/x-flac"], ["fli", "video/x-fli"], ["flo", "application/vnd.micrografx.flo"], ["flv", "video/x-flv"], ["flw", "application/vnd.kde.kivio"], ["flx", "text/vnd.fmi.flexstor"], ["fly", "text/vnd.fly"], ["fm", "application/vnd.framemaker"], ["fnc", "application/vnd.frogans.fnc"], ["fo", "application/vnd.software602.filler.form+xml"], ["for", "text/x-fortran"], ["fpx", "image/vnd.fpx"], ["frame", "application/vnd.framemaker"], ["fsc", "application/vnd.fsc.weblaunch"], ["fst", "image/vnd.fst"], ["ftc", "application/vnd.fluxtime.clip"], ["fti", "application/vnd.anser-web-funds-transfer-initiation"], ["fvt", "video/vnd.fvt"], ["fxp", "application/vnd.adobe.fxp"], ["fxpl", "application/vnd.adobe.fxp"], ["fzs", "application/vnd.fuzzysheet"], ["g2w", "application/vnd.geoplan"], ["g3", "image/g3fax"], ["g3w", "application/vnd.geospace"], ["gac", "application/vnd.groove-account"], ["gam", "application/x-tads"], ["gbr", "application/rpki-ghostbusters"], ["gca", "application/x-gca-compressed"], ["gdl", "model/vnd.gdl"], ["gdoc", "application/vnd.google-apps.document"], ["geo", "application/vnd.dynageo"], ["geojson", "application/geo+json"], ["gex", "application/vnd.geometry-explorer"], ["ggb", "application/vnd.geogebra.file"], ["ggt", "application/vnd.geogebra.tool"], ["ghf", "application/vnd.groove-help"], ["gif", "image/gif"], ["gim", "application/vnd.groove-identity-message"], ["glb", "model/gltf-binary"], ["gltf", "model/gltf+json"], ["gml", "application/gml+xml"], ["gmx", "application/vnd.gmx"], ["gnumeric", "application/x-gnumeric"], ["gpg", "application/gpg-keys"], ["gph", "application/vnd.flographit"], ["gpx", "application/gpx+xml"], ["gqf", "application/vnd.grafeq"], ["gqs", "application/vnd.grafeq"], ["gram", "application/srgs"], ["gramps", "application/x-gramps-xml"], ["gre", "application/vnd.geometry-explorer"], ["grv", "application/vnd.groove-injector"], ["grxml", "application/srgs+xml"], ["gsf", "application/x-font-ghostscript"], ["gsheet", "application/vnd.google-apps.spreadsheet"], ["gslides", "application/vnd.google-apps.presentation"], ["gtar", "application/x-gtar"], ["gtm", "application/vnd.groove-tool-message"], ["gtw", "model/vnd.gtw"], ["gv", "text/vnd.graphviz"], ["gxf", "application/gxf"], ["gxt", "application/vnd.geonext"], ["gz", "application/gzip"], ["gzip", "application/gzip"], ["h", "text/x-c"], ["h261", "video/h261"], ["h263", "video/h263"], ["h264", "video/h264"], ["hal", "application/vnd.hal+xml"], ["hbci", "application/vnd.hbci"], ["hbs", "text/x-handlebars-template"], ["hdd", "application/x-virtualbox-hdd"], ["hdf", "application/x-hdf"], ["heic", "image/heic"], ["heics", "image/heic-sequence"], ["heif", "image/heif"], ["heifs", "image/heif-sequence"], ["hej2", "image/hej2k"], ["held", "application/atsc-held+xml"], ["hh", "text/x-c"], ["hjson", "application/hjson"], ["hlp", "application/winhlp"], ["hpgl", "application/vnd.hp-hpgl"], ["hpid", "application/vnd.hp-hpid"], ["hps", "application/vnd.hp-hps"], ["hqx", "application/mac-binhex40"], ["hsj2", "image/hsj2"], ["htc", "text/x-component"], ["htke", "application/vnd.kenameaapp"], ["htm", "text/html"], ["html", "text/html"], ["hvd", "application/vnd.yamaha.hv-dic"], ["hvp", "application/vnd.yamaha.hv-voice"], ["hvs", "application/vnd.yamaha.hv-script"], ["i2g", "application/vnd.intergeo"], ["icc", "application/vnd.iccprofile"], ["ice", "x-conference/x-cooltalk"], ["icm", "application/vnd.iccprofile"], ["ico", "image/x-icon"], ["ics", "text/calendar"], ["ief", "image/ief"], ["ifb", "text/calendar"], ["ifm", "application/vnd.shana.informed.formdata"], ["iges", "model/iges"], ["igl", "application/vnd.igloader"], ["igm", "application/vnd.insors.igm"], ["igs", "model/iges"], ["igx", "application/vnd.micrografx.igx"], ["iif", "application/vnd.shana.informed.interchange"], ["img", "application/octet-stream"], ["imp", "application/vnd.accpac.simply.imp"], ["ims", "application/vnd.ms-ims"], ["in", "text/plain"], ["ini", "text/plain"], ["ink", "application/inkml+xml"], ["inkml", "application/inkml+xml"], ["install", "application/x-install-instructions"], ["iota", "application/vnd.astraea-software.iota"], ["ipfix", "application/ipfix"], ["ipk", "application/vnd.shana.informed.package"], ["irm", "application/vnd.ibm.rights-management"], ["irp", "application/vnd.irepository.package+xml"], ["iso", "application/x-iso9660-image"], ["itp", "application/vnd.shana.informed.formtemplate"], ["its", "application/its+xml"], ["ivp", "application/vnd.immervision-ivp"], ["ivu", "application/vnd.immervision-ivu"], ["jad", "text/vnd.sun.j2me.app-descriptor"], ["jade", "text/jade"], ["jam", "application/vnd.jam"], ["jar", "application/java-archive"], ["jardiff", "application/x-java-archive-diff"], ["java", "text/x-java-source"], ["jhc", "image/jphc"], ["jisp", "application/vnd.jisp"], ["jls", "image/jls"], ["jlt", "application/vnd.hp-jlyt"], ["jng", "image/x-jng"], ["jnlp", "application/x-java-jnlp-file"], ["joda", "application/vnd.joost.joda-archive"], ["jp2", "image/jp2"], ["jpe", "image/jpeg"], ["jpeg", "image/jpeg"], ["jpf", "image/jpx"], ["jpg", "image/jpeg"], ["jpg2", "image/jp2"], ["jpgm", "video/jpm"], ["jpgv", "video/jpeg"], ["jph", "image/jph"], ["jpm", "video/jpm"], ["jpx", "image/jpx"], ["js", "application/javascript"], ["json", "application/json"], ["json5", "application/json5"], ["jsonld", "application/ld+json"], ["jsonl", "application/jsonl"], ["jsonml", "application/jsonml+json"], ["jsx", "text/jsx"], ["jxr", "image/jxr"], ["jxra", "image/jxra"], ["jxrs", "image/jxrs"], ["jxs", "image/jxs"], ["jxsc", "image/jxsc"], ["jxsi", "image/jxsi"], ["jxss", "image/jxss"], ["kar", "audio/midi"], ["karbon", "application/vnd.kde.karbon"], ["kdb", "application/octet-stream"], ["kdbx", "application/x-keepass2"], ["key", "application/x-iwork-keynote-sffkey"], ["kfo", "application/vnd.kde.kformula"], ["kia", "application/vnd.kidspiration"], ["kml", "application/vnd.google-earth.kml+xml"], ["kmz", "application/vnd.google-earth.kmz"], ["kne", "application/vnd.kinar"], ["knp", "application/vnd.kinar"], ["kon", "application/vnd.kde.kontour"], ["kpr", "application/vnd.kde.kpresenter"], ["kpt", "application/vnd.kde.kpresenter"], ["kpxx", "application/vnd.ds-keypoint"], ["ksp", "application/vnd.kde.kspread"], ["ktr", "application/vnd.kahootz"], ["ktx", "image/ktx"], ["ktx2", "image/ktx2"], ["ktz", "application/vnd.kahootz"], ["kwd", "application/vnd.kde.kword"], ["kwt", "application/vnd.kde.kword"], ["lasxml", "application/vnd.las.las+xml"], ["latex", "application/x-latex"], ["lbd", "application/vnd.llamagraphics.life-balance.desktop"], ["lbe", "application/vnd.llamagraphics.life-balance.exchange+xml"], ["les", "application/vnd.hhe.lesson-player"], ["less", "text/less"], ["lgr", "application/lgr+xml"], ["lha", "application/octet-stream"], ["link66", "application/vnd.route66.link66+xml"], ["list", "text/plain"], ["list3820", "application/vnd.ibm.modcap"], ["listafp", "application/vnd.ibm.modcap"], ["litcoffee", "text/coffeescript"], ["lnk", "application/x-ms-shortcut"], ["log", "text/plain"], ["lostxml", "application/lost+xml"], ["lrf", "application/octet-stream"], ["lrm", "application/vnd.ms-lrm"], ["ltf", "application/vnd.frogans.ltf"], ["lua", "text/x-lua"], ["luac", "application/x-lua-bytecode"], ["lvp", "audio/vnd.lucent.voice"], ["lwp", "application/vnd.lotus-wordpro"], ["lzh", "application/octet-stream"], ["m1v", "video/mpeg"], ["m2a", "audio/mpeg"], ["m2v", "video/mpeg"], ["m3a", "audio/mpeg"], ["m3u", "text/plain"], ["m3u8", "application/vnd.apple.mpegurl"], ["m4a", "audio/x-m4a"], ["m4p", "application/mp4"], ["m4s", "video/iso.segment"], ["m4u", "application/vnd.mpegurl"], ["m4v", "video/x-m4v"], ["m13", "application/x-msmediaview"], ["m14", "application/x-msmediaview"], ["m21", "application/mp21"], ["ma", "application/mathematica"], ["mads", "application/mads+xml"], ["maei", "application/mmt-aei+xml"], ["mag", "application/vnd.ecowin.chart"], ["maker", "application/vnd.framemaker"], ["man", "text/troff"], ["manifest", "text/cache-manifest"], ["map", "application/json"], ["mar", "application/octet-stream"], ["markdown", "text/markdown"], ["mathml", "application/mathml+xml"], ["mb", "application/mathematica"], ["mbk", "application/vnd.mobius.mbk"], ["mbox", "application/mbox"], ["mc1", "application/vnd.medcalcdata"], ["mcd", "application/vnd.mcd"], ["mcurl", "text/vnd.curl.mcurl"], ["md", "text/markdown"], ["mdb", "application/x-msaccess"], ["mdi", "image/vnd.ms-modi"], ["mdx", "text/mdx"], ["me", "text/troff"], ["mesh", "model/mesh"], ["meta4", "application/metalink4+xml"], ["metalink", "application/metalink+xml"], ["mets", "application/mets+xml"], ["mfm", "application/vnd.mfmp"], ["mft", "application/rpki-manifest"], ["mgp", "application/vnd.osgeo.mapguide.package"], ["mgz", "application/vnd.proteus.magazine"], ["mid", "audio/midi"], ["midi", "audio/midi"], ["mie", "application/x-mie"], ["mif", "application/vnd.mif"], ["mime", "message/rfc822"], ["mj2", "video/mj2"], ["mjp2", "video/mj2"], ["mjs", "application/javascript"], ["mk3d", "video/x-matroska"], ["mka", "audio/x-matroska"], ["mkd", "text/x-markdown"], ["mks", "video/x-matroska"], ["mkv", "video/x-matroska"], ["mlp", "application/vnd.dolby.mlp"], ["mmd", "application/vnd.chipnuts.karaoke-mmd"], ["mmf", "application/vnd.smaf"], ["mml", "text/mathml"], ["mmr", "image/vnd.fujixerox.edmics-mmr"], ["mng", "video/x-mng"], ["mny", "application/x-msmoney"], ["mobi", "application/x-mobipocket-ebook"], ["mods", "application/mods+xml"], ["mov", "video/quicktime"], ["movie", "video/x-sgi-movie"], ["mp2", "audio/mpeg"], ["mp2a", "audio/mpeg"], ["mp3", "audio/mpeg"], ["mp4", "video/mp4"], ["mp4a", "audio/mp4"], ["mp4s", "application/mp4"], ["mp4v", "video/mp4"], ["mp21", "application/mp21"], ["mpc", "application/vnd.mophun.certificate"], ["mpd", "application/dash+xml"], ["mpe", "video/mpeg"], ["mpeg", "video/mpeg"], ["mpg", "video/mpeg"], ["mpg4", "video/mp4"], ["mpga", "audio/mpeg"], ["mpkg", "application/vnd.apple.installer+xml"], ["mpm", "application/vnd.blueice.multipass"], ["mpn", "application/vnd.mophun.application"], ["mpp", "application/vnd.ms-project"], ["mpt", "application/vnd.ms-project"], ["mpy", "application/vnd.ibm.minipay"], ["mqy", "application/vnd.mobius.mqy"], ["mrc", "application/marc"], ["mrcx", "application/marcxml+xml"], ["ms", "text/troff"], ["mscml", "application/mediaservercontrol+xml"], ["mseed", "application/vnd.fdsn.mseed"], ["mseq", "application/vnd.mseq"], ["msf", "application/vnd.epson.msf"], ["msg", "application/vnd.ms-outlook"], ["msh", "model/mesh"], ["msi", "application/x-msdownload"], ["msl", "application/vnd.mobius.msl"], ["msm", "application/octet-stream"], ["msp", "application/octet-stream"], ["msty", "application/vnd.muvee.style"], ["mtl", "model/mtl"], ["mts", "model/vnd.mts"], ["mus", "application/vnd.musician"], ["musd", "application/mmt-usd+xml"], ["musicxml", "application/vnd.recordare.musicxml+xml"], ["mvb", "application/x-msmediaview"], ["mvt", "application/vnd.mapbox-vector-tile"], ["mwf", "application/vnd.mfer"], ["mxf", "application/mxf"], ["mxl", "application/vnd.recordare.musicxml"], ["mxmf", "audio/mobile-xmf"], ["mxml", "application/xv+xml"], ["mxs", "application/vnd.triscape.mxs"], ["mxu", "video/vnd.mpegurl"], ["n-gage", "application/vnd.nokia.n-gage.symbian.install"], ["n3", "text/n3"], ["nb", "application/mathematica"], ["nbp", "application/vnd.wolfram.player"], ["nc", "application/x-netcdf"], ["ncx", "application/x-dtbncx+xml"], ["nfo", "text/x-nfo"], ["ngdat", "application/vnd.nokia.n-gage.data"], ["nitf", "application/vnd.nitf"], ["nlu", "application/vnd.neurolanguage.nlu"], ["nml", "application/vnd.enliven"], ["nnd", "application/vnd.noblenet-directory"], ["nns", "application/vnd.noblenet-sealer"], ["nnw", "application/vnd.noblenet-web"], ["npx", "image/vnd.net-fpx"], ["nq", "application/n-quads"], ["nsc", "application/x-conference"], ["nsf", "application/vnd.lotus-notes"], ["nt", "application/n-triples"], ["ntf", "application/vnd.nitf"], ["numbers", "application/x-iwork-numbers-sffnumbers"], ["nzb", "application/x-nzb"], ["oa2", "application/vnd.fujitsu.oasys2"], ["oa3", "application/vnd.fujitsu.oasys3"], ["oas", "application/vnd.fujitsu.oasys"], ["obd", "application/x-msbinder"], ["obgx", "application/vnd.openblox.game+xml"], ["obj", "model/obj"], ["oda", "application/oda"], ["odb", "application/vnd.oasis.opendocument.database"], ["odc", "application/vnd.oasis.opendocument.chart"], ["odf", "application/vnd.oasis.opendocument.formula"], ["odft", "application/vnd.oasis.opendocument.formula-template"], ["odg", "application/vnd.oasis.opendocument.graphics"], ["odi", "application/vnd.oasis.opendocument.image"], ["odm", "application/vnd.oasis.opendocument.text-master"], ["odp", "application/vnd.oasis.opendocument.presentation"], ["ods", "application/vnd.oasis.opendocument.spreadsheet"], ["odt", "application/vnd.oasis.opendocument.text"], ["oga", "audio/ogg"], ["ogex", "model/vnd.opengex"], ["ogg", "audio/ogg"], ["ogv", "video/ogg"], ["ogx", "application/ogg"], ["omdoc", "application/omdoc+xml"], ["onepkg", "application/onenote"], ["onetmp", "application/onenote"], ["onetoc", "application/onenote"], ["onetoc2", "application/onenote"], ["opf", "application/oebps-package+xml"], ["opml", "text/x-opml"], ["oprc", "application/vnd.palm"], ["opus", "audio/ogg"], ["org", "text/x-org"], ["osf", "application/vnd.yamaha.openscoreformat"], ["osfpvg", "application/vnd.yamaha.openscoreformat.osfpvg+xml"], ["osm", "application/vnd.openstreetmap.data+xml"], ["otc", "application/vnd.oasis.opendocument.chart-template"], ["otf", "font/otf"], ["otg", "application/vnd.oasis.opendocument.graphics-template"], ["oth", "application/vnd.oasis.opendocument.text-web"], ["oti", "application/vnd.oasis.opendocument.image-template"], ["otp", "application/vnd.oasis.opendocument.presentation-template"], ["ots", "application/vnd.oasis.opendocument.spreadsheet-template"], ["ott", "application/vnd.oasis.opendocument.text-template"], ["ova", "application/x-virtualbox-ova"], ["ovf", "application/x-virtualbox-ovf"], ["owl", "application/rdf+xml"], ["oxps", "application/oxps"], ["oxt", "application/vnd.openofficeorg.extension"], ["p", "text/x-pascal"], ["p7a", "application/x-pkcs7-signature"], ["p7b", "application/x-pkcs7-certificates"], ["p7c", "application/pkcs7-mime"], ["p7m", "application/pkcs7-mime"], ["p7r", "application/x-pkcs7-certreqresp"], ["p7s", "application/pkcs7-signature"], ["p8", "application/pkcs8"], ["p10", "application/x-pkcs10"], ["p12", "application/x-pkcs12"], ["pac", "application/x-ns-proxy-autoconfig"], ["pages", "application/x-iwork-pages-sffpages"], ["pas", "text/x-pascal"], ["paw", "application/vnd.pawaafile"], ["pbd", "application/vnd.powerbuilder6"], ["pbm", "image/x-portable-bitmap"], ["pcap", "application/vnd.tcpdump.pcap"], ["pcf", "application/x-font-pcf"], ["pcl", "application/vnd.hp-pcl"], ["pclxl", "application/vnd.hp-pclxl"], ["pct", "image/x-pict"], ["pcurl", "application/vnd.curl.pcurl"], ["pcx", "image/x-pcx"], ["pdb", "application/x-pilot"], ["pde", "text/x-processing"], ["pdf", "application/pdf"], ["pem", "application/x-x509-user-cert"], ["pfa", "application/x-font-type1"], ["pfb", "application/x-font-type1"], ["pfm", "application/x-font-type1"], ["pfr", "application/font-tdpfr"], ["pfx", "application/x-pkcs12"], ["pgm", "image/x-portable-graymap"], ["pgn", "application/x-chess-pgn"], ["pgp", "application/pgp"], ["php", "application/x-httpd-php"], ["php3", "application/x-httpd-php"], ["php4", "application/x-httpd-php"], ["phps", "application/x-httpd-php-source"], ["phtml", "application/x-httpd-php"], ["pic", "image/x-pict"], ["pkg", "application/octet-stream"], ["pki", "application/pkixcmp"], ["pkipath", "application/pkix-pkipath"], ["pkpass", "application/vnd.apple.pkpass"], ["pl", "application/x-perl"], ["plb", "application/vnd.3gpp.pic-bw-large"], ["plc", "application/vnd.mobius.plc"], ["plf", "application/vnd.pocketlearn"], ["pls", "application/pls+xml"], ["pm", "application/x-perl"], ["pml", "application/vnd.ctc-posml"], ["png", "image/png"], ["pnm", "image/x-portable-anymap"], ["portpkg", "application/vnd.macports.portpkg"], ["pot", "application/vnd.ms-powerpoint"], ["potm", "application/vnd.ms-powerpoint.presentation.macroEnabled.12"], ["potx", "application/vnd.openxmlformats-officedocument.presentationml.template"], ["ppa", "application/vnd.ms-powerpoint"], ["ppam", "application/vnd.ms-powerpoint.addin.macroEnabled.12"], ["ppd", "application/vnd.cups-ppd"], ["ppm", "image/x-portable-pixmap"], ["pps", "application/vnd.ms-powerpoint"], ["ppsm", "application/vnd.ms-powerpoint.slideshow.macroEnabled.12"], ["ppsx", "application/vnd.openxmlformats-officedocument.presentationml.slideshow"], ["ppt", "application/powerpoint"], ["pptm", "application/vnd.ms-powerpoint.presentation.macroEnabled.12"], ["pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"], ["pqa", "application/vnd.palm"], ["prc", "application/x-pilot"], ["pre", "application/vnd.lotus-freelance"], ["prf", "application/pics-rules"], ["provx", "application/provenance+xml"], ["ps", "application/postscript"], ["psb", "application/vnd.3gpp.pic-bw-small"], ["psd", "application/x-photoshop"], ["psf", "application/x-font-linux-psf"], ["pskcxml", "application/pskc+xml"], ["pti", "image/prs.pti"], ["ptid", "application/vnd.pvi.ptid1"], ["pub", "application/x-mspublisher"], ["pvb", "application/vnd.3gpp.pic-bw-var"], ["pwn", "application/vnd.3m.post-it-notes"], ["pya", "audio/vnd.ms-playready.media.pya"], ["pyv", "video/vnd.ms-playready.media.pyv"], ["qam", "application/vnd.epson.quickanime"], ["qbo", "application/vnd.intu.qbo"], ["qfx", "application/vnd.intu.qfx"], ["qps", "application/vnd.publishare-delta-tree"], ["qt", "video/quicktime"], ["qwd", "application/vnd.quark.quarkxpress"], ["qwt", "application/vnd.quark.quarkxpress"], ["qxb", "application/vnd.quark.quarkxpress"], ["qxd", "application/vnd.quark.quarkxpress"], ["qxl", "application/vnd.quark.quarkxpress"], ["qxt", "application/vnd.quark.quarkxpress"], ["ra", "audio/x-realaudio"], ["ram", "audio/x-pn-realaudio"], ["raml", "application/raml+yaml"], ["rapd", "application/route-apd+xml"], ["rar", "application/x-rar"], ["ras", "image/x-cmu-raster"], ["rcprofile", "application/vnd.ipunplugged.rcprofile"], ["rdf", "application/rdf+xml"], ["rdz", "application/vnd.data-vision.rdz"], ["relo", "application/p2p-overlay+xml"], ["rep", "application/vnd.businessobjects"], ["res", "application/x-dtbresource+xml"], ["rgb", "image/x-rgb"], ["rif", "application/reginfo+xml"], ["rip", "audio/vnd.rip"], ["ris", "application/x-research-info-systems"], ["rl", "application/resource-lists+xml"], ["rlc", "image/vnd.fujixerox.edmics-rlc"], ["rld", "application/resource-lists-diff+xml"], ["rm", "audio/x-pn-realaudio"], ["rmi", "audio/midi"], ["rmp", "audio/x-pn-realaudio-plugin"], ["rms", "application/vnd.jcp.javame.midlet-rms"], ["rmvb", "application/vnd.rn-realmedia-vbr"], ["rnc", "application/relax-ng-compact-syntax"], ["rng", "application/xml"], ["roa", "application/rpki-roa"], ["roff", "text/troff"], ["rp9", "application/vnd.cloanto.rp9"], ["rpm", "audio/x-pn-realaudio-plugin"], ["rpss", "application/vnd.nokia.radio-presets"], ["rpst", "application/vnd.nokia.radio-preset"], ["rq", "application/sparql-query"], ["rs", "application/rls-services+xml"], ["rsa", "application/x-pkcs7"], ["rsat", "application/atsc-rsat+xml"], ["rsd", "application/rsd+xml"], ["rsheet", "application/urc-ressheet+xml"], ["rss", "application/rss+xml"], ["rtf", "text/rtf"], ["rtx", "text/richtext"], ["run", "application/x-makeself"], ["rusd", "application/route-usd+xml"], ["rv", "video/vnd.rn-realvideo"], ["s", "text/x-asm"], ["s3m", "audio/s3m"], ["saf", "application/vnd.yamaha.smaf-audio"], ["sass", "text/x-sass"], ["sbml", "application/sbml+xml"], ["sc", "application/vnd.ibm.secure-container"], ["scd", "application/x-msschedule"], ["scm", "application/vnd.lotus-screencam"], ["scq", "application/scvp-cv-request"], ["scs", "application/scvp-cv-response"], ["scss", "text/x-scss"], ["scurl", "text/vnd.curl.scurl"], ["sda", "application/vnd.stardivision.draw"], ["sdc", "application/vnd.stardivision.calc"], ["sdd", "application/vnd.stardivision.impress"], ["sdkd", "application/vnd.solent.sdkm+xml"], ["sdkm", "application/vnd.solent.sdkm+xml"], ["sdp", "application/sdp"], ["sdw", "application/vnd.stardivision.writer"], ["sea", "application/octet-stream"], ["see", "application/vnd.seemail"], ["seed", "application/vnd.fdsn.seed"], ["sema", "application/vnd.sema"], ["semd", "application/vnd.semd"], ["semf", "application/vnd.semf"], ["senmlx", "application/senml+xml"], ["sensmlx", "application/sensml+xml"], ["ser", "application/java-serialized-object"], ["setpay", "application/set-payment-initiation"], ["setreg", "application/set-registration-initiation"], ["sfd-hdstx", "application/vnd.hydrostatix.sof-data"], ["sfs", "application/vnd.spotfire.sfs"], ["sfv", "text/x-sfv"], ["sgi", "image/sgi"], ["sgl", "application/vnd.stardivision.writer-global"], ["sgm", "text/sgml"], ["sgml", "text/sgml"], ["sh", "application/x-sh"], ["shar", "application/x-shar"], ["shex", "text/shex"], ["shf", "application/shf+xml"], ["shtml", "text/html"], ["sid", "image/x-mrsid-image"], ["sieve", "application/sieve"], ["sig", "application/pgp-signature"], ["sil", "audio/silk"], ["silo", "model/mesh"], ["sis", "application/vnd.symbian.install"], ["sisx", "application/vnd.symbian.install"], ["sit", "application/x-stuffit"], ["sitx", "application/x-stuffitx"], ["siv", "application/sieve"], ["skd", "application/vnd.koan"], ["skm", "application/vnd.koan"], ["skp", "application/vnd.koan"], ["skt", "application/vnd.koan"], ["sldm", "application/vnd.ms-powerpoint.slide.macroenabled.12"], ["sldx", "application/vnd.openxmlformats-officedocument.presentationml.slide"], ["slim", "text/slim"], ["slm", "text/slim"], ["sls", "application/route-s-tsid+xml"], ["slt", "application/vnd.epson.salt"], ["sm", "application/vnd.stepmania.stepchart"], ["smf", "application/vnd.stardivision.math"], ["smi", "application/smil"], ["smil", "application/smil"], ["smv", "video/x-smv"], ["smzip", "application/vnd.stepmania.package"], ["snd", "audio/basic"], ["snf", "application/x-font-snf"], ["so", "application/octet-stream"], ["spc", "application/x-pkcs7-certificates"], ["spdx", "text/spdx"], ["spf", "application/vnd.yamaha.smaf-phrase"], ["spl", "application/x-futuresplash"], ["spot", "text/vnd.in3d.spot"], ["spp", "application/scvp-vp-response"], ["spq", "application/scvp-vp-request"], ["spx", "audio/ogg"], ["sql", "application/x-sql"], ["src", "application/x-wais-source"], ["srt", "application/x-subrip"], ["sru", "application/sru+xml"], ["srx", "application/sparql-results+xml"], ["ssdl", "application/ssdl+xml"], ["sse", "application/vnd.kodak-descriptor"], ["ssf", "application/vnd.epson.ssf"], ["ssml", "application/ssml+xml"], ["sst", "application/octet-stream"], ["st", "application/vnd.sailingtracker.track"], ["stc", "application/vnd.sun.xml.calc.template"], ["std", "application/vnd.sun.xml.draw.template"], ["stf", "application/vnd.wt.stf"], ["sti", "application/vnd.sun.xml.impress.template"], ["stk", "application/hyperstudio"], ["stl", "model/stl"], ["stpx", "model/step+xml"], ["stpxz", "model/step-xml+zip"], ["stpz", "model/step+zip"], ["str", "application/vnd.pg.format"], ["stw", "application/vnd.sun.xml.writer.template"], ["styl", "text/stylus"], ["stylus", "text/stylus"], ["sub", "text/vnd.dvb.subtitle"], ["sus", "application/vnd.sus-calendar"], ["susp", "application/vnd.sus-calendar"], ["sv4cpio", "application/x-sv4cpio"], ["sv4crc", "application/x-sv4crc"], ["svc", "application/vnd.dvb.service"], ["svd", "application/vnd.svd"], ["svg", "image/svg+xml"], ["svgz", "image/svg+xml"], ["swa", "application/x-director"], ["swf", "application/x-shockwave-flash"], ["swi", "application/vnd.aristanetworks.swi"], ["swidtag", "application/swid+xml"], ["sxc", "application/vnd.sun.xml.calc"], ["sxd", "application/vnd.sun.xml.draw"], ["sxg", "application/vnd.sun.xml.writer.global"], ["sxi", "application/vnd.sun.xml.impress"], ["sxm", "application/vnd.sun.xml.math"], ["sxw", "application/vnd.sun.xml.writer"], ["t", "text/troff"], ["t3", "application/x-t3vm-image"], ["t38", "image/t38"], ["taglet", "application/vnd.mynfc"], ["tao", "application/vnd.tao.intent-module-archive"], ["tap", "image/vnd.tencent.tap"], ["tar", "application/x-tar"], ["tcap", "application/vnd.3gpp2.tcap"], ["tcl", "application/x-tcl"], ["td", "application/urc-targetdesc+xml"], ["teacher", "application/vnd.smart.teacher"], ["tei", "application/tei+xml"], ["teicorpus", "application/tei+xml"], ["tex", "application/x-tex"], ["texi", "application/x-texinfo"], ["texinfo", "application/x-texinfo"], ["text", "text/plain"], ["tfi", "application/thraud+xml"], ["tfm", "application/x-tex-tfm"], ["tfx", "image/tiff-fx"], ["tga", "image/x-tga"], ["tgz", "application/x-tar"], ["thmx", "application/vnd.ms-officetheme"], ["tif", "image/tiff"], ["tiff", "image/tiff"], ["tk", "application/x-tcl"], ["tmo", "application/vnd.tmobile-livetv"], ["toml", "application/toml"], ["torrent", "application/x-bittorrent"], ["tpl", "application/vnd.groove-tool-template"], ["tpt", "application/vnd.trid.tpt"], ["tr", "text/troff"], ["tra", "application/vnd.trueapp"], ["trig", "application/trig"], ["trm", "application/x-msterminal"], ["ts", "video/mp2t"], ["tsd", "application/timestamped-data"], ["tsv", "text/tab-separated-values"], ["ttc", "font/collection"], ["ttf", "font/ttf"], ["ttl", "text/turtle"], ["ttml", "application/ttml+xml"], ["twd", "application/vnd.simtech-mindmapper"], ["twds", "application/vnd.simtech-mindmapper"], ["txd", "application/vnd.genomatix.tuxedo"], ["txf", "application/vnd.mobius.txf"], ["txt", "text/plain"], ["u8dsn", "message/global-delivery-status"], ["u8hdr", "message/global-headers"], ["u8mdn", "message/global-disposition-notification"], ["u8msg", "message/global"], ["u32", "application/x-authorware-bin"], ["ubj", "application/ubjson"], ["udeb", "application/x-debian-package"], ["ufd", "application/vnd.ufdl"], ["ufdl", "application/vnd.ufdl"], ["ulx", "application/x-glulx"], ["umj", "application/vnd.umajin"], ["unityweb", "application/vnd.unity"], ["uoml", "application/vnd.uoml+xml"], ["uri", "text/uri-list"], ["uris", "text/uri-list"], ["urls", "text/uri-list"], ["usdz", "model/vnd.usdz+zip"], ["ustar", "application/x-ustar"], ["utz", "application/vnd.uiq.theme"], ["uu", "text/x-uuencode"], ["uva", "audio/vnd.dece.audio"], ["uvd", "application/vnd.dece.data"], ["uvf", "application/vnd.dece.data"], ["uvg", "image/vnd.dece.graphic"], ["uvh", "video/vnd.dece.hd"], ["uvi", "image/vnd.dece.graphic"], ["uvm", "video/vnd.dece.mobile"], ["uvp", "video/vnd.dece.pd"], ["uvs", "video/vnd.dece.sd"], ["uvt", "application/vnd.dece.ttml+xml"], ["uvu", "video/vnd.uvvu.mp4"], ["uvv", "video/vnd.dece.video"], ["uvva", "audio/vnd.dece.audio"], ["uvvd", "application/vnd.dece.data"], ["uvvf", "application/vnd.dece.data"], ["uvvg", "image/vnd.dece.graphic"], ["uvvh", "video/vnd.dece.hd"], ["uvvi", "image/vnd.dece.graphic"], ["uvvm", "video/vnd.dece.mobile"], ["uvvp", "video/vnd.dece.pd"], ["uvvs", "video/vnd.dece.sd"], ["uvvt", "application/vnd.dece.ttml+xml"], ["uvvu", "video/vnd.uvvu.mp4"], ["uvvv", "video/vnd.dece.video"], ["uvvx", "application/vnd.dece.unspecified"], ["uvvz", "application/vnd.dece.zip"], ["uvx", "application/vnd.dece.unspecified"], ["uvz", "application/vnd.dece.zip"], ["vbox", "application/x-virtualbox-vbox"], ["vbox-extpack", "application/x-virtualbox-vbox-extpack"], ["vcard", "text/vcard"], ["vcd", "application/x-cdlink"], ["vcf", "text/x-vcard"], ["vcg", "application/vnd.groove-vcard"], ["vcs", "text/x-vcalendar"], ["vcx", "application/vnd.vcx"], ["vdi", "application/x-virtualbox-vdi"], ["vds", "model/vnd.sap.vds"], ["vhd", "application/x-virtualbox-vhd"], ["vis", "application/vnd.visionary"], ["viv", "video/vnd.vivo"], ["vlc", "application/videolan"], ["vmdk", "application/x-virtualbox-vmdk"], ["vob", "video/x-ms-vob"], ["vor", "application/vnd.stardivision.writer"], ["vox", "application/x-authorware-bin"], ["vrml", "model/vrml"], ["vsd", "application/vnd.visio"], ["vsf", "application/vnd.vsf"], ["vss", "application/vnd.visio"], ["vst", "application/vnd.visio"], ["vsw", "application/vnd.visio"], ["vtf", "image/vnd.valve.source.texture"], ["vtt", "text/vtt"], ["vtu", "model/vnd.vtu"], ["vxml", "application/voicexml+xml"], ["w3d", "application/x-director"], ["wad", "application/x-doom"], ["wadl", "application/vnd.sun.wadl+xml"], ["war", "application/java-archive"], ["wasm", "application/wasm"], ["wav", "audio/x-wav"], ["wax", "audio/x-ms-wax"], ["wbmp", "image/vnd.wap.wbmp"], ["wbs", "application/vnd.criticaltools.wbs+xml"], ["wbxml", "application/wbxml"], ["wcm", "application/vnd.ms-works"], ["wdb", "application/vnd.ms-works"], ["wdp", "image/vnd.ms-photo"], ["weba", "audio/webm"], ["webapp", "application/x-web-app-manifest+json"], ["webm", "video/webm"], ["webmanifest", "application/manifest+json"], ["webp", "image/webp"], ["wg", "application/vnd.pmi.widget"], ["wgt", "application/widget"], ["wks", "application/vnd.ms-works"], ["wm", "video/x-ms-wm"], ["wma", "audio/x-ms-wma"], ["wmd", "application/x-ms-wmd"], ["wmf", "image/wmf"], ["wml", "text/vnd.wap.wml"], ["wmlc", "application/wmlc"], ["wmls", "text/vnd.wap.wmlscript"], ["wmlsc", "application/vnd.wap.wmlscriptc"], ["wmv", "video/x-ms-wmv"], ["wmx", "video/x-ms-wmx"], ["wmz", "application/x-msmetafile"], ["woff", "font/woff"], ["woff2", "font/woff2"], ["word", "application/msword"], ["wpd", "application/vnd.wordperfect"], ["wpl", "application/vnd.ms-wpl"], ["wps", "application/vnd.ms-works"], ["wqd", "application/vnd.wqd"], ["wri", "application/x-mswrite"], ["wrl", "model/vrml"], ["wsc", "message/vnd.wfa.wsc"], ["wsdl", "application/wsdl+xml"], ["wspolicy", "application/wspolicy+xml"], ["wtb", "application/vnd.webturbo"], ["wvx", "video/x-ms-wvx"], ["x3d", "model/x3d+xml"], ["x3db", "model/x3d+fastinfoset"], ["x3dbz", "model/x3d+binary"], ["x3dv", "model/x3d-vrml"], ["x3dvz", "model/x3d+vrml"], ["x3dz", "model/x3d+xml"], ["x32", "application/x-authorware-bin"], ["x_b", "model/vnd.parasolid.transmit.binary"], ["x_t", "model/vnd.parasolid.transmit.text"], ["xaml", "application/xaml+xml"], ["xap", "application/x-silverlight-app"], ["xar", "application/vnd.xara"], ["xav", "application/xcap-att+xml"], ["xbap", "application/x-ms-xbap"], ["xbd", "application/vnd.fujixerox.docuworks.binder"], ["xbm", "image/x-xbitmap"], ["xca", "application/xcap-caps+xml"], ["xcs", "application/calendar+xml"], ["xdf", "application/xcap-diff+xml"], ["xdm", "application/vnd.syncml.dm+xml"], ["xdp", "application/vnd.adobe.xdp+xml"], ["xdssc", "application/dssc+xml"], ["xdw", "application/vnd.fujixerox.docuworks"], ["xel", "application/xcap-el+xml"], ["xenc", "application/xenc+xml"], ["xer", "application/patch-ops-error+xml"], ["xfdf", "application/vnd.adobe.xfdf"], ["xfdl", "application/vnd.xfdl"], ["xht", "application/xhtml+xml"], ["xhtml", "application/xhtml+xml"], ["xhvml", "application/xv+xml"], ["xif", "image/vnd.xiff"], ["xl", "application/excel"], ["xla", "application/vnd.ms-excel"], ["xlam", "application/vnd.ms-excel.addin.macroEnabled.12"], ["xlc", "application/vnd.ms-excel"], ["xlf", "application/xliff+xml"], ["xlm", "application/vnd.ms-excel"], ["xls", "application/vnd.ms-excel"], ["xlsb", "application/vnd.ms-excel.sheet.binary.macroEnabled.12"], ["xlsm", "application/vnd.ms-excel.sheet.macroEnabled.12"], ["xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"], ["xlt", "application/vnd.ms-excel"], ["xltm", "application/vnd.ms-excel.template.macroEnabled.12"], ["xltx", "application/vnd.openxmlformats-officedocument.spreadsheetml.template"], ["xlw", "application/vnd.ms-excel"], ["xm", "audio/xm"], ["xml", "application/xml"], ["xns", "application/xcap-ns+xml"], ["xo", "application/vnd.olpc-sugar"], ["xop", "application/xop+xml"], ["xpi", "application/x-xpinstall"], ["xpl", "application/xproc+xml"], ["xpm", "image/x-xpixmap"], ["xpr", "application/vnd.is-xpr"], ["xps", "application/vnd.ms-xpsdocument"], ["xpw", "application/vnd.intercon.formnet"], ["xpx", "application/vnd.intercon.formnet"], ["xsd", "application/xml"], ["xsl", "application/xml"], ["xslt", "application/xslt+xml"], ["xsm", "application/vnd.syncml+xml"], ["xspf", "application/xspf+xml"], ["xul", "application/vnd.mozilla.xul+xml"], ["xvm", "application/xv+xml"], ["xvml", "application/xv+xml"], ["xwd", "image/x-xwindowdump"], ["xyz", "chemical/x-xyz"], ["xz", "application/x-xz"], ["yaml", "text/yaml"], ["yang", "application/yang"], ["yin", "application/yin+xml"], ["yml", "text/yaml"], ["ymp", "text/x-suse-ymp"], ["z", "application/x-compress"], ["z1", "application/x-zmachine"], ["z2", "application/x-zmachine"], ["z3", "application/x-zmachine"], ["z4", "application/x-zmachine"], ["z5", "application/x-zmachine"], ["z6", "application/x-zmachine"], ["z7", "application/x-zmachine"], ["z8", "application/x-zmachine"], ["zaz", "application/vnd.zzazz.deck+xml"], ["zip", "application/zip"], ["zir", "application/vnd.zul"], ["zirz", "application/vnd.zul"], ["zmm", "application/vnd.handheld-entertainment+xml"], ["zsh", "text/x-scriptzsh"]]);
function ko(a, s, u) {
  const d = Fm(a),
    {
      webkitRelativePath: p
    } = a,
    m = typeof s == "string" ? s : typeof p == "string" && p.length > 0 ? p : `./${a.name}`;
  return typeof d.path != "string" && dp(d, "path", m), dp(d, "relativePath", m), d;
}
function Fm(a) {
  const {
    name: s
  } = a;
  if (s && s.lastIndexOf(".") !== -1 && !a.type) {
    const d = s.split(".").pop().toLowerCase(),
      p = Rm.get(d);
    p && Object.defineProperty(a, "type", {
      value: p,
      writable: !1,
      configurable: !1,
      enumerable: !0
    });
  }
  return a;
}
function dp(a, s, u) {
  Object.defineProperty(a, s, {
    value: u,
    writable: !1,
    configurable: !1,
    enumerable: !0
  });
}
const Mm = [".DS_Store", "Thumbs.db"];
function Im(a) {
  return _a(this, void 0, void 0, function* () {
    return Al(a) && Om(a.dataTransfer) ? Bm(a.dataTransfer, a.type) : Vm(a) ? zm(a) : Array.isArray(a) && a.every(s => "getFile" in s && typeof s.getFile == "function") ? Am(a) : [];
  });
}
function Om(a) {
  return Al(a);
}
function Vm(a) {
  return Al(a) && Al(a.target);
}
function Al(a) {
  return typeof a == "object" && a !== null;
}
function zm(a) {
  return $c(a.target.files).map(s => ko(s));
}
function Am(a) {
  return _a(this, void 0, void 0, function* () {
    return (yield Promise.all(a.map(u => u.getFile()))).map(u => ko(u));
  });
}
function Bm(a, s) {
  return _a(this, void 0, void 0, function* () {
    if (a.items) {
      const u = $c(a.items).filter(p => p.kind === "file");
      if (s !== "drop") return u;
      const d = yield Promise.all(u.map($m));
      return pp(nf(d));
    }
    return pp($c(a.files).map(u => ko(u)));
  });
}
function pp(a) {
  return a.filter(s => Mm.indexOf(s.name) === -1);
}
function $c(a) {
  if (a === null) return [];
  const s = [];
  for (let u = 0; u < a.length; u++) {
    const d = a[u];
    s.push(d);
  }
  return s;
}
function $m(a) {
  if (typeof a.webkitGetAsEntry != "function") return fp(a);
  const s = a.webkitGetAsEntry();
  return s && s.isDirectory ? rf(s) : fp(a, s);
}
function nf(a) {
  return a.reduce((s, u) => [...s, ...(Array.isArray(u) ? nf(u) : [u])], []);
}
function fp(a, s) {
  return _a(this, void 0, void 0, function* () {
    var u;
    if (globalThis.isSecureContext && typeof a.getAsFileSystemHandle == "function") {
      const m = yield a.getAsFileSystemHandle();
      if (m === null) throw new Error(`${a} is not a File`);
      if (m !== void 0) {
        const x = yield m.getFile();
        return x.handle = m, ko(x);
      }
    }
    const d = a.getAsFile();
    if (!d) throw new Error(`${a} is not a File`);
    return ko(d, (u = s?.fullPath) !== null && u !== void 0 ? u : void 0);
  });
}
function Um(a) {
  return _a(this, void 0, void 0, function* () {
    return a.isDirectory ? rf(a) : Wm(a);
  });
}
function rf(a) {
  const s = a.createReader();
  return new Promise((u, d) => {
    const p = [];
    function m() {
      s.readEntries(x => _a(this, void 0, void 0, function* () {
        if (x.length) {
          const b = Promise.all(x.map(Um));
          p.push(b), m();
        } else try {
          const b = yield Promise.all(p);
          u(b);
        } catch (b) {
          d(b);
        }
      }), x => {
        d(x);
      });
    }
    m();
  });
}
function Wm(a) {
  return _a(this, void 0, void 0, function* () {
    return new Promise((s, u) => {
      a.file(d => {
        const p = ko(d, a.fullPath);
        s(p);
      }, d => {
        u(d);
      });
    });
  });
}
var Rl = {},
  mp;
function Hm() {
  return mp || (mp = 1, Rl.__esModule = !0, Rl.default = function (a, s) {
    if (a && s) {
      var u = Array.isArray(s) ? s : s.split(",");
      if (u.length === 0) return !0;
      var d = a.name || "",
        p = (a.type || "").toLowerCase(),
        m = p.replace(/\/.*$/, "");
      return u.some(function (x) {
        var b = x.trim().toLowerCase();
        return b.charAt(0) === "." ? d.toLowerCase().endsWith(b) : b.endsWith("/*") ? m === b.replace(/\/.*$/, "") : p === b;
      });
    }
    return !0;
  }), Rl;
}
var Gm = Hm();
const Fc = Jc(Gm);
function hp(a) {
  return Qm(a) || qm(a) || of(a) || Km();
}
function Km() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function qm(a) {
  if (typeof Symbol < "u" && a[Symbol.iterator] != null || a["@@iterator"] != null) return Array.from(a);
}
function Qm(a) {
  if (Array.isArray(a)) return Uc(a);
}
function gp(a, s) {
  var u = Object.keys(a);
  if (Object.getOwnPropertySymbols) {
    var d = Object.getOwnPropertySymbols(a);
    s && (d = d.filter(function (p) {
      return Object.getOwnPropertyDescriptor(a, p).enumerable;
    })), u.push.apply(u, d);
  }
  return u;
}
function xp(a) {
  for (var s = 1; s < arguments.length; s++) {
    var u = arguments[s] != null ? arguments[s] : {};
    s % 2 ? gp(Object(u), !0).forEach(function (d) {
      af(a, d, u[d]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(a, Object.getOwnPropertyDescriptors(u)) : gp(Object(u)).forEach(function (d) {
      Object.defineProperty(a, d, Object.getOwnPropertyDescriptor(u, d));
    });
  }
  return a;
}
function af(a, s, u) {
  return s in a ? Object.defineProperty(a, s, {
    value: u,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : a[s] = u, a;
}
function hi(a, s) {
  return Ym(a) || Xm(a, s) || of(a, s) || Jm();
}
function Jm() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function of(a, s) {
  if (a) {
    if (typeof a == "string") return Uc(a, s);
    var u = Object.prototype.toString.call(a).slice(8, -1);
    if (u === "Object" && a.constructor && (u = a.constructor.name), u === "Map" || u === "Set") return Array.from(a);
    if (u === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(u)) return Uc(a, s);
  }
}
function Uc(a, s) {
  (s == null || s > a.length) && (s = a.length);
  for (var u = 0, d = new Array(s); u < s; u++) d[u] = a[u];
  return d;
}
function Xm(a, s) {
  var u = a == null ? null : typeof Symbol < "u" && a[Symbol.iterator] || a["@@iterator"];
  if (u != null) {
    var d = [],
      p = !0,
      m = !1,
      x,
      b;
    try {
      for (u = u.call(a); !(p = (x = u.next()).done) && (d.push(x.value), !(s && d.length === s)); p = !0);
    } catch (D) {
      m = !0, b = D;
    } finally {
      try {
        !p && u.return != null && u.return();
      } finally {
        if (m) throw b;
      }
    }
    return d;
  }
}
function Ym(a) {
  if (Array.isArray(a)) return a;
}
var Zm = typeof Fc == "function" ? Fc : Fc.default,
  eh = "file-invalid-type",
  th = "file-too-large",
  nh = "file-too-small",
  rh = "too-many-files",
  ah = function () {
    var s = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "",
      u = s.split(","),
      d = u.length > 1 ? "one of ".concat(u.join(", ")) : u[0];
    return {
      code: eh,
      message: "File type must be ".concat(d)
    };
  },
  vp = function (s) {
    return {
      code: th,
      message: "File is larger than ".concat(s, " ").concat(s === 1 ? "byte" : "bytes")
    };
  },
  wp = function (s) {
    return {
      code: nh,
      message: "File is smaller than ".concat(s, " ").concat(s === 1 ? "byte" : "bytes")
    };
  },
  oh = {
    code: rh,
    message: "Too many files"
  };
function ih(a) {
  return a.type === "" && typeof a.getAsFile == "function";
}
function lf(a, s) {
  var u = a.type === "application/x-moz-file" || Zm(a, s) || ih(a);
  return [u, u ? null : ah(s)];
}
function sf(a, s, u) {
  if (Ea(a.size)) if (Ea(s) && Ea(u)) {
    if (a.size > u) return [!1, vp(u)];
    if (a.size < s) return [!1, wp(s)];
  } else {
    if (Ea(s) && a.size < s) return [!1, wp(s)];
    if (Ea(u) && a.size > u) return [!1, vp(u)];
  }
  return [!0, null];
}
function Ea(a) {
  return a != null;
}
function lh(a) {
  var s = a.files,
    u = a.accept,
    d = a.minSize,
    p = a.maxSize,
    m = a.multiple,
    x = a.maxFiles,
    b = a.validator;
  return !m && s.length > 1 || m && x >= 1 && s.length > x ? !1 : s.every(function (D) {
    var j = lf(D, u),
      E = hi(j, 1),
      R = E[0],
      C = sf(D, d, p),
      J = hi(C, 1),
      pe = J[0],
      oe = b ? b(D) : null;
    return R && pe && !oe;
  });
}
function Bl(a) {
  return typeof a.isPropagationStopped == "function" ? a.isPropagationStopped() : typeof a.cancelBubble < "u" ? a.cancelBubble : !1;
}
function di(a) {
  return a.dataTransfer ? Array.prototype.some.call(a.dataTransfer.types, function (s) {
    return s === "Files" || s === "application/x-moz-file";
  }) : !!a.target && !!a.target.files;
}
function yp(a) {
  a.preventDefault();
}
function sh(a) {
  return a.indexOf("MSIE") !== -1 || a.indexOf("Trident/") !== -1;
}
function ch(a) {
  return a.indexOf("Edge/") !== -1;
}
function uh() {
  var a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : window.navigator.userAgent;
  return sh(a) || ch(a);
}
function fr() {
  for (var a = arguments.length, s = new Array(a), u = 0; u < a; u++) s[u] = arguments[u];
  return function (d) {
    for (var p = arguments.length, m = new Array(p > 1 ? p - 1 : 0), x = 1; x < p; x++) m[x - 1] = arguments[x];
    return s.some(function (b) {
      return !Bl(d) && b && b.apply(void 0, [d].concat(m)), Bl(d);
    });
  };
}
function dh() {
  return "showOpenFilePicker" in window;
}
function ph(a) {
  if (Ea(a)) {
    var s = Object.entries(a).filter(function (u) {
      var d = hi(u, 2),
        p = d[0],
        m = d[1],
        x = !0;
      return cf(p) || (console.warn('Skipped "'.concat(p, '" because it is not a valid MIME type. Check https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types for a list of valid MIME types.')), x = !1), (!Array.isArray(m) || !m.every(uf)) && (console.warn('Skipped "'.concat(p, '" because an invalid file extension was provided.')), x = !1), x;
    }).reduce(function (u, d) {
      var p = hi(d, 2),
        m = p[0],
        x = p[1];
      return xp(xp({}, u), {}, af({}, m, x));
    }, {});
    return [{
      description: "Files",
      accept: s
    }];
  }
  return a;
}
function fh(a) {
  if (Ea(a)) return Object.entries(a).reduce(function (s, u) {
    var d = hi(u, 2),
      p = d[0],
      m = d[1];
    return [].concat(hp(s), [p], hp(m));
  }, []).filter(function (s) {
    return cf(s) || uf(s);
  }).join(",");
}
function mh(a) {
  return a instanceof DOMException && (a.name === "AbortError" || a.code === a.ABORT_ERR);
}
function hh(a) {
  return a instanceof DOMException && (a.name === "SecurityError" || a.code === a.SECURITY_ERR);
}
function cf(a) {
  return a === "audio/*" || a === "video/*" || a === "image/*" || a === "text/*" || a === "application/*" || /\w+\/[-+.\w]+/g.test(a);
}
function uf(a) {
  return /^.*\.[\w]+$/.test(a);
}
var gh = ["children"],
  xh = ["open"],
  vh = ["refKey", "role", "onKeyDown", "onFocus", "onBlur", "onClick", "onDragEnter", "onDragOver", "onDragLeave", "onDrop"],
  wh = ["refKey", "onChange", "onClick"];
function bp(a) {
  return kh(a) || bh(a) || df(a) || yh();
}
function yh() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function bh(a) {
  if (typeof Symbol < "u" && a[Symbol.iterator] != null || a["@@iterator"] != null) return Array.from(a);
}
function kh(a) {
  if (Array.isArray(a)) return Wc(a);
}
function Mc(a, s) {
  return jh(a) || Nh(a, s) || df(a, s) || Sh();
}
function Sh() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function df(a, s) {
  if (a) {
    if (typeof a == "string") return Wc(a, s);
    var u = Object.prototype.toString.call(a).slice(8, -1);
    if (u === "Object" && a.constructor && (u = a.constructor.name), u === "Map" || u === "Set") return Array.from(a);
    if (u === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(u)) return Wc(a, s);
  }
}
function Wc(a, s) {
  (s == null || s > a.length) && (s = a.length);
  for (var u = 0, d = new Array(s); u < s; u++) d[u] = a[u];
  return d;
}
function Nh(a, s) {
  var u = a == null ? null : typeof Symbol < "u" && a[Symbol.iterator] || a["@@iterator"];
  if (u != null) {
    var d = [],
      p = !0,
      m = !1,
      x,
      b;
    try {
      for (u = u.call(a); !(p = (x = u.next()).done) && (d.push(x.value), !(s && d.length === s)); p = !0);
    } catch (D) {
      m = !0, b = D;
    } finally {
      try {
        !p && u.return != null && u.return();
      } finally {
        if (m) throw b;
      }
    }
    return d;
  }
}
function jh(a) {
  if (Array.isArray(a)) return a;
}
function kp(a, s) {
  var u = Object.keys(a);
  if (Object.getOwnPropertySymbols) {
    var d = Object.getOwnPropertySymbols(a);
    s && (d = d.filter(function (p) {
      return Object.getOwnPropertyDescriptor(a, p).enumerable;
    })), u.push.apply(u, d);
  }
  return u;
}
function gt(a) {
  for (var s = 1; s < arguments.length; s++) {
    var u = arguments[s] != null ? arguments[s] : {};
    s % 2 ? kp(Object(u), !0).forEach(function (d) {
      Hc(a, d, u[d]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(a, Object.getOwnPropertyDescriptors(u)) : kp(Object(u)).forEach(function (d) {
      Object.defineProperty(a, d, Object.getOwnPropertyDescriptor(u, d));
    });
  }
  return a;
}
function Hc(a, s, u) {
  return s in a ? Object.defineProperty(a, s, {
    value: u,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : a[s] = u, a;
}
function $l(a, s) {
  if (a == null) return {};
  var u = Eh(a, s),
    d,
    p;
  if (Object.getOwnPropertySymbols) {
    var m = Object.getOwnPropertySymbols(a);
    for (p = 0; p < m.length; p++) d = m[p], !(s.indexOf(d) >= 0) && Object.prototype.propertyIsEnumerable.call(a, d) && (u[d] = a[d]);
  }
  return u;
}
function Eh(a, s) {
  if (a == null) return {};
  var u = {},
    d = Object.keys(a),
    p,
    m;
  for (m = 0; m < d.length; m++) p = d[m], !(s.indexOf(p) >= 0) && (u[p] = a[p]);
  return u;
}
var Zc = M.forwardRef(function (a, s) {
  var u = a.children,
    d = $l(a, gh),
    p = ff(d),
    m = p.open,
    x = $l(p, xh);
  return M.useImperativeHandle(s, function () {
    return {
      open: m
    };
  }, [m]), ym.createElement(M.Fragment, null, u(gt(gt({}, x), {}, {
    open: m
  })));
});
Zc.displayName = "Dropzone";
var pf = {
  disabled: !1,
  getFilesFromEvent: Im,
  maxSize: 1 / 0,
  minSize: 0,
  multiple: !0,
  maxFiles: 0,
  preventDropOnDocument: !0,
  noClick: !1,
  noKeyboard: !1,
  noDrag: !1,
  noDragEventsBubbling: !1,
  validator: null,
  useFsAccessApi: !1,
  autoFocus: !1
};
Zc.defaultProps = pf;
Zc.propTypes = {
  children: lt.func,
  accept: lt.objectOf(lt.arrayOf(lt.string)),
  multiple: lt.bool,
  preventDropOnDocument: lt.bool,
  noClick: lt.bool,
  noKeyboard: lt.bool,
  noDrag: lt.bool,
  noDragEventsBubbling: lt.bool,
  minSize: lt.number,
  maxSize: lt.number,
  maxFiles: lt.number,
  disabled: lt.bool,
  getFilesFromEvent: lt.func,
  onFileDialogCancel: lt.func,
  onFileDialogOpen: lt.func,
  useFsAccessApi: lt.bool,
  autoFocus: lt.bool,
  onDragEnter: lt.func,
  onDragLeave: lt.func,
  onDragOver: lt.func,
  onDrop: lt.func,
  onDropAccepted: lt.func,
  onDropRejected: lt.func,
  onError: lt.func,
  validator: lt.func
};
var Gc = {
  isFocused: !1,
  isFileDialogActive: !1,
  isDragActive: !1,
  isDragAccept: !1,
  isDragReject: !1,
  isDragGlobal: !1,
  acceptedFiles: [],
  fileRejections: []
};
function ff() {
  var a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {},
    s = gt(gt({}, pf), a),
    u = s.accept,
    d = s.disabled,
    p = s.getFilesFromEvent,
    m = s.maxSize,
    x = s.minSize,
    b = s.multiple,
    D = s.maxFiles,
    j = s.onDragEnter,
    E = s.onDragLeave,
    R = s.onDragOver,
    C = s.onDrop,
    J = s.onDropAccepted,
    pe = s.onDropRejected,
    oe = s.onFileDialogCancel,
    K = s.onFileDialogOpen,
    z = s.useFsAccessApi,
    Q = s.autoFocus,
    B = s.preventDropOnDocument,
    $ = s.noClick,
    ie = s.noKeyboard,
    Y = s.noDrag,
    ne = s.noDragEventsBubbling,
    Z = s.onError,
    fe = s.validator,
    le = M.useMemo(function () {
      return fh(u);
    }, [u]),
    H = M.useMemo(function () {
      return ph(u);
    }, [u]),
    U = M.useMemo(function () {
      return typeof K == "function" ? K : Sp;
    }, [K]),
    W = M.useMemo(function () {
      return typeof oe == "function" ? oe : Sp;
    }, [oe]),
    q = M.useRef(null),
    se = M.useRef(null),
    de = M.useReducer(Ch, Gc),
    ge = Mc(de, 2),
    A = ge[0],
    G = ge[1],
    re = A.isFocused,
    y = A.isFileDialogActive,
    _ = M.useRef(typeof window < "u" && window.isSecureContext && z && dh()),
    Ne = function () {
      !_.current && y && setTimeout(function () {
        if (se.current) {
          var Re = se.current.files;
          Re.length || (G({
            type: "closeDialog"
          }), W());
        }
      }, 300);
    };
  M.useEffect(function () {
    return window.addEventListener("focus", Ne, !1), function () {
      window.removeEventListener("focus", Ne, !1);
    };
  }, [se, y, W, _]);
  var ue = M.useRef([]),
    ke = M.useRef([]),
    Se = function (Re) {
      q.current && q.current.contains(Re.target) || (Re.preventDefault(), ue.current = []);
    };
  M.useEffect(function () {
    return B && (document.addEventListener("dragover", yp, !1), document.addEventListener("drop", Se, !1)), function () {
      B && (document.removeEventListener("dragover", yp), document.removeEventListener("drop", Se));
    };
  }, [q, B]), M.useEffect(function () {
    var he = function (Nt) {
        ke.current = [].concat(bp(ke.current), [Nt.target]), di(Nt) && G({
          isDragGlobal: !0,
          type: "setDragGlobal"
        });
      },
      Re = function (Nt) {
        ke.current = ke.current.filter(function (vt) {
          return vt !== Nt.target && vt !== null;
        }), !(ke.current.length > 0) && G({
          isDragGlobal: !1,
          type: "setDragGlobal"
        });
      },
      Ke = function () {
        ke.current = [], G({
          isDragGlobal: !1,
          type: "setDragGlobal"
        });
      },
      qe = function () {
        ke.current = [], G({
          isDragGlobal: !1,
          type: "setDragGlobal"
        });
      };
    return document.addEventListener("dragenter", he, !1), document.addEventListener("dragleave", Re, !1), document.addEventListener("dragend", Ke, !1), document.addEventListener("drop", qe, !1), function () {
      document.removeEventListener("dragenter", he), document.removeEventListener("dragleave", Re), document.removeEventListener("dragend", Ke), document.removeEventListener("drop", qe);
    };
  }, [q]), M.useEffect(function () {
    return !d && Q && q.current && q.current.focus(), function () {};
  }, [q, Q, d]);
  var Ce = M.useCallback(function (he) {
      Z ? Z(he) : console.error(he);
    }, [Z]),
    ze = M.useCallback(function (he) {
      he.preventDefault(), he.persist(), Pt(he), ue.current = [].concat(bp(ue.current), [he.target]), di(he) && Promise.resolve(p(he)).then(function (Re) {
        if (!(Bl(he) && !ne)) {
          var Ke = Re.length,
            qe = Ke > 0 && lh({
              files: Re,
              accept: le,
              minSize: x,
              maxSize: m,
              multiple: b,
              maxFiles: D,
              validator: fe
            }),
            at = Ke > 0 && !qe;
          G({
            isDragAccept: qe,
            isDragReject: at,
            isDragActive: !0,
            type: "setDraggedFiles"
          }), j && j(he);
        }
      }).catch(function (Re) {
        return Ce(Re);
      });
    }, [p, j, Ce, ne, le, x, m, b, D, fe]),
    We = M.useCallback(function (he) {
      he.preventDefault(), he.persist(), Pt(he);
      var Re = di(he);
      if (Re && he.dataTransfer) try {
        he.dataTransfer.dropEffect = "copy";
      } catch {}
      return Re && R && R(he), !1;
    }, [R, ne]),
    rt = M.useCallback(function (he) {
      he.preventDefault(), he.persist(), Pt(he);
      var Re = ue.current.filter(function (qe) {
          return q.current && q.current.contains(qe);
        }),
        Ke = Re.indexOf(he.target);
      Ke !== -1 && Re.splice(Ke, 1), ue.current = Re, !(Re.length > 0) && (G({
        type: "setDraggedFiles",
        isDragActive: !1,
        isDragAccept: !1,
        isDragReject: !1
      }), di(he) && E && E(he));
    }, [q, E, ne]),
    $t = M.useCallback(function (he, Re) {
      var Ke = [],
        qe = [];
      he.forEach(function (at) {
        var Nt = lf(at, le),
          vt = Mc(Nt, 2),
          na = vt[0],
          nn = vt[1],
          Ye = sf(at, x, m),
          Rt = Mc(Ye, 2),
          Un = Rt[0],
          Xt = Rt[1],
          ot = fe ? fe(at) : null;
        if (na && Un && !ot) Ke.push(at);else {
          var rn = [nn, Xt];
          ot && (rn = rn.concat(ot)), qe.push({
            file: at,
            errors: rn.filter(function (Ut) {
              return Ut;
            })
          });
        }
      }), (!b && Ke.length > 1 || b && D >= 1 && Ke.length > D) && (Ke.forEach(function (at) {
        qe.push({
          file: at,
          errors: [oh]
        });
      }), Ke.splice(0)), G({
        acceptedFiles: Ke,
        fileRejections: qe,
        isDragReject: qe.length > 0,
        type: "setFiles"
      }), C && C(Ke, qe, Re), qe.length > 0 && pe && pe(qe, Re), Ke.length > 0 && J && J(Ke, Re);
    }, [G, b, le, x, m, D, C, J, pe, fe]),
    An = M.useCallback(function (he) {
      he.preventDefault(), he.persist(), Pt(he), ue.current = [], di(he) && Promise.resolve(p(he)).then(function (Re) {
        Bl(he) && !ne || $t(Re, he);
      }).catch(function (Re) {
        return Ce(Re);
      }), G({
        type: "reset"
      });
    }, [p, $t, Ce, ne]),
    Vt = M.useCallback(function () {
      if (_.current) {
        G({
          type: "openDialog"
        }), U();
        var he = {
          multiple: b,
          types: H
        };
        window.showOpenFilePicker(he).then(function (Re) {
          return p(Re);
        }).then(function (Re) {
          $t(Re, null), G({
            type: "closeDialog"
          });
        }).catch(function (Re) {
          mh(Re) ? (W(Re), G({
            type: "closeDialog"
          })) : hh(Re) ? (_.current = !1, se.current ? (se.current.value = null, se.current.click()) : Ce(new Error("Cannot open the file picker because the https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API is not supported and no <input> was provided."))) : Ce(Re);
        });
        return;
      }
      se.current && (G({
        type: "openDialog"
      }), U(), se.current.value = null, se.current.click());
    }, [G, U, W, z, $t, Ce, H, b]),
    hr = M.useCallback(function (he) {
      !q.current || !q.current.isEqualNode(he.target) || (he.key === " " || he.key === "Enter" || he.keyCode === 32 || he.keyCode === 13) && (he.preventDefault(), Vt());
    }, [q, Vt]),
    gr = M.useCallback(function () {
      G({
        type: "focus"
      });
    }, []),
    ta = M.useCallback(function () {
      G({
        type: "blur"
      });
    }, []),
    Cn = M.useCallback(function () {
      $ || (uh() ? setTimeout(Vt, 0) : Vt());
    }, [$, Vt]),
    _n = function (Re) {
      return d ? null : Re;
    },
    Bn = function (Re) {
      return ie ? null : _n(Re);
    },
    ut = function (Re) {
      return Y ? null : _n(Re);
    },
    Pt = function (Re) {
      ne && Re.stopPropagation();
    },
    $n = M.useMemo(function () {
      return function () {
        var he = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {},
          Re = he.refKey,
          Ke = Re === void 0 ? "ref" : Re,
          qe = he.role,
          at = he.onKeyDown,
          Nt = he.onFocus,
          vt = he.onBlur,
          na = he.onClick,
          nn = he.onDragEnter,
          Ye = he.onDragOver,
          Rt = he.onDragLeave,
          Un = he.onDrop,
          Xt = $l(he, vh);
        return gt(gt(Hc({
          onKeyDown: Bn(fr(at, hr)),
          onFocus: Bn(fr(Nt, gr)),
          onBlur: Bn(fr(vt, ta)),
          onClick: _n(fr(na, Cn)),
          onDragEnter: ut(fr(nn, ze)),
          onDragOver: ut(fr(Ye, We)),
          onDragLeave: ut(fr(Rt, rt)),
          onDrop: ut(fr(Un, An)),
          role: typeof qe == "string" && qe !== "" ? qe : "presentation"
        }, Ke, q), !d && !ie ? {
          tabIndex: 0
        } : {}), Xt);
      };
    }, [q, hr, gr, ta, Cn, ze, We, rt, An, ie, Y, d]),
    Dn = M.useCallback(function (he) {
      he.stopPropagation();
    }, []),
    Da = M.useMemo(function () {
      return function () {
        var he = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {},
          Re = he.refKey,
          Ke = Re === void 0 ? "ref" : Re,
          qe = he.onChange,
          at = he.onClick,
          Nt = $l(he, wh),
          vt = Hc({
            accept: le,
            multiple: b,
            type: "file",
            style: {
              border: 0,
              clip: "rect(0, 0, 0, 0)",
              clipPath: "inset(50%)",
              height: "1px",
              margin: "0 -1px -1px 0",
              overflow: "hidden",
              padding: 0,
              position: "absolute",
              width: "1px",
              whiteSpace: "nowrap"
            },
            onChange: _n(fr(qe, An)),
            onClick: _n(fr(at, Dn)),
            tabIndex: -1
          }, Ke, se);
        return gt(gt({}, vt), Nt);
      };
    }, [se, u, b, An, d]);
  return gt(gt({}, A), {}, {
    isFocused: re && !d,
    getRootProps: $n,
    getInputProps: Da,
    rootRef: q,
    inputRef: se,
    open: _n(Vt)
  });
}
function Ch(a, s) {
  switch (s.type) {
    case "focus":
      return gt(gt({}, a), {}, {
        isFocused: !0
      });
    case "blur":
      return gt(gt({}, a), {}, {
        isFocused: !1
      });
    case "openDialog":
      return gt(gt({}, Gc), {}, {
        isFileDialogActive: !0
      });
    case "closeDialog":
      return gt(gt({}, a), {}, {
        isFileDialogActive: !1
      });
    case "setDraggedFiles":
      return gt(gt({}, a), {}, {
        isDragActive: s.isDragActive,
        isDragAccept: s.isDragAccept,
        isDragReject: s.isDragReject
      });
    case "setFiles":
      return gt(gt({}, a), {}, {
        acceptedFiles: s.acceptedFiles,
        fileRejections: s.fileRejections,
        isDragReject: s.isDragReject
      });
    case "setDragGlobal":
      return gt(gt({}, a), {}, {
        isDragGlobal: s.isDragGlobal
      });
    case "reset":
      return gt({}, Gc);
    default:
      return a;
  }
}
function Sp() {}
const Np = 20;
function Ol() {
  return new Promise(a => setTimeout(a, 0));
}
const _h = new Uint8Array([254, 255, 255, 255, 255, 255, 255, 255]),
  Dh = new DataView(_h.buffer).getFloat64(0, !0);
function jp(a) {
  return a <= Dh + 1e200;
}
const Th = {
    "UTF-8": "utf-8",
    UTF8: "utf-8",
    "UTF-16": "utf-16le",
    UTF16: "utf-16le",
    "UTF-16LE": "utf-16le",
    "WINDOWS-1250": "windows-1250",
    WINDOWS_1250: "windows-1250",
    1250: "windows-1250",
    "WINDOWS-1251": "windows-1251",
    WINDOWS_1251: "windows-1251",
    1251: "windows-1251",
    "WINDOWS-1252": "windows-1252",
    WINDOWS_1252: "windows-1252",
    1252: "windows-1252",
    "WINDOWS-1253": "windows-1253",
    WINDOWS_1253: "windows-1253",
    1253: "windows-1253",
    "WINDOWS-1254": "windows-1254",
    WINDOWS_1254: "windows-1254",
    1254: "windows-1254",
    "WINDOWS-1255": "windows-1255",
    WINDOWS_1255: "windows-1255",
    1255: "windows-1255",
    "WINDOWS-1256": "windows-1256",
    WINDOWS_1256: "windows-1256",
    1256: "windows-1256",
    "WINDOWS-1257": "windows-1257",
    WINDOWS_1257: "windows-1257",
    1257: "windows-1257",
    "WINDOWS-1258": "windows-1258",
    WINDOWS_1258: "windows-1258",
    1258: "windows-1258",
    "WINDOWS-874": "windows-874",
    WINDOWS_874: "windows-874",
    874: "windows-874",
    "TIS-620": "windows-874",
    TIS620: "windows-874",
    "ISO-8859-11": "windows-874",
    "SHIFT-JIS": "shift_jis",
    SHIFT_JIS: "shift_jis",
    SHIFTJIS: "shift_jis",
    SJIS: "shift_jis",
    MS_KANJI: "shift_jis",
    "WINDOWS-31J": "shift_jis",
    WINDOWS31J: "shift_jis",
    CP932: "shift_jis",
    MS932: "shift_jis",
    932: "shift_jis",
    GBK: "gbk",
    CP936: "gbk",
    MS936: "gbk",
    936: "gbk",
    GB2312: "gbk",
    "GB-2312": "gbk",
    GB_2312: "gbk",
    GB18030: "gb18030",
    "GB-18030": "gb18030",
    GB_18030: "gb18030",
    BIG5: "big5",
    "BIG-5": "big5",
    BIG_5: "big5",
    CP950: "big5",
    MS950: "big5",
    950: "big5",
    "EUC-KR": "euc-kr",
    EUC_KR: "euc-kr",
    EUCKR: "euc-kr",
    CP949: "euc-kr",
    MS949: "euc-kr",
    UHC: "euc-kr",
    949: "euc-kr",
    "ISO-8859-1": "windows-1252",
    "ISO8859-1": "windows-1252",
    LATIN1: "windows-1252",
    "ISO-8859-15": "windows-1252",
    "ISO8859-15": "windows-1252",
    MACINTOSH: "macintosh",
    "MAC-ROMAN": "macintosh",
    MACROMAN: "macintosh"
  },
  mf = "windows-874",
  Lh = [mf, "utf-8", "windows-1252"],
  Ic = new Map();
function Vl(a) {
  const s = a.trim().toLowerCase();
  if (!s) return !1;
  const u = Ic.get(s);
  if (u != null) return u;
  try {
    return new TextDecoder(s), Ic.set(s, !0), !0;
  } catch {
    return Ic.set(s, !1), !1;
  }
}
function Ep(a) {
  const s = a.trim(),
    u = s.toUpperCase().replace(/\s+/g, ""),
    d = Th[u];
  if (d && Vl(d)) return d;
  const p = [s.toLowerCase(), s.toLowerCase().replace(/_/g, "-")];
  for (const m of p) if (m && Vl(m)) return m;
  if (/^\d+$/.test(u)) {
    const m = `windows-${u}`;
    if (Vl(m)) return m;
  }
  return mf;
}
function Ph(a, s) {
  return new TextDecoder(s).decode(a).replace(/\0/g, "").trimEnd();
}
function eu(a, s) {
  const u = [s, ...Lh],
    d = new Set();
  for (const p of u) {
    const m = p.trim().toLowerCase();
    if (!(!m || d.has(m) || !Vl(m))) {
      d.add(m);
      try {
        return Ph(a, m);
      } catch {
        continue;
      }
    }
  }
  return String.fromCharCode(...a).replace(/\0/g, "").trimEnd();
}
function pi(a, s, u) {
  return eu(a.subarray(0, Math.min(s, a.length)), u);
}
class hf {
  v;
  o = 0;
  le = !0;
  enc = "windows-874";
  constructor(s) {
    this.v = new DataView(s);
  }
  i32() {
    const s = this.v.getInt32(this.o, this.le);
    return this.o += 4, s;
  }
  u8() {
    return this.v.getUint8(this.o++);
  }
  f64() {
    const s = this.v.getFloat64(this.o, this.le);
    return this.o += 8, s;
  }
  u64() {
    const s = this.v.getUint32(this.o, !0),
      u = this.v.getUint32(this.o + 4, !0);
    return this.o += 8, u * 4294967296 + s;
  }
  rawBytes(s) {
    const u = new Uint8Array(this.v.buffer, this.o, s);
    return this.o += s, new Uint8Array(u);
  }
  ascii(s) {
    const u = this.rawBytes(s);
    let d = "";
    for (const p of u) p !== 0 && (d += String.fromCharCode(p));
    return d.trimEnd();
  }
  str(s) {
    return eu(this.rawBytes(s), this.enc);
  }
  skip(s) {
    this.o += s;
  }
  peek32() {
    return this.v.getInt32(this.o, this.le);
  }
  get left() {
    return this.v.byteLength - this.o;
  }
}
function Rh(a) {
  return Math.ceil(a / 4) * 4;
}
function Fh(a) {
  const s = new Set();
  for (let u = 0; u < a.length; u++) {
    if (s.has(u)) continue;
    const d = a[u]._veryLongSegments;
    if (!d || d <= 1) continue;
    let p = 0;
    for (let m = u + 1; m < a.length && p < d - 1; m++) s.has(m) || (a[u].slotCount += a[m].slotCount, s.add(m), p += 1);
  }
  return s.size === 0 ? a : a.filter((u, d) => !s.has(d));
}
async function Mh(a, s) {
  const u = a.u64(),
    d = a.u64();
  a.u64();
  const p = Math.floor((u - a.o) / 16),
    m = [];
  for (let D = 0; D < p; D++) {
    const j = a.u64(),
      E = a.u64();
    m.push({
      unc: j,
      cmp: E
    });
  }
  a.o = u;
  const x = new Uint8Array(d);
  let b = 0;
  for (let D = 0; D < m.length; D++) {
    const {
        cmp: j
      } = m[D],
      E = a.rawBytes(j),
      R = new DecompressionStream("deflate"),
      C = R.writable.getWriter(),
      J = R.readable.getReader();
    C.write(E), C.close();
    let pe;
    for (; !(pe = await J.read()).done;) x.set(pe.value, b), b += pe.value.length;
    ((D + 1) % 20 === 0 || D === m.length - 1) && (s?.("cases", (D + 1) / m.length * .3), await Ol());
  }
  return new hf(x.buffer.slice(0, b));
}
async function Ih(a, s) {
  const u = a,
    d = typeof u.path == "string" && u.path.trim() ? u.path.trim() : typeof u.webkitRelativePath == "string" && u.webkitRelativePath.trim() ? u.webkitRelativePath.trim() : null,
    p = await a.arrayBuffer(),
    m = new hf(p),
    x = m.ascii(4);
  if (!x.startsWith("$FL")) throw new Error(`ไม่ใช่ไฟล์ SPSS .sav (magic="${x}")`);
  m.skip(60);
  const b = m.i32();
  m.le = b !== 3;
  const D = m.i32(),
    j = m.i32();
  m.skip(4);
  const E = m.i32(),
    R = m.f64();
  m.skip(84);
  const C = [],
    J = new Map(),
    pe = new Map(),
    oe = new Map();
  let K = 0,
    z = {},
    Q = {},
    B = "windows-874",
    $ = 0;
  e: for (;;) {
    const U = m.i32();
    switch ($++, $ % 500 === 0 && (s?.("variables", -1), await Ol()), U) {
      case 999:
        m.skip(4);
        break e;
      case 2:
        {
          const W = m.i32(),
            q = m.i32(),
            se = m.i32();
          m.skip(8);
          const de = m.ascii(8);
          let ge = "";
          if (q) {
            const A = m.i32(),
              G = m.rawBytes(A);
            m.skip(Rh(A) - A), ge = eu(G, B), pe.set(de, {
              bytes: G,
              len: A
            });
          }
          if (m.skip(Math.abs(se) * 8), K++, W === -1) {
            const A = C[C.length - 1];
            A && (A.slotCount++, J.set(K, A));
          } else {
            const A = {
              name: de,
              longName: de,
              label: ge,
              valueLabels: {},
              isString: W > 0,
              stringLength: W,
              slotCount: 1,
              dictIndex: K
            };
            C.push(A), J.set(K, A);
          }
          break;
        }
      case 3:
        {
          const W = m.i32();
          z = {}, Q = {};
          for (let q = 0; q < W; q++) {
            const se = m.rawBytes(8),
              de = new DataView(se.buffer, se.byteOffset).getFloat64(0, m.le),
              ge = m.u8(),
              A = Math.ceil((ge + 1) / 8) * 8,
              G = m.rawBytes(A - 1),
              re = pi(G, ge, B),
              y = String(Math.round(de * 1e8) / 1e8);
            z[y] = re, Q[y] = {
              bytes: G,
              len: ge
            };
          }
          break;
        }
      case 4:
        {
          const W = m.i32();
          for (let q = 0; q < W; q++) {
            const se = m.i32(),
              de = J.get(se);
            if (de) {
              Object.assign(de.valueLabels, z);
              const ge = oe.get(de.name) ?? {};
              Object.assign(ge, Q), oe.set(de.name, ge);
            }
          }
          z = {}, Q = {};
          break;
        }
      case 6:
        {
          const W = m.i32();
          m.skip(W * 80);
          break;
        }
      case 7:
        {
          const W = m.i32(),
            q = m.i32(),
            se = m.i32(),
            de = q * se;
          if (W === 13) {
            const ge = m.str(de);
            for (const A of ge.split("	")) {
              const G = A.indexOf("=");
              if (G >= 0) {
                const re = A.slice(0, G).trimEnd(),
                  y = A.slice(G + 1).replace(/\0/g, "").trimEnd(),
                  _ = C.find(Ne => Ne.name === re);
                _ && (_.longName = y);
              }
            }
          } else if (W === 14) {
            const ge = m.str(de);
            for (const A of ge.replace(/\0/g, "	").split("	")) {
              const G = A.indexOf("=");
              if (G < 0) continue;
              const re = A.slice(0, G).trimEnd(),
                y = Number(A.slice(G + 1).trim());
              if (!re || !Number.isFinite(y) || y <= 0) continue;
              const _ = C.find(Ne => Ne.name === re);
              _ && (_.stringLength = y, _._veryLongSegments = Math.ceil(y / 252));
            }
          } else if (W === 20) {
            const ge = m.rawBytes(de),
              A = new TextDecoder("ascii").decode(ge).replace(/\0/g, "").trim();
            B = Ep(A), m.enc = B;
          } else if (W === 11) {
            if (q === 4 && se >= 1) {
              const ge = m.i32();
              m.skip(de - 4);
              const A = String(ge);
              B = Ep(A), m.enc = B;
            } else m.skip(de);
          } else m.skip(de);
          break;
        }
      default:
        console.warn("Unknown SAV record type", U, "at offset", m.o);
        break e;
    }
  }
  const ie = Fh(C);
  C.length = 0, C.push(...ie);
  for (const U of C) {
    const W = pe.get(U.name);
    W && (U.label = pi(W.bytes, W.len, B));
    const q = oe.get(U.name);
    q && (U.valueLabels = Object.fromEntries(Object.entries(q).map(([se, de]) => [se, pi(de.bytes, de.len, B)])));
  }
  const Y = [];
  for (const U of C) for (let W = 0; W < U.slotCount; W++) Y.push(U);
  const ne = D > 0 ? D : Y.length,
    Z = E > 0 ? E : 1 / 0,
    fe = new Map();
  for (const U of C) fe.set(U.name, U);
  let le = m;
  j === 2 && (le = await Mh(m, s), le.le = m.le, le.enc = B);
  const H = [];
  if (j === 0) for (; le.left >= ne * 8 && H.length < Z;) {
    const U = {},
      W = {};
    for (let q = 0; q < ne; q++) {
      const se = Y[q];
      if (!se) {
        le.skip(8);
        continue;
      }
      if (se.isString) W[se.name] || (W[se.name] = []), W[se.name].push(le.rawBytes(8));else {
        const de = le.f64();
        se.name in U || (U[se.name] = jp(de) ? "" : de);
      }
    }
    for (const [q, se] of Object.entries(W)) {
      const de = Cp(se),
        ge = fe.get(q);
      U[q] = pi(de, ge?.stringLength ?? de.length, B);
    }
    H.push(U), H.length % Np === 0 && (s?.("cases", Z === 1 / 0 ? -1 : H.length / Z), await Ol());
  } else {
    const U = new Uint8Array(8).fill(32);
    let W = 0,
      q = {};
    const se = {};
    let de = !1;
    for (; !de && le.left >= 8 && H.length < Z;) {
      const ge = le.rawBytes(8);
      for (let A = 0; A < 8 && !(de || H.length >= Z); A++) {
        const G = ge[A];
        if (G === 252) {
          de = !0;
          break;
        }
        const re = Y[W];
        if (re && re.isString) {
          let y;
          if (G === 253) {
            if (le.left < 8) {
              de = !0;
              break;
            }
            y = le.rawBytes(8);
          } else if (G === 254) y = U;else {
            const _ = new ArrayBuffer(8);
            G >= 1 && G <= 251 && new DataView(_).setFloat64(0, G - R, le.le), y = new Uint8Array(_);
          }
          se[re.name] || (se[re.name] = []), se[re.name].push(y);
        } else if (re) {
          if (!(re.name in q)) if (G === 255) q[re.name] = "";else if (G === 253) {
            if (le.left < 8) {
              de = !0;
              break;
            }
            const y = le.rawBytes(8),
              _ = new DataView(y.buffer, y.byteOffset).getFloat64(0, le.le);
            q[re.name] = jp(_) ? "" : _;
          } else G >= 1 && G <= 251 ? q[re.name] = G - R : q[re.name] = 0;
        } else if (G === 253) {
          if (le.left < 8) {
            de = !0;
            break;
          }
          le.skip(8);
        }
        if (W++, W >= ne) {
          for (const [y, _] of Object.entries(se)) {
            const Ne = Cp(_),
              ue = fe.get(y);
            q[y] = pi(Ne, ue?.stringLength ?? Ne.length, B);
          }
          H.push(q), q = {};
          for (const y in se) delete se[y];
          W = 0, H.length % Np === 0 && (s?.("cases", Z === 1 / 0 ? -1 : H.length / Z), await Ol());
        }
      }
    }
  }
  return {
    variables: C,
    cases: H,
    fileName: a.name,
    fileSize: a.size,
    encoding: B,
    sourcePath: d
  };
}
function Cp(a) {
  const s = a.reduce((p, m) => p + m.length, 0),
    u = new Uint8Array(s);
  let d = 0;
  for (const p of a) u.set(p, d), d += p.length;
  return u;
}
function Oc(a, s) {
  const u = new Map();
  for (const p of s) Object.keys(p.valueLabels).length > 0 && u.set(p.name, p.valueLabels);
  const d = new Map();
  for (const p of s) p.longName && p.longName !== p.name && d.set(p.name, p.longName);
  return a.map(p => {
    const m = {};
    for (const [x, b] of Object.entries(p)) {
      const D = u.get(x);
      if (D && b !== "" && b != null) {
        const E = String(Math.round(Number(b) * 1e8) / 1e8);
        m[x] = D[E] ?? String(b);
      } else m[x] = b === "" || b == null ? "" : String(b);
      const j = d.get(x);
      j && !(j in m) && (m[j] = m[x]);
    }
    return m;
  });
}
const Oh = 250;
function Vh() {
  return new Promise(a => {
    if (typeof window < "u" && typeof window.requestAnimationFrame == "function") {
      window.requestAnimationFrame(() => a());
      return;
    }
    setTimeout(() => a(), 0);
  });
}
function Lr(a, s) {
  if (!s) return a;
  const u = a.rowTypes ?? a.rowValues.map(() => "data"),
    d = a.rowValues.map((x, b) => ({
      index: b,
      type: u[b],
      total: a.rowTotalsN[b] ?? 0
    })).filter(x => x.type === "stat" || x.total > 0).map(x => x.index);
  if (d.length === a.rowValues.length) return a;
  const p = new Map(d.map((x, b) => [x, b])),
    m = a.rowSectionBases?.map((x, b, D) => {
      const j = (D[b + 1]?.startIndex ?? a.rowValues.length) - 1,
        E = d.filter(R => R >= x.startIndex && R <= j);
      return E.length === 0 ? null : {
        ...x,
        startIndex: p.get(E[0]) ?? 0
      };
    }).filter(x => x !== null);
  return {
    ...a,
    rowValues: d.map(x => a.rowValues[x]),
    rowTypes: d.map(x => u[x]),
    rowPaths: a.rowPaths ? d.map(x => a.rowPaths[x]) : a.rowPaths,
    counts: d.map(x => a.counts[x]),
    rowTotalsN: d.map(x => a.rowTotalsN[x]),
    rowSectionBases: m
  };
}
function zh(a, s, u, d, p) {
  const m = p === "row" ? d.rowTotalsN[s] || 1 : p === "column" ? d.colTotalsN[u] || 1 : d.grandTotal || 1;
  return m > 0 ? a / m : 0;
}
function Ah(a, s, u, d, p, m) {
  const {
      rowVar: x,
      colVar: b
    } = s,
    D = a.filter(B => {
      const $ = B[x],
        ie = B[b];
      return $ != null && $ !== "" && ie != null && ie !== "";
    });
  if (D.length === 0) throw new Error(`ไม่มีข้อมูลสำหรับตัวแปร "${x}" × "${b}"`);
  const j = new Map(),
    E = new Set(),
    R = new Set();
  for (const B of D) {
    const $ = String(B[x]),
      ie = String(B[b]);
    E.add($), R.add(ie), j.set($ + "\0" + ie, (j.get($ + "\0" + ie) ?? 0) + 1);
  }
  function C(B, $) {
    if (B && B.length > 0) {
      const ie = [...$].filter(Y => !B.includes(Y));
      return [...B, ...ie];
    }
    return [...$];
  }
  const J = C(p, E),
    pe = C(m, R),
    oe = D.length,
    K = J.map(B => pe.reduce(($, ie) => $ + (j.get(B + "\0" + ie) ?? 0), 0)),
    z = pe.map(B => J.reduce(($, ie) => $ + (j.get(ie + "\0" + B) ?? 0), 0)),
    Q = J.map(B => pe.map($ => j.get(B + "\0" + $) ?? 0));
  return {
    rowVar: x,
    colVar: b,
    rowLabel: u ?? x,
    colLabel: d ?? b,
    rowValues: J,
    colValues: pe,
    rowTypes: J.map(() => "data"),
    rowLevelLabels: [u ?? x],
    colLevelLabels: [d ?? b],
    rowPaths: J.map(B => [B]),
    colPaths: pe.map(B => [B]),
    counts: Q,
    rowTotalsN: K,
    colTotalsN: z,
    grandTotal: oe
  };
}
async function Bh(a, s, u, d, p, m) {
  const {
      rowVar: x,
      colVar: b
    } = s,
    D = new Map(),
    j = new Set(),
    E = new Set();
  let R = 0;
  for (let Q = 0; Q < a.length; Q++) {
    Q > 0 && Q % Oh === 0 && (await Vh());
    const B = a[Q],
      $ = B[x],
      ie = B[b];
    if ($ == null || $ === "" || ie == null || ie === "") continue;
    const Y = String($),
      ne = String(ie);
    j.add(Y), E.add(ne), D.set(Y + "\0" + ne, (D.get(Y + "\0" + ne) ?? 0) + 1), R += 1;
  }
  if (R === 0) throw new Error(`เนเธกเนเธกเธตเธเนเธญเธกเธนเธฅเธชเธณเธซเธฃเธฑเธเธ•เธฑเธงเนเธเธฃ "${x}" ร— "${b}"`);
  function C(Q, B) {
    if (Q && Q.length > 0) {
      const $ = [...B].filter(ie => !Q.includes(ie));
      return [...Q, ...$];
    }
    return [...B];
  }
  const J = C(p, j),
    pe = C(m, E),
    oe = J.map(Q => pe.reduce((B, $) => B + (D.get(Q + "\0" + $) ?? 0), 0)),
    K = pe.map(Q => J.reduce((B, $) => B + (D.get($ + "\0" + Q) ?? 0), 0)),
    z = J.map(Q => pe.map(B => D.get(Q + "\0" + B) ?? 0));
  return {
    rowVar: x,
    colVar: b,
    rowLabel: u ?? x,
    colLabel: d ?? b,
    rowValues: J,
    colValues: pe,
    rowTypes: J.map(() => "data"),
    rowLevelLabels: [u ?? x],
    colLevelLabels: [d ?? b],
    rowPaths: J.map(Q => [Q]),
    colPaths: pe.map(Q => [Q]),
    counts: z,
    rowTotalsN: oe,
    colTotalsN: K,
    grandTotal: R
  };
}
function $h(a) {
  const s = Math.max(0, Math.round(a / 1e3)),
    u = Math.floor(s / 60),
    d = s % 60;
  return u <= 0 ? `${d} sec` : `${u} min ${d} sec`;
}
function Uh(a) {
  const s = Math.max(0, Math.floor(a / 1e3 / 5) * 5),
    u = Math.floor(s / 60),
    d = s - u * 60;
  return u <= 0 ? `${d} sec` : d === 0 ? `${u} min` : `${u} min ${d} sec`;
}
function _p(a) {
  return a.trim().toLowerCase();
}
function Wh(a) {
  return a.operator === "in" || a.operator === "not_in" ? a.values.length > 0 : a.operator === "between" ? a.value.trim() !== "" && a.secondaryValue.trim() !== "" : a.operator === "gt" || a.operator === "gte" || a.operator === "lt" || a.operator === "lte" || a.operator === "contains" || a.operator === "not_contains" ? a.value.trim() !== "" : !0;
}
function Hh(a, s, u, d) {
  if (!Wh(a)) return !0;
  if (a.operator === "is_blank") return d.getTextValue(a.variableName, s, u).trim() === "";
  if (a.operator === "not_blank") return d.getTextValue(a.variableName, s, u).trim() !== "";
  if (a.operator === "in" || a.operator === "not_in") {
    const j = new Set(a.values),
      R = d.getValueKeys(a.variableName, s, u).some(C => j.has(C));
    return a.operator === "in" ? R : !R;
  }
  if (a.operator === "contains" || a.operator === "not_contains") {
    const j = _p(d.getTextValue(a.variableName, s, u)),
      E = _p(a.value),
      R = E === "" ? !0 : j.includes(E);
    return a.operator === "contains" ? R : !R;
  }
  const p = d.getNumericValue(a.variableName, s, u);
  if (p == null) return !1;
  const m = Number(a.value),
    x = Number(a.secondaryValue);
  if ((a.operator === "gt" || a.operator === "gte" || a.operator === "lt" || a.operator === "lte") && !Number.isFinite(m) || a.operator === "between" && (!Number.isFinite(m) || !Number.isFinite(x))) return !0;
  if (a.operator === "gt") return p > m;
  if (a.operator === "gte") return p >= m;
  if (a.operator === "lt") return p < m;
  if (a.operator === "lte") return p <= m;
  const [b, D] = m <= x ? [m, x] : [x, m];
  return p >= b && p <= D;
}
function Gh(a, s, u, d) {
  if (a.conditions.length === 0) return !0;
  const p = a.conditions.map(m => Hh(m, s, u, d));
  return a.join === "all" ? p.every(Boolean) : p.some(Boolean);
}
function Kh(a, s, u, d) {
  if (!a || a.groups.length === 0) return !0;
  const p = a.groups.filter(x => x.conditions.length > 0);
  if (p.length === 0) return !0;
  const m = p.map(x => Gh(x, s, u, d));
  return a.rootJoin === "all" ? m.every(Boolean) : m.some(Boolean);
}
const qh = "crossify-file-handles",
  Qh = 1,
  So = "sav-handles";
function gf() {
  return new Promise((a, s) => {
    const u = indexedDB.open(qh, Qh);
    u.onerror = () => s(u.error ?? new Error("Failed to open IndexedDB")), u.onupgradeneeded = () => {
      const d = u.result;
      if (!d.objectStoreNames.contains(So)) {
        const p = d.createObjectStore(So, {
          keyPath: "id"
        });
        p.createIndex("fileName", "fileName", {
          unique: !1
        }), p.createIndex("updatedAt", "updatedAt", {
          unique: !1
        });
      }
    }, u.onsuccess = () => a(u.result);
  });
}
function Jh(a) {
  return a.filePath?.trim() ? `path:${a.filePath.trim().toLowerCase()}` : `name:${a.fileName.trim().toLowerCase()}`;
}
async function Xh() {
  const a = await gf();
  return new Promise((s, u) => {
    const m = a.transaction(So, "readonly").objectStore(So).getAll();
    m.onerror = () => u(m.error ?? new Error("Failed to read stored file handles")), m.onsuccess = () => s(m.result ?? []);
  }).finally(() => a.close());
}
async function Yh(a, s) {
  if (!a.fileName.trim()) return;
  const u = await gf(),
    d = {
      id: Jh(a),
      fileName: a.fileName.trim(),
      filePath: a.filePath?.trim() || void 0,
      updatedAt: Date.now(),
      handle: s
    };
  await new Promise((p, m) => {
    const x = u.transaction(So, "readwrite");
    x.oncomplete = () => p(), x.onerror = () => m(x.error ?? new Error("Failed to save file handle")), x.objectStore(So).put(d);
  }).finally(() => u.close());
}
async function Zh(a) {
  const s = a.filePath?.trim().toLowerCase(),
    u = a.fileName.trim().toLowerCase(),
    d = await Xh(),
    p = s ? d.find(x => x.filePath?.trim().toLowerCase() === s) : null;
  return p ? p.handle : d.filter(x => x.fileName.trim().toLowerCase() === u).sort((x, b) => b.updatedAt - x.updatedAt)[0]?.handle ?? null;
}
var zl = {
    exports: {}
  },
  eg = zl.exports,
  Dp;
function tg() {
  return Dp || (Dp = 1, function (a, s) {
    (function (u, d) {
      d();
    })(eg, function () {
      function u(j, E) {
        return typeof E > "u" ? E = {
          autoBom: !1
        } : typeof E != "object" && (console.warn("Deprecated: Expected third argument to be a object"), E = {
          autoBom: !E
        }), E.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(j.type) ? new Blob(["\uFEFF", j], {
          type: j.type
        }) : j;
      }
      function d(j, E, R) {
        var C = new XMLHttpRequest();
        C.open("GET", j), C.responseType = "blob", C.onload = function () {
          D(C.response, E, R);
        }, C.onerror = function () {
          console.error("could not download file");
        }, C.send();
      }
      function p(j) {
        var E = new XMLHttpRequest();
        E.open("HEAD", j, !1);
        try {
          E.send();
        } catch {}
        return 200 <= E.status && 299 >= E.status;
      }
      function m(j) {
        try {
          j.dispatchEvent(new MouseEvent("click"));
        } catch {
          var E = document.createEvent("MouseEvents");
          E.initMouseEvent("click", !0, !0, window, 0, 0, 0, 80, 20, !1, !1, !1, !1, 0, null), j.dispatchEvent(E);
        }
      }
      var x = typeof window == "object" && window.window === window ? window : typeof self == "object" && self.self === self ? self : typeof Ll == "object" && Ll.global === Ll ? Ll : void 0,
        b = x.navigator && /Macintosh/.test(navigator.userAgent) && /AppleWebKit/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent),
        D = x.saveAs || (typeof window != "object" || window !== x ? function () {} : "download" in HTMLAnchorElement.prototype && !b ? function (j, E, R) {
          var C = x.URL || x.webkitURL,
            J = document.createElement("a");
          E = E || j.name || "download", J.download = E, J.rel = "noopener", typeof j == "string" ? (J.href = j, J.origin === location.origin ? m(J) : p(J.href) ? d(j, E, R) : m(J, J.target = "_blank")) : (J.href = C.createObjectURL(j), setTimeout(function () {
            C.revokeObjectURL(J.href);
          }, 4e4), setTimeout(function () {
            m(J);
          }, 0));
        } : "msSaveOrOpenBlob" in navigator ? function (j, E, R) {
          if (E = E || j.name || "download", typeof j != "string") navigator.msSaveOrOpenBlob(u(j, R), E);else if (p(j)) d(j, E, R);else {
            var C = document.createElement("a");
            C.href = j, C.target = "_blank", setTimeout(function () {
              m(C);
            });
          }
        } : function (j, E, R, C) {
          if (C = C || open("", "_blank"), C && (C.document.title = C.document.body.innerText = "downloading..."), typeof j == "string") return d(j, E, R);
          var J = j.type === "application/octet-stream",
            pe = /constructor/i.test(x.HTMLElement) || x.safari,
            oe = /CriOS\/[\d]+/.test(navigator.userAgent);
          if ((oe || J && pe || b) && typeof FileReader < "u") {
            var K = new FileReader();
            K.onloadend = function () {
              var B = K.result;
              B = oe ? B : B.replace(/^data:[^;]*;/, "data:attachment/file;"), C ? C.location.href = B : location = B, C = null;
            }, K.readAsDataURL(j);
          } else {
            var z = x.URL || x.webkitURL,
              Q = z.createObjectURL(j);
            C ? C.location = Q : location.href = Q, C = null, setTimeout(function () {
              z.revokeObjectURL(Q);
            }, 4e4);
          }
        });
      x.saveAs = D.saveAs = D, a.exports = D;
    });
  }(zl)), zl.exports;
}
var ng = tg();
async function xf() {
  return (await Yc(() => import("./exceljs.min-D_N-FMmF.js").then(s => s.e), __vite__mapDeps([0, 1]))).default;
}
function Dr(a) {
  a.height = 18, a.eachCell(s => {
    s.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "FF1F4E78"
      }
    }, s.font = {
      bold: !0,
      color: {
        argb: "FFFFFFFF"
      },
      size: 11,
      name: "Calibri"
    }, s.alignment = {
      horizontal: "center",
      vertical: "middle"
    }, s.border = {
      top: {
        style: "thin"
      },
      left: {
        style: "thin"
      },
      bottom: {
        style: "thin"
      },
      right: {
        style: "thin"
      }
    };
  });
}
function Tr(a, s) {
  a.height = 16, a.eachCell(u => {
    u.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: s ? "FFEBF3FB" : "FFFFFFFF"
      }
    }, u.font = {
      size: 10,
      name: "Calibri"
    }, u.border = {
      top: {
        style: "thin"
      },
      left: {
        style: "thin"
      },
      bottom: {
        style: "thin"
      },
      right: {
        style: "thin"
      }
    };
  });
}
function rg(a) {
  const s = [],
    u = [];
  return Object.entries(a).forEach(([d, p]) => {
    const m = p ?? {};
    Object.entries(m.labels ?? {}).forEach(([x, b]) => {
      s.push({
        variable: d,
        setting: "Label",
        key: x,
        value: String(b)
      });
    }), Object.entries(m.weights ?? {}).forEach(([x, b]) => {
      s.push({
        variable: d,
        setting: "Factor",
        key: x,
        value: String(b)
      });
    }), (m.order ?? []).forEach((x, b) => {
      s.push({
        variable: d,
        setting: "Order",
        key: x,
        value: String(b + 1)
      });
    }), (m.numericStats ?? []).forEach(x => {
      s.push({
        variable: d,
        setting: "Stat",
        key: x,
        value: "TRUE"
      });
    }), (m.groups ?? []).forEach(x => {
      const b = (() => {
        let D = 0,
          j = x.parentId;
        const E = new Set();
        for (; j && !E.has(j);) {
          E.add(j);
          const R = (m.groups ?? []).find(C => C.id === j);
          if (!R) break;
          D += 1, j = R.parentId;
        }
        return D;
      })();
      u.push({
        variable: d,
        setting: b === 0 ? "Net" : `${"Sub".repeat(b)}net`,
        value: x.name,
        code: x.members.join(","),
        parent: x.parentId ? (m.groups ?? []).find(D => D.id === x.parentId)?.name ?? "" : "",
        depth: b
      });
    });
  }), s.sort((d, p) => d.variable.localeCompare(p.variable, void 0, {
    numeric: !0,
    sensitivity: "base"
  }) || d.setting.localeCompare(p.setting, void 0, {
    numeric: !0,
    sensitivity: "base"
  }) || d.key.localeCompare(p.key, void 0, {
    numeric: !0,
    sensitivity: "base"
  })), u.sort((d, p) => d.variable.localeCompare(p.variable, void 0, {
    numeric: !0,
    sensitivity: "base"
  }) || (d.depth ?? 0) - (p.depth ?? 0) || d.value.localeCompare(p.value, void 0, {
    numeric: !0,
    sensitivity: "base"
  })), {
    rows: s,
    netRows: u
  };
}
function ag(a, s = []) {
  const u = new Map();
  return a.forEach(d => {
    if (!d.variable) return;
    const p = u.get(d.variable) ?? {
      order: [],
      weights: {},
      labels: {},
      numericStats: [],
      groups: []
    };
    u.set(d.variable, p), d.setting === "Label" && (p.labels[d.key] = d.value), d.setting === "Factor" && d.value.trim() !== "" && (p.weights[d.key] = d.value.trim()), d.setting === "Order" && p.order.push({
      key: d.key,
      rank: Number(d.value) || Number.MAX_SAFE_INTEGER
    }), d.setting === "Stat" && d.key && p.numericStats.push(d.key), d.setting === "Net" && p.groups.push({
      id: d.key,
      name: d.value,
      parentId: d.extra1?.trim() ? d.extra1.trim() : null,
      members: (d.extra2 ?? "").split(",").map(m => m.trim()).filter(Boolean)
    });
  }), s.forEach((d, p) => {
    if (!d.variable) return;
    const m = u.get(d.variable) ?? {
      order: [],
      weights: {},
      labels: {},
      numericStats: [],
      groups: []
    };
    u.set(d.variable, m);
    const x = d.parent?.trim() || "",
      b = x ? m.groups.find(D => D.name === x) : null;
    m.groups.push({
      id: `${d.variable}__net_${p + 1}`,
      name: d.value,
      parentId: b?.id ?? null,
      members: d.code.split(",").map(D => D.trim()).filter(Boolean)
    });
  }), Object.fromEntries([...u.entries()].map(([d, p]) => [d, {
    order: p.order.sort((m, x) => m.rank - x.rank).map(m => m.key),
    weights: p.weights,
    labels: p.labels,
    numericStats: p.numericStats,
    groups: p.groups
  }]));
}
const og = 3e4;
function ig(a, s) {
  (JSON.stringify(s).match(new RegExp(`.{1,${og}}`, "g")) ?? ["{}"]).forEach((p, m) => {
    a.getCell(m + 1, 1).value = p;
  });
}
function lg(a) {
  const s = [];
  for (let u = 1; u <= a.rowCount; u++) {
    const d = a.getCell(u, 1).value,
      p = d,
      m = typeof d == "string" ? d : p && typeof p.text == "string" ? p.text : null;
    if (!m) break;
    s.push(m);
  }
  return s.length > 0 ? s.join("") : null;
}
function Tp(a) {
  return a === "all" || a === "any";
}
function sg(a) {
  return a === "in" || a === "not_in" || a === "gt" || a === "gte" || a === "lt" || a === "lte" || a === "between" || a === "contains" || a === "not_contains" || a === "is_blank" || a === "not_blank";
}
function cg(a) {
  if (a.operator === "in" || a.operator === "not_in") {
    const s = a.values.join(", ");
    return `${a.variableName} ${a.operator === "in" ? "in" : "not in"} [${s}]`;
  }
  return a.operator === "between" ? `${a.variableName} between ${a.value} and ${a.secondaryValue}` : a.operator === "is_blank" ? `${a.variableName} is blank` : a.operator === "not_blank" ? `${a.variableName} is not blank` : `${a.variableName} ${a.operator} ${a.value}`.trim();
}
function ug(a) {
  if (!a) return "";
  const s = a.description.trim();
  if (s) return s;
  const u = a.groups.filter(p => p.conditions.length > 0);
  if (u.length === 0) return "";
  const d = u.map(p => p.conditions.map(cg).join(p.join === "all" ? " AND " : " OR ")).join(a.rootJoin === "all" ? " AND " : " OR ");
  return d.length > 180 ? `${d.slice(0, 177)}...` : d;
}
async function tu({
  tables: a,
  folders: s,
  output: u,
  variableOverrides: d = {},
  detectedMrsets: p = [],
  sourceDataset: m,
  sourceMappings: x = [],
  activeLock: b = null
}) {
  const D = await xf(),
    j = new D.Workbook();
  j.creator = "Crosstab Generator", j.created = new Date();
  const E = j.addWorksheet("Tables");
  E.getColumn(1).width = 30, E.getColumn(2).width = 25, E.getColumn(3).width = 25, E.getColumn(4).width = 20, E.getColumn(5).width = 32, Dr(E.addRow(["Table Name", "Row Variable", "Column Variable", "Folder", "Filter Description"])), a.forEach((fe, le) => {
    const H = s.find(U => U.id === fe.folderId)?.name ?? "";
    Tr(E.addRow([fe.name, fe.rowVar ?? "", fe.colVar ?? "", H, ug(fe.filter)]), le % 2 === 1);
  });
  const R = j.addWorksheet("Filters");
  R.getColumn(1).width = 10, R.getColumn(2).width = 28, R.getColumn(3).width = 32, R.getColumn(4).width = 16, R.getColumn(5).width = 10, R.getColumn(6).width = 20, R.getColumn(7).width = 22, R.getColumn(8).width = 16, R.getColumn(9).width = 30, R.getColumn(10).width = 18, R.getColumn(11).width = 18, Dr(R.addRow(["Table #", "Table Name", "Filter Description", "Between Groups", "Group #", "Between Conditions", "Variable", "Operator", "Values", "Value", "Secondary Value"]));
  let C = 0;
  a.forEach((fe, le) => {
    const H = (fe.filter?.groups ?? []).filter(U => U.conditions.length > 0);
    H.length !== 0 && H.forEach((U, W) => {
      U.conditions.forEach(q => {
        Tr(R.addRow([le + 1, fe.name, fe.filter?.description ?? "", fe.filter?.rootJoin ?? "all", W + 1, U.join, q.variableName, q.operator, q.values.join("|"), q.value, q.secondaryValue]), C % 2 === 1), C += 1;
      });
    });
  });
  const J = j.addWorksheet("Output");
  J.getColumn(1).width = 24, J.getColumn(2).width = 18, Dr(J.addRow(["Setting", "Value"])), [["showCount", String(u.showCount)], ["showPercent", String(u.showPercent)], ["percentType", u.percentType], ["hideZeroRows", String(u.hideZeroRows ?? !1)]].forEach(([fe, le], H) => {
    Tr(J.addRow([fe, le]), H % 2 === 1);
  });
  const pe = j.addWorksheet("Source");
  pe.getColumn(1).width = 24, pe.getColumn(2).width = 60, Dr(pe.addRow(["Setting", "Value"])), [["SPSS File Name", m?.fileName ?? ""], ["SPSS File Path", m?.filePath ?? ""], ["Source Mapping Count", String(x.length)]].forEach(([fe, le], H) => {
    Tr(pe.addRow([fe, le]), H % 2 === 1);
  });
  const oe = j.addWorksheet("SourceMappings");
  oe.getColumn(1).width = 26, oe.getColumn(2).width = 32, oe.getColumn(3).width = 60, oe.getColumn(4).width = 18, oe.getColumn(5).width = 18, oe.getColumn(6).width = 24, oe.getColumn(7).width = 24, Dr(oe.addRow(["Id", "File Name", "File Path", "Owner Label", "Machine Label", "Last Bound At", "Last Bound By"])), x.forEach((fe, le) => {
    Tr(oe.addRow([fe.id, fe.fileName, fe.filePath ?? "", fe.ownerLabel ?? "", fe.machineLabel ?? "", fe.lastBoundAt, fe.lastBoundBy ?? ""]), le % 2 === 1);
  });
  const K = j.addWorksheet("Lock");
  K.getColumn(1).width = 24, K.getColumn(2).width = 40, Dr(K.addRow(["Setting", "Value"])), [["Lock Status", b?.status ?? (b ? "ACTIVE" : "UNLOCKED")], ["Session Id", b?.sessionId ?? ""], ["Owner Label", b?.ownerLabel ?? ""], ["Machine Label", b?.machineLabel ?? ""], ["Acquired At", b?.acquiredAt ?? ""], ["Updated At", b?.updatedAt ?? ""], ["Expires At", b?.expiresAt ?? ""], ["Exited At", b?.exitedAt ?? ""]].forEach(([fe, le], H) => {
    Tr(K.addRow([fe, le]), H % 2 === 1);
  });
  const z = j.addWorksheet("VariableSettings");
  z.getColumn(1).width = 24, z.getColumn(2).width = 16, z.getColumn(3).width = 18, z.getColumn(4).width = 28, Dr(z.addRow(["Variable", "Setting", "Key", "Value"]));
  const {
    rows: Q,
    netRows: B
  } = rg(d);
  Q.forEach((fe, le) => {
    Tr(z.addRow([fe.variable, fe.setting, fe.key, fe.value]), le % 2 === 1);
  });
  const $ = j.addWorksheet("VariableNet");
  $.getColumn(1).width = 24, $.getColumn(2).width = 16, $.getColumn(3).width = 28, $.getColumn(4).width = 24, $.getColumn(5).width = 24, Dr($.addRow(["Variable", "Setting", "Value", "Code", "Parent"])), B.forEach((fe, le) => {
    Tr($.addRow([fe.variable, fe.setting, fe.value, fe.code, fe.parent ?? ""]), le % 2 === 1);
  });
  const ie = j.addWorksheet("MRSET");
  ie.getColumn(1).width = 22, ie.getColumn(2).width = 40, ie.getColumn(3).width = 60, Dr(ie.addRow(["กลุ่ม MA (Group Name)", "ชื่อ / Label", "ตัวแปรสมาชิก (Members) คั่นด้วย ,"]));
  const Y = ie.addRow(["# ตัวอย่าง: Q8J_R2_O", "Q8J.Formula...", "Q8J_R2$1,Q8J_R2$2,Q8J_R2$3"]);
  Y.font = {
    italic: !0,
    color: {
      argb: "FF888888"
    },
    size: 9
  }, Y.height = 14, p.forEach((fe, le) => {
    Tr(ie.addRow([fe.groupName, fe.label, fe.members.join(",")]), le % 2 === 1);
  });
  const ne = {
      version: "1.7",
      savedAt: new Date().toISOString(),
      output: u,
      folders: s,
      tables: a,
      variableOverrides: d,
      customMrsets: p,
      sourceDataset: m,
      sourceMappings: x,
      activeLock: b
    },
    Z = j.addWorksheet("_settings", {
      state: "hidden"
    });
  return ig(Z, ne), j.xlsx.writeBuffer();
}
async function dg(a, s, u, d = {}, p = "crosstab_settings.xlsx", m = [], x, b = [], D = null) {
  const j = await tu({
    tables: a,
    folders: s,
    output: u,
    variableOverrides: d,
    detectedMrsets: m,
    sourceDataset: x,
    sourceMappings: b,
    activeLock: D
  });
  ng.saveAs(new Blob([j], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  }), p);
}
async function pg(a) {
  const s = await a.arrayBuffer(),
    u = await xf(),
    d = new u.Workbook();
  await d.xlsx.load(s);
  let p = {
      showCount: !0,
      showPercent: !0,
      percentType: "column",
      hideZeroRows: !1
    },
    m = [],
    x = {},
    b = [],
    D,
    j = [],
    E = null,
    R = [];
  const C = new Map(),
    J = new Map(),
    pe = d.worksheets.find(H => H.name === "_settings") ?? d.getWorksheet("_settings");
  if (pe) {
    const H = lg(pe);
    if (H?.trim().startsWith("{")) try {
      const U = JSON.parse(H);
      (U.version === "1.0" || U.version === "1.1" || U.version === "1.2" || U.version === "1.3" || U.version === "1.4" || U.version === "1.5" || U.version === "1.6" || U.version === "1.7") && (p = U.output ?? p, m = U.folders ?? [], R = U.tables ?? [], x = U.variableOverrides ?? {}, b = U.customMrsets ?? [], D = U.sourceDataset, j = U.sourceMappings ?? [], E = U.activeLock ?? null);
    } catch {}
  }
  const oe = d.worksheets.find(H => H.name.toLowerCase() === "source") ?? d.getWorksheet("Source");
  if (oe) {
    let H = D?.fileName ?? "",
      U = D?.filePath ?? "";
    for (let W = 2; W <= oe.rowCount; W++) {
      const q = oe.getRow(W),
        se = String(q.getCell(1).value ?? "").trim().toLowerCase(),
        de = String(q.getCell(2).value ?? "").trim();
      !se || !de || (se === "spss file name" && (H = de), se === "spss file path" && (U = de));
    }
    H && (D = {
      fileName: H,
      filePath: U || void 0
    });
  }
  const K = d.worksheets.find(H => H.name.toLowerCase() === "sourcemappings") ?? d.getWorksheet("SourceMappings");
  if (K) {
    const H = [];
    for (let U = 2; U <= K.rowCount; U++) {
      const W = K.getRow(U),
        q = String(W.getCell(1).value ?? "").trim(),
        se = String(W.getCell(2).value ?? "").trim(),
        de = String(W.getCell(3).value ?? "").trim(),
        ge = String(W.getCell(4).value ?? "").trim(),
        A = String(W.getCell(5).value ?? "").trim(),
        G = String(W.getCell(6).value ?? "").trim(),
        re = String(W.getCell(7).value ?? "").trim();
      !q || !se || !G || H.push({
        id: q,
        fileName: se,
        filePath: de || void 0,
        ownerLabel: ge || void 0,
        machineLabel: A || void 0,
        lastBoundAt: G,
        lastBoundBy: re || void 0
      });
    }
    H.length > 0 && (j = H);
  }
  const z = d.worksheets.find(H => H.name.toLowerCase() === "lock") ?? d.getWorksheet("Lock");
  if (z) {
    let H = E?.status ?? "",
      U = E?.sessionId ?? "",
      W = E?.ownerLabel ?? "",
      q = E?.machineLabel ?? "",
      se = E?.acquiredAt ?? "",
      de = E?.updatedAt ?? "",
      ge = E?.expiresAt ?? "",
      A = E?.exitedAt ?? "";
    for (let G = 2; G <= z.rowCount; G++) {
      const re = z.getRow(G),
        y = String(re.getCell(1).value ?? "").trim().toLowerCase(),
        _ = String(re.getCell(2).value ?? "").trim();
      !y || !_ || (y === "lock status" && (H = _.toUpperCase()), y === "session id" && (U = _), y === "owner label" && (W = _), y === "machine label" && (q = _), y === "acquired at" && (se = _), y === "updated at" && (de = _), y === "expires at" && (ge = _), y === "exited at" && (A = _));
    }
    U && W && se && ge && (E = {
      sessionId: U,
      ownerLabel: W,
      machineLabel: q || void 0,
      status: H === "EXITED" ? "EXITED" : "ACTIVE",
      acquiredAt: se,
      updatedAt: de || se,
      expiresAt: ge,
      exitedAt: A || void 0
    });
  }
  const Q = d.worksheets.find(H => H.name.toLowerCase() === "output") ?? d.getWorksheet("Output");
  if (Q) for (let H = 2; H <= Q.rowCount; H++) {
    const U = Q.getRow(H),
      W = String(U.getCell(1).value ?? "").trim(),
      q = String(U.getCell(2).value ?? "").trim();
    W && (W === "showCount" && (p.showCount = q.toLowerCase() === "true"), W === "showPercent" && (p.showPercent = q.toLowerCase() === "true"), W === "percentType" && (q === "row" || q === "column" || q === "total") && (p.percentType = q), W === "hideZeroRows" && (p.hideZeroRows = q.toLowerCase() === "true"));
  }
  const B = d.worksheets.find(H => H.name.toLowerCase() === "tables") ?? d.getWorksheet("Tables");
  if (!B) throw new Error('ไม่พบ Sheet "Tables" ในไฟล์ที่เลือก');
  const $ = [],
    ie = new Set();
  for (let H = 2; H <= B.rowCount; H++) {
    const U = B.getRow(H),
      W = String(U.getCell(1).value ?? "").trim();
    if (!W) continue;
    const q = String(U.getCell(2).value ?? "").trim() || null,
      se = String(U.getCell(3).value ?? "").trim() || null,
      de = String(U.getCell(4).value ?? "").trim(),
      ge = String(U.getCell(5).value ?? "").trim();
    de && ie.add(de);
    const A = m.find(G => G.name === de);
    $.push({
      name: W,
      rowVar: q,
      colVar: se,
      folderId: de ? A?.id ?? de : null,
      filter: ge ? {
        description: ge,
        rootJoin: "all",
        groups: []
      } : void 0
    });
  }
  const Y = d.worksheets.find(H => H.name.toLowerCase() === "filters") ?? d.getWorksheet("Filters");
  if (Y) for (let H = 2; H <= Y.rowCount; H++) {
    const U = Y.getRow(H),
      W = Number(U.getCell(1).value ?? 0),
      q = String(U.getCell(3).value ?? "").trim(),
      se = String(U.getCell(4).value ?? "").trim().toLowerCase(),
      de = Number(U.getCell(5).value ?? 0),
      ge = String(U.getCell(6).value ?? "").trim().toLowerCase(),
      A = String(U.getCell(7).value ?? "").trim(),
      G = String(U.getCell(8).value ?? "").trim(),
      re = String(U.getCell(9).value ?? "").split("|").map(We => We.trim()).filter(Boolean),
      y = String(U.getCell(10).value ?? ""),
      _ = String(U.getCell(11).value ?? "");
    if (!Number.isFinite(W) || W < 1 || !Number.isFinite(de) || de < 1 || !A) continue;
    const Ne = Tp(se) ? se : "all",
      ue = Tp(ge) ? ge : "all",
      ke = sg(G) ? G : "in",
      Se = C.get(W) ?? {
        description: q,
        rootJoin: Ne,
        groups: []
      };
    !Se.description && q && (Se.description = q), Se.rootJoin = Ne, C.set(W, Se);
    let Ce = J.get(W);
    Ce || (Ce = new Map(), J.set(W, Ce));
    let ze = Ce.get(de);
    ze ? ze.join = ue : (ze = {
      id: `table_${W}_group_${de}`,
      join: ue,
      conditions: []
    }, Ce.set(de, ze), Se.groups.push(ze)), ze.conditions.push({
      id: `table_${W}_group_${de}_condition_${H}`,
      variableName: A,
      operator: ke,
      values: re,
      value: y,
      secondaryValue: _
    });
  }
  R.length > 0 && $.forEach((H, U) => {
    const W = R[U];
    W && (H.filter = W.filter ?? H.filter);
  }), C.size > 0 && $.forEach((H, U) => {
    const W = C.get(U + 1);
    W && (H.filter = W);
  });
  const ne = [...ie].map(H => ({
      id: m.find(W => W.name === H)?.id ?? H,
      name: H
    })),
    Z = d.worksheets.find(H => H.name.toLowerCase() === "variablesettings") ?? d.getWorksheet("VariableSettings"),
    fe = d.worksheets.find(H => H.name.toLowerCase() === "variablenet") ?? d.getWorksheet("VariableNet");
  if (Z) {
    const H = [];
    for (let W = 2; W <= Z.rowCount; W++) {
      const q = Z.getRow(W),
        se = String(q.getCell(1).value ?? "").trim(),
        de = String(q.getCell(2).value ?? "").trim(),
        ge = String(q.getCell(3).value ?? "").trim(),
        A = String(q.getCell(4).value ?? "").trim(),
        G = String(q.getCell(5).value ?? "").trim(),
        re = String(q.getCell(6).value ?? "").trim();
      !se || !de || H.push({
        variable: se,
        setting: de,
        key: ge,
        value: A,
        extra1: G,
        extra2: re
      });
    }
    const U = [];
    if (fe) for (let W = 2; W <= fe.rowCount; W++) {
      const q = fe.getRow(W),
        se = String(q.getCell(1).value ?? "").trim(),
        de = String(q.getCell(2).value ?? "").trim(),
        ge = String(q.getCell(3).value ?? "").trim(),
        A = String(q.getCell(4).value ?? "").trim(),
        G = String(q.getCell(5).value ?? "").trim();
      !se || !de || !ge || U.push({
        variable: se,
        setting: de,
        value: ge,
        code: A,
        parent: G
      });
    }
    x = ag(H, U);
  }
  const le = d.worksheets.find(H => H.name.toLowerCase() === "mrset") ?? d.getWorksheet("MRSET");
  if (le) for (let H = 3; H <= le.rowCount; H++) {
    const U = le.getRow(H),
      W = String(U.getCell(1).value ?? "").trim();
    if (!W || W.startsWith("#")) continue;
    const q = String(U.getCell(2).value ?? "").trim(),
      de = String(U.getCell(3).value ?? "").trim().split(",").map(ge => ge.trim()).filter(Boolean);
    if (de.length >= 2) {
      const ge = b.findIndex(G => G.groupName === W),
        A = {
          groupName: W,
          label: q,
          members: de
        };
      ge >= 0 ? b[ge] = A : b.push(A);
    }
  }
  return j.length === 0 && D?.fileName && (j = [{
    id: `legacy:${D.filePath?.trim().toLowerCase() || D.fileName.trim().toLowerCase()}`,
    fileName: D.fileName,
    filePath: D.filePath,
    lastBoundAt: new Date().toISOString(),
    lastBoundBy: "legacy"
  }]), E && (E = {
    ...E,
    status: E.status === "EXITED" ? "EXITED" : "ACTIVE",
    updatedAt: E.updatedAt || E.acquiredAt
  }), {
    version: "1.7",
    savedAt: new Date().toISOString(),
    output: p,
    folders: ne,
    tables: $,
    variableOverrides: x,
    customMrsets: b,
    sourceDataset: D,
    sourceMappings: j,
    activeLock: E
  };
}
const fg = Object.freeze(Object.defineProperty({
  __proto__: null,
  buildSettingsWorkbookBuffer: tu,
  loadSettings: pg,
  saveSettings: dg
}, Symbol.toStringTag, {
  value: "Module"
}));
function Hl() {
  return window;
}
function mr() {
  return typeof window < "u" && typeof Hl().showOpenFilePicker == "function";
}
async function mg(a) {
  const s = a,
    u = s.queryPermission?.bind(s);
  if (u && (await u({
    mode: "read"
  })) === "granted") return "granted";
  const d = s.requestPermission?.bind(s);
  return d ? d({
    mode: "read"
  }) : "granted";
}
async function hg() {
  if (!mr()) return null;
  const a = Hl().showOpenFilePicker;
  if (!a) return null;
  const [s] = await a({
    id: "crossify-spss-file",
    excludeAcceptAllOption: !0,
    multiple: !1,
    types: [{
      description: "SPSS Files",
      accept: {
        "application/octet-stream": [".sav"]
      }
    }]
  });
  return s ? {
    file: await s.getFile(),
    handle: s
  } : null;
}
async function gg(a) {
  if (!mr() || !a.fileName.trim()) return null;
  const s = await Zh(a);
  return !s || (await mg(s)) !== "granted" ? null : {
    file: await s.getFile(),
    handle: s
  };
}
async function xg(a, s) {
  !s || !mr() || !a.fileName.trim() || (await Yh(a, s));
}
async function vg(a) {
  const s = a,
    u = s.queryPermission?.bind(s);
  if (u && (await u({
    mode: "readwrite"
  })) === "granted") return "granted";
  const d = s.requestPermission?.bind(s);
  return d ? d({
    mode: "readwrite"
  }) : "granted";
}
async function wg() {
  if (!mr()) return null;
  const a = Hl().showOpenFilePicker;
  if (!a) return null;
  const [s] = await a({
    id: "crossify-settings-file",
    excludeAcceptAllOption: !0,
    multiple: !1,
    types: [{
      description: "Crossify Settings",
      accept: {
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"]
      }
    }]
  });
  return s ? {
    file: await s.getFile(),
    handle: s
  } : null;
}
async function ea(a, s, u = "crosstab_settings.xlsx") {
  if (!mr()) return null;
  let d = s;
  if (!d) {
    const D = Hl().showSaveFilePicker;
    if (!D) return null;
    d = await D({
      id: "crossify-settings-save",
      suggestedName: u,
      excludeAcceptAllOption: !0,
      types: [{
        description: "Crossify Settings",
        accept: {
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"]
        }
      }]
    });
  }
  if (!d || (await vg(d)) !== "granted") return null;
  const m = await tu(a),
    b = await d.createWritable();
  return await b.write(new Blob([m], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  })), await b.close(), d;
}
const vf = " || ",
  Ca = " ++ ",
  Kc = "__AXIS2__:";
function yg(a, s) {
  a.includes(s) || a.push(s);
}
function Jt(a) {
  const s = new Set(),
    u = [];
  return a.forEach(d => {
    const p = d.filter(Boolean);
    if (p.length === 0) return;
    const m = p.join("");
    s.has(m) || (s.add(m), u.push(p));
  }), u;
}
function bg(a) {
  return a.split(vf).map(s => {
    const u = s.trim();
    return u ? u.includes(Ca) ? u.split(Ca).map(d => d.trim()).filter(Boolean) : [u] : [];
  }).filter(s => s.length > 0);
}
function wf(a) {
  if (a.length === 0) return [];
  let s = [[]];
  return a.forEach(u => {
    const d = [];
    s.forEach(p => {
      u.forEach(m => {
        d.push([...p, m]);
      });
    }), s = d;
  }), Jt(s);
}
function kg(a) {
  const s = rr(a);
  if (s.length === 0) return null;
  const u = Jt(wf(s)),
    d = Jt(a);
  if (u.length !== d.length) return null;
  const p = new Set(u.map(x => x.join(""))),
    m = new Set(d.map(x => x.join("")));
  if (p.size !== m.size) return null;
  for (const x of m) if (!p.has(x)) return null;
  return s.map(x => x.join(Ca)).join(vf);
}
function yf(a, s) {
  return a.map((u, d) => ({
    branchIndex: d,
    itemIndex: u.indexOf(s)
  })).filter(u => u.itemIndex >= 0);
}
function ct(a) {
  if (!a) return [];
  const s = a.trim();
  if (s.startsWith(Kc)) try {
    const u = JSON.parse(s.slice(Kc.length));
    return Array.isArray(u) ? Jt(u.filter(d => Array.isArray(d)).map(d => d.map(p => String(p).trim()).filter(Boolean))) : [];
  } catch {
    return [];
  }
  return wf(bg(s));
}
function zn(a) {
  const s = Jt(a);
  return s.length === 0 ? null : kg(s) ?? `${Kc}${JSON.stringify(s)}`;
}
function rr(a) {
  const s = [];
  return Jt(a).forEach(u => {
    u.forEach((d, p) => {
      s[p] || (s[p] = []), yg(s[p], d);
    });
  }), s;
}
function Xe(a) {
  return rr(a).flat();
}
function Lp(a, s, u) {
  if (Xe(a).includes(s)) return a;
  const p = [...Jt(a)],
    m = u == null ? p.length : Math.max(0, Math.min(u, p.length));
  return p.splice(m, 0, [s]), Jt(p);
}
function Pp(a, s, u, d) {
  if (Xe(a).includes(s)) return a;
  const p = Jt(a);
  if (p.length === 0) return [[s]];
  if (u === "add") return Jt([...p, [s]]);
  if (!d) return p.map(x => [...x, s]);
  const m = yf(p, d);
  return m.length === 0 ? u === "nest" ? p.map(x => [...x, s]) : Jt([...p, [...p[p.length - 1], s]]) : Jt(p.map((x, b) => {
    const D = m.find(j => j.branchIndex === b);
    return D ? [...x.slice(0, D.itemIndex + 1), s] : x;
  }));
}
function Rp(a, s, u) {
  return Jt(u ? a.map((d, p) => p !== u.branchIndex ? d : d.filter((m, x) => !(m === s && x === u.itemIndex))) : a.map(d => d.filter(p => p !== s)));
}
function Fl(a, s, u) {
  const d = Jt(a),
    p = yf(d, s);
  return p.length === 0 ? a : Jt(d.map((m, x) => {
    const b = p.find(E => E.branchIndex === x);
    if (!b) return m;
    const D = b.itemIndex + u;
    if (D < 0 || D >= m.length) return m;
    const j = [...m];
    return [j[b.itemIndex], j[D]] = [j[D], j[b.itemIndex]], j;
  }));
}
function moveAxisOccurrenceToTarget(a, s, u) {
  const d = Jt(a).map(p => [...p]),
    m = d[s.branchIndex],
    x = d[u.branchIndex];
  if (!m || !x || !m[s.itemIndex] || !x[u.itemIndex]) return a;
  const b = m[s.itemIndex],
    D = x[u.itemIndex],
    j = m.length === 1,
    E = x.length === 1;
  d[s.branchIndex].splice(s.itemIndex, 1), d[s.branchIndex].length === 0 && d.splice(s.branchIndex, 1);
  let R = u.branchIndex;
  s.branchIndex < u.branchIndex && j && (R -= 1);
  if (j && E) {
    const C = u.placement === "after" ? R + 1 : R;
    return d.splice(C, 0, [b]), Jt(d);
  }
  const o = d[R];
  if (!o) return a;
  const c = o.findIndex(v => v === D);
  if (c < 0) return a;
  const h = u.placement === "after" ? c + 1 : c;
  return o.splice(h, 0, b), Jt(d);
}
function ht(a) {
  if (a == null || a === "") return "";
  const s = String(a).trim(),
    u = Number(s);
  return Number.isFinite(u) ? String(u) : s;
}
function Fp(a, s, u) {
  if (s.length === 0) return a;
  const d = new Set(s),
    p = [...a];
  if (u === -1) {
    for (let m = 1; m < p.length; m++) !d.has(p[m].key) || d.has(p[m - 1].key) || ([p[m - 1], p[m]] = [p[m], p[m - 1]]);
    return p;
  }
  for (let m = p.length - 2; m >= 0; m--) !d.has(p[m].key) || d.has(p[m + 1].key) || ([p[m + 1], p[m]] = [p[m], p[m + 1]]);
  return p;
}
const Mp = 250;
function Ip() {
  return new Promise(a => {
    if (typeof window < "u" && typeof window.requestAnimationFrame == "function") {
      window.requestAnimationFrame(() => a());
      return;
    }
    setTimeout(() => a(), 0);
  });
}
function Vc(a) {
  const s = a.longName || a.name;
  return gi(s) ? s : a.name && a.name !== s && gi(a.name) ? a.name : s;
}
const Sg = ["no", "none", "not", "never", "without", "do not", "did not", "not selected", "not choose", "not chosen", "not mention", "ไม่", "ไม่มี", "ไม่เคย", "ไม่ได้", "ไม่ใช่", "ไม่เลือก"],
  Ng = ["yes", "selected", "choose", "chosen", "mention", "used", "use", "เลือก", "เคย", "ใช้", "มี"];
function gi(a) {
  const u = a.trim().match(/^(.*?)(?:[$&](\d+)|_O(\d+))$/i);
  if (!u) return null;
  const d = u[1].trim(),
    p = Number(u[2] ?? u[3]);
  return !d || !Number.isFinite(p) ? null : {
    base: d,
    index: p
  };
}
function jg(a) {
  const s = gi(a);
  return s ? `${s.base}_O` : a;
}
function Eg(a) {
  return a.trim().toLowerCase();
}
function Op(a, s) {
  const u = Eg(a);
  return s.some(d => u.includes(d));
}
function Vp(a) {
  const s = Object.entries(a.valueLabels);
  if (s.length === 0) return new Set(["1"]);
  const u = s.filter(([, x]) => Op(x, Ng));
  if (u.length === 1) return new Set([u[0][0]]);
  const d = s.filter(([, x]) => Op(x, Sg));
  if (s.length === 2 && d.length === 1) return new Set(s.filter(([x]) => x !== d[0][0]).map(([x]) => x));
  const p = s.map(([x]) => Number(x)).filter(x => Number.isFinite(x)).sort((x, b) => x - b);
  if (p.includes(0) && p.includes(1)) return new Set(["1"]);
  const m = p.find(x => x > 0);
  return m != null ? new Set([String(m)]) : new Set([s[0][0]]);
}
function zp(a, s, u) {
  const d = String(s),
    p = u?.valueLabels[d];
  return p ? `${d}. ${p}` : `${a}${s}`;
}
function Cg(a) {
  const s = new Map();
  for (const u of a) for (const [d, p] of Object.entries(u.valueLabels)) {
    const m = ht(d);
    m && (s.has(m) || s.set(m, p));
  }
  return [...s.entries()].sort(([u], [d]) => Number(u) - Number(d));
}
function _g(a, s) {
  const u = new Set();
  for (const d of s) for (const p of a) {
    const m = ht(d[p]);
    !m || m === "0" || u.add(m);
  }
  return [...u].sort((d, p) => d.localeCompare(p, void 0, {
    numeric: !0,
    sensitivity: "base"
  }));
}
function Ap(a, s = []) {
  const u = new Map(Cg(a));
  _g(a.map(m => m.name), s).forEach(m => {
    u.has(m) || u.set(m, m);
  });
  const p = [...u.entries()].sort(([m], [x]) => Number(m) - Number(x));
  return p.length === 0 ? [] : p.map(([m, x], b) => ({
    memberName: `${a[0]?.name ?? "group"}#code:${m}`,
    label: `${m}. ${x}`,
    order: b + 1,
    selectedCodes: new Set(),
    valueCode: ht(m)
  }));
}
function Bp(a) {
  if (a.length === 0) return !1;
  const u = a.map(m => Object.keys(m.valueLabels).map(x => ht(x)).filter(Boolean).sort((x, b) => x.localeCompare(b, void 0, {
    numeric: !0,
    sensitivity: "base"
  }))).filter(m => m.length > 0);
  if (u.length === 0) return !1;
  const d = new Set(u.flat());
  return d.size === 0 || d.size > 3 || ![...d].every(m => m === "0" || m === "1" || m === "2") || new Set(u.map(m => m.join("|"))).size > 2 ? !1 : u.every(m => {
    if (m.length > 3) return !1;
    const x = new Set(m);
    return x.size <= 2 ? !0 : [...x].every(b => b === "0" || b === "1" || b === "2");
  });
}
function Dg(a, s = [], u = []) {
  const d = new Map();
  for (const E of a) {
    const R = gi(Vc(E));
    if (!R) continue;
    const C = `${R.base}_O`,
      J = d.get(C) ?? [];
    J.push({
      variable: E,
      index: R.index
    }), d.set(C, J);
  }
  const p = new Set();
  for (const [, E] of d) if (E.length >= 2) for (const {
    variable: R
  } of E) p.add(R.name);
  const m = [],
    x = new Map(),
    b = new Map(),
    D = new Set();
  for (const E of a) {
    const R = jg(Vc(E)),
      C = d.get(R);
    if (!C || C.length < 2) {
      if (p.has(E.name)) continue;
      const le = E.longName || E.name;
      if (x.has(le)) continue;
      const H = {
        name: le,
        label: E.label,
        longName: E.longName,
        isString: E.isString,
        valueLabels: E.valueLabels
      };
      m.push(H), x.set(H.name, H);
      continue;
    }
    if (D.has(R)) continue;
    D.add(R);
    const J = [...C].sort((le, H) => le.index - H.index),
      pe = J[0]?.variable,
      oe = pe ? gi(Vc(pe))?.base ?? R : R,
      K = a.find(le => le.name === oe || le.longName === oe),
      z = J.map(({
        variable: le
      }) => le),
      Q = Ap(z, u),
      B = Q.length > 0 && !Bp(z),
      $ = B ? Q : J.map(({
        variable: le,
        index: H
      }) => ({
        memberName: le.name,
        label: zp(R, H, K),
        order: H,
        selectedCodes: Vp(le)
      })),
      ie = pe,
      Y = K?.label || ie?.label || R,
      ne = K?.longName || R.replace(/_O$/, ""),
      Z = {
        name: R,
        label: Y,
        longName: ne,
        isString: !1,
        valueLabels: Object.fromEntries($.map((le, H) => [String(H + 1), le.label])),
        isGroupedMA: !0,
        memberNames: J.map(({
          variable: le
        }) => le.name)
      },
      fe = {
        name: R,
        label: Y,
        longName: ne,
        options: $,
        memberNames: J.map(({
          variable: le
        }) => le.name),
        aggregateByCode: B
      };
    m.push(Z), x.set(Z.name, Z), b.set(R, fe);
  }
  const j = new Map();
  a.forEach(E => {
    j.set(E.name, E), E.longName && j.set(E.longName, E);
  });
  for (const E of s) {
    const {
      groupName: R,
      label: C,
      members: J
    } = E;
    if (!R || J.length < 2) continue;
    const pe = J.map(ne => j.get(ne)).filter(Boolean);
    if (pe.length < 2) continue;
    const oe = pe.map(ne => ne.name),
      K = pe.map((ne, Z) => ({
        variable: ne,
        index: Z + 1
      })),
      z = pe[0],
      Q = Ap(pe, u),
      B = Q.length > 0 && !Bp(pe),
      $ = B ? Q : K.map(({
        variable: ne,
        index: Z
      }) => ({
        memberName: ne.name,
        label: zp(R, Z, z),
        order: Z,
        selectedCodes: Vp(ne)
      })),
      ie = {
        name: R,
        label: C || z.label || R,
        longName: C || z.longName || R,
        isString: !1,
        valueLabels: Object.fromEntries($.map((ne, Z) => [String(Z + 1), ne.label])),
        isGroupedMA: !0,
        memberNames: oe
      },
      Y = {
        name: R,
        label: C || z.label || R,
        longName: C || z.longName || R,
        options: $,
        memberNames: oe,
        aggregateByCode: B
      };
    if (x.has(R)) {
      const ne = m.findIndex(Z => Z.name === R);
      ne >= 0 && (m[ne] = ie);
    } else {
      const ne = m.findIndex(Z => oe.includes(Z.name));
      if (ne >= 0) {
        m.splice(ne, 0, ie);
        for (let Z = m.length - 1; Z >= 0; Z--) m[Z].name !== R && oe.includes(m[Z].name) && m.splice(Z, 1);
      } else m.push(ie);
    }
    x.set(R, ie), b.set(R, Y);
  }
  return {
    list: m,
    byName: x,
    groupedByName: b
  };
}
function bf(a, s) {
  if (a && a.length > 0) {
    const u = [...s].filter(d => !a.includes(d));
    return [...a, ...u];
  }
  return [...s];
}
function Tg(a, s) {
  if (a == null || a === "") return !1;
  const u = String(a).trim();
  if (s.selectedCodes.has(u)) return !0;
  const d = Number(u);
  return Number.isFinite(d) && s.selectedCodes.has(String(d)) ? !0 : s.selectedCodes.size === 1 && s.selectedCodes.has("1") ? u !== "0" : !1;
}
function nu(a, s) {
  return a.options.filter(u => Tg(s[u.memberName], u)).map(u => u.label);
}
function ru(a, s) {
  const u = [],
    d = new Map(a.options.filter(m => m.valueCode).map(m => [m.valueCode, m.label])),
    p = d.has("0");
  for (const m of a.memberNames) {
    const x = ht(s[m]);
    if (!x || x === "0" && !p) continue;
    const b = d.get(x);
    if (b) {
      u.push(b);
      continue;
    }
  }
  return u;
}
function au(a, s) {
  const d = new Set(a.options.map(p => p.valueCode).filter(p => !!p)).has("0");
  return a.memberNames.some(p => {
    const m = ht(s[p]);
    return !(!m || m === "0" && !d);
  });
}
function Lg(a, s) {
  let u = 0;
  for (const d of s) au(a, d) && (u += 1);
  return u;
}
function zc(a, s) {
  return a.aggregateByCode ? ru(a, s) : nu(a, s);
}
function $p(a, s, u, d, p, m, x) {
  const b = p === "row" ? u.colVar : u.rowVar,
    D = new Set();
  for (const z of s) {
    const Q = z[b];
    Q != null && Q !== "" && D.add(String(Q));
  }
  const j = bf(x, D);
  if (j.length === 0) throw new Error(`No usable data for "${d.name}" x "${b}"`);
  const E = d.options.map(z => z.label),
    R = p === "row" ? E.map(() => j.map(() => 0)) : j.map(() => E.map(() => 0)),
    C = p === "row" ? E.map(() => 0) : j.map(() => 0),
    J = p === "row" ? j.map(() => 0) : E.map(() => 0),
    pe = new Map(j.map((z, Q) => [z, Q])),
    oe = new Map(E.map((z, Q) => [z, Q]));
  let K = 0;
  for (let z = 0; z < s.length; z++) {
    const Q = s[z]?.[b];
    if (Q == null || Q === "") continue;
    const B = pe.get(String(Q));
    if (B == null) continue;
    const $ = a[z] ?? {};
    if (!au(d, $)) continue;
    K += 1;
    const ie = d.aggregateByCode ? ru(d, $) : nu(d, $);
    if (p === "row") {
      J[B] += 1;
      for (const Y of ie) {
        const ne = oe.get(Y);
        ne != null && (R[ne][B] += 1, C[ne] += 1);
      }
    } else {
      C[B] += 1;
      for (const Y of ie) {
        const ne = oe.get(Y);
        ne != null && (R[B][ne] += 1, J[ne] += 1);
      }
    }
  }
  return p === "row" ? {
    rowVar: d.name,
    colVar: b,
    rowLabel: d.label,
    colLabel: m,
    rowValues: E,
    colValues: j,
    rowLevelLabels: [d.label],
    colLevelLabels: [m],
    rowPaths: E.map(z => [z]),
    colPaths: j.map(z => [z]),
    counts: R,
    rowTotalsN: C,
    colTotalsN: J,
    grandTotal: K
  } : {
    rowVar: b,
    colVar: d.name,
    rowLabel: m,
    colLabel: d.label,
    rowValues: j,
    colValues: E,
    rowLevelLabels: [m],
    colLevelLabels: [d.label],
    rowPaths: j.map(z => [z]),
    colPaths: E.map(z => [z]),
    counts: R,
    rowTotalsN: C,
    colTotalsN: J,
    grandTotal: K
  };
}
async function Up(a, s, u, d, p, m, x) {
  const b = p === "row" ? u.colVar : u.rowVar,
    D = new Set();
  for (let z = 0; z < s.length; z++) {
    z > 0 && z % Mp === 0 && (await Ip());
    const Q = s[z]?.[b];
    Q != null && Q !== "" && D.add(String(Q));
  }
  const j = bf(x, D);
  if (j.length === 0) throw new Error(`No usable data for "${d.name}" x "${b}"`);
  const E = d.options.map(z => z.label),
    R = p === "row" ? E.map(() => j.map(() => 0)) : j.map(() => E.map(() => 0)),
    C = p === "row" ? E.map(() => 0) : j.map(() => 0),
    J = p === "row" ? j.map(() => 0) : E.map(() => 0),
    pe = new Map(j.map((z, Q) => [z, Q])),
    oe = new Map(E.map((z, Q) => [z, Q]));
  let K = 0;
  for (let z = 0; z < s.length; z++) {
    z > 0 && z % Mp === 0 && (await Ip());
    const Q = s[z]?.[b];
    if (Q == null || Q === "") continue;
    const B = pe.get(String(Q));
    if (B == null) continue;
    const $ = a[z] ?? {};
    if (!au(d, $)) continue;
    K += 1;
    const ie = d.aggregateByCode ? ru(d, $) : nu(d, $);
    if (p === "row") {
      J[B] += 1;
      for (const Y of ie) {
        const ne = oe.get(Y);
        ne != null && (R[ne][B] += 1, C[ne] += 1);
      }
    } else {
      C[B] += 1;
      for (const Y of ie) {
        const ne = oe.get(Y);
        ne != null && (R[B][ne] += 1, J[ne] += 1);
      }
    }
  }
  return p === "row" ? {
    rowVar: d.name,
    colVar: b,
    rowLabel: d.label,
    colLabel: m,
    rowValues: E,
    colValues: j,
    rowLevelLabels: [d.label],
    colLevelLabels: [m],
    rowPaths: E.map(z => [z]),
    colPaths: j.map(z => [z]),
    counts: R,
    rowTotalsN: C,
    colTotalsN: J,
    grandTotal: K
  } : {
    rowVar: b,
    colVar: d.name,
    rowLabel: m,
    colLabel: d.label,
    rowValues: j,
    colValues: E,
    rowLevelLabels: [m],
    colLevelLabels: [d.label],
    rowPaths: j.map(z => [z]),
    colPaths: E.map(z => [z]),
    counts: R,
    rowTotalsN: C,
    colTotalsN: J,
    grandTotal: K
  };
}
function qc(a) {
  return a <= 0 ? "Net : " : `${"Sub".repeat(a)}net : `;
}
function wo(a, s) {
  let u = 0,
    d = a.parentId;
  const p = new Set();
  for (; d && !p.has(d);) {
    p.add(d);
    const m = s.find(x => x.id === d);
    if (!m) break;
    u += 1, d = m.parentId;
  }
  return u;
}
function mo(a, s) {
  const u = a.filter(b => b.rowKind !== "net");
  if (s.length === 0) return u;
  const d = s.map(b => {
      const D = u.filter(R => b.members.includes(R.key));
      if (D.length === 0) return null;
      const j = u.findIndex(R => R.key === D[0].key);
      if (j < 0) return null;
      const E = wo(b, s);
      return {
        group: b,
        insertBefore: j,
        depth: E,
        row: {
          key: `__net__${b.id}`,
          code: "",
          label: `${qc(E)}${b.name}`,
          count: D.reduce((R, C) => R + C.count, 0),
          percent: D.reduce((R, C) => R + C.percent, 0),
          factor: "",
          rowKind: "net",
          groupId: b.id,
          indentLevel: E
        }
      };
    }).filter(b => b !== null).sort((b, D) => b.insertBefore - D.insertBefore || b.depth - D.depth),
    p = new Map();
  d.forEach(b => {
    b.group.members.forEach(D => {
      p.set(D, Math.max(p.get(D) ?? -1, b.depth));
    });
  });
  const m = [];
  let x = 0;
  for (u.forEach((b, D) => {
    for (; d[x]?.insertBefore === D;) m.push(d[x].row), x += 1;
    const j = p.get(b.key);
    m.push({
      ...b,
      indentLevel: j != null ? j + 1 : 0
    });
  }); x < d.length;) m.push(d[x].row), x += 1;
  return m;
}
function Pg() {
  const [a, s] = M.useState(!1),
    [u, d] = M.useState(null),
    [p, m] = M.useState(0),
    [x, b] = M.useState(null);
  M.useEffect(() => {
    if (!a || u === null) return;
    let C = 0;
    const J = () => {
      m(Math.max(0, Date.now() - u)), C = window.requestAnimationFrame(J);
    };
    return J(), () => window.cancelAnimationFrame(C);
  }, [a, u]);
  const D = M.useCallback((C = Date.now()) => (s(!0), d(C), m(0), b(null), C), []),
    j = M.useCallback(C => {
      m(C.elapsedMs), b(C);
    }, []),
    E = M.useCallback(() => {
      d(null), s(!1);
    }, []),
    R = M.useCallback(() => {
      b(null);
    }, []);
  return {
    batchExporting: a,
    batchElapsedMs: p,
    batchExportSummary: x,
    beginBatchExport: D,
    completeBatchExport: j,
    endBatchExportSession: E,
    dismissBatchExportSummary: R
  };
}
const Ml = M.memo(function ({
  size: s = "md",
  withWordmark: u = !1,
  className: d = ""
}) {
  const p = s === "sm" ? "h-8 w-8" : s === "lg" ? "h-24 w-24" : "h-12 w-12",
    m = s === "sm" ? "border-[2.5px]" : s === "lg" ? "border-[5px]" : "border-[3px]",
    x = s === "sm" ? "border-[2px]" : s === "lg" ? "border-[4px]" : "border-[3px]",
    b = s === "sm" ? "text-[7px]" : s === "lg" ? "text-sm" : "text-[9px]",
    D = s === "sm" ? "text-base" : s === "lg" ? "text-2xl" : "text-lg",
    j = s === "sm" ? "text-[10px]" : s === "lg" ? "text-xs" : "text-[11px]";
  return l.jsxs("div", {
    className: `flex items-center gap-3 ${d}`,
    children: [l.jsxs("div", {
      className: `relative ${p} flex-shrink-0`,
      children: [l.jsx("div", {
        className: `absolute inset-0 rounded-full ${m} border-blue-100`
      }), l.jsx("div", {
        className: `absolute inset-[6%] rounded-full ${m} border-transparent border-t-[#6FB6FF] border-r-[#2F6FE4] border-b-[#1F4E78]`
      }), l.jsx("div", {
        className: `absolute inset-[24%] rounded-full bg-white shadow-sm ${x} border-[#1F4E78]`
      }), l.jsx("div", {
        className: `absolute inset-0 flex items-center justify-center font-black tracking-[0.18em] text-[#1F4E78] ${b}`,
        children: "CX"
      })]
    }), u && l.jsxs("div", {
      className: "flex flex-col leading-none",
      children: [l.jsx("span", {
        className: `font-black tracking-[0.02em] text-white ${D}`,
        children: "Crossify"
      }), l.jsx("span", {
        className: `mt-1 text-blue-200 ${j}`,
        children: "SPSS Edition"
      })]
    })]
  });
}); /**
    * @license lucide-react v0.469.0 - ISC
    *
    * This source code is licensed under the ISC license.
    * See the LICENSE file in the root directory of this source tree.
    */
const Rg = a => a.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
  kf = (...a) => a.filter((s, u, d) => !!s && s.trim() !== "" && d.indexOf(s) === u).join(" ").trim(); /**
                                                                                                       * @license lucide-react v0.469.0 - ISC
                                                                                                       *
                                                                                                       * This source code is licensed under the ISC license.
                                                                                                       * See the LICENSE file in the root directory of this source tree.
                                                                                                       */
var Fg = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
}; /**
   * @license lucide-react v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
const Mg = M.forwardRef(({
  color: a = "currentColor",
  size: s = 24,
  strokeWidth: u = 2,
  absoluteStrokeWidth: d,
  className: p = "",
  children: m,
  iconNode: x,
  ...b
}, D) => M.createElement("svg", {
  ref: D,
  ...Fg,
  width: s,
  height: s,
  stroke: a,
  strokeWidth: d ? Number(u) * 24 / Number(s) : u,
  className: kf("lucide", p),
  ...b
}, [...x.map(([j, E]) => M.createElement(j, E)), ...(Array.isArray(m) ? m : [m])])); /**
                                                                                     * @license lucide-react v0.469.0 - ISC
                                                                                     *
                                                                                     * This source code is licensed under the ISC license.
                                                                                     * See the LICENSE file in the root directory of this source tree.
                                                                                     */
const bt = (a, s) => {
  const u = M.forwardRef(({
    className: d,
    ...p
  }, m) => M.createElement(Mg, {
    ref: m,
    iconNode: s,
    className: kf(`lucide-${Rg(a)}`, d),
    ...p
  }));
  return u.displayName = `${a}`, u;
}; /**
   * @license lucide-react v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
const Ig = bt("ArrowDown", [["path", {
  d: "M12 5v14",
  key: "s699le"
}], ["path", {
  d: "m19 12-7 7-7-7",
  key: "1idqje"
}]]); /**
      * @license lucide-react v0.469.0 - ISC
      *
      * This source code is licensed under the ISC license.
      * See the LICENSE file in the root directory of this source tree.
      */
const Og = bt("ArrowRight", [["path", {
  d: "M5 12h14",
  key: "1ays0h"
}], ["path", {
  d: "m12 5 7 7-7 7",
  key: "xquz4c"
}]]); /**
      * @license lucide-react v0.469.0 - ISC
      *
      * This source code is licensed under the ISC license.
      * See the LICENSE file in the root directory of this source tree.
      */
const Vg = bt("ArrowUp", [["path", {
  d: "m5 12 7-7 7 7",
  key: "hav0vg"
}], ["path", {
  d: "M12 19V5",
  key: "x0mq9r"
}]]); /**
      * @license lucide-react v0.469.0 - ISC
      *
      * This source code is licensed under the ISC license.
      * See the LICENSE file in the root directory of this source tree.
      */
const zg = bt("Check", [["path", {
  d: "M20 6 9 17l-5-5",
  key: "1gmf2c"
}]]); /**
      * @license lucide-react v0.469.0 - ISC
      *
      * This source code is licensed under the ISC license.
      * See the LICENSE file in the root directory of this source tree.
      */
const mi = bt("ChevronDown", [["path", {
  d: "m6 9 6 6 6-6",
  key: "qrunsl"
}]]); /**
      * @license lucide-react v0.469.0 - ISC
      *
      * This source code is licensed under the ISC license.
      * See the LICENSE file in the root directory of this source tree.
      */
const Ag = bt("ChevronRight", [["path", {
  d: "m9 18 6-6-6-6",
  key: "mthhwq"
}]]); /**
      * @license lucide-react v0.469.0 - ISC
      *
      * This source code is licensed under the ISC license.
      * See the LICENSE file in the root directory of this source tree.
      */
const Bg = bt("ChevronUp", [["path", {
  d: "m18 15-6-6-6 6",
  key: "153udz"
}]]); /**
      * @license lucide-react v0.469.0 - ISC
      *
      * This source code is licensed under the ISC license.
      * See the LICENSE file in the root directory of this source tree.
      */
const Wp = bt("ClipboardCopy", [["rect", {
  width: "8",
  height: "4",
  x: "8",
  y: "2",
  rx: "1",
  ry: "1",
  key: "tgr4d6"
}], ["path", {
  d: "M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",
  key: "4jdomd"
}], ["path", {
  d: "M16 4h2a2 2 0 0 1 2 2v4",
  key: "3hqy98"
}], ["path", {
  d: "M21 14H11",
  key: "1bme5i"
}], ["path", {
  d: "m15 10-4 4 4 4",
  key: "5dvupr"
}]]); /**
      * @license lucide-react v0.469.0 - ISC
      *
      * This source code is licensed under the ISC license.
      * See the LICENSE file in the root directory of this source tree.
      */
const $g = bt("Copy", [["rect", {
  width: "14",
  height: "14",
  x: "8",
  y: "8",
  rx: "2",
  ry: "2",
  key: "17jyea"
}], ["path", {
  d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
  key: "zix9uf"
}]]); /**
      * @license lucide-react v0.469.0 - ISC
      *
      * This source code is licensed under the ISC license.
      * See the LICENSE file in the root directory of this source tree.
      */
const Ug = bt("Database", [["ellipse", {
  cx: "12",
  cy: "5",
  rx: "9",
  ry: "3",
  key: "msslwz"
}], ["path", {
  d: "M3 5V19A9 3 0 0 0 21 19V5",
  key: "1wlel7"
}], ["path", {
  d: "M3 12A9 3 0 0 0 21 12",
  key: "mv7ke4"
}]]); /**
      * @license lucide-react v0.469.0 - ISC
      *
      * This source code is licensed under the ISC license.
      * See the LICENSE file in the root directory of this source tree.
      */
const ho = bt("Download", [["path", {
  d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
  key: "ih7n3h"
}], ["polyline", {
  points: "7 10 12 15 17 10",
  key: "2ggqvy"
}], ["line", {
  x1: "12",
  x2: "12",
  y1: "15",
  y2: "3",
  key: "1vk2je"
}]]); /**
      * @license lucide-react v0.469.0 - ISC
      *
      * This source code is licensed under the ISC license.
      * See the LICENSE file in the root directory of this source tree.
      */
const Qc = bt("Filter", [["polygon", {
  points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3",
  key: "1yg77f"
}]]); /**
      * @license lucide-react v0.469.0 - ISC
      *
      * This source code is licensed under the ISC license.
      * See the LICENSE file in the root directory of this source tree.
      */
const Ac = bt("FolderInput", [["path", {
  d: "M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1",
  key: "fm4g5t"
}], ["path", {
  d: "M2 13h10",
  key: "pgb2dq"
}], ["path", {
  d: "m9 16 3-3-3-3",
  key: "6m91ic"
}]]); /**
      * @license lucide-react v0.469.0 - ISC
      *
      * This source code is licensed under the ISC license.
      * See the LICENSE file in the root directory of this source tree.
      */
const Hp = bt("FolderOpen", [["path", {
  d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",
  key: "usdka0"
}]]); /**
      * @license lucide-react v0.469.0 - ISC
      *
      * This source code is licensed under the ISC license.
      * See the LICENSE file in the root directory of this source tree.
      */
const Sf = bt("Folder", [["path", {
  d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
  key: "1kt360"
}]]); /**
      * @license lucide-react v0.469.0 - ISC
      *
      * This source code is licensed under the ISC license.
      * See the LICENSE file in the root directory of this source tree.
      */
const Gp = bt("Play", [["polygon", {
  points: "6 3 20 12 6 21 6 3",
  key: "1oa8hb"
}]]); /**
      * @license lucide-react v0.469.0 - ISC
      *
      * This source code is licensed under the ISC license.
      * See the LICENSE file in the root directory of this source tree.
      */
const Nf = bt("Plus", [["path", {
  d: "M5 12h14",
  key: "1ays0h"
}], ["path", {
  d: "M12 5v14",
  key: "s699le"
}]]); /**
      * @license lucide-react v0.469.0 - ISC
      *
      * This source code is licensed under the ISC license.
      * See the LICENSE file in the root directory of this source tree.
      */
const go = bt("RefreshCw", [["path", {
  d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",
  key: "v9h5vc"
}], ["path", {
  d: "M21 3v5h-5",
  key: "1q7to0"
}], ["path", {
  d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",
  key: "3uifl3"
}], ["path", {
  d: "M8 16H3v5",
  key: "1cv678"
}]]); /**
      * @license lucide-react v0.469.0 - ISC
      *
      * This source code is licensed under the ISC license.
      * See the LICENSE file in the root directory of this source tree.
      */
const Wg = bt("Save", [["path", {
  d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
  key: "1c8476"
}], ["path", {
  d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",
  key: "1ydtos"
}], ["path", {
  d: "M7 3v4a1 1 0 0 0 1 1h7",
  key: "t51u73"
}]]); /**
      * @license lucide-react v0.469.0 - ISC
      *
      * This source code is licensed under the ISC license.
      * See the LICENSE file in the root directory of this source tree.
      */
const jf = bt("Settings2", [["path", {
  d: "M20 7h-9",
  key: "3s1dr2"
}], ["path", {
  d: "M14 17H5",
  key: "gfn3mx"
}], ["circle", {
  cx: "17",
  cy: "17",
  r: "3",
  key: "18b49y"
}], ["circle", {
  cx: "7",
  cy: "7",
  r: "3",
  key: "dfmy0x"
}]]); /**
      * @license lucide-react v0.469.0 - ISC
      *
      * This source code is licensed under the ISC license.
      * See the LICENSE file in the root directory of this source tree.
      */
const Ul = bt("Trash2", [["path", {
  d: "M3 6h18",
  key: "d0wm0j"
}], ["path", {
  d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",
  key: "4alrt4"
}], ["path", {
  d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",
  key: "v07s0e"
}], ["line", {
  x1: "10",
  x2: "10",
  y1: "11",
  y2: "17",
  key: "1uufr5"
}], ["line", {
  x1: "14",
  x2: "14",
  y1: "11",
  y2: "17",
  key: "xtxkd"
}]]); /**
      * @license lucide-react v0.469.0 - ISC
      *
      * This source code is licensed under the ISC license.
      * See the LICENSE file in the root directory of this source tree.
      */
const ja = bt("Upload", [["path", {
  d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
  key: "ih7n3h"
}], ["polyline", {
  points: "17 8 12 3 7 8",
  key: "t8dd8p"
}], ["line", {
  x1: "12",
  x2: "12",
  y1: "3",
  y2: "15",
  key: "widbto"
}]]); /**
      * @license lucide-react v0.469.0 - ISC
      *
      * This source code is licensed under the ISC license.
      * See the LICENSE file in the root directory of this source tree.
      */
const Wl = bt("X", [["path", {
    d: "M18 6 6 18",
    key: "1bl5f8"
  }], ["path", {
    d: "m6 6 12 12",
    key: "d8bk6v"
  }]]),
  Kp = M.memo(function ({
    title: s,
    side: u,
    branches: d,
    selectedVar: p,
    mode: m,
    isQuickTarget: x = !1,
    getVarLabel: b,
    getVarTone: D,
    onActivateQuickTarget: j,
    onDrop: E,
    onClear: R,
    onReorder: C,
    onRemove: J,
    onSelect: pe,
    onMoveUp: oe,
    onMoveDown: K,
    onModeChange: z
  }) {
    const [Q, B] = M.useState(!1),
      $ = u === "top",
      ie = Xe(d),
      Y = ne => {
        const Z = ne.dataTransfer.getData("application/x-crossify-axis-item");
        if (!Z) return null;
        try {
          const fe = JSON.parse(Z);
          return fe.side !== u || typeof fe.branchIndex != "number" || typeof fe.itemIndex != "number" ? null : {
            branchIndex: fe.branchIndex,
            itemIndex: fe.itemIndex
          };
        } catch {
          return null;
        }
      },
      ne = fe => {
        fe.preventDefault(), fe.dataTransfer.dropEffect = "move", B(!0);
      },
      Z = fe => {
        fe.preventDefault(), fe.stopPropagation(), B(!1);
        const le = Y(fe);
        if (le && d.length > 0) {
          const H = d.length - 1,
            U = Math.max(d[H].length - 1, 0);
          C?.(le, {
            branchIndex: H,
            itemIndex: U,
            placement: "after"
          });
          return;
        }
        E({
          placement: "after"
        });
      };
    return l.jsxs("div", {
      onClick: j,
      onDragOver: ne,
      onDragLeave: () => B(!1),
      onDropCapture: Z,
      className: `border-2 rounded-xl transition-colors bg-white ${Q ? "border-blue-400 bg-blue-50" : x ? "border-blue-500 bg-blue-50/60 shadow-[0_0_0_3px_rgba(59,130,246,0.08)]" : "border-blue-200"} ${$ ? "w-full p-4" : "w-[220px] p-3 flex-shrink-0"}`,
      children: [l.jsxs("div", {
        className: "flex items-start justify-between gap-3",
        children: [l.jsxs("div", {
          className: "flex-1 min-w-0",
          children: [l.jsxs("div", {
            className: "mb-3 flex items-center gap-2",
            children: [l.jsx("div", {
              className: "text-xs font-bold text-gray-600 uppercase tracking-wide",
              children: s
            }), x && l.jsx("span", {
              className: "rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white",
              children: "Quick Add"
            })]
          }), ie.length > 0 ? l.jsx("div", {
            className: `${$ ? "flex flex-wrap items-start gap-px min-h-[84px]" : "flex flex-col gap-px min-h-[84px]"}`,
            children: d.map((fe, le) => l.jsxs("div", {
              className: $ ? "flex items-stretch gap-0" : "flex flex-col gap-0",
              children: [l.jsx("div", {
                onDragOver: H => {
                  H.preventDefault(), H.stopPropagation(), B(!0);
                },
                onDrop: H => {
                  H.preventDefault(), H.stopPropagation(), B(!1);
                  const U = Y(H);
                  if (U) {
                    C?.(U, {
                      branchIndex: le,
                      itemIndex: 0,
                      placement: "before"
                    });
                    return;
                  }
                  E({
                    branchIndex: le,
                    placement: "before"
                  });
                },
                className: $ ? `w-0.5 rounded ${m === "add" ? "hover:bg-blue-200/70" : "pointer-events-none opacity-0"}` : `h-1 rounded ${m === "add" ? "hover:bg-blue-200/70" : "pointer-events-none opacity-0"}`
              }), l.jsx("div", {
                className: "flex flex-col gap-px",
                children: fe.map((H, U) => {
                  const W = ie.indexOf(H),
                    q = D(H);
                  return l.jsxs("div", {
                    draggable: !0,
                    onClick: () => pe(H),
                    title: b(H),
                    onDragStart: se => {
                      se.dataTransfer.effectAllowed = "move", se.dataTransfer.setData("application/x-crossify-axis-item", JSON.stringify({
                        side: u,
                        branchIndex: le,
                        itemIndex: U
                      }));
                    },
                    onDragOver: se => {
                      const de = Y(se);
                      if (de) {
                        se.preventDefault(), se.stopPropagation(), se.dataTransfer.dropEffect = "move";
                        return;
                      }
                      ne(se);
                    },
                    onDrop: se => {
                      se.preventDefault(), se.stopPropagation(), B(!1);
                      const de = Y(se);
                      if (de) {
                        C?.(de, {
                          branchIndex: le,
                          itemIndex: U,
                          placement: "before"
                        });
                        return;
                      }
                      E({
                        targetVar: H
                      });
                    },
                    className: `group relative cursor-pointer transition-all shadow-sm ${$ ? "min-h-[42px] min-w-[86px] px-2 py-1.5 rounded-2xl" : "min-h-[44px] px-3 py-2 rounded-2xl"} ${q.cls} ${p === H ? "ring-2 ring-offset-1 ring-blue-300" : "hover:-translate-y-[1px] hover:shadow-md"}`,
                    children: [l.jsxs("div", {
                      className: "flex items-center gap-1.5",
                      children: [l.jsx("span", {
                        className: "inline-flex items-center justify-center rounded-full bg-white/80 px-1.5 py-0.5 text-[9px] font-bold text-slate-700 border border-white/70 shadow-sm",
                        children: q.badge
                      }), l.jsx("div", {
                        className: `font-semibold text-slate-800 leading-tight ${$ ? "text-[11px] truncate" : "text-xs pr-12 break-all"}`,
                        children: H
                      })]
                    }), l.jsxs("div", {
                      className: `absolute ${$ ? "bottom-0.5 right-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100" : "top-1/2 right-1 -translate-y-1/2 flex gap-0.5 opacity-70 group-hover:opacity-100"}`,
                      children: [l.jsx("button", {
                        onClick: se => {
                          se.stopPropagation(), oe(H);
                        },
                        disabled: W === 0,
                        className: "p-0.5 text-gray-400 hover:text-blue-600 disabled:opacity-30",
                        title: "Move up",
                        children: l.jsx(Bg, {
                          className: "w-3 h-3"
                        })
                      }), l.jsx("button", {
                        onClick: se => {
                          se.stopPropagation(), K(H);
                        },
                        disabled: W === ie.length - 1,
                        className: "p-0.5 text-gray-400 hover:text-blue-600 disabled:opacity-30",
                        title: "Move down",
                        children: l.jsx(mi, {
                          className: "w-3 h-3"
                        })
                      }), l.jsx("button", {
                        onClick: se => {
                          se.stopPropagation(), J(H, {
                            branchIndex: le,
                            itemIndex: U
                          });
                        },
                        className: "p-0.5 text-gray-400 hover:text-red-500",
                        title: "Remove",
                        children: l.jsx(Wl, {
                          className: "w-3 h-3"
                        })
                      })]
                    })]
                  }, `${H}-${le}-${U}`);
                })
              }), l.jsx("div", {
                onDragOver: H => {
                  H.preventDefault(), H.stopPropagation(), B(!0);
                },
                onDrop: H => {
                  H.preventDefault(), H.stopPropagation(), B(!1);
                  const U = Y(H);
                  if (U) {
                    C?.(U, {
                      branchIndex: le,
                      itemIndex: Math.max(fe.length - 1, 0),
                      placement: "after"
                    });
                    return;
                  }
                  E({
                    branchIndex: le,
                    placement: "after"
                  });
                },
                className: $ ? `w-0.5 rounded ${m === "add" ? "hover:bg-blue-200/70" : "pointer-events-none opacity-0"}` : `h-1 rounded ${m === "add" ? "hover:bg-blue-200/70" : "pointer-events-none opacity-0"}`
              })]
            }, `${s}-branch-${le}-${fe.join("__")}`))
          }) : l.jsx("div", {
            onDragOver: ne,
            onDropCapture: Z,
            className: "min-h-[84px] flex items-center justify-center rounded-lg border border-dashed border-gray-200 text-[11px] text-gray-400 text-center px-3",
            children: "Drag variable here"
          })]
        }), l.jsxs("div", {
          className: "flex flex-col items-center gap-2 pt-5",
          children: [l.jsx("button", {
            onClick: H => {
              H.stopPropagation(), z("add");
            },
            className: `min-w-[46px] px-2 py-1 rounded text-[11px] font-semibold border ${m === "add" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`,
            children: "Add"
          }), l.jsx("button", {
            onClick: H => {
              H.stopPropagation(), z("nest");
            },
            className: `min-w-[46px] px-2 py-1 rounded text-[11px] font-semibold border ${m === "nest" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`,
            children: "Nest"
          }), l.jsx("button", {
            onClick: H => {
              H.stopPropagation(), R?.();
            },
            disabled: ie.length === 0,
            className: "inline-flex min-w-[46px] items-center justify-center rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-600 disabled:cursor-not-allowed disabled:opacity-40",
            title: `Clear all ${s.toLowerCase()} variables`,
            children: "Clear"
          })]
        })]
      }), ie.length > 0 && l.jsx("p", {
        className: "mt-3 text-[10px] text-gray-400",
        children: m === "add" ? "Add mode: place next variable after the last level" : "Nest mode: insert next variable after the selected level"
      })]
    });
  }),
  Hg = M.memo(function ({
    table: s,
    batchEditCount: u = 1,
    quickAddTarget: d = "side",
    getVarLabel: p,
    getVarTone: m,
    onActivateQuickTarget: x,
    onDropTop: b,
    onDropSide: D,
    onClearTop: j,
    onClearSide: E,
    onReorderTop: R,
    onReorderSide: C,
    onRemoveTop: J,
    onRemoveSide: pe,
    onMoveTopUp: oe,
    onMoveTopDown: K,
    onMoveSideUp: z,
    onMoveSideDown: Q,
    onUpdateName: B,
    onGenerate: $,
    canRun: ie
  }) {
    const Y = ct(s.rowVar),
      ne = ct(s.colVar),
      Z = Xe(Y),
      fe = Xe(ne),
      [le, H] = M.useState(null),
      [U, W] = M.useState(null),
      [q, se] = M.useState("add"),
      [de, ge] = M.useState("add");
    return l.jsxs("div", {
      className: "flex flex-col gap-5 w-full max-w-2xl mx-auto",
      children: [l.jsxs("div", {
        className: "flex items-center gap-3",
        children: [l.jsx("span", {
          className: "text-xs text-gray-500 font-medium whitespace-nowrap",
          children: "Table Description"
        }), l.jsx("input", {
          value: s.name,
          onChange: y => B(y.target.value),
          className: "flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        }), u > 1 && l.jsxs("span", {
          className: "rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100 whitespace-nowrap",
          children: ["Editing ", u, " tables"]
        })]
      }), l.jsx("div", {
        className: "border-2 border-[#4472C4] rounded-xl p-5 bg-white shadow-sm",
        children: l.jsxs("div", {
          className: "flex flex-col gap-3",
          children: [l.jsx(Kp, {
            title: "Top",
            side: "top",
            branches: ne,
            selectedVar: le,
            mode: q,
            isQuickTarget: d === "top",
            getVarLabel: p,
            getVarTone: m,
            onActivateQuickTarget: () => x("top"),
            onDrop: y => b(q, {
              ...y,
              targetVar: y.targetVar ?? le
            }),
            onClear: j,
            onReorder: R,
            onRemove: (y, _) => {
              J(y, _), le === y && H(null);
            },
            onSelect: H,
            onMoveUp: oe,
            onMoveDown: K,
            onModeChange: se
          }), l.jsxs("div", {
            className: "flex gap-3",
            children: [l.jsx(Kp, {
              title: "Side",
              side: "side",
              branches: Y,
              selectedVar: U,
              mode: de,
              isQuickTarget: d === "side",
              getVarLabel: p,
              getVarTone: m,
              onActivateQuickTarget: () => x("side"),
              onDrop: y => D(de, {
                ...y,
                targetVar: y.targetVar ?? U
              }),
              onClear: E,
              onReorder: C,
              onRemove: (y, _) => {
                pe(y, _), U === y && W(null);
              },
              onSelect: W,
              onMoveUp: z,
              onMoveDown: Q,
              onModeChange: ge
            }), l.jsx("div", {
              className: "flex-1 border border-dashed border-gray-200 rounded-lg bg-gray-50/60 flex items-center justify-center min-h-[110px]",
              children: Z.length > 0 && fe.length > 0 ? l.jsxs("div", {
                className: "text-center px-3",
                children: [l.jsxs("p", {
                  className: "text-xs text-gray-600 font-medium",
                  children: [Z.map(p).join(" + "), " x ", fe.map(p).join(" + ")]
                }), l.jsx("p", {
                  className: "text-[10px] text-gray-400 mt-0.5",
                  children: "Press Run to generate the table"
                })]
              }) : l.jsx("p", {
                className: "text-xs text-gray-400 text-center px-3",
                children: "Drag variables to Top and Side"
              })
            })]
          })]
        })
      }), l.jsx("button", {
        onClick: $,
        disabled: !ie,
        className: "w-full py-2.5 bg-[#1F4E78] hover:bg-[#16375a] disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-sm shadow",
        children: "Run Table"
      })]
    });
  }),
  Gg = {
    in: "is any of",
    not_in: "is not any of",
    gt: ">",
    gte: ">=",
    lt: "<",
    lte: "<=",
    between: "between",
    contains: "contains",
    not_contains: "does not contain",
    is_blank: "is blank",
    not_blank: "is not blank"
  },
  ou = {
    all: "AND",
    any: "OR"
  };
function qp({
  value: a,
  onChange: s,
  compact: u = !1
}) {
  return l.jsx("div", {
    className: `inline-flex rounded-xl bg-blue-50 p-1 ring-1 ring-blue-100 ${u ? "" : "shadow-sm"}`,
    children: ["all", "any"].map(d => l.jsx("button", {
      onClick: () => s(d),
      className: `rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${a === d ? "bg-white text-[#1F4E78] shadow-sm" : "text-gray-500 hover:text-[#1F4E78]"}`,
      title: d === "all" ? "Every condition must match" : "Any condition can match",
      children: ou[d]
    }, d))
  });
}
function Qp({
  join: a,
  label: s
}) {
  return l.jsx("div", {
    className: "flex items-center justify-center py-1",
    children: l.jsxs("span", {
      className: "inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-[#1F4E78]",
      children: [l.jsx("span", {
        children: ou[a]
      }), l.jsx("span", {
        className: "text-[10px] font-medium text-blue-500",
        children: s
      })]
    })
  });
}
function Kg({
  groupId: a,
  condition: s,
  meta: u,
  getVarLabel: d,
  getVarTone: p,
  search: m,
  onSearchChange: x,
  onUpdateCondition: b,
  onRemoveCondition: D
}) {
  const j = p(s.variableName),
    E = (s.operator === "in" || s.operator === "not_in") && u.options.length > 0,
    R = m.trim() === "" ? u.options : u.options.filter(C => C.label.toLowerCase().includes(m.trim().toLowerCase()));
  return l.jsxs("div", {
    className: "rounded-2xl border border-blue-100 bg-white p-4 shadow-sm",
    children: [l.jsxs("div", {
      className: "flex items-start justify-between gap-3",
      children: [l.jsxs("div", {
        className: "flex items-center gap-2 min-w-0",
        children: [l.jsxs("span", {
          className: `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-slate-700 ${j.cls}`,
          children: [l.jsx("span", {
            className: "rounded-full bg-white/80 px-1.5 py-0.5 text-[9px] font-bold",
            children: j.badge
          }), l.jsx("span", {
            className: "truncate max-w-[220px]",
            children: s.variableName
          })]
        }), l.jsx("span", {
          className: "text-xs text-gray-500 truncate",
          children: d(s.variableName)
        })]
      }), l.jsx("button", {
        onClick: () => D(a, s.id),
        className: "text-gray-400 hover:text-red-500",
        title: "Remove filter",
        children: l.jsx(Wl, {
          className: "h-4 w-4"
        })
      })]
    }), l.jsxs("div", {
      className: "mt-3 flex flex-wrap items-center gap-2",
      children: [l.jsx("select", {
        value: s.operator,
        onChange: C => b(a, s.id, {
          operator: C.target.value
        }),
        className: "rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-200",
        children: u.operators.map(C => l.jsx("option", {
          value: C,
          children: Gg[C]
        }, C))
      }), s.operator === "between" && l.jsxs(l.Fragment, {
        children: [l.jsx("input", {
          value: s.value,
          onChange: C => b(a, s.id, {
            value: C.target.value
          }),
          placeholder: "min",
          className: "w-24 rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200"
        }), l.jsx("span", {
          className: "text-xs text-gray-400",
          children: "to"
        }), l.jsx("input", {
          value: s.secondaryValue,
          onChange: C => b(a, s.id, {
            secondaryValue: C.target.value
          }),
          placeholder: "max",
          className: "w-24 rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200"
        })]
      }), (s.operator === "gt" || s.operator === "gte" || s.operator === "lt" || s.operator === "lte" || s.operator === "contains" || s.operator === "not_contains") && l.jsx("input", {
        value: s.value,
        onChange: C => b(a, s.id, {
          value: C.target.value
        }),
        placeholder: u.kind === "numeric" ? "value" : "text",
        className: "min-w-[180px] rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200"
      })]
    }), E && l.jsxs("div", {
      className: "mt-3 space-y-2",
      children: [u.options.length > 8 && l.jsx("input", {
        value: m,
        onChange: C => x(C.target.value),
        placeholder: "Search code or label...",
        className: "w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200"
      }), l.jsx("div", {
        className: "max-h-36 overflow-auto rounded-xl border border-blue-100 bg-blue-50/40 p-2",
        children: l.jsxs("div", {
          className: "flex flex-wrap gap-2",
          children: [R.map(C => {
            const J = s.values.includes(C.key);
            return l.jsx("button", {
              onClick: () => {
                const pe = J ? s.values.filter(oe => oe !== C.key) : [...s.values, C.key];
                b(a, s.id, {
                  values: pe
                });
              },
              className: `rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${J ? "border-blue-600 bg-blue-600 text-white" : "border-blue-200 bg-white text-slate-700 hover:border-blue-300"}`,
              title: C.key,
              children: C.label
            }, C.key);
          }), R.length === 0 && l.jsx("div", {
            className: "px-2 py-1 text-[11px] text-gray-400",
            children: "No matching values"
          })]
        })
      })]
    })]
  });
}
const qg = M.memo(function ({
  table: s,
  batchEditCount: u = 1,
  isQuickTarget: d = !1,
  getVarLabel: p,
  getVarTone: m,
  getFilterFieldMeta: x,
  onActivateQuickTarget: b,
  onUpdateDescription: D,
  onUpdateRootJoin: j,
  onAddGroup: E,
  onClear: R,
  onDropVariable: C,
  onUpdateGroupJoin: J,
  onRemoveGroup: pe,
  onUpdateCondition: oe,
  onRemoveCondition: K,
  onGenerate: z,
  canRun: Q
}) {
  const [B, $] = M.useState({});
  return l.jsxs("div", {
    className: "flex w-full max-w-5xl flex-col gap-5 mx-auto",
    children: [l.jsxs("div", {
      className: "flex items-center gap-3",
      children: [l.jsx("span", {
        className: "whitespace-nowrap text-xs font-medium text-gray-500",
        children: "Filter Description"
      }), l.jsx("input", {
        value: s.filter.description,
        onChange: ie => D(ie.target.value),
        className: "flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300",
        placeholder: "Describe this filter..."
      }), u > 1 && l.jsxs("span", {
        className: "whitespace-nowrap rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100",
        children: ["Editing ", u, " tables"]
      })]
    }), l.jsxs("div", {
      onClick: b,
      className: `rounded-2xl border-2 bg-white p-5 shadow-sm transition-colors ${d ? "border-blue-500 bg-blue-50/40 shadow-[0_0_0_3px_rgba(59,130,246,0.08)]" : "border-[#4472C4]"}`,
      children: [l.jsxs("div", {
        className: "flex flex-wrap items-center justify-between gap-3",
        children: [l.jsxs("div", {
          className: "flex items-center gap-3",
          children: [l.jsxs("div", {
            className: "inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 ring-1 ring-blue-100",
            children: [l.jsx(Qc, {
              className: "h-4 w-4 text-[#1F4E78]"
            }), l.jsx("span", {
              className: "text-xs font-semibold text-[#1F4E78]",
              children: "Between Groups"
            })]
          }), d && l.jsx("span", {
            className: "rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white",
            children: "Quick Add"
          }), l.jsx(qp, {
            value: s.filter.rootJoin,
            onChange: j
          })]
        }), l.jsxs("div", {
          className: "flex items-center gap-2",
          children: [l.jsxs("button", {
            onClick: E,
            className: "inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700",
            children: [l.jsx(Nf, {
              className: "h-3.5 w-3.5"
            }), "Add Group"]
          }), l.jsxs("button", {
            onClick: R,
            className: "inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50",
            children: [l.jsx(Ul, {
              className: "h-3.5 w-3.5"
            }), "Clear"]
          })]
        })]
      }), l.jsx("p", {
        className: "mt-3 text-xs text-gray-500",
        children: "In the same group, conditions are joined with AND or OR. Between groups, the top toggle controls the final logic."
      }), l.jsx("div", {
        className: "mt-5 space-y-4",
        children: s.filter.groups.length === 0 ? l.jsx("div", {
          onDragOver: ie => {
            ie.preventDefault(), ie.dataTransfer.dropEffect = "move";
          },
          onDrop: ie => {
            ie.preventDefault(), ie.stopPropagation(), C();
          },
          className: "flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 px-6 text-center",
          children: l.jsxs("div", {
            className: "space-y-2",
            children: [l.jsx("div", {
              className: "mx-auto inline-flex rounded-2xl bg-white p-3 text-blue-600 shadow-sm ring-1 ring-blue-100",
              children: l.jsx(Qc, {
                className: "h-6 w-6"
              })
            }), l.jsx("p", {
              className: "text-sm font-semibold text-slate-700",
              children: "Drop a variable here to start filtering"
            }), l.jsx("p", {
              className: "text-xs text-gray-500",
              children: "A new filter group will be created automatically."
            })]
          })
        }) : s.filter.groups.map((ie, Y) => l.jsxs(M.Fragment, {
          children: [Y > 0 && l.jsx(Qp, {
            join: s.filter.rootJoin,
            label: "between groups"
          }), l.jsxs("div", {
            onDragOver: ne => {
              ne.preventDefault(), ne.dataTransfer.dropEffect = "move";
            },
            onDrop: ne => {
              ne.preventDefault(), ne.stopPropagation(), C(ie.id);
            },
            className: "rounded-2xl border border-blue-200 bg-gradient-to-br from-white to-blue-50/40 p-4",
            children: [l.jsxs("div", {
              className: "flex flex-wrap items-center justify-between gap-3",
              children: [l.jsxs("div", {
                className: "flex items-center gap-3",
                children: [l.jsxs("span", {
                  className: "rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1F4E78] ring-1 ring-blue-100",
                  children: ["Group ", Y + 1]
                }), l.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [l.jsx("span", {
                    className: "text-xs text-gray-500",
                    children: "Between conditions"
                  }), l.jsx(qp, {
                    value: ie.join,
                    onChange: ne => J(ie.id, ne),
                    compact: !0
                  })]
                })]
              }), l.jsxs("button", {
                onClick: () => pe(ie.id),
                className: "inline-flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-red-500",
                children: [l.jsx(Ul, {
                  className: "h-3.5 w-3.5"
                }), "Remove Group"]
              })]
            }), l.jsxs("div", {
              className: "mt-4 space-y-3",
              children: [ie.conditions.map((ne, Z) => {
                const fe = x(ne.variableName);
                return l.jsxs(M.Fragment, {
                  children: [Z > 0 && l.jsx(Qp, {
                    join: ie.join,
                    label: "between conditions"
                  }), l.jsx(Kg, {
                    groupId: ie.id,
                    condition: ne,
                    meta: fe,
                    getVarLabel: p,
                    getVarTone: m,
                    search: B[ne.id] ?? "",
                    onSearchChange: le => $(H => ({
                      ...H,
                      [ne.id]: le
                    })),
                    onUpdateCondition: oe,
                    onRemoveCondition: K
                  })]
                }, ne.id);
              }), l.jsxs("div", {
                className: "rounded-xl border border-dashed border-blue-200 bg-white/70 px-4 py-3 text-center text-xs text-gray-500",
                children: ["Drop another variable here to add more conditions joined by ", ou[ie.join]]
              })]
            })]
          })]
        }, ie.id))
      })]
    }), l.jsx("button", {
      onClick: z,
      disabled: !Q,
      className: "w-full rounded-xl bg-[#1F4E78] py-2.5 text-sm font-bold text-white shadow transition-colors hover:bg-[#16375a] disabled:cursor-not-allowed disabled:bg-gray-200",
      children: "Run Table"
    })]
  });
});
function Jp(a, s, u, d) {
  if (a === 0) return l.jsx("span", {
    className: "text-gray-300",
    children: "-"
  });
  const p = u ? a : null,
    m = d ? `${(s * 100).toFixed(1)}` : null;
  return p !== null && m !== null ? l.jsxs(l.Fragment, {
    children: [p, l.jsx("br", {}), l.jsxs("span", {
      className: "text-gray-500 text-[10px]",
      children: ["(", m, ")"]
    })]
  }) : p !== null ? l.jsx(l.Fragment, {
    children: p
  }) : m !== null ? l.jsx(l.Fragment, {
    children: m
  }) : l.jsx(l.Fragment, {
    children: "-"
  });
}
function Xp(a) {
  return !Number.isFinite(a) || a === 0 ? l.jsx("span", {
    className: "text-gray-300",
    children: "-"
  }) : l.jsx("span", {
    children: a.toFixed(2)
  });
}
function Qg(a, s) {
  return Array.from({
    length: s
  }, (u, d) => {
    const p = [];
    let m = "";
    return a.forEach(x => {
      const b = x.slice(0, d + 1).join(""),
        D = x[d] ?? "";
      p.length === 0 || b !== m ? (p.push({
        label: D,
        span: 1
      }), m = b) : p[p.length - 1].span += 1;
    }), p;
  });
}
function Jg(a) {
  return a.map((s, u) => s.map((d, p) => {
    if (u === 0) return d;
    const m = a[u - 1] ?? [];
    return s.slice(0, p + 1).every((b, D) => b === m[D]) ? "" : d;
  }));
}
function Xg(a, s) {
  const u = new Map(),
    d = new Set();
  return a.forEach((p, m) => {
    const x = (a[m + 1]?.startIndex ?? s) - 1;
    u.set(p.startIndex, {
      label: p.label,
      span: x - p.startIndex + 1
    });
    for (let b = p.startIndex + 1; b <= x; b++) d.add(b);
  }), {
    byStart: u,
    covered: d
  };
}
function Yg(a, s, u, d) {
  return d.length === 0 && u.length === 1 ? {
    rowPaths: s.map(p => [a.rowLabel, p[0] ?? ""]),
    rowLevelLabels: ["Variable", "Category"],
    rowSectionBases: [{
      startIndex: 0,
      label: a.rowLabel,
      totalN: a.grandTotal,
      colTotalsN: a.colTotalsN
    }]
  } : {
    rowPaths: s,
    rowLevelLabels: u,
    rowSectionBases: d
  };
}
function Zg({
  result: a,
  config: s
}) {
  const u = Lr(a, s.hideZeroRows ?? !1),
    {
      rowValues: d,
      colValues: p,
      counts: m,
      rowTotalsN: x,
      colTotalsN: b,
      grandTotal: D
    } = u,
    {
      showCount: j,
      showPercent: E,
      percentType: R
    } = s,
    C = u.rowPaths ?? d.map(y => [y]),
    J = u.colPaths ?? p.map(y => [y]),
    pe = u.rowLevelLabels ?? [u.rowLabel],
    oe = u.colLevelLabels ?? [u.colLabel],
    K = Yg(u, C, pe, u.rowSectionBases ?? []),
    z = K.rowPaths,
    Q = K.rowLevelLabels,
    B = u.rowTypes ?? d.map(() => "data"),
    $ = Jg(z),
    ie = Qg(J, oe.length),
    Y = K.rowSectionBases,
    ne = Xg(Y, d.length),
    Z = Q.length > 1 ? "w-[150px] min-w-[150px] max-w-[150px]" : "w-[220px] min-w-[220px] max-w-[220px]",
    fe = "w-[230px] min-w-[230px] max-w-[230px]",
    le = "w-[72px] min-w-[72px] max-w-[72px]",
    [H, U] = M.useState(!1),
    [W, q] = M.useState(null),
    se = M.useRef(null),
    de = y => D > 0 ? y / D : 0;
  function ge(y, _, Ne) {
    return l.jsxs("tr", {
      className: "bg-[#D9E1F2] font-bold",
      children: [l.jsx("td", {
        colSpan: Math.max(1, Q.length),
        className: "px-2 py-1.5 text-gray-800 border border-[#BDD7EE]",
        children: "Base"
      }), l.jsx("td", {
        className: "px-2 py-1.5 text-center text-gray-800 border border-[#BDD7EE] tabular-nums",
        children: y === 0 ? l.jsx("span", {
          className: "text-gray-300",
          children: "-"
        }) : y
      }), _.map((ue, ke) => l.jsx("td", {
        className: "px-2 py-1.5 text-center text-gray-800 border border-[#BDD7EE] tabular-nums",
        children: ue === 0 ? l.jsx("span", {
          className: "text-gray-300",
          children: "-"
        }) : ue
      }, ke))]
    }, Ne);
  }
  function A() {
    const y = [...Q, "Total", ...J.map(ue => ue.join(" / "))].join("	"),
      _ = ["Base", ...Array.from({
        length: Math.max(0, Q.length - 1)
      }, () => ""), String(D), ...b.map(ue => ue === 0 ? "-" : String(ue))].join("	"),
      Ne = d.map((ue, ke) => [...z[ke], B[ke] === "stat" ? Number.isFinite(x[ke]) ? x[ke].toFixed(2) : "-" : x[ke] === 0 ? "-" : String(x[ke]), ...p.map((Se, Ce) => B[ke] === "stat" ? Number.isFinite(m[ke][Ce]) && m[ke][Ce] !== 0 ? m[ke][Ce].toFixed(2) : "-" : m[ke][Ce] === 0 ? "-" : String(m[ke][Ce]))].join("	"));
    return [y, _, ...Ne].join(`
`);
  }
  async function G() {
    await navigator.clipboard.writeText(A()), U(!0), q(null), setTimeout(() => U(!1), 1800);
  }
  function re(y) {
    y.preventDefault(), q({
      x: y.clientX,
      y: y.clientY
    });
  }
  return M.useEffect(() => {
    if (!W) return;
    function y(_) {
      se.current && !se.current.contains(_.target) && q(null);
    }
    return document.addEventListener("mousedown", y), () => document.removeEventListener("mousedown", y);
  }, [W]), l.jsxs("div", {
    className: "flex flex-col gap-1",
    children: [l.jsx("div", {
      className: "flex justify-end",
      children: l.jsx("button", {
        onClick: G,
        title: "Copy table as TSV (paste to Excel)",
        className: "flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-md shadow-sm text-xs text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors",
        children: H ? l.jsxs(l.Fragment, {
          children: [l.jsx(zg, {
            className: "w-3.5 h-3.5 text-green-500"
          }), l.jsx("span", {
            className: "text-green-600 font-semibold",
            children: "Copied!"
          })]
        }) : l.jsxs(l.Fragment, {
          children: [l.jsx(Wp, {
            className: "w-3.5 h-3.5"
          }), "Copy Table"]
        })
      })
    }), l.jsx("div", {
      className: "overflow-auto rounded-lg border border-gray-200 text-[11px] select-none max-h-[72vh]",
      onContextMenu: re,
      children: l.jsxs("table", {
        className: "border-collapse table-fixed min-w-[980px]",
        children: [l.jsxs("colgroup", {
          children: [Q.map((y, _) => l.jsx("col", {
            className: _ === 0 ? Z : fe
          }, `row-col-${_}`)), l.jsx("col", {
            className: le
          }), p.map((y, _) => l.jsx("col", {
            className: le
          }, `data-col-${_}`))]
        }), l.jsxs("thead", {
          children: [l.jsxs("tr", {
            children: [l.jsx("th", {
              colSpan: Math.max(1, Q.length),
              rowSpan: ie.length + 1,
              className: "border-0 bg-transparent p-0"
            }), l.jsx("th", {
              className: "bg-[#1F4E78] text-white px-2 py-1.5 text-center border border-[#BDD7EE] font-bold whitespace-nowrap",
              children: "Total"
            }), l.jsx("th", {
              colSpan: p.length,
              className: "bg-[#1F4E78] text-white px-2 py-1.5 text-center border border-[#BDD7EE] font-bold",
              children: l.jsx("div", {
                className: "max-w-full overflow-hidden text-ellipsis whitespace-nowrap",
                title: u.colLabel,
                children: u.colLabel
              })
            })]
          }), ie.map((y, _) => l.jsxs("tr", {
            children: [_ === ie.length - 1 ? l.jsx(l.Fragment, {
              children: l.jsxs("th", {
                className: "bg-[#2E75B6] border border-[#BDD7EE] px-2 py-1.5 text-white text-center text-[10px] font-normal opacity-70",
                children: ["n=", D.toLocaleString()]
              })
            }) : l.jsx(l.Fragment, {
              children: l.jsx("th", {
                className: "bg-[#2E75B6] border border-[#BDD7EE]"
              })
            }), y.map((Ne, ue) => l.jsx("th", {
              colSpan: Ne.span,
              className: "bg-[#2E75B6] text-white px-3 py-1.5 text-center border border-[#BDD7EE] font-semibold",
              children: l.jsx("div", {
                className: "max-w-full overflow-hidden text-ellipsis whitespace-nowrap",
                title: Ne.label,
                children: Ne.label
              })
            }, `${_}-${ue}-${Ne.label}`))]
          }, oe[_] ?? _))]
        }), l.jsxs("tbody", {
          children: [Y.length === 0 && ge(D, b, "base-global"), d.map((y, _) => {
            const Ne = Y.find(Se => Se.startIndex === _),
              ue = B[_] === "stat",
              ke = B[_] === "net";
            return l.jsxs(M.Fragment, {
              children: [Ne && ge(Ne.totalN, Ne.colTotalsN, `base-${_}`), l.jsxs("tr", {
                className: ue ? "bg-red-50" : ke ? "bg-emerald-50" : _ % 2 === 0 ? "bg-white" : "bg-[#EBF3FB]",
                children: [Y.length > 0 ? l.jsxs(l.Fragment, {
                  children: [ne.byStart.get(_) && l.jsx("td", {
                    rowSpan: ne.byStart.get(_).span,
                    className: `px-2 py-1.5 border border-[#BDD7EE] text-gray-800 align-middle bg-white break-words whitespace-normal ${ke ? "text-emerald-800 font-semibold" : ""}`,
                    children: ne.byStart.get(_).label
                  }), !ne.covered.has(_) && $[_].slice(1).map((Se, Ce) => l.jsx("td", {
                    className: `px-2 py-1.5 border border-[#BDD7EE] break-words whitespace-normal ${Ce === $[_].slice(1).length - 1 ? "font-medium text-gray-800" : "text-gray-600"} ${ke ? "text-emerald-800 font-semibold" : ""}`,
                    children: Se || l.jsx("span", {
                      className: "text-transparent",
                      children: "."
                    })
                  }, `${y}-${Ce + 1}`)), ne.covered.has(_) && $[_].slice(1).map((Se, Ce) => l.jsx("td", {
                    className: `px-2 py-1.5 border border-[#BDD7EE] break-words whitespace-normal ${Ce === $[_].slice(1).length - 1 ? "font-medium text-gray-800" : "text-gray-600"} ${ke ? "text-emerald-800 font-semibold" : ""}`,
                    children: Se || l.jsx("span", {
                      className: "text-transparent",
                      children: "."
                    })
                  }, `${y}-${Ce + 1}`))]
                }) : $[_].map((Se, Ce) => l.jsx("td", {
                  className: `px-2 py-1.5 border border-[#BDD7EE] break-words whitespace-normal ${Ce === $[_].length - 1 ? "font-medium text-gray-800" : "text-gray-600"} ${ke ? "text-emerald-800 font-semibold" : ""}`,
                  children: Se || l.jsx("span", {
                    className: "text-transparent",
                    children: "."
                  })
                }, `${y}-${Ce}`)), l.jsx("td", {
                  className: `px-2 py-1.5 text-center font-semibold border border-[#BDD7EE] tabular-nums ${ue ? "bg-red-100 text-red-700" : ke ? "bg-emerald-100 text-emerald-800" : "text-gray-800 bg-[#D6E4F0]"}`,
                  children: ue ? Xp(x[_]) : Jp(x[_], de(x[_]), j, E)
                }), p.map((Se, Ce) => {
                  const ze = m[_][Ce],
                    We = zh(ze, _, Ce, u, R);
                  return l.jsx("td", {
                    className: `px-2 py-1.5 text-center border border-[#BDD7EE] tabular-nums ${ue ? "text-red-700 bg-red-50 font-semibold" : ke ? "text-emerald-800 bg-emerald-50 font-semibold" : "text-gray-700"}`,
                    children: ue ? Xp(ze) : Jp(ze, We, j, E)
                  }, Ce);
                })]
              })]
            }, y);
          })]
        })]
      })
    }), W && l.jsx("div", {
      ref: se,
      style: {
        position: "fixed",
        top: W.y,
        left: W.x,
        zIndex: 9999
      },
      className: "bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[160px] text-sm",
      children: l.jsxs("button", {
        onClick: G,
        className: "w-full flex items-center gap-2.5 px-3 py-2 hover:bg-blue-50 hover:text-blue-700 transition-colors text-gray-700",
        children: [l.jsx(Wp, {
          className: "w-4 h-4 flex-shrink-0"
        }), l.jsx("span", {
          children: "Copy Table"
        }), l.jsx("span", {
          className: "ml-auto text-[10px] text-gray-400",
          children: "TSV"
        })]
      })
    })]
  });
}
const Yp = M.memo(function ({
    table: s,
    active: u,
    selected: d,
    hasActiveFilter: p,
    filterSummary: m,
    folders: x,
    onClick: b,
    onDelete: D,
    onRename: j,
    onToggleSelect: E,
    onMoveToFolder: R,
    onDuplicate: C,
    onDragStart: J,
    onDropToRow: pe,
    indent: oe
  }) {
    const [K, z] = M.useState(!1),
      [Q, B] = M.useState(!1),
      [$, ie] = M.useState("");
    function Y() {
      const Z = $.trim();
      j(Z || s.name), B(!1);
    }
    function ne(Z) {
      b({
        shiftKey: Z.shiftKey,
        metaKey: Z.metaKey,
        ctrlKey: Z.ctrlKey
      });
    }
    return l.jsxs("div", {
      draggable: !0,
      onDragStart: J,
      onDragOver: Z => Z.preventDefault(),
      onDrop: Z => {
        Z.preventDefault(), Z.stopPropagation(), pe();
      },
      onClick: ne,
      className: `flex items-center gap-1.5 py-2 cursor-pointer group transition-colors
        ${oe ? "pl-6 pr-2" : "px-2"}
        ${u ? "bg-blue-50 border-l-2 border-[#1F4E78]" : d ? "bg-blue-50/70 border-l-2 border-blue-200" : "hover:bg-gray-50 border-l-2 border-transparent"}`,
      children: [l.jsx("input", {
        type: "checkbox",
        checked: d,
        onClick: Z => {
          Z.stopPropagation(), E({
            shiftKey: Z.shiftKey,
            metaKey: Z.metaKey,
            ctrlKey: Z.ctrlKey
          });
        },
        readOnly: !0,
        className: "w-3 h-3 flex-shrink-0 accent-[#1F4E78] cursor-pointer",
        title: "Select table"
      }), l.jsx("span", {
        className: `w-2 h-2 rounded-full flex-shrink-0 ${s.result ? "bg-green-400" : "bg-gray-300"}`
      }), p && l.jsx("span", {
        className: `inline-flex h-4 w-4 items-center justify-center rounded-full border flex-shrink-0 ${u ? "border-blue-200 bg-blue-100 text-blue-700" : "border-amber-200 bg-amber-50 text-amber-600"}`,
        title: m || "This table has an active filter",
        children: l.jsx(Qc, {
          className: "h-2.5 w-2.5"
        })
      }), Q ? l.jsx("input", {
        value: $,
        autoFocus: !0,
        onClick: Z => Z.stopPropagation(),
        onChange: Z => ie(Z.target.value),
        onBlur: Y,
        onKeyDown: Z => {
          Z.key === "Enter" && Y(), Z.key === "Escape" && (ie(s.name), B(!1));
        },
        className: `flex-1 text-xs bg-transparent outline-none min-w-0 ${u ? "text-[#1F4E78] font-semibold" : "text-gray-700"}`
      }) : l.jsx("button", {
        onClick: Z => {
          Z.stopPropagation(), ne(Z);
        },
        onDoubleClick: Z => {
          Z.stopPropagation(), ie(s.name), B(!0);
        },
        className: `flex-1 text-left text-xs bg-transparent outline-none min-w-0 truncate ${u ? "text-[#1F4E78] font-semibold" : "text-gray-700"}`,
        title: "Double-click to rename",
        children: s.name
      }), x.length > 0 && l.jsxs("div", {
        className: "relative flex-shrink-0",
        children: [l.jsx("button", {
          onClick: Z => {
            Z.stopPropagation(), z(fe => !fe);
          },
          className: "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto text-gray-400 hover:text-amber-500 p-0.5",
          title: "Move to folder",
          children: l.jsx(Sf, {
            className: "w-3 h-3"
          })
        }), K && l.jsxs(l.Fragment, {
          children: [l.jsx("div", {
            className: "fixed inset-0 z-10",
            onClick: () => z(!1)
          }), l.jsxs("div", {
            className: "absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]",
            children: [l.jsx("button", {
              className: "block w-full text-left px-3 py-1 text-xs text-gray-600 hover:bg-gray-50",
              onClick: Z => {
                Z.stopPropagation(), R(null), z(!1);
              },
              children: "(No folder)"
            }), x.map(Z => l.jsx("button", {
              className: "block w-full text-left px-3 py-1 text-xs text-gray-700 hover:bg-amber-50",
              onClick: fe => {
                fe.stopPropagation(), R(Z.id), z(!1);
              },
              children: Z.name
            }, Z.id))]
          })]
        })]
      }), l.jsx("button", {
        onClick: Z => {
          Z.stopPropagation(), C();
        },
        className: "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto text-gray-400 hover:text-blue-500 flex-shrink-0",
        title: "Duplicate this table",
        children: l.jsx($g, {
          className: "w-3 h-3"
        })
      }), l.jsx("button", {
        onClick: Z => {
          Z.stopPropagation(), D();
        },
        className: "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto text-gray-400 hover:text-red-500 flex-shrink-0",
        title: "Delete table",
        children: l.jsx(Ul, {
          className: "w-3.5 h-3.5"
        })
      })]
    });
  }),
  yo = 46,
  Zp = 4;
function ex(a) {
  return "isGroupedMA" in a && a.isGroupedMA ? "ma" : a.isString ? "text" : Object.keys(a.valueLabels).length === 0 ? "numeric" : "sa";
}
const tx = {
    text: {
      label: "A",
      cls: "bg-amber-100 text-amber-700 border border-amber-300",
      title: "Text"
    },
    sa: {
      label: "SA",
      cls: "bg-blue-100 text-blue-700 border border-blue-300",
      title: "Single Answer"
    },
    ma: {
      label: "MA",
      cls: "bg-emerald-100 text-emerald-700 border border-emerald-300",
      title: "Multiple Answer"
    },
    numeric: {
      label: "#",
      cls: "bg-gray-100 text-gray-500 border border-gray-300",
      title: "Numeric"
    }
  },
  nx = M.memo(function ({
    v: s,
    onDragStart: u,
    onOpen: d,
    selected: p = !1,
    activeTarget: m = "side",
    onSelect: x,
    onQuickAction: b
  }) {
    const D = tx[ex(s)],
      j = {
        top: "Top",
        side: "Side",
        filter: "Filter"
      };
    return l.jsxs("div", {
      draggable: !0,
      onDragStart: E => {
        E.dataTransfer.effectAllowed = "move", E.dataTransfer.setData("text/plain", s.name), u(s.name);
      },
      onDoubleClick: () => d?.(s.name),
      onClick: E => x?.(s.name, {
        shiftKey: E.shiftKey,
        metaKey: E.metaKey,
        ctrlKey: E.ctrlKey
      }),
      className: `group flex items-start gap-1.5 px-2 py-1.5 rounded cursor-grab active:bg-blue-100 select-none ${p ? "bg-blue-50/70 ring-1 ring-blue-100" : "hover:bg-blue-50"}`,
      style: {
        height: yo
      },
      children: [l.jsx("span", {
        className: `mt-0.5 flex-shrink-0 w-5 h-4 rounded text-[9px] font-bold flex items-center justify-center ${D.cls}`,
        title: D.title,
        children: D.label
      }), l.jsxs("div", {
        className: "min-w-0 flex-1 pr-2",
        children: [l.jsx("div", {
          className: "text-xs font-medium text-gray-800 truncate leading-tight",
          children: s.name
        }), l.jsx("div", {
          className: "text-[10px] text-gray-400 truncate",
          children: s.label || s.longName
        })]
      }), l.jsxs("div", {
        className: "ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100",
        children: [l.jsx("button", {
          type: "button",
          onMouseDown: E => E.preventDefault(),
          onClick: E => {
            E.stopPropagation(), b?.(s.name, m);
          },
          className: "rounded-full border border-blue-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-blue-700 shadow-sm hover:bg-blue-50",
          title: `Add to ${j[m]}`,
          children: "Add"
        }), l.jsx("button", {
          type: "button",
          onMouseDown: E => E.preventDefault(),
          onClick: E => {
            E.stopPropagation(), b?.(s.name, "table");
          },
          className: "rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50",
          title: "Create table from variable",
          children: "Tbl"
        })]
      })]
    });
  });
function rx({
  variables: a,
  onDragStart: s,
  onOpen: u,
  activeTarget: d = "side",
  selectedNames: p = new Set(),
  onSelect: m,
  onClearSelection: x,
  onQuickAction: b,
  onSetActiveTarget: D
}) {
  const j = M.useRef(null),
    [E, R] = M.useState(""),
    [C, J] = M.useState({
      top: 0,
      height: 400
    }),
    pe = E ? a.filter(oe => (oe.label || "").toLowerCase().includes(E.toLowerCase()) || (oe.longName || "").toLowerCase().includes(E.toLowerCase()) || oe.name.toLowerCase().includes(E.toLowerCase())) : a;
  M.useEffect(() => {
    function oe(K) {
      const z = K.target;
      j.current?.contains(z) || x?.();
    }
    return window.addEventListener("pointerdown", oe), () => window.removeEventListener("pointerdown", oe);
  }, [x]);
  M.useLayoutEffect(() => {
    const oe = j.current;
    if (oe && oe.clientHeight > 0 && J(K => K.height === oe.clientHeight ? K : {
      ...K,
      height: oe.clientHeight
    }), !oe) return;
    const z = new ResizeObserver(() => {
      oe.clientHeight > 0 && J(K => K.height === oe.clientHeight ? K : {
        ...K,
        height: oe.clientHeight
      });
    });
    return z.observe(oe), () => z.disconnect();
  }, []);
  const {
      top: oe,
      height: K
    } = C,
    z = pe.length * yo,
    Q = Math.max(0, Math.floor(oe / yo) - Zp),
    B = Math.min(pe.length, Math.ceil((oe + K) / yo) + Zp),
    $ = pe.slice(Q, B),
    ie = M.useCallback(() => {
      const le = j.current;
      le && J(H => {
        const U = le.clientHeight > 0 ? le.clientHeight : H.height;
        return H.top === le.scrollTop && H.height === U ? H : {
          top: le.scrollTop,
          height: U
        };
      });
    }, []),
    Y = p.size > 0 ? Array.from(p)[0] : null,
    ne = {
      top: "Top",
      side: "Side",
      filter: "Filter"
    };
  return l.jsxs("div", {
    className: "flex flex-col h-full overflow-hidden",
    children: [l.jsx("div", {
      className: "px-2 py-1.5 border-b border-gray-100 flex-shrink-0",
      children: l.jsx("input", {
        value: E,
        onChange: le => R(le.target.value),
        placeholder: "ค้นหาตัวแปร...",
        className: "w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-300 select-text"
      })
    }), l.jsx("div", {
      ref: j,
      onScroll: ie,
      className: "flex-1 overflow-y-auto",
      children: l.jsx("div", {
        style: {
          height: z,
          position: "relative"
        },
        children: $.map((le, H) => l.jsx("div", {
          style: {
            position: "absolute",
            top: (Q + H) * yo,
            left: 0,
            right: 0,
            height: yo
          },
          children: l.jsx(nx, {
            v: le,
            onDragStart: s,
            onOpen: u,
            selected: p.has(le.name),
            activeTarget: d,
            onSelect: m,
            onQuickAction: b
          })
        }, `${Q + H}_${le.name}`))
      })
    }), l.jsxs("div", {
      className: "px-2 py-1.5 text-[10px] text-gray-400 border-t border-gray-100 flex-shrink-0 space-y-2",
      children: [l.jsxs("div", {
        className: "flex items-center justify-between gap-2",
        children: [l.jsx("span", {
          children: E ? `${pe.length} / ${a.length}` : `${a.length} variables`
        }), l.jsxs("span", {
          className: "font-semibold text-blue-500",
          children: ["Quick add: ", ne[d]]
        })]
      }), l.jsxs("div", {
        className: "flex flex-wrap items-center gap-1.5",
        children: [["top", "Top"], ["side", "Side"], ["filter", "Filter"]].map(([le, H]) => l.jsx("button", {
          type: "button",
          onClick: () => D?.(le),
          className: `rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors ${d === le ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-700"}`,
          children: H
        }, le))
      }), p.size > 0 && l.jsxs("div", {
        className: "flex flex-wrap items-center justify-between gap-2 pt-1",
        children: [l.jsxs("span", {
          className: "text-[10px] font-semibold text-slate-500",
          children: [p.size, " selected"]
        }), l.jsxs("div", {
          className: "flex items-center gap-1.5",
          children: [Y && l.jsx("button", {
            type: "button",
            onClick: () => b?.(Y, "table"),
            className: "rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-50",
            children: p.size > 1 ? "Create Tables" : "Create Table"
          }), l.jsx("button", {
            type: "button",
            onClick: () => x?.(),
            className: "rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-600 hover:bg-gray-50",
            children: "Clear"
          })]
        })]
      })]
    })]
  });
}
const ax = 1e3 * 60 * 3,
  ox = 1e3 * 30,
  ix = 150 * 1024 * 1024;
function lx() {
  if (typeof window > "u") return crypto.randomUUID();
  const a = "crossify-settings-session-id";
  try {
    const u = window.sessionStorage.getItem(a)?.trim();
    if (u) return u;
  } catch {}
  const s = crypto.randomUUID();
  try {
    window.sessionStorage.setItem(a, s);
  } catch {}
  return s;
}
function sx() {
  if (typeof window > "u") return {
    ownerLabel: "Crossify User",
    machineLabel: "Browser Session"
  };
  const a = "crossify-editor-identity";
  try {
    const d = window.localStorage.getItem(a);
    if (d) {
      const p = JSON.parse(d);
      if (p.ownerLabel && p.machineLabel) return {
        ownerLabel: p.ownerLabel,
        machineLabel: p.machineLabel
      };
    }
  } catch {}
  const s = typeof navigator < "u" ? navigator.language.toUpperCase() : "LOCAL",
    u = {
      ownerLabel: `Crossify User ${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      machineLabel: `${s} Browser`
    };
  try {
    window.localStorage.setItem(a, JSON.stringify(u));
  } catch {}
  return u;
}
const ef = 250;
async function Il() {
  return Yc(() => import("./excelExport-CFUKVLbe.js"), __vite__mapDeps([2, 1, 3]));
}
async function Bc() {
  return Yc(() => Promise.resolve().then(() => fg), void 0);
}
function xo() {
  return new Promise(a => {
    if (typeof window.requestAnimationFrame == "function") {
      window.requestAnimationFrame(() => a());
      return;
    }
    window.setTimeout(() => a(), 0);
  });
}
function vo(a, s = null) {
  return {
    id: crypto.randomUUID(),
    name: `Table${a}`,
    rowVar: null,
    colVar: null,
    result: null,
    folderId: s,
    filter: bo()
  };
}
function bo() {
  return {
    description: "",
    rootJoin: "all",
    groups: []
  };
}
function fi(a) {
  return a ? a.groups.some(s => s.conditions.length > 0) : !1;
}
const tf = {
  all: "AND",
  any: "OR"
};
function cx({
  settings: a,
  onChange: s
}) {
  const [u, d] = M.useState(!1);
  return l.jsxs("div", {
    className: "relative",
    children: [l.jsxs("button", {
      onClick: () => d(p => !p),
      className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border
          ${u ? "bg-[#1F4E78] text-white border-[#1F4E78]" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-700"}`,
      children: [l.jsx(jf, {
        className: "w-3.5 h-3.5"
      }), "Output Options"]
    }), u && l.jsxs(l.Fragment, {
      children: [l.jsx("div", {
        className: "fixed inset-0 z-10",
        onClick: () => d(!1)
      }), l.jsxs("div", {
        className: "absolute right-0 top-full mt-2 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-72",
        children: [l.jsxs("p", {
          className: "text-xs font-bold text-gray-600 uppercase tracking-wide mb-3",
          children: ["Output Options ", l.jsx("span", {
            className: "text-blue-500 font-normal normal-case",
            children: "(ใช้กับทุก Table)"
          })]
        }), l.jsxs("div", {
          className: "flex gap-5 mb-3",
          children: [l.jsxs("label", {
            className: "flex items-center gap-2 cursor-pointer",
            children: [l.jsx("input", {
              type: "checkbox",
              checked: a.showCount,
              onChange: p => s({
                showCount: p.target.checked
              }),
              className: "w-4 h-4 accent-[#1F4E78]"
            }), l.jsx("span", {
              className: "text-sm text-gray-700",
              children: "Count (N)"
            })]
          }), l.jsxs("label", {
            className: "flex items-center gap-2 cursor-pointer",
            children: [l.jsx("input", {
              type: "checkbox",
              checked: a.showPercent,
              onChange: p => s({
                showPercent: p.target.checked
              }),
              className: "w-4 h-4 accent-[#1F4E78]"
            }), l.jsx("span", {
              className: "text-sm text-gray-700",
              children: "Percentage (%)"
            })]
          })]
        }), l.jsxs("label", {
          className: "flex items-center gap-2 cursor-pointer mb-3",
          children: [l.jsx("input", {
            type: "checkbox",
            checked: a.hideZeroRows,
            onChange: p => s({
              hideZeroRows: p.target.checked
            }),
            className: "w-4 h-4 accent-[#1F4E78]"
          }), l.jsx("span", {
            className: "text-sm text-gray-700",
            children: "Hide zero rows"
          })]
        }), a.showPercent && l.jsx("div", {
          className: "flex gap-3 flex-wrap",
          children: ["row", "column", "total"].map(p => l.jsxs("label", {
            className: "flex items-center gap-1.5 cursor-pointer",
            children: [l.jsx("input", {
              type: "radio",
              name: "global-pct",
              checked: a.percentType === p,
              onChange: () => s({
                percentType: p
              }),
              className: "w-4 h-4 accent-[#1F4E78]"
            }), l.jsx("span", {
              className: "text-sm text-gray-700",
              children: p === "row" ? "Row %" : p === "column" ? "Column %" : "Total %"
            })]
          }, p))
        }), l.jsx("div", {
          className: "mt-3 pt-3 border-t border-gray-100",
          children: l.jsx("p", {
            className: "text-[10px] text-gray-400",
            children: "การเปลี่ยน settings จะมีผลกับ Table ที่ Run ใหม่เท่านั้น"
          })
        })]
      })]
    })]
  });
}
function ux() {
  const [a, s] = M.useState(!0),
    [u, d] = M.useState("th"),
    [p, m] = M.useState(null),
    [x, b] = M.useState(!1),
    [D, j] = M.useState([]),
    [E, R] = M.useState(!1),
    [C, J] = M.useState(null),
    [pe, oe] = M.useState(0),
    [K, z] = M.useState(null),
    [Q, B] = M.useState(null),
    [$, ie] = M.useState({
      showCount: !0,
      showPercent: !0,
      percentType: "column",
      hideZeroRows: !1
    }),
    [Y, ne] = M.useState([vo(1)]),
    [Z, fe] = M.useState(""),
    [le, H] = M.useState("design"),
    [U, W] = M.useState(!1),
    [q, se] = M.useState(new Set()),
    [de, ge] = M.useState(null),
    [quickAddTarget, setQuickAddTarget] = M.useState("side"),
    [selectedVariableNames, setSelectedVariableNames] = M.useState(new Set()),
    [lastSelectedVariableName, setLastSelectedVariableName] = M.useState(null),
    [A, G] = M.useState(!1),
    [re, y] = M.useState(236),
    [_, Ne] = M.useState(!1),
    [ue, ke] = M.useState({}),
    [Se, Ce] = M.useState(null),
    [ze, We] = M.useState([]),
    [rt, $t] = M.useState([]),
    [An, Vt] = M.useState(null),
    [hr, gr] = M.useState("asc"),
    [ta, Cn] = M.useState(null),
    [_n, Bn] = M.useState(["mean"]),
    [ut, Pt] = M.useState([]),
    [$n, Dn] = M.useState(null),
    [Da, he] = M.useState(!1),
    [Re, Ke] = M.useState("UPC"),
    [qe, at] = M.useState(null),
    [Nt, vt] = M.useState(null),
    [na, nn] = M.useState("match"),
    [Ye, Rt] = M.useState(null),
    [Un, Xt] = M.useState([]),
    [ot, rn] = M.useState(!1),
    [Ut, Yt] = M.useState(null),
    [_t, Ta] = M.useState(null),
    [xn, an] = M.useState(!1),
    [Wn, Pr] = M.useState([]),
    on = M.useRef(null),
    ln = M.useRef(null),
    xr = M.useRef(null),
    La = M.useRef(null),
    Hn = M.useRef(null),
    Pa = M.useRef(lx()),
    Zt = M.useRef(sx()),
    vr = M.useRef(!1),
    Rr = M.useRef(!1),
    Fr = M.useRef(null),
    Tn = M.useMemo(() => Dg(p?.variables ?? [], D, p?.cases ?? []), [p, D]),
    Mr = M.useMemo(() => p ? x ? [] : Oc(p.cases, p.variables) : [], [p, x]),
    Gn = M.useMemo(() => p ? x ? [] : Object.keys(ue).length === 0 ? Mr : Mr.map((i, f) => {
      const g = p.cases[f] ?? {},
        w = {
          ...i
        };
      return Object.entries(ue).forEach(([N, F]) => {
        const O = ht(g[N]),
          T = F.labels?.[O];
        T && (w[N] = T);
      }), w;
    }) : [], [Mr, p, x, ue]),
    {
      batchExporting: Ln,
      batchElapsedMs: xi,
      batchExportSummary: Ir,
      beginBatchExport: Gl,
      completeBatchExport: vi,
      endBatchExportSession: wi,
      dismissBatchExportSummary: No
    } = Pg(),
    De = Y.find(i => i.id === Z) ?? Y[0],
    jo = De?.id ?? "",
    editingTableIds = M.useMemo(() => Z ? [...new Set([Z, ...q])] : [], [Z, q]),
    editingTables = M.useMemo(() => {
      const i = new Set(editingTableIds);
      return Y.filter(f => i.has(f.id));
    }, [editingTableIds, Y]),
    filterMismatchTableNames = M.useMemo(() => {
      if (!De || editingTables.length <= 1) return [];
      const i = JSON.stringify(Aa(De.filter));
      return editingTables.filter(f => f.id !== De.id).filter(f => JSON.stringify(Aa(f.filter)) !== i).map(f => f.name);
    }, [De, editingTables]),
    Ra = M.useMemo(() => {
      const i = [];
      return Y.filter(f => !f.folderId).forEach(f => i.push(f.id)), Wn.forEach(f => {
        f.expanded && Y.filter(g => g.folderId === f.id).forEach(g => i.push(g.id));
      }), i;
    }, [Wn, Y]);
  M.useEffect(() => {
    if (!_) return;
    function i(g) {
      y(Math.min(420, Math.max(180, g.clientX)));
    }
    function f() {
      Ne(!1);
    }
    return window.addEventListener("mousemove", i), window.addEventListener("mouseup", f), () => {
      window.removeEventListener("mousemove", i), window.removeEventListener("mouseup", f);
    };
  }, [_]), M.useEffect(() => {
    if (!Se) {
      We([]), $t([]), Vt(null), gr("asc"), Cn(null), Bn(["mean"]), Pt([]), Dn(null), he(!1), Ke("UPC");
      return;
    }
    We(Ni(Se)), $t([]), Vt(null), gr("asc"), Cn(null), Bn(cn(Se)?.numericStats ?? ["mean"]), Pt(cn(Se)?.groups ?? []), Dn(null), he(!1), Ke("UPC");
  }, [Se, p, Mr, ue]), M.useEffect(() => {
    Se && We(i => mo(i, ut));
  }, [Se, ut]), M.useEffect(() => {
    if (!$n) return;
    function i() {
      Dn(null);
    }
    return window.addEventListener("click", i), () => window.removeEventListener("click", i);
  }, [$n]), M.useEffect(() => {
    if (!qe) return;
    function i() {
      at(null);
    }
    return window.addEventListener("click", i), () => window.removeEventListener("click", i);
  }, [qe]);
  async function dt(i, f) {
    R(!0), J(null), oe(0), z(null), await new Promise(g => setTimeout(g, 0));
    try {
      f && (await xg(yi(i), f));
      const g = await Ih(i, (F, O) => {
          J(F), O >= 0 && oe(Math.round(O * 100));
        }),
        w = g.fileSize >= ix;
      m(g), b(w), w && kt("Large SPSS detected: Light load mode is on to reduce memory usage", 5e3);
      const N = Hn.current;
      if (N) {
        const F = yi(i),
          O = za(g, N.sourceDataset),
          T = na === "rebind";
        if (!O && !T) {
          vt(N.sourceDataset ?? null), nn("match"), kt(`ไฟล์ ${g.fileName} ยังไม่ตรงกับ settings ที่บันทึกไว้`, 4500);
          return;
        }
        const X = O ? N : {
            ...N,
            sourceDataset: F,
            sourceMappings: Ia(N.sourceMappings ?? [], F)
          },
          xe = aa(X.activeLock);
        let ye = X;
        if (!xe && Ye && mr()) {
          const Ee = {
              ...X,
              activeLock: vn()
            },
            ve = await ea({
              tables: Ee.tables,
              folders: Ee.folders,
              output: Ee.output,
              variableOverrides: Ee.variableOverrides ?? {},
              detectedMrsets: Ee.customMrsets ?? [],
              sourceDataset: Ee.sourceDataset,
              sourceMappings: Ee.sourceMappings ?? [],
              activeLock: Ee.activeLock
            }, Ye);
          ve && (Rt(ve), an(!1), ye = Ee);
        }
        Hn.current = null, vt(null), nn("match"), Lo(ye, {
          loadedDataset: !0,
          loadedFileName: g.fileName,
          readonly: xe,
          readonlyLock: ye.activeLock ?? null
        }), !O && T && (await Jl(ye, F));
        return;
      }
      se(new Set()), ge(null), ne(F => F.some(T => T.rowVar || T.colVar) ? F.map(T => ({
        ...T,
        result: null
      })) : [vo(1)]), s(!1), H("design");
    } catch (g) {
      z(g instanceof Error ? g.message : String(g));
    } finally {
      R(!1), J(null), oe(0);
    }
  }
  async function Kl(i) {
    const f = i[0];
    f && (await dt(f));
  }
  async function wr() {
    try {
      if (mr()) {
        const i = await hg();
        if (i) {
          await dt(i.file, i.handle);
          return;
        }
      }
      Ma();
    } catch (i) {
      if (i instanceof DOMException && i.name === "AbortError") return;
      z(i instanceof Error ? i.message : String(i));
    }
  }
  async function ra() {
    try {
      if (mr()) {
        const i = await wg();
        if (i) {
          await Ka(i.file, i.handle);
          return;
        }
      }
      xr.current?.click();
    } catch (i) {
      if (i instanceof DOMException && i.name === "AbortError") return;
      z(i instanceof Error ? i.message : String(i));
    }
  }
  const {
      getRootProps: Fa,
      getInputProps: ql,
      isDragActive: Eo,
      open: Ma
    } = ff({
      onDrop: Kl,
      accept: {
        "application/octet-stream": [".sav"]
      },
      multiple: !1,
      noClick: !0
    }),
    tt = M.useCallback(i => {
      const f = Tn.byName.get(i);
      return f?.label || f?.longName || i;
    }, [Tn]),
    yi = M.useCallback(i => {
      const f = i,
        g = typeof f.path == "string" && f.path.trim() ? f.path.trim() : typeof f.webkitRelativePath == "string" && f.webkitRelativePath.trim() ? f.webkitRelativePath.trim() : void 0;
      return {
        fileName: i.name,
        filePath: g
      };
    }, []),
    sn = M.useCallback(i => ({
      id: i.filePath?.trim() ? `path:${i.filePath.trim().toLowerCase()}` : `name:${i.fileName.trim().toLowerCase()}`,
      fileName: i.fileName.trim(),
      filePath: i.filePath?.trim() || void 0,
      ownerLabel: Zt.current.ownerLabel,
      machineLabel: Zt.current.machineLabel,
      lastBoundAt: new Date().toISOString(),
      lastBoundBy: Zt.current.ownerLabel
    }), []),
    Ia = M.useCallback((i, f) => {
      const g = new Map();
      if (i.forEach(w => {
        g.set(w.id, w);
      }), f?.fileName.trim()) {
        const w = sn(f);
        g.set(w.id, w);
      }
      return [...g.values()].sort((w, N) => new Date(N.lastBoundAt).getTime() - new Date(w.lastBoundAt).getTime());
    }, [sn]),
    Oa = M.useCallback(i => !i || i.status === "EXITED" ? !1 : new Date(i.expiresAt).getTime() > Date.now(), []),
    bi = M.useCallback(i => !Oa(i) || i?.sessionId === Pa.current ? !1 : i?.ownerLabel === Zt.current.ownerLabel && i?.machineLabel === Zt.current.machineLabel, [Oa]),
    aa = M.useCallback(i => !Oa(i) || bi(i) ? !1 : i?.sessionId !== Pa.current, [bi, Oa]),
    vn = M.useCallback(() => {
      const i = new Date().toISOString();
      return {
        sessionId: Pa.current,
        ownerLabel: Zt.current.ownerLabel,
        machineLabel: Zt.current.machineLabel,
        status: "ACTIVE",
        acquiredAt: i,
        updatedAt: i,
        expiresAt: new Date(Date.now() + ax).toISOString()
      };
    }, []),
    ar = M.useCallback(i => {
      const f = new Date().toISOString();
      return {
        sessionId: i?.sessionId ?? Pa.current,
        ownerLabel: i?.ownerLabel ?? Zt.current.ownerLabel,
        machineLabel: i?.machineLabel ?? Zt.current.machineLabel,
        status: "EXITED",
        acquiredAt: i?.acquiredAt ?? f,
        updatedAt: f,
        expiresAt: f,
        exitedAt: f
      };
    }, []),
    wn = M.useCallback(i => {
      const f = Y.map(O => ({
          name: O.name,
          rowVar: O.rowVar,
          colVar: O.colVar,
          folderId: O.folderId,
          filter: O.filter
        })),
        g = Wn.map(O => ({
          id: O.id,
          name: O.name
        })),
        w = {
          showCount: $.showCount,
          showPercent: $.showPercent,
          percentType: $.percentType,
          hideZeroRows: $.hideZeroRows
        },
        N = [...Tn.groupedByName.values()].map(O => ({
          groupName: O.name,
          label: O.label,
          members: O.memberNames.map(T => p?.variables.find(X => X.name === T)?.longName || T)
        })),
        F = i?.sourceDataset ?? (p ? {
          fileName: p.fileName,
          filePath: p.sourcePath ?? void 0
        } : void 0);
      return {
        tables: f,
        folders: g,
        output: w,
        variableOverrides: ue,
        detectedMrsets: N,
        sourceDataset: F,
        sourceMappings: i?.sourceMappings ?? Ia(Un, F),
        activeLock: i?.activeLock ?? (ot || xn ? null : vn())
      };
    }, [vn, Un, p, Wn, Ia, $.hideZeroRows, $.percentType, $.showCount, $.showPercent, xn, ot, Y, Tn.groupedByName, ue]),
    Va = M.useCallback(async () => {
      if (!(!Ye || !_t || ot || vr.current || Rr.current)) {
        Rr.current = !0;
        try {
          const i = wn({
              activeLock: ar(Ut)
            }),
            f = await ea(i, Ye, _t);
          f && (Rt(f), an(!0), Yt(i.activeLock ?? null), kt("Release Lock สำเร็จแล้ว เครื่องอื่นเปิดแก้ต่อได้เมื่อ sync ถึง", 4500));
        } catch {} finally {
          Rr.current = !1;
        }
      }
    }, [wn, ar, Ye, _t, ot, Ut]),
    Ql = M.useCallback(async () => {
      if (ot) {
        Ta(null), Rt(null), rn(!1), Yt(null), an(!1), s(!0), kt("Exited read-only settings session", 3e3);
        return;
      }
      if (Ye) {
        const i = wn({
            activeLock: ar(Ut)
          }),
          f = await ea(i, Ye, _t ?? "crosstab_settings.xlsx");
        f ? (Rt(f), Xt(i.sourceMappings ?? []), rn(!1), Yt(i.activeLock ?? null), an(!0)) : xn || (await Va());
      }
      Ta(null), Rt(null), rn(!1), Yt(null), an(!1), s(!0), kt("Saved and exited settings session", 3200);
    }, [wn, ar, Ye, _t, Va, xn, ot, Ut]);
  M.useEffect(() => {
    if (!Ye || ot || xn) return;
    const i = window.setInterval(async () => {
      if (!vr.current) {
        vr.current = !0;
        try {
          const f = wn({
              activeLock: vn()
            }),
            g = await ea(f, Ye, _t ?? "crosstab_settings.xlsx");
          g && (Rt(g), Yt(f.activeLock ?? null), Xt(f.sourceMappings ?? []), an(!1));
        } catch {} finally {
          vr.current = !1;
        }
      }
    }, ox);
    return () => window.clearInterval(i);
  }, [wn, vn, Ye, _t, xn, ot]), M.useEffect(() => {
    if (!Ye || ot || xn) return;
    const i = () => {
      Va();
    };
    return window.addEventListener("pagehide", i), window.addEventListener("beforeunload", i), () => {
      window.removeEventListener("pagehide", i), window.removeEventListener("beforeunload", i);
    };
  }, [Ye, Va, xn, ot]), M.useEffect(() => {
    if (!Ye || ot || xn) return;
    const i = f => (f.preventDefault(), f.returnValue = "Please release the settings lock before leaving Crossify.", f.returnValue);
    return window.addEventListener("beforeunload", i), () => window.removeEventListener("beforeunload", i);
  }, [Ye, xn, ot]);
  const za = M.useCallback((i, f) => {
      if (!i || !f?.fileName) return !1;
      const g = i.sourcePath?.trim(),
        w = f.filePath?.trim();
      return g && w ? g === w : i.fileName === f.fileName;
    }, []),
    Co = M.useCallback(i => {
      const f = Tn.byName.get(i);
      return f ? f.isGroupedMA ? {
        badge: "MA",
        cls: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-100"
      } : f.isString ? {
        badge: "A",
        cls: "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100"
      } : Object.keys(f.valueLabels).length === 0 ? {
        badge: "#",
        cls: "border-slate-200 bg-gradient-to-br from-slate-50 to-slate-200"
      } : {
        badge: "SA",
        cls: "border-blue-200 bg-gradient-to-br from-blue-50 to-sky-100"
      } : {
        badge: "VAR",
        cls: "border-slate-200 bg-slate-50"
      };
    }, [Tn]);
  function Wt(i) {
    return Tn.groupedByName.get(i);
  }
  function yn(i) {
    return p?.variables.find(f => f.name === i || f.longName === i);
  }
  function Pn(i) {
    const f = Tn.byName.get(i);
    return !!f && !f.isString && Object.keys(f.valueLabels).length === 0 && !f.isGroupedMA;
  }
  function Aa(i) {
    return i ? {
      description: i.description,
      rootJoin: i.rootJoin,
      groups: i.groups.map(f => ({
        id: f.id,
        join: f.join,
        conditions: f.conditions.map(g => ({
          ...g,
          values: [...g.values]
        }))
      }))
    } : bo();
  }
  function Ze(i, f) {
    const g = ht(i) || String(i ?? "").trim(),
      w = String(f ?? "").trim();
    return g ? !w || w === g ? g : `${g}. ${w}` : w;
  }
  function Ba(i, f = ue) {
    const g = Wt(i);
    if (g) return {
      kind: "options",
      options: g.options.map(T => {
        const X = T.valueCode || T.label;
        return {
          key: X,
          label: Ze(X, f[i]?.labels?.[X] ?? T.label)
        };
      }),
      operators: ["in", "not_in", "is_blank", "not_blank"]
    };
    const w = yn(i);
    if (!w) return {
      kind: "text",
      options: [],
      operators: ["contains", "not_contains", "is_blank", "not_blank"]
    };
    if (Object.keys(w.valueLabels).length > 0) return {
      kind: "options",
      options: Object.entries(w.valueLabels).sort(([T], [X]) => Number(T) - Number(X)).map(([T, X]) => {
        const xe = ht(T);
        return {
          key: xe,
          label: Ze(xe, f[i]?.labels?.[xe] ?? X)
        };
      }),
      operators: ["in", "not_in", "is_blank", "not_blank"]
    };
    const F = [...new Set((p?.cases ?? []).map(T => {
        const X = T[w.name];
        return X == null || X === "" ? "" : w.isString ? String(X).trim() : ht(X);
      }).filter(Boolean))].sort((T, X) => T.localeCompare(X, void 0, {
        numeric: !0,
        sensitivity: "base"
      })),
      O = F.length > 0 && F.length <= 20 ? F.map(T => ({
        key: T,
        label: T
      })) : [];
    return Pn(i) ? {
      kind: "numeric",
      options: O,
      operators: O.length > 0 ? ["in", "not_in", "gt", "gte", "lt", "lte", "between", "is_blank", "not_blank"] : ["gt", "gte", "lt", "lte", "between", "is_blank", "not_blank"]
    } : {
      kind: "text",
      options: O,
      operators: O.length > 0 ? ["in", "not_in", "contains", "not_contains", "is_blank", "not_blank"] : ["contains", "not_contains", "is_blank", "not_blank"]
    };
  }
  function _o(i) {
    const f = Ba(i);
    return {
      id: crypto.randomUUID(),
      variableName: i,
      operator: f.operators[0] ?? "in",
      values: [],
      value: "",
      secondaryValue: ""
    };
  }
  function Do(i, f) {
    const g = String(f ?? "").trim();
    return Ba(i).options.find(N => N.key === g)?.label ?? g;
  }
  function ki(i) {
    const f = tt(i.variableName);
    switch (i.operator) {
      case "in":
      case "not_in":
        {
          const g = i.values.map(N => Do(i.variableName, N)).filter(Boolean),
            w = g.length > 0 ? g.join(", ") : "-";
          return `${f} ${i.operator === "in" ? "is any of" : "is not any of"} [${w}]`;
        }
      case "between":
        return `${f} between ${i.value || "-"} and ${i.secondaryValue || "-"}`;
      case "gt":
        return `${f} > ${i.value || "-"}`;
      case "gte":
        return `${f} >= ${i.value || "-"}`;
      case "lt":
        return `${f} < ${i.value || "-"}`;
      case "lte":
        return `${f} <= ${i.value || "-"}`;
      case "contains":
        return `${f} contains "${i.value || ""}"`;
      case "not_contains":
        return `${f} does not contain "${i.value || ""}"`;
      case "is_blank":
        return `${f} is blank`;
      case "not_blank":
        return `${f} is not blank`;
      default:
        return f;
    }
  }
  function Si(i) {
    if (!i || !fi(i)) return null;
    const f = i.groups.map(g => ({
      join: g.join,
      conditions: g.conditions.map(ki).filter(Boolean)
    })).filter(g => g.conditions.length > 0);
    return f.length === 0 ? null : f.map(g => {
      const w = g.conditions.join(` ${tf[g.join]} `);
      return g.conditions.length > 1 ? `(${w})` : w;
    }).join(` ${tf[i.rootJoin]} `);
  }
  function or(i) {
    if (!i || !fi(i)) return null;
    const f = i.description.trim(),
      g = Si(i);
    return f && g ? `${f}: ${g}` : f || g;
  }
  function To(i, f) {
    const g = new Map(i.options.map(w => [w.label, w.valueCode || w.label]));
    return zc(i, f).map(w => g.get(w) ?? w);
  }
  function oa(i, f, g) {
    const w = Wt(i);
    if (w) return To(w, f);
    const N = yn(i);
    if (!N) {
      const T = g[i];
      return T ? [T] : [];
    }
    const F = f[N.name];
    if (N.isString) {
      const T = String(F ?? "").trim();
      return T ? [T] : [];
    }
    const O = ht(F);
    return O ? [O] : [];
  }
  function ir(i, f, g) {
    const w = Wt(i);
    if (w) return zc(w, f).join(" | ");
    const N = yn(i);
    if (!N) return String(g[i] ?? "");
    const F = g[N.name] ?? g[N.longName] ?? g[i];
    return F != null && F !== "" ? String(F) : String(f[N.name] ?? "");
  }
  function lr(i, f, g) {
    const w = oa(i, f, g);
    if (w.length === 0) return null;
    const N = Number(w[0]);
    return Number.isFinite(N) ? N : null;
  }
  function Kn(i) {
    if (!p) return [];
    const f = x ? Oc(p.cases, p.variables) : Mr;
    return Object.keys(i).length === 0 ? f : f.map((g, w) => {
      const N = p.cases[w] ?? {},
        F = {
          ...g
        };
      return Object.entries(i).forEach(([O, T]) => {
        const X = ht(N[O]),
          xe = T.labels?.[X];
        xe && (F[O] = xe);
      }), F;
    });
  }
  function bn(i, f = p?.cases ?? [], g = ue) {
    if (i && i.length > 0) return i;
    if (!p || f.length === 0) return [];
    if (!x && f === p.cases) return Object.keys(g).length === 0 ? Mr : Kn(g);
    const w = Oc(f, p.variables);
    return Object.keys(g).length === 0 ? w : w.map((N, F) => {
      const O = f[F] ?? {},
        T = {
          ...N
        };
      return Object.entries(g).forEach(([X, xe]) => {
        const ye = ht(O[X]),
          Ee = xe.labels?.[ye];
        Ee && (T[X] = Ee);
      }), T;
    });
  }
  function cn(i, f = ue) {
    return f[i];
  }
  function qn(i, f = Gn, g = p?.cases ?? []) {
    const w = bn(f, g),
      N = i.filter;
    if (!N || N.groups.length === 0) return {
      labeled: w,
      raw: g
    };
    const F = [],
      O = [],
      T = Math.min(w.length, g.length);
    for (let X = 0; X < T; X++) {
      const xe = w[X],
        ye = g[X];
      !xe || !ye || !Kh(N, ye, xe, {
        getValueKeys: oa,
        getTextValue: ir,
        getNumericValue: lr
      }) || (F.push(xe), O.push(ye));
    }
    return {
      labeled: F,
      raw: O
    };
  }
  function Ni(i, f = ue) {
    const g = Wt(i),
      w = cn(i, f);
    if (g) {
      const ve = new Map();
      let Fe = 0;
      for (const Be of p?.cases ?? []) {
        const me = new Set();
        if (g.aggregateByCode) {
          const L = new Map(g.options.filter(we => we.valueCode).map(we => [we.valueCode, we.label]));
          for (const we of g.memberNames) {
            const Ue = ht(Be[we]);
            if (!Ue) continue;
            const Ge = L.get(Ue);
            Ge && me.add(Ge);
          }
        } else g.options.forEach(L => {
          const we = ht(Be[L.memberName]);
          we && L.selectedCodes.has(we) && me.add(L.label);
        });
        me.size !== 0 && (Fe += 1, me.forEach(L => ve.set(L, (ve.get(L) ?? 0) + 1)));
      }
      const Le = g.options.map((Be, me) => ({
          key: Be.valueCode || Be.label,
          code: Be.valueCode || String(me + 1),
          label: w?.labels?.[Be.valueCode || Be.label] ?? Be.label,
          count: ve.get(Be.label) ?? 0,
          percent: Fe > 0 ? (ve.get(Be.label) ?? 0) / Fe * 100 : 0,
          factor: w?.weights[Be.valueCode || Be.label] ?? "",
          rowKind: "code"
        })),
        $e = w?.order?.length ? (() => {
          const Be = new Map(w.order.map((me, L) => [me, L]));
          return [...Le].sort((me, L) => (Be.get(me.key) ?? Number.MAX_SAFE_INTEGER) - (Be.get(L.key) ?? Number.MAX_SAFE_INTEGER));
        })() : Le;
      return mo($e, w?.groups ?? []);
    }
    const N = yn(i);
    if (!N) return [];
    const F = new Map();
    let O = 0;
    for (const ve of p?.cases ?? []) {
      const Fe = ht(ve[N.name]);
      Fe && (O += 1, F.set(Fe, (F.get(Fe) ?? 0) + 1));
    }
    const T = new Set(),
      X = Object.entries(N.valueLabels).sort(([ve], [Fe]) => Number(ve) - Number(Fe)).map(([ve, Fe]) => {
        const Le = ht(ve);
        T.add(Le);
        const $e = F.get(Le) ?? 0;
        return {
          key: Le,
          code: Le,
          label: w?.labels?.[Le] ?? Fe,
          count: $e,
          percent: O > 0 ? $e / O * 100 : 0,
          factor: w?.weights[Le] ?? "",
          rowKind: "code"
        };
      }),
      xe = [...F.entries()].filter(([ve]) => !T.has(ve)).map(([ve, Fe]) => ({
        key: ve,
        code: ve,
        label: w?.labels?.[ve] ?? ve,
        count: Fe,
        percent: O > 0 ? Fe / O * 100 : 0,
        factor: w?.weights[ve] ?? (Pn(i) ? ve : ""),
        autoFactor: Pn(i),
        rowKind: "code"
      })),
      ye = [...X.map(ve => ({
        ...ve,
        autoFactor: Pn(i) && !w?.weights[ve.key]
      })), ...xe],
      Ee = w?.order?.length ? (() => {
        const ve = new Map(w.order.map((Fe, Le) => [Fe, Le]));
        return [...ye].sort((Fe, Le) => (ve.get(Fe.key) ?? Number.MAX_SAFE_INTEGER) - (ve.get(Le.key) ?? Number.MAX_SAFE_INTEGER));
      })() : ye;
    return mo(Ee, w?.groups ?? []);
  }
  function ji(i) {
    const f = Wt(i);
    if (f) return Lg(f, p?.cases ?? []);
    const g = yn(i);
    return g ? (p?.cases ?? []).filter(w => ht(w[g.name])).length : 0;
  }
  function ia(i, f) {
    const g = f.filter(N => N.rowKind !== "net"),
      w = Object.fromEntries(g.map(N => [N.key, N.factor.trim()]).filter(([, N]) => N !== ""));
    ke(N => ({
      ...N,
      [i]: {
        order: g.map(F => F.key),
        weights: w,
        labels: Object.fromEntries(g.map(F => [F.key, F.label])),
        numericStats: Pn(i) ? _n : void 0,
        groups: ut
      }
    })), ne(N => N.map(F => ({
      ...F,
      result: null
    }))), Ce(null);
  }
  function Ei(i, f) {
    const g = ze.filter(N => N.rowKind !== "net"),
      w = g.findIndex(N => N.key === i);
    if (!(w < 0)) {
      if (f && An != null) {
        const N = Math.min(An, w),
          F = Math.max(An, w);
        $t(g.slice(N, F + 1).map(O => O.key));
        return;
      }
      $t([g[w].key]), Vt(w);
    }
  }
  function Ci() {
    const i = hr === "asc" ? "desc" : "asc";
    gr(i), We(f => mo([...f.filter(g => g.rowKind !== "net")].sort((g, w) => {
      const N = Number(g.code),
        F = Number(w.code),
        O = Number.isFinite(N) && Number.isFinite(F) ? N - F : g.code.localeCompare(w.code, void 0, {
          numeric: !0,
          sensitivity: "base"
        });
      return i === "asc" ? O : -O;
    }), ut));
  }
  function $a() {
    Dn(null), !(!Se || rt.length === 0) && (Ke("UPC"), he(!0));
  }
  function _i(i) {
    if (i.length === 0) return null;
    const f = ut.filter(g => i.every(w => g.members.includes(w)));
    return f.length === 0 ? null : [...f].sort((g, w) => wo(w, ut) - wo(g, ut))[0];
  }
  function Di() {
    if (!Se || rt.length === 0) return;
    const i = ze.filter(w => w.rowKind !== "net" && rt.includes(w.key)),
      f = Re.trim();
    if (i.length === 0 || !f) return;
    const g = _i(i.map(w => w.key));
    Pt([...ut, {
      id: crypto.randomUUID(),
      name: f,
      members: i.map(w => w.key),
      parentId: g?.id ?? null
    }]), he(!1), Ke("UPC");
  }
  function la(i) {
    Pt(f => f.filter(g => g.id !== i && g.parentId !== i));
  }
  function sa() {
    if (rt.length === 0) return;
    const i = new Set(rt);
    Pt(f => f.map(g => ({
      ...g,
      members: g.members.filter(w => !i.has(w))
    })).filter(g => g.members.length > 0)), Dn(null);
  }
  function Qn(i, f, g = ue) {
    const N = cn(f, g)?.groups ?? [];
    if (N.length === 0) return i;
    const F = i.rowPaths ?? i.rowValues.map(L => [L]);
    if (F.some(L => L.length !== 1)) return i;
    const O = new Map(Ni(f, g).filter(L => L.rowKind !== "net").map(L => [L.key, L.label.replace(/^\s+/, "")])),
      T = new Map(i.rowValues.map((L, we) => [L, we])),
      X = i.rowTypes ?? i.rowValues.map(() => "data"),
      xe = new Map();
    N.forEach(L => {
      const we = wo(L, N);
      L.members.forEach(Ue => {
        const Ge = O.get(Ue);
        Ge && xe.set(Ge, `${"   ".repeat(we + 1)}${Ge}`);
      });
    });
    const ye = N.map(L => {
      const we = L.members.map(Me => T.get(O.get(Me) ?? "")).filter(Me => Me != null).sort((Me, it) => Me - it);
      if (we.length === 0) return null;
      const Ue = i.colValues.map((Me, it) => we.reduce((nt, Ve) => nt + (i.counts[Ve]?.[it] ?? 0), 0)),
        Ge = we.reduce((Me, it) => Me + (i.rowTotalsN[it] ?? 0), 0),
        Qe = wo(L, N);
      return {
        insertBefore: we[0],
        depth: Qe,
        label: `${qc(Qe)}${L.name}`,
        counts: Ue,
        totalN: Ge
      };
    }).filter(L => L !== null).sort((L, we) => L.insertBefore - we.insertBefore || L.depth - we.depth);
    if (ye.length === 0) return i;
    const Ee = [...ye].sort((L, we) => L.insertBefore - we.insertBefore),
      ve = [],
      Fe = [],
      Le = [],
      $e = [],
      Be = [];
    let me = 0;
    for (let L = 0; L < i.rowValues.length; L++) {
      for (; Ee[me]?.insertBefore === L;) {
        const we = Ee[me];
        ve.push(we.label), Fe.push("net"), Le.push([we.label]), $e.push(we.counts), Be.push(we.totalN), me += 1;
      }
      ve.push(i.rowValues[L]), Fe.push(X[L]), Le.push([xe.get(i.rowValues[L]) ?? F[L]?.[0] ?? i.rowValues[L]]), xe.has(i.rowValues[L]) && (ve[ve.length - 1] = xe.get(i.rowValues[L])), $e.push(i.counts[L]), Be.push(i.rowTotalsN[L]);
    }
    for (; me < Ee.length;) {
      const L = Ee[me];
      ve.push(L.label), Fe.push("net"), Le.push([L.label]), $e.push(L.counts), Be.push(L.totalN), me += 1;
    }
    return {
      ...i,
      rowValues: ve,
      rowTypes: Fe,
      rowPaths: Le,
      counts: $e,
      rowTotalsN: Be
    };
  }
  function kt(i, f = 3e3) {
    B(i), setTimeout(() => B(null), f);
  }
  function Lo(i, f) {
    const g = i.folders.map(O => ({
      id: O.id,
      name: O.name,
      expanded: !0
    }));
    Pr(g);
    const w = i.tables.map(O => ({
      id: crypto.randomUUID(),
      name: O.name,
      rowVar: O.rowVar,
      colVar: O.colVar,
      folderId: O.folderId,
      result: null,
      filter: O.filter ?? bo()
    }));
    w.length === 0 && w.push(vo(1)), ne(w), se(new Set()), ge(null), fe(w[0].id), H("design"), ke(i.variableOverrides ?? {}), j(i.customMrsets ?? []), ie({
      showCount: i.output.showCount,
      showPercent: i.output.showPercent,
      percentType: i.output.percentType,
      hideZeroRows: i.output.hideZeroRows ?? !1
    }), s(!1), vt(null), Xt(i.sourceMappings ?? []), rn(f?.readonly ?? !1), Yt(f?.readonlyLock ?? null), an((f?.readonlyLock?.status ?? "ACTIVE") === "EXITED");
    const N = f?.loadedDataset ? ` พร้อมโหลด ${f.loadedFileName ?? i.sourceDataset?.fileName ?? "SPSS"}` : "",
      F = f?.readonly ? " (Read-only mode)" : "";
    kt(`โหลด ${w.length} tables แล้ว${N}${F} กด Run All เพื่อคำนวณ`, 3500);
  }
  async function Jl(i, f) {
    if (!Ye) {
      kt("Rebind สำเร็จแล้ว กด Save อีกครั้งเพื่อบันทึก source ใหม่ลง settings file", 4500);
      return;
    }
    const g = Ia(i.sourceMappings ?? Un, f),
      w = await ea({
        tables: i.tables,
        folders: i.folders,
        output: i.output,
        variableOverrides: i.variableOverrides ?? {},
        detectedMrsets: i.customMrsets ?? [],
        sourceDataset: f,
        sourceMappings: g,
        activeLock: ot ? null : vn()
      }, Ye);
    if (w) {
      Rt(w), Xt(g), kt("Rebind สำเร็จและอัปเดต source link ลง settings file แล้ว", 4200);
      return;
    }
    kt("Rebind สำเร็จแล้ว แต่ยังเขียนกลับ settings file ไม่ได้ กด Save อีกครั้งเพื่อลองใหม่", 5e3);
  }
  async function Po() {
    try {
      if (!Ye) {
        await ra();
        return;
      }
      const i = await Ye.getFile();
      await Ka(i, Ye);
    } catch (i) {
      if (i instanceof DOMException && i.name === "AbortError") return;
      z(i instanceof Error ? i.message : String(i));
    }
  }
  async function Ua() {
    if (!Ye || !_t) {
      kt("ยัง takeover ไม่ได้ เพราะไฟล์ settings นี้ยังไม่ได้เปิดผ่าน editable handle", 4500);
      return;
    }
    if (window.confirm("Force Take Over จะยึดสิทธิ์แก้ไฟล์ settings นี้จาก lock เดิม ต้องการดำเนินการต่อหรือไม่?")) try {
      const f = wn({
          activeLock: vn()
        }),
        g = await ea(f, Ye, _t);
      if (!g) {
        kt("Take over ไม่สำเร็จ เพราะยังไม่ได้รับสิทธิ์เขียนไฟล์ settings", 4500);
        return;
      }
      Rt(g), rn(!1), Yt(f.activeLock ?? null), Xt(f.sourceMappings ?? []), an(!1), kt("Force Take Over สำเร็จ ตอนนี้แก้ไขและ Save ได้แล้ว", 4500);
    } catch (f) {
      if (f instanceof DOMException && f.name === "AbortError") return;
      z(f instanceof Error ? f.message : String(f));
    }
  }
  function Ro(i = null) {
    const f = vo(Y.length + 1, i);
    ne(g => [...g, f]), fe(f.id), se(new Set([f.id])), ge(f.id), H("design");
  }
  function Fo(i) {
    ne(f => {
      const g = f.filter(N => N.id !== i),
        w = g.length === 0 ? [vo(1)] : g;
      return i === Z && fe(w[0].id), w;
    }), se(f => {
      const g = new Set(f);
      return g.delete(i), g;
    }), ge(f => f === i ? null : f);
  }
  function un(i, f) {
    ne(g => g.map(w => w.id === i ? {
      ...w,
      ...f
    } : w));
  }
  function Wa(i) {
    const f = Y.find(w => w.id === i);
    if (!f) return;
    const g = {
      id: crypto.randomUUID(),
      name: `${f.name} (Copy)`,
      rowVar: f.rowVar,
      colVar: f.colVar,
      folderId: f.folderId,
      result: null,
      filter: {
        description: f.filter.description,
        rootJoin: f.filter.rootJoin,
        groups: f.filter.groups.map(w => ({
          ...w,
          conditions: w.conditions.map(N => ({
            ...N,
            values: [...N.values]
          }))
        }))
      }
    };
    ne(w => {
      const N = w.findIndex(O => O.id === i),
        F = [...w];
      return F.splice(N + 1, 0, g), F;
    }), fe(g.id), se(new Set([g.id])), ge(g.id), H("design");
  }
  function Or(i, f) {
    i && un(i, {
      folderId: f
    });
  }
  function Mo(i, f) {
    i !== f && ne(g => {
      const w = g.find(T => T.id === i),
        N = g.find(T => T.id === f);
      if (!w || !N) return g;
      const F = g.filter(T => T.id !== i),
        O = F.findIndex(T => T.id === f);
      return O < 0 ? g : (F.splice(O, 0, {
        ...w,
        folderId: N.folderId
      }), F);
    });
  }
  function Ha() {
    const i = {
      id: crypto.randomUUID(),
      name: `Folder ${Wn.length + 1}`,
      expanded: !0
    };
    Pr(f => [...f, i]);
  }
  function Ga(i) {
    Pr(f => f.filter(g => g.id !== i)), ne(f => f.map(g => g.folderId === i ? {
      ...g,
      folderId: null
    } : g));
  }
  function Io(i, f) {
    Pr(g => g.map(w => w.id === i ? {
      ...w,
      ...f
    } : w));
  }
  const zt = M.useCallback(i => q.size > 1 && q.has(i) ? new Set(q) : new Set([i]), [q]),
    Dt = M.useCallback((i, f) => {
      const g = zt(i);
      ne(w => w.map(N => g.has(N.id) ? f(N) : N));
    }, [zt]),
    createTablesFromVariables = M.useCallback((i, f = null) => {
      const g = [...new Set(Array.from(i).filter(Boolean))];
      if (g.length === 0) return;
      const w = Tn ? Tn.list.filter(N => g.includes(N.name)).map(N => N.name) : g;
      if (w.length === 0) return;
      ne(N => {
        const F = [...N],
          O = w.map((T, X) => ({
            ...vo(F.length + X + 1, f),
            name: T,
            rowVar: zn([[T]])
          })),
          xe = O[O.length - 1];
        return F.push(...O), xe && (fe(xe.id), ge(xe.id), H("design")), F;
      });
    }, [Tn]),
    handleVarSelect = M.useCallback((i, f = {}) => {
      const {
        shiftKey: g = !1,
        metaKey: w = !1,
        ctrlKey: N = !1
      } = f;
      if (g && lastSelectedVariableName) {
        const F = Tn?.list ?? [],
          O = F.findIndex(T => T.name === lastSelectedVariableName),
          X = F.findIndex(T => T.name === i);
        if (O >= 0 && X >= 0) {
          const xe = F.slice(Math.min(O, X), Math.max(O, X) + 1).map(T => T.name);
          setSelectedVariableNames(ye => {
            const Ee = new Set(ye);
            return xe.forEach(ve => Ee.add(ve)), Ee;
          });
          return;
        }
      }
      if (w || N) {
        setSelectedVariableNames(F => {
          const O = new Set(F);
          return O.has(i) ? O.delete(i) : O.add(i), O;
        }), setLastSelectedVariableName(i);
        return;
      }
      setSelectedVariableNames(new Set([i])), setLastSelectedVariableName(i);
    }, [lastSelectedVariableName, Tn]),
    handleVarClearSelection = M.useCallback(() => {
      setSelectedVariableNames(new Set()), setLastSelectedVariableName(null);
    }, []),
    handleVarQuickAction = M.useCallback((i, f) => {
      if (f === "table") {
        const g = selectedVariableNames.size > 1 && selectedVariableNames.has(i) ? selectedVariableNames : [i];
        createTablesFromVariables(g);
        return;
      }
      if (f === "top") {
        setQuickAddTarget("top"), De && ne(g => g.map(w => w.id !== De.id ? w : {
          ...w,
          colVar: zn(Pp(ct(w.colVar), i, "add", null)),
          result: null
        }));
        return;
      }
      if (f === "side") {
        setQuickAddTarget("side"), De && ne(g => g.map(w => w.id !== De.id ? w : {
          ...w,
          rowVar: zn(Pp(ct(w.rowVar), i, "add", null)),
          result: null
        }));
        return;
      }
      if (f === "filter") {
        setQuickAddTarget("filter"), De && ne(g => {
          const w = g.find(N => N.id === De.id);
          if (!w) return g;
          const N = new Set(q.size > 0 ? [De.id, ...q] : [De.id]),
            F = Aa(w.filter);
          return F.groups = [...F.groups, {
            id: crypto.randomUUID(),
            join: "all",
            conditions: [_o(i)]
          }], g.map(O => N.has(O.id) ? {
            ...O,
            filter: Aa(F),
            result: null
          } : O);
        });
      }
    }, [De, Tn, createTablesFromVariables, q, selectedVariableNames]),
    kn = M.useCallback((i, f) => {
      if (!i) return;
      ne(g => {
        const w = g.find(N => N.id === i);
        if (!w) return g;
        const N = new Set(q.size > 0 ? [i, ...q] : [i]),
          F = f(Aa(w.filter));
        return g.map(O => N.has(O.id) ? {
          ...O,
          filter: Aa(F),
          result: null
        } : O);
      });
    }, [q]),
    ca = M.useCallback((i, f) => {
      if (!on.current || !De) return;
      const g = on.current;
      Dt(De.id, w => {
        const N = ct(w.colVar),
          F = i === "add" ? Lp(N, g, f.branchIndex == null ? void 0 : f.placement === "before" ? f.branchIndex : f.branchIndex + 1) : Pp(N, g, i, f.targetVar ?? null);
        return {
          ...w,
          colVar: zn(F),
          result: null
        };
      }), on.current = null;
    }, [De, Dt]),
    Xl = M.useCallback((i, f) => {
      if (!on.current || !De) return;
      const g = on.current;
      Dt(De.id, w => {
        const N = ct(w.rowVar),
          F = i === "add" ? Lp(N, g, f.branchIndex == null ? void 0 : f.placement === "before" ? f.branchIndex : f.branchIndex + 1) : Pp(N, g, i, f.targetVar ?? null);
        return {
          ...w,
          rowVar: zn(F),
          result: null
        };
      }), on.current = null;
    }, [De, Dt]),
    Oo = M.useCallback(i => {
      on.current = i;
    }, []);
  function Sn(i, f = ue) {
    const g = Wt(i),
      w = cn(i, f);
    if (g) {
      const T = g.options.map((xe, ye) => ({
        key: xe.valueCode || xe.label,
        label: xe.label,
        order: ye
      }));
      if (!w?.order?.length) return T.map(xe => xe.label);
      const X = new Map(w.order.map((xe, ye) => [xe, ye]));
      return [...T].sort((xe, ye) => (X.get(xe.key) ?? Number.MAX_SAFE_INTEGER) - (X.get(ye.key) ?? Number.MAX_SAFE_INTEGER)).map(xe => xe.label);
    }
    if (!p) return;
    const N = p.variables.find(T => T.name === i || T.longName === i);
    if (!N || Object.keys(N.valueLabels).length === 0) return;
    const F = Object.entries(N.valueLabels).sort(([T], [X]) => Number(T) - Number(X)).map(([T, X], xe) => ({
      key: ht(T),
      label: X,
      order: xe
    }));
    if (!w?.order?.length) return F.map(T => T.label);
    const O = new Map(w.order.map((T, X) => [T, X]));
    return [...F].sort((T, X) => (O.get(T.key) ?? Number.MAX_SAFE_INTEGER) - (O.get(X.key) ?? Number.MAX_SAFE_INTEGER)).map(T => T.label);
  }
  function ua(i, f = Gn, g = ue) {
    const w = bn(f, p?.cases ?? [], g);
    return Sn(i, g) ?? [...new Set(w.map(N => N[i]).filter(Boolean))];
  }
  function Jn(i, f = Gn, g = ue) {
    const w = bn(f, p?.cases ?? [], g),
      N = rr(i);
    function F(O) {
      const T = Wt(O);
      if (T) {
        const X = T.options.map(ye => ye.label),
          xe = cn(O, g);
        if (xe?.order?.length) {
          const ye = new Map(xe.order.map((Ee, ve) => [Ee, ve]));
          return [...X].sort((Ee, ve) => (ye.get(Ee) ?? 999) - (ye.get(ve) ?? 999));
        }
        return X;
      }
      return ua(O, w, g);
    }
    return i.flatMap(O => {
      let T = [{
        key: "",
        path: []
      }];
      return O.forEach((X, xe) => {
        const ye = (N[xe]?.length ?? 0) > 1,
          Ee = [];
        T.forEach(ve => {
          F(X).forEach(Fe => {
            Ee.push({
              key: ve.key ? `${ve.key}${X}=${Fe}` : `${X}=${Fe}`,
              path: ye ? [...ve.path, tt(X), Fe] : [...ve.path, Fe]
            });
          });
        }), T = Ee;
      }), T;
    });
  }
  function yr(i, f, g) {
    const w = rr(i);
    function N(F) {
      const O = Wt(F);
      if (O && g) return zc(O, g);
      const T = f[F];
      return T ? [T] : [];
    }
    return i.flatMap(F => {
      let O = [{
        key: "",
        path: []
      }];
      for (let T = 0; T < F.length; T++) {
        const X = F[T],
          xe = (w[T]?.length ?? 0) > 1,
          ye = N(X);
        if (ye.length === 0) return [];
        const Ee = [];
        O.forEach(ve => {
          ye.forEach(Fe => {
            Ee.push({
              key: ve.key ? `${ve.key}${X}=${Fe}` : `${X}=${Fe}`,
              path: xe ? [...ve.path, tt(X), Fe] : [...ve.path, Fe]
            });
          });
        }), O = Ee;
      }
      return O;
    });
  }
  function sr(i) {
    return rr(i).flatMap(f => f.length > 1 ? ["Variable", "Category"] : [tt(f[0])]);
  }
  function Yl(i, f, g = Gn, w = p?.cases ?? [], N = ue) {
    const F = bn(g, w, N),
      O = Jn(i, F, N),
      T = Jn(f, F, N);
    if (O.length === 0 || T.length === 0) return {
      rowVar: Xe(i).join(Ca),
      colVar: Xe(f).join(Ca),
      rowLabel: sr(i).join(" / "),
      colLabel: sr(f).join(" / "),
      rowValues: [],
      colValues: [],
      counts: [],
      rowTotalsN: [],
      colTotalsN: [],
      grandTotal: 0
    };
    const X = new Map(O.map((me, L) => [me.key, L])),
      xe = new Map(T.map((me, L) => [me.key, L])),
      ye = O.map(() => T.map(() => 0)),
      Ee = O.map(() => 0),
      ve = T.map(() => 0),
      Fe = rr(i).some(me => me.length > 1),
      Le = new Map();
    let $e = 0;
    for (let me = 0; me < F.length; me++) {
      const L = F[me],
        we = w[me],
        Ue = yr(i, L, we),
        Ge = yr(f, L, we);
      if (Ue.length === 0 || Ge.length === 0) continue;
      $e += 1;
      const Qe = new Set(),
        Me = new Map();
      Ue.forEach(nt => {
        const Ve = X.get(nt.key);
        if (Ve !== void 0 && !Qe.has(Ve) && (Ee[Ve] += 1, Qe.add(Ve)), Fe && nt.path[0]) {
          const Et = nt.path[0],
            Ft = Me.get(Et) ?? new Set();
          Me.set(Et, Ft);
        }
      });
      const it = new Set();
      Ge.forEach(nt => {
        const Ve = xe.get(nt.key);
        Ve !== void 0 && !it.has(Ve) && (ve[Ve] += 1, it.add(Ve));
      }), Fe && Ue.forEach(nt => {
        const Ve = nt.path[0];
        if (!Ve) return;
        const Et = Le.get(Ve) ?? {
          totalN: 0,
          colTotalsN: T.map(() => 0)
        };
        Le.set(Ve, Et), Et.totalN += 1, Ge.forEach(Ft => {
          const Ht = xe.get(Ft.key);
          if (Ht === void 0) return;
          const Xn = Me.get(Ve);
          Xn && (Xn.has(Ht) || (Et.colTotalsN[Ht] += 1, Xn.add(Ht)));
        });
      }), Ue.forEach(nt => {
        const Ve = X.get(nt.key);
        Ve !== void 0 && Ge.forEach(Et => {
          const Ft = xe.get(Et.key);
          Ft !== void 0 && (ye[Ve][Ft] += 1);
        });
      });
    }
    const Be = Fe ? O.reduce((me, L, we) => {
      const Ue = L.path[0];
      if (!Ue || me.length > 0 && me[me.length - 1].label === Ue) return me;
      const Ge = Le.get(Ue) ?? {
        totalN: 0,
        colTotalsN: T.map(() => 0)
      };
      return me.push({
        startIndex: we,
        label: Ue,
        totalN: Ge.totalN,
        colTotalsN: Ge.colTotalsN
      }), me;
    }, []) : void 0;
    return {
      rowVar: zn(i) ?? Xe(i).join(" + "),
      colVar: zn(f) ?? Xe(f).join(" + "),
      rowLabel: Xe(i).map(tt).join(" + "),
      colLabel: Xe(f).map(tt).join(" + "),
      rowValues: O.map(me => me.path.join(" / ")),
      colValues: T.map(me => me.path.join(" / ")),
      rowLevelLabels: sr(i),
      colLevelLabels: sr(f),
      rowPaths: O.map(me => me.path),
      colPaths: T.map(me => me.path),
      counts: ye,
      rowTotalsN: Ee,
      colTotalsN: ve,
      grandTotal: $e,
      rowSectionBases: Be
    };
  }
  function Ti(i, f, g, w = ue, N = Gn, F = p?.cases ?? []) {
    const O = bn(N, F, w),
      T = yn(f),
      X = cn(f, w);
    if (!T) return i;
    const xe = Object.entries(X?.weights ?? {}).filter(([, L]) => String(L).trim() !== "" && String(L).trim() !== "-").map(([L, we]) => [ht(L), Number(we)]).filter(([, L]) => Number.isFinite(L)),
      ye = xe.length > 0 ? xe : Pn(f) ? [...new Set(F.map(L => ht(L[T.name])).filter(Boolean))].map(L => [L, Number(L)]).filter(([, L]) => Number.isFinite(L)) : [];
    if (ye.length === 0) return i;
    const Ee = Pn(f) ? X?.numericStats?.length ? X.numericStats : ["mean"] : ["mean"],
      ve = new Map(ye),
      Fe = Jn(g, O, w),
      Le = new Map(Fe.map((L, we) => [L.key, we])),
      $e = i.colValues.map(() => []),
      Be = [];
    for (let L = 0; L < F.length; L++) {
      const we = F[L],
        Ue = O[L];
      if (!we || !Ue) continue;
      const Ge = ht(we[T.name]);
      if (!Ge) continue;
      const Qe = ve.get(Ge);
      if (Qe == null) continue;
      const Me = yr(g, Ue, we);
      if (Me.length === 0) continue;
      const it = new Set();
      Me.forEach(nt => {
        const Ve = Le.get(nt.key);
        Ve == null || it.has(Ve) || ($e[Ve].push(Qe), it.add(Ve));
      }), it.size > 0 && Be.push(Qe);
    }
    if (Be.length === 0) return i;
    function me(L, we) {
      if (L.length === 0) return 0;
      if (we === "mean") return L.reduce((Qe, Me) => Qe + Me, 0) / L.length;
      if (we === "min") return Math.min(...L);
      if (we === "max") return Math.max(...L);
      const Ue = L.reduce((Qe, Me) => Qe + Me, 0) / L.length,
        Ge = L.reduce((Qe, Me) => Qe + (Me - Ue) ** 2, 0) / L.length;
      return Math.sqrt(Ge);
    }
    return {
      ...i,
      rowValues: [...i.rowValues, ...Ee.map(L => L === "stddev" ? "StdDev" : L[0].toUpperCase() + L.slice(1))],
      rowTypes: [...(i.rowTypes ?? i.rowValues.map(() => "data")), ...Ee.map(() => "stat")],
      rowPaths: [...(i.rowPaths ?? i.rowValues.map(L => [L])), ...Ee.map(L => [L === "stddev" ? "StdDev" : L[0].toUpperCase() + L.slice(1)])],
      counts: [...i.counts, ...Ee.map(L => $e.map(we => we.length > 0 ? Number(me(we, L).toFixed(2)) : 0))],
      rowTotalsN: [...i.rowTotalsN, ...Ee.map(L => Number(me(Be, L).toFixed(2)))]
    };
  }
  async function Vo(i, f, g = Gn, w = p?.cases ?? [], N = ue) {
    const F = bn(g, w, N),
      O = Jn(i, F, N),
      T = Jn(f, F, N);
    if (O.length === 0 || T.length === 0) return {
      rowVar: Xe(i).join(Ca),
      colVar: Xe(f).join(Ca),
      rowLabel: sr(i).join(" / "),
      colLabel: sr(f).join(" / "),
      rowValues: [],
      colValues: [],
      counts: [],
      rowTotalsN: [],
      colTotalsN: [],
      grandTotal: 0
    };
    const X = new Map(O.map((me, L) => [me.key, L])),
      xe = new Map(T.map((me, L) => [me.key, L])),
      ye = O.map(() => T.map(() => 0)),
      Ee = O.map(() => 0),
      ve = T.map(() => 0),
      Fe = rr(i).some(me => me.length > 1),
      Le = new Map();
    let $e = 0;
    for (let me = 0; me < F.length; me++) {
      me > 0 && me % ef === 0 && (await xo());
      const L = F[me],
        we = w[me],
        Ue = yr(i, L, we),
        Ge = yr(f, L, we);
      if (Ue.length === 0 || Ge.length === 0) continue;
      $e += 1;
      const Qe = new Set(),
        Me = new Map();
      Ue.forEach(nt => {
        const Ve = X.get(nt.key);
        if (Ve !== void 0 && !Qe.has(Ve) && (Ee[Ve] += 1, Qe.add(Ve)), Fe && nt.path[0]) {
          const Et = nt.path[0],
            Ft = Me.get(Et) ?? new Set();
          Me.set(Et, Ft);
        }
      });
      const it = new Set();
      Ge.forEach(nt => {
        const Ve = xe.get(nt.key);
        Ve !== void 0 && !it.has(Ve) && (ve[Ve] += 1, it.add(Ve));
      }), Fe && Ue.forEach(nt => {
        const Ve = nt.path[0];
        if (!Ve) return;
        const Et = Le.get(Ve) ?? {
          totalN: 0,
          colTotalsN: T.map(() => 0)
        };
        Le.set(Ve, Et), Et.totalN += 1, Ge.forEach(Ft => {
          const Ht = xe.get(Ft.key);
          if (Ht === void 0) return;
          const Xn = Me.get(Ve);
          Xn && (Xn.has(Ht) || (Et.colTotalsN[Ht] += 1, Xn.add(Ht)));
        });
      }), Ue.forEach(nt => {
        const Ve = X.get(nt.key);
        Ve !== void 0 && Ge.forEach(Et => {
          const Ft = xe.get(Et.key);
          Ft !== void 0 && (ye[Ve][Ft] += 1);
        });
      });
    }
    const Be = Fe ? O.reduce((me, L, we) => {
      const Ue = L.path[0];
      if (!Ue || me.length > 0 && me[me.length - 1].label === Ue) return me;
      const Ge = Le.get(Ue) ?? {
        totalN: 0,
        colTotalsN: T.map(() => 0)
      };
      return me.push({
        startIndex: we,
        label: Ue,
        totalN: Ge.totalN,
        colTotalsN: Ge.colTotalsN
      }), me;
    }, []) : void 0;
    return {
      rowVar: zn(i) ?? Xe(i).join(" + "),
      colVar: zn(f) ?? Xe(f).join(" + "),
      rowLabel: Xe(i).map(tt).join(" + "),
      colLabel: Xe(f).map(tt).join(" + "),
      rowValues: O.map(me => me.path.join(" / ")),
      colValues: T.map(me => me.path.join(" / ")),
      rowLevelLabels: sr(i),
      colLevelLabels: sr(f),
      rowPaths: O.map(me => me.path),
      colPaths: T.map(me => me.path),
      counts: ye,
      rowTotalsN: Ee,
      colTotalsN: ve,
      grandTotal: $e,
      rowSectionBases: Be
    };
  }
  async function Li(i, f, g, w = ue, N = Gn, F = p?.cases ?? []) {
    const O = bn(N, F, w),
      T = yn(f),
      X = cn(f, w);
    if (!T) return i;
    const xe = Object.entries(X?.weights ?? {}).filter(([, L]) => String(L).trim() !== "" && String(L).trim() !== "-").map(([L, we]) => [ht(L), Number(we)]).filter(([, L]) => Number.isFinite(L)),
      ye = xe.length > 0 ? xe : Pn(f) ? [...new Set(F.map(L => ht(L[T.name])).filter(Boolean))].map(L => [L, Number(L)]).filter(([, L]) => Number.isFinite(L)) : [];
    if (ye.length === 0) return i;
    const Ee = Pn(f) ? X?.numericStats?.length ? X.numericStats : ["mean"] : ["mean"],
      ve = new Map(ye),
      Fe = Jn(g, O, w),
      Le = new Map(Fe.map((L, we) => [L.key, we])),
      $e = i.colValues.map(() => []),
      Be = [];
    for (let L = 0; L < F.length; L++) {
      L > 0 && L % ef === 0 && (await xo());
      const we = F[L],
        Ue = O[L];
      if (!we || !Ue) continue;
      const Ge = ht(we[T.name]);
      if (!Ge) continue;
      const Qe = ve.get(Ge);
      if (Qe == null) continue;
      const Me = yr(g, Ue, we);
      if (Me.length === 0) continue;
      const it = new Set();
      Me.forEach(nt => {
        const Ve = Le.get(nt.key);
        Ve == null || it.has(Ve) || ($e[Ve].push(Qe), it.add(Ve));
      }), it.size > 0 && Be.push(Qe);
    }
    if (Be.length === 0) return i;
    function me(L, we) {
      if (L.length === 0) return 0;
      if (we === "mean") return L.reduce((Qe, Me) => Qe + Me, 0) / L.length;
      if (we === "min") return Math.min(...L);
      if (we === "max") return Math.max(...L);
      const Ue = L.reduce((Qe, Me) => Qe + Me, 0) / L.length,
        Ge = L.reduce((Qe, Me) => Qe + (Me - Ue) ** 2, 0) / L.length;
      return Math.sqrt(Ge);
    }
    return {
      ...i,
      rowValues: [...i.rowValues, ...Ee.map(L => L === "stddev" ? "StdDev" : L[0].toUpperCase() + L.slice(1))],
      rowTypes: [...(i.rowTypes ?? i.rowValues.map(() => "data")), ...Ee.map(() => "stat")],
      rowPaths: [...(i.rowPaths ?? i.rowValues.map(L => [L])), ...Ee.map(L => [L === "stddev" ? "StdDev" : L[0].toUpperCase() + L.slice(1)])],
      counts: [...i.counts, ...Ee.map(L => $e.map(we => we.length > 0 ? Number(me(we, L).toFixed(2)) : 0))],
      rowTotalsN: [...i.rowTotalsN, ...Ee.map(L => Number(me(Be, L).toFixed(2)))]
    };
  }
  async function Zl(i, f = $, g = ue, w = Gn, N = p?.cases ?? []) {
    const F = qn(i, w, N);
    if (!i.rowVar || !i.colVar || F.labeled.length === 0) return null;
    const O = ct(i.rowVar),
      T = ct(i.colVar),
      X = Xe(O),
      xe = Xe(T),
      ye = Wt(i.rowVar),
      Ee = Wt(i.colVar);
    if (X.length > 1 || xe.length > 1 || rr(O).some(Le => Le.length > 1) || rr(T).some(Le => Le.length > 1) || ye && Ee) {
      const Le = await Vo(O, T, F.labeled, F.raw, g),
        $e = O.length === 1 && O[0]?.length === 1 && !ye ? await Li(Le, O[0][0], T, g, F.labeled, F.raw) : Le,
        Be = O.length === 1 && O[0]?.length === 1 && !ye ? Qn($e, O[0][0], g) : $e;
      return Lr(Be, f.hideZeroRows);
    }
    const ve = {
      rowVar: i.rowVar,
      colVar: i.colVar,
      showCount: f.showCount,
      showPercent: f.showPercent,
      percentType: f.percentType
    };
    if (ye) return Lr(await Up(F.raw, F.labeled, ve, ye, "row", tt(i.colVar), Sn(i.colVar, g)), f.hideZeroRows);
    if (Ee) return Lr(await Up(F.raw, F.labeled, ve, Ee, "column", tt(i.rowVar), Sn(i.rowVar, g)), f.hideZeroRows);
    const Fe = await Li(await Bh(F.labeled, ve, tt(i.rowVar), tt(i.colVar), Sn(i.rowVar, g), Sn(i.colVar, g)), i.rowVar, T, g, F.labeled, F.raw);
    return Lr(Qn(Fe, i.rowVar, g), f.hideZeroRows);
  }
  function Pi(i, f = $, g = ue, w = Gn, N = p?.cases ?? []) {
    const F = qn(i, w, N);
    if (!i.rowVar || !i.colVar || F.labeled.length === 0) return null;
    const O = ct(i.rowVar),
      T = ct(i.colVar),
      X = Xe(O),
      xe = Xe(T),
      ye = Wt(i.rowVar),
      Ee = Wt(i.colVar);
    if (X.length > 1 || xe.length > 1 || rr(O).some(Le => Le.length > 1) || rr(T).some(Le => Le.length > 1) || ye && Ee) {
      const Le = Yl(O, T, F.labeled, F.raw, g),
        $e = O.length === 1 && O[0]?.length === 1 && !ye ? Ti(Le, O[0][0], T, g, F.labeled, F.raw) : Le,
        Be = O.length === 1 && O[0]?.length === 1 && !ye ? Qn($e, O[0][0], g) : $e;
      return Lr(Be, f.hideZeroRows);
    }
    const ve = {
      rowVar: i.rowVar,
      colVar: i.colVar,
      showCount: f.showCount,
      showPercent: f.showPercent,
      percentType: f.percentType
    };
    if (ye) return Lr($p(F.raw, F.labeled, ve, ye, "row", tt(i.colVar), Sn(i.colVar, g)), f.hideZeroRows);
    if (Ee) return Lr($p(F.raw, F.labeled, ve, Ee, "column", tt(i.rowVar), Sn(i.rowVar, g)), f.hideZeroRows);
    const Fe = Ti(Ah(F.labeled, ve, tt(i.rowVar), tt(i.colVar), Sn(i.rowVar, g), Sn(i.colVar, g)), i.rowVar, T, g, F.labeled, F.raw);
    return Lr(Qn(Fe, i.rowVar, g), f.hideZeroRows);
  }
  function Ri(i) {
    if (!(!i.rowVar || !i.colVar || (p?.cases.length ?? 0) === 0)) {
      z(null);
      try {
        const f = Pi(i);
        f && (un(i.id, {
          result: f
        }), H("results"));
      } catch (f) {
        z(f instanceof Error ? f.message : String(f));
      }
    }
  }
  function es() {
    G(!0), z(null), setTimeout(() => {
      try {
        if (Y.filter(N => N.rowVar && N.colVar).length === 0) {
          G(!1);
          return;
        }
        let f = 0;
        const g = [],
          w = Y.map(N => {
            if (!N.rowVar || !N.colVar) return N;
            try {
              const F = Pi(N);
              return F ? (f += 1, {
                ...N,
                result: F
              }) : N;
            } catch {
              return g.push(N.name), N;
            }
          });
        ne(w), f > 0 && kt(`Run ${f} table${f > 1 ? "s" : ""} completed`), g.length > 0 && z(`Run failed for: ${g.join(", ")}`);
      } catch (i) {
        z(i instanceof Error ? i.message : String(i));
      } finally {
        G(!1);
      }
    }, 0);
  }
  async function Fi() {
    try {
      if (ot) {
        kt("Settings file นี้เปิดแบบ read-only จึงยัง save ไม่ได้", 4e3);
        return;
      }
      const i = wn();
      if (mr()) {
        const g = await ea(i, Ye ?? void 0);
        if (g) {
          Rt(g), Xt(i.sourceMappings ?? []), rn(!1), Yt(i.activeLock), an(!1), kt(Ye ? "Saved updates to current settings file" : "Settings file created and linked");
          return;
        }
      }
      const {
        saveSettings: f
      } = await Bc();
      await f(i.tables, i.folders, i.output, i.variableOverrides ?? {}, "crosstab_settings.xlsx", i.detectedMrsets ?? [], i.sourceDataset, i.sourceMappings, i.activeLock), Xt(i.sourceMappings ?? []), an(!1);
    } catch (i) {
      z(i instanceof Error ? i.message : String(i));
    }
  }
  async function Ka(i, f) {
    try {
      const {
          loadSettings: g
        } = await Bc(),
        w = await g(i);
      if (Ta(i.name), Rt(f ?? null), w.sourceDataset?.fileName && !za(p, w.sourceDataset)) {
        const T = [...(w.sourceMappings ?? []), ...(w.sourceDataset ? [w.sourceDataset] : [])].filter((xe, ye, Ee) => {
          const ve = `${xe.fileName}|${xe.filePath ?? ""}`;
          return Ee.findIndex(Fe => `${Fe.fileName}|${Fe.filePath ?? ""}` === ve) === ye;
        });
        let X = null;
        for (const xe of T) if (X = await gg(xe), X) break;
        if (X) {
          Hn.current = w, nn("match"), await dt(X.file, X.handle);
          return;
        }
        Hn.current = w, vt(w.sourceDataset), nn("match");
        return;
      }
      const N = aa(w.activeLock);
      if (!N && f && mr()) {
        const T = {
            ...w,
            activeLock: vn()
          },
          X = await ea({
            tables: T.tables,
            folders: T.folders,
            output: T.output,
            variableOverrides: T.variableOverrides ?? {},
            detectedMrsets: T.customMrsets ?? [],
            sourceDataset: T.sourceDataset,
            sourceMappings: T.sourceMappings ?? [],
            activeLock: T.activeLock
          }, f, i.name);
        if (X) {
          Rt(X), an(!1), Lo(T, {
            readonly: !1,
            readonlyLock: T.activeLock
          });
          return;
        }
      }
      Lo(w, {
        readonly: N,
        readonlyLock: N ? w.activeLock ?? null : null
      });
      return;
    } catch (g) {
      z(g instanceof Error ? g.message : String(g));
    }
  }
  function zo(i) {
    const f = Xe(ct(i.rowVar)),
      g = Xe(ct(i.colVar));
    return {
      rowVar: f.join(" + "),
      colVar: g.join(" + "),
      showCount: $.showCount,
      showPercent: $.showPercent,
      percentType: $.percentType,
      hideZeroRows: $.hideZeroRows
    };
  }
  async function ts() {
    if (De?.result) {
      W(!0);
      try {
        const {
          exportCrosstabToExcel: i
        } = await Il();
        await i(De.result, zo(De), De.name, or(De.filter) ?? void 0, `${De.name}.xlsx`);
      } catch (i) {
        z(String(i));
      } finally {
        W(!1);
      }
    }
  }
  async function ns() {
    const i = Y.filter(f => f.result).map(f => ({
      result: f.result,
      config: zo(f),
      tableName: f.name,
      filterSummary: or(f.filter) ?? void 0
    }));
    if (i.length !== 0) {
      W(!0);
      try {
        const {
          exportMultipleCrosstabsToExcel: f
        } = await Il();
        await f(i, "crosstab_all.xlsx");
      } catch (f) {
        z(String(f));
      } finally {
        W(!1);
      }
    }
  }
  async function Ao() {
    const i = Y.filter(f => q.has(f.id) && f.result).map(f => ({
      result: f.result,
      config: zo(f),
      tableName: f.name,
      filterSummary: or(f.filter) ?? void 0
    }));
    if (i.length !== 0) {
      W(!0);
      try {
        const {
          exportMultipleCrosstabsToExcel: f
        } = await Il();
        await f(i, "crosstab_selected.xlsx");
      } catch (f) {
        z(String(f));
      } finally {
        W(!1);
      }
    }
  }
  async function rs() {
    const i = window;
    if (!i.showDirectoryPicker) {
      z("Batch export needs a browser that supports folder selection");
      return;
    }
    try {
      No();
      const f = await i.showDirectoryPicker(),
        g = f.queryPermission ? await f.queryPermission({
          mode: "readwrite"
        }) : "prompt";
      if ((g === "granted" ? g : f.requestPermission ? await f.requestPermission({
        mode: "readwrite"
      }) : g) !== "granted") {
        z("Folder write permission was not granted for batch export");
        return;
      }
      Fr.current = f, La.current?.click();
    } catch (f) {
      if (f instanceof Error && f.name === "AbortError") return;
      z(f instanceof Error ? f.message : String(f));
    }
  }
  async function as(i) {
    if (!i || i.length === 0 || !p || !Fr.current) return;
    const f = Array.from(i),
      g = Gl();
    z(null);
    try {
      await xo(), await xo();
      const w = Fr.current;
      let N = 0;
      const F = [],
        O = [];
      for (const X of f) {
        await xo();
        try {
          const {
              loadSettings: xe
            } = await Bc(),
            ye = await xe(X),
            Ee = ye.variableOverrides ?? {},
            ve = {
              showCount: ye.output.showCount,
              showPercent: ye.output.showPercent,
              percentType: ye.output.percentType,
              hideZeroRows: ye.output.hideZeroRows ?? !1
            },
            Fe = Kn(Ee),
            Le = ye.tables.map((Me, it) => ({
              id: `batch-${it + 1}`,
              name: Me.name,
              rowVar: Me.rowVar,
              colVar: Me.colVar,
              folderId: Me.folderId,
              result: null,
              filter: Me.filter ?? bo()
            })),
            $e = [],
            Be = [];
          for (const Me of Le) try {
            const it = await Zl(Me, ve, Ee, Fe);
            if (!it) continue;
            Be.push({
              result: it,
              config: {
                rowVar: Xe(ct(Me.rowVar)).join(" + "),
                colVar: Xe(ct(Me.colVar)).join(" + "),
                showCount: ve.showCount,
                showPercent: ve.showPercent,
                percentType: ve.percentType,
                hideZeroRows: ve.hideZeroRows
              },
              tableName: Me.name,
              filterSummary: or(Me.filter) ?? void 0
            });
          } catch {
            $e.push(Me.name);
          }
          if (Be.length === 0) {
            $e.length > 0 ? F.push(`${X.name} (${$e.join(", ")})`) : F.push(`${X.name} (no runnable tables)`);
            continue;
          }
          await xo();
          const {
              buildCrosstabWorkbook: me
            } = await Il(),
            we = await (await me(Be)).xlsx.writeBuffer(),
            Ue = `${X.name.replace(/\.xlsx$/i, "")}.xlsx`,
            Qe = await (await w.getFileHandle(Ue, {
              create: !0
            })).createWritable();
          await Qe.write(we), await Qe.close(), N += 1, $e.length > 0 && O.push(`${X.name}: skipped ${$e.join(", ")}`);
        } catch (xe) {
          F.push(`${X.name} (${xe instanceof Error ? xe.message : String(xe)})`);
        }
      }
      const T = Math.max(0, Date.now() - g);
      if (vi({
        successCount: N,
        skippedCount: F.length,
        elapsedMs: T
      }), kt(`Batch export completed: ${N} file${N !== 1 ? "s" : ""}`), F.length > 0 || O.length > 0) {
        const X = [F.length > 0 ? `Skipped files: ${F.join(", ")}` : "", ...O].filter(Boolean);
        z(X.join(" | "));
      }
    } catch (w) {
      z(w instanceof Error ? w.message : String(w));
    } finally {
      Fr.current = null, wi();
    }
  }
  function qa(i, f = {}, g = "row") {
    const {
        shiftKey: w = !1,
        metaKey: N = !1,
        ctrlKey: F = !1
      } = f,
      O = N || F;
    if (g === "row" && (fe(i), H(T => T === "filter" ? "filter" : "design")), w && Ra.length > 0) {
      const T = de ?? jo ?? i,
        X = Ra.indexOf(T),
        xe = Ra.indexOf(i);
      if (xe >= 0) {
        const ye = X >= 0 ? X : xe,
          Ee = Math.min(ye, xe),
          ve = Math.max(ye, xe),
          Fe = Ra.slice(Ee, ve + 1);
        se(Le => {
          const $e = O ? new Set(Le) : new Set();
          return Fe.forEach(Be => $e.add(Be)), $e;
        }), ge(i);
        return;
      }
    }
    if (g === "checkbox" || O) {
      se(T => {
        const X = new Set(T);
        return X.has(i) ? X.delete(i) : X.add(i), X;
      }), ge(i);
      return;
    }
    se(new Set([i])), ge(i);
  }
  function Mi(i) {
    const f = {
      id: crypto.randomUUID(),
      join: "all",
      conditions: []
    };
    kn(i, g => ({
      ...g,
      groups: [...g.groups, f]
    }));
  }
  function os(i) {
    kn(i, () => bo());
  }
  function is(i, f) {
    kn(i, g => ({
      ...g,
      description: f
    }));
  }
  function ls(i, f) {
    kn(i, g => ({
      ...g,
      rootJoin: f
    }));
  }
  function ss(i, f) {
    if (!on.current) return;
    const g = on.current;
    kn(i, w => {
      const N = Aa(w),
        F = f ?? N.groups[0]?.id ?? crypto.randomUUID();
      N.groups.length === 0 && N.groups.push({
        id: F,
        join: "all",
        conditions: []
      });
      const O = N.groups.find(T => T.id === F);
      return O ? O.conditions.some(X => X.variableName === g) || O.conditions.push(_o(g)) : N.groups.push({
        id: F,
        join: "all",
        conditions: [_o(g)]
      }), N;
    }), on.current = null;
  }
  function cs(i, f, g) {
    kn(i, w => ({
      ...w,
      groups: w.groups.map(N => N.id === f ? {
        ...N,
        join: g
      } : N)
    }));
  }
  function us(i, f) {
    kn(i, g => ({
      ...g,
      groups: g.groups.filter(w => w.id !== f)
    }));
  }
  function ds(i, f, g, w) {
    kn(i, N => ({
      ...N,
      groups: N.groups.map(F => F.id !== f ? F : {
        ...F,
        conditions: F.conditions.map(O => O.id === g ? {
          ...O,
          ...w
        } : O)
      })
    }));
  }
  function Bo(i, f, g) {
    kn(i, w => ({
      ...w,
      groups: w.groups.map(N => N.id !== f ? N : {
        ...N,
        conditions: N.conditions.filter(F => F.id !== g)
      }).filter(N => N.conditions.length > 0 || w.groups.length === 1)
    }));
  }
  const Vr = De ? zt(De.id).size : 1,
    Ii = !!(De && Xe(ct(De.rowVar)).length > 0 && Xe(ct(De.colVar)).length > 0 && ($.showCount || $.showPercent)),
    $o = fi(De?.filter),
    Oi = Y.some(i => i.rowVar && i.colVar),
    Vi = Y.some(i => i.result),
    Uo = [...q].filter(i => Y.find(f => f.id === i)?.result).length,
    da = Se ? Tn.byName.get(Se) : null,
    zr = Se ? ji(Se) : 0,
    Qa = ze.filter(i => i.rowKind !== "net"),
    Wo = Qa.map((i, f) => rt.includes(i.key) ? f : -1).filter(i => i >= 0),
    ps = Wo[0] ?? -1,
    zi = Wo[Wo.length - 1] ?? -1,
    Ai = rt.some(i => ut.some(f => f.members.includes(i))),
    pt = u === "th" ? {
      badge: "SPSS CROSSTAB WORKSPACE",
      title: "Crossify ยกระดับการออกแบบตาราง SPSS Crosstab ให้เร็ว ลื่น และชัดเจน",
      subtitle: "สร้างแกน Top และ Side, จัด Nest ตัวแปรได้ยืดหยุ่น, ดูผลลัพธ์ทันที และ export งานต่อได้จาก workspace เดียวอย่างเป็นระบบ",
      enter: "เข้าใช้งานโปรแกรม",
      load: "โหลดไฟล์ SPSS",
      feature1Title: "ออกแบบได้ไว",
      feature1Desc: "จัดแกน Top และ Side พร้อม nested drag-and-drop ได้อย่างยืดหยุ่น",
      feature2Title: "ผลลัพธ์ยืดหยุ่น",
      feature2Desc: "ดู crosstab ทันทีและ export Excel ได้โดยไม่ต้องออกจาก flow",
      feature3Title: "ปลอดภัยใน Browser",
      feature3Desc: "ข้อมูลประมวลผลใน browser เพื่อ workflow ที่ปลอดภัยยิ่งขึ้น",
      batchTitle: "Batch Export — ส่งออกทุก Banner พร้อมกันในคลิกเดียว",
      batchDesc: "เลือกไฟล์ Setting Banner เข้าหลายไฟล์พร้อมกัน ระบบจะรัน Crosstab และ export Excel ให้ครบทุก Banner โดยอัตโนมัติ ไม่ต้องตั้งค่าซ้ำทีละไฟล์",
      batchTag: "Batch Export",
      startTitle: "แนะนำการเริ่มต้น",
      startDesc: "เข้า workspace ก่อน แล้วค่อยโหลดไฟล์ .sav จากเมนูด้านบน",
      settingsTitle: "พร้อมใช้ Settings",
      settingsDesc: "โหลด settings เดิมกลับมาทำงานต่อจากงานที่บันทึกไว้ได้เร็ว",
      developer: "Developed by Songklod Khunsiri"
    } : {
      badge: "SPSS CROSSTAB WORKSPACE",
      title: "Crossify helps you design SPSS crosstabs faster and more clearly",
      subtitle: "Build Top and Side axes, nest variables flexibly, run results instantly, and export everything from one workspace.",
      enter: "Enter Workspace",
      load: "Load SPSS File",
      feature1Title: "Design Fast",
      feature1Desc: "Arrange Top and Side axes with flexible nesting and drag-and-drop.",
      feature2Title: "Flexible Output",
      feature2Desc: "See crosstabs instantly and export to Excel without leaving the flow.",
      feature3Title: "Safe In Browser",
      feature3Desc: "Your data stays processed in the browser for a safer workflow.",
      batchTitle: "Batch Export — Export Every Banner at Once",
      batchDesc: "Select multiple SPSS files at once. The system runs Crosstabs and exports Excel for every banner automatically — no repetition needed.",
      batchTag: "Batch Export",
      startTitle: "Recommended Start",
      startDesc: "Open the workspace first, then load your .sav file from the top menu.",
      settingsTitle: "Settings Ready",
      settingsDesc: "Load existing settings to continue from a saved design faster.",
      developer: "Developed by Songklod Khunsiri"
    };
  if (a) return l.jsxs("div", {
    className: "min-h-screen bg-gradient-to-b from-[#EBF3FF] via-white to-[#F0F7FF] text-slate-800 select-none font-sans",
    children: [l.jsxs("div", {
      className: "pointer-events-none fixed inset-0 overflow-hidden",
      children: [l.jsx("div", {
        className: "absolute -top-[160px] -left-[120px] h-[600px] w-[600px] rounded-full bg-blue-300/[0.18] blur-[120px]"
      }), l.jsx("div", {
        className: "absolute -bottom-[120px] -right-[100px] h-[500px] w-[500px] rounded-full bg-indigo-300/[0.14] blur-[100px]"
      })]
    }), l.jsxs("header", {
      className: "sticky top-0 z-20 bg-[#1F4E78] text-white flex items-center gap-4 px-6 py-3.5 shadow-md",
      children: [l.jsx(Ml, {
        size: "md",
        withWordmark: !0
      }), l.jsxs("div", {
        className: "ml-auto flex items-center gap-3",
        children: [l.jsxs("div", {
          className: "flex rounded-lg border border-white/20 bg-white/10 p-0.5",
          children: [l.jsx("button", {
            onClick: () => d("th"),
            className: `rounded-md px-3 py-1.5 text-xs font-bold transition-all ${u === "th" ? "bg-white text-[#1F4E78] shadow" : "text-white/60 hover:text-white"}`,
            children: "TH"
          }), l.jsx("button", {
            onClick: () => d("en"),
            className: `rounded-md px-3 py-1.5 text-xs font-bold transition-all ${u === "en" ? "bg-white text-[#1F4E78] shadow" : "text-white/60 hover:text-white"}`,
            children: "EN"
          })]
        }), l.jsxs("button", {
          onClick: () => ra(),
          className: "inline-flex items-center gap-2 rounded-lg bg-white/10 border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition-all hover:bg-white/20 hover:text-white",
          children: [l.jsx(Ac, {
            className: "h-3.5 w-3.5"
          }), "Load Settings"]
        }), l.jsx("input", {
          ref: xr,
          type: "file",
          accept: ".xlsx",
          className: "hidden",
          onChange: i => {
            const f = i.target.files?.[0];
            f && Ka(f), i.target.value = "";
          }
        })]
      })]
    }), l.jsx("main", {
      className: "relative mx-auto flex min-h-[calc(100vh-57px)] w-full max-w-7xl items-center px-8 py-14",
      children: l.jsxs("div", {
        className: "grid w-full gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center",
        children: [l.jsxs("section", {
          className: "space-y-9",
          children: [l.jsxs("div", {
            className: "inline-flex items-center gap-2.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 shadow-sm",
            children: [l.jsx("span", {
              className: "h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"
            }), l.jsx("span", {
              className: "text-[10.5px] font-bold uppercase tracking-[0.30em] text-blue-600",
              children: pt.badge
            })]
          }), l.jsxs("div", {
            className: "space-y-5",
            children: [l.jsxs("h1", {
              className: "font-display max-w-2xl text-[1.85rem] font-extrabold leading-[1.3] tracking-[-0.01em] text-slate-900 sm:text-[2.1rem] xl:text-[2.4rem]",
              children: [l.jsx("span", {
                className: "bg-gradient-to-r from-[#1F4E78] to-[#2F6FE4] bg-clip-text text-transparent",
                children: "Crossify"
              }), pt.title.replace(/^Crossify/, "")]
            }), l.jsx("p", {
              className: "max-w-lg text-[1.0625rem] leading-[1.8] text-slate-500",
              children: pt.subtitle
            })]
          }), l.jsxs("div", {
            className: "flex flex-wrap gap-3",
            children: [l.jsxs("button", {
              onClick: () => s(!1),
              className: "inline-flex items-center gap-2.5 rounded-xl bg-[#1F4E78] px-6 py-3.5 text-[0.9375rem] font-bold text-white shadow-[0_8px_28px_-6px_rgba(31,78,120,0.45)] transition-all hover:-translate-y-0.5 hover:bg-[#163b5c] hover:shadow-[0_12px_34px_-6px_rgba(31,78,120,0.55)]",
              children: [pt.enter, l.jsx(Og, {
                className: "h-4 w-4"
              })]
            }), l.jsxs("button", {
              onClick: () => {
                s(!1), wr();
              },
              className: "inline-flex items-center gap-2.5 rounded-xl border border-blue-200 bg-white px-6 py-3.5 text-[0.9375rem] font-bold text-[#1F4E78] shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md",
              children: [l.jsx(ja, {
                className: "h-4 w-4"
              }), pt.load]
            })]
          }), l.jsxs("div", {
            className: "relative overflow-hidden rounded-2xl border border-[#1F4E78]/20 bg-gradient-to-r from-[#1F4E78] to-[#2563EB] p-5 shadow-[0_8px_32px_-8px_rgba(31,78,120,0.35)]",
            children: [l.jsx("div", {
              className: "pointer-events-none absolute right-0 top-0 h-full w-48 bg-[radial-gradient(circle_at_right,_rgba(255,255,255,0.07)_0%,_transparent_70%)]"
            }), l.jsx("div", {
              className: "pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/[0.06] blur-xl"
            }), l.jsxs("div", {
              className: "relative flex items-start gap-4",
              children: [l.jsx("div", {
                className: "flex-shrink-0",
                children: l.jsx("div", {
                  className: "flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20",
                  children: l.jsx(ho, {
                    className: "h-5 w-5 text-white"
                  })
                })
              }), l.jsxs("div", {
                className: "flex-1 min-w-0",
                children: [l.jsx("div", {
                  className: "mb-1.5 flex items-center gap-2 flex-wrap",
                  children: l.jsx("span", {
                    className: "rounded-full bg-white/15 px-2.5 py-0.5 text-[9.5px] font-black uppercase tracking-[0.22em] text-white/80",
                    children: pt.batchTag
                  })
                }), l.jsx("h3", {
                  className: "font-display text-[1rem] font-extrabold leading-snug tracking-tight text-white",
                  children: pt.batchTitle
                }), l.jsx("p", {
                  className: "mt-1.5 text-[0.8125rem] leading-[1.65] text-blue-100/80",
                  children: pt.batchDesc
                })]
              }), l.jsxs("div", {
                className: "hidden sm:flex flex-shrink-0 flex-col items-end gap-1",
                children: [["Banner_A.sav", "Banner_B.sav", "Banner_C.sav"].map((i, f) => l.jsxs("div", {
                  style: {
                    opacity: 1 - f * .2,
                    transform: `translateX(${f * 3}px)`
                  },
                  className: "flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 ring-1 ring-white/15",
                  children: [l.jsx("div", {
                    className: "h-1.5 w-1.5 rounded-full bg-emerald-300"
                  }), l.jsx("span", {
                    className: "text-[10px] font-semibold text-white/80",
                    children: i
                  })]
                }, i)), l.jsxs("div", {
                  className: "mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-300",
                  children: [l.jsx(ho, {
                    className: "h-3 w-3"
                  }), l.jsx("span", {
                    children: "3 files exported"
                  })]
                })]
              })]
            })]
          }), l.jsx("div", {
            className: "grid gap-3 sm:grid-cols-3",
            children: [{
              title: pt.feature1Title,
              desc: pt.feature1Desc,
              icon: l.jsx(Gp, {
                className: "h-[15px] w-[15px]"
              })
            }, {
              title: pt.feature2Title,
              desc: pt.feature2Desc,
              icon: l.jsx(ho, {
                className: "h-[15px] w-[15px]"
              })
            }, {
              title: pt.feature3Title,
              desc: pt.feature3Desc,
              icon: l.jsx(jf, {
                className: "h-[15px] w-[15px]"
              })
            }].map(i => l.jsxs("div", {
              className: "rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
              children: [l.jsx("div", {
                className: "mb-3 inline-flex rounded-xl bg-blue-50 p-2.5 text-blue-600 ring-1 ring-blue-100",
                children: i.icon
              }), l.jsx("h3", {
                className: "text-[0.875rem] font-bold text-slate-800",
                children: i.title
              }), l.jsx("p", {
                className: "mt-1.5 text-[0.8125rem] leading-[1.65] text-slate-500",
                children: i.desc
              })]
            }, i.title))
          }), l.jsx("p", {
            className: "text-[0.75rem] text-slate-400",
            children: pt.developer
          })]
        }), l.jsxs("section", {
          className: "relative",
          children: [l.jsx("div", {
            className: "absolute inset-[6%] rounded-full bg-blue-300/20 blur-3xl"
          }), l.jsxs("div", {
            className: "relative rounded-[32px] border border-blue-100 bg-white p-2 shadow-[0_32px_80px_-16px_rgba(31,78,120,0.18)]",
            children: [l.jsxs("div", {
              className: "rounded-[26px] bg-[#1F4E78] p-6 text-white",
              children: [l.jsxs("div", {
                className: "mb-4 flex items-center gap-1.5",
                children: [l.jsx("div", {
                  className: "h-2.5 w-2.5 rounded-full bg-white/20"
                }), l.jsx("div", {
                  className: "h-2.5 w-2.5 rounded-full bg-white/20"
                }), l.jsx("div", {
                  className: "h-2.5 w-2.5 rounded-full bg-white/20"
                }), l.jsx("div", {
                  className: "ml-2 h-5 flex-1 rounded-md bg-white/10 px-3 text-[10px] leading-5 text-white/40",
                  children: "crossify · workspace"
                })]
              }), l.jsxs("div", {
                className: "mb-5 flex items-center gap-2.5",
                children: [l.jsx(Ml, {
                  size: "sm"
                }), l.jsxs("div", {
                  children: [l.jsx("p", {
                    className: "font-display text-[0.9375rem] font-extrabold tracking-tight text-white",
                    children: "Crossify"
                  }), l.jsx("p", {
                    className: "text-[0.6875rem] text-blue-200/70",
                    children: "SPSS Edition"
                  })]
                })]
              }), l.jsxs("div", {
                className: "rounded-[20px] border border-white/15 bg-white/10 p-4",
                children: [l.jsxs("div", {
                  className: "grid grid-cols-2 gap-3",
                  children: [l.jsxs("div", {
                    className: "rounded-[16px] bg-white/10 p-3.5",
                    children: [l.jsx("p", {
                      className: "mb-2.5 text-[9.5px] font-black uppercase tracking-[0.22em] text-blue-200/70",
                      children: "Top Axis"
                    }), l.jsxs("div", {
                      className: "flex flex-wrap gap-1.5",
                      children: [l.jsx("span", {
                        className: "rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#1F4E78]",
                        children: "Area"
                      }), l.jsx("span", {
                        className: "rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#1F4E78]",
                        children: "Gender"
                      }), l.jsx("span", {
                        className: "rounded-lg bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white/50",
                        children: "Age"
                      })]
                    })]
                  }), l.jsxs("div", {
                    className: "rounded-[16px] bg-white/10 p-3.5",
                    children: [l.jsx("p", {
                      className: "mb-2.5 text-[9.5px] font-black uppercase tracking-[0.22em] text-blue-200/70",
                      children: "Output"
                    }), l.jsxs("div", {
                      className: "space-y-1.5",
                      children: [l.jsxs("div", {
                        className: "flex items-center gap-2 rounded-lg bg-emerald-400/20 px-2.5 py-1.5",
                        children: [l.jsx("span", {
                          className: "h-1.5 w-1.5 rounded-full bg-emerald-300"
                        }), l.jsx("span", {
                          className: "text-[11px] font-semibold text-emerald-200",
                          children: "Counts"
                        })]
                      }), l.jsxs("div", {
                        className: "flex items-center gap-2 rounded-lg bg-emerald-400/20 px-2.5 py-1.5",
                        children: [l.jsx("span", {
                          className: "h-1.5 w-1.5 rounded-full bg-emerald-300"
                        }), l.jsx("span", {
                          className: "text-[11px] font-semibold text-emerald-200",
                          children: "Percents"
                        })]
                      }), l.jsxs("div", {
                        className: "flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1.5",
                        children: [l.jsx("span", {
                          className: "h-1.5 w-1.5 rounded-full bg-white/30"
                        }), l.jsx("span", {
                          className: "text-[11px] font-semibold text-white/40",
                          children: "Excel Export"
                        })]
                      })]
                    })]
                  })]
                }), l.jsxs("div", {
                  className: "mt-3 rounded-[16px] bg-white/10 p-3",
                  children: [l.jsx("p", {
                    className: "mb-2 text-[9.5px] font-black uppercase tracking-[0.22em] text-blue-200/70",
                    children: "Preview"
                  }), l.jsxs("div", {
                    className: "overflow-hidden rounded-lg border border-white/15",
                    children: [l.jsx("div", {
                      className: "grid grid-cols-4 border-b border-white/15 bg-white/10",
                      children: ["", "Male", "Female", "Total"].map((i, f) => l.jsx("div", {
                        className: "px-2 py-1.5 text-center text-[9.5px] font-bold text-blue-200/70",
                        children: i
                      }, f))
                    }), [["Bangkok", "142", "158", "300"], ["Province", "98", "102", "200"]].map(i => l.jsx("div", {
                      className: "grid grid-cols-4 border-b border-white/10 last:border-0",
                      children: i.map((f, g) => l.jsx("div", {
                        className: `px-2 py-1.5 text-[9.5px] ${g === 0 ? "text-left font-medium text-white/70" : "text-center font-mono text-white/55"}`,
                        children: f
                      }, g))
                    }, i[0]))]
                  })]
                })]
              })]
            }), l.jsxs("div", {
              className: "mt-2 grid gap-2 p-1 sm:grid-cols-2",
              children: [l.jsxs("div", {
                className: "rounded-[22px] border border-slate-100 bg-slate-50 p-4",
                children: [l.jsx("p", {
                  className: "text-[9.5px] font-black uppercase tracking-[0.22em] text-slate-400",
                  children: pt.startTitle
                }), l.jsx("p", {
                  className: "mt-2 text-[12.5px] font-medium leading-[1.6] text-slate-600",
                  children: pt.startDesc
                })]
              }), l.jsxs("div", {
                className: "rounded-[22px] border border-slate-100 bg-slate-50 p-4",
                children: [l.jsx("p", {
                  className: "text-[9.5px] font-black uppercase tracking-[0.22em] text-slate-400",
                  children: pt.settingsTitle
                }), l.jsx("p", {
                  className: "mt-2 text-[12.5px] font-medium leading-[1.6] text-slate-600",
                  children: pt.settingsDesc
                })]
              })]
            })]
          })]
        })]
      })
    })]
  });
  const pa = Y.filter(i => !i.folderId);
  return l.jsxs("div", {
    className: "h-screen flex flex-col bg-gray-100 overflow-hidden select-none",
    children: [Q && l.jsx("div", {
      className: "fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-blue-700 text-white text-sm rounded-lg shadow-lg",
      children: Q
    }), l.jsxs("header", {
      className: "bg-[#1F4E78] text-white flex items-center gap-4 px-5 py-3.5 shadow-md flex-shrink-0",
      children: [l.jsx("button", {
        onClick: () => s(!0),
        className: "rounded-2xl transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/30",
        title: "Back to Home",
        children: l.jsx(Ml, {
          size: "md",
          withWordmark: !0
        })
      }), l.jsx("span", {
        className: "ml-4 text-sm text-blue-100 border-l border-blue-500/70 pl-4",
        children: p ? `${p.fileName} · ${p.cases.length.toLocaleString()} cases · ${p.variables.length.toLocaleString()} variables` : "Workspace ready · load an SPSS file to begin"
      }), p && x && l.jsx("span", {
        className: "rounded-full border border-amber-300/50 bg-amber-200/10 px-3 py-1 text-[11px] font-semibold text-amber-100",
        children: "Light load mode"
      }), l.jsxs("div", {
        className: "ml-auto flex flex-wrap items-center justify-end gap-2",
        children: [l.jsxs("div", {
          className: "relative",
          children: [l.jsxs("button", {
            onClick: i => {
              i.stopPropagation(), at(f => f === "workspace" ? null : "workspace");
            },
            className: "flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-white/20",
            children: ["Workspace", l.jsx(mi, {
              className: `w-3.5 h-3.5 transition-transform ${qe === "workspace" ? "rotate-180" : ""}`
            })]
          }), qe === "workspace" && l.jsx("div", {
            onClick: i => i.stopPropagation(),
            className: "absolute right-0 top-full z-40 mt-2 min-w-[150px] rounded-xl border border-blue-100 bg-white/95 p-1 shadow-[0_18px_38px_-14px_rgba(15,23,42,0.26)] backdrop-blur",
            children: l.jsxs("button", {
              onClick: () => {
                wr(), at(null);
              },
              className: "flex w-full items-center gap-1.5 rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-sky-50 px-2 py-1.5 text-left text-xs font-semibold text-slate-700 transition-all hover:border-blue-200 hover:from-blue-100 hover:to-sky-100",
              children: [l.jsx(ja, {
                className: "h-3.5 w-3.5 text-blue-600"
              }), l.jsx("span", {
                children: p ? "Change SPSS" : "Load SPSS"
              })]
            })
          })]
        }), l.jsxs("div", {
          className: "relative",
          children: [l.jsxs("button", {
            onClick: i => {
              i.stopPropagation(), at(f => f === "tables" ? null : "tables");
            },
            className: "flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-white/20",
            children: ["Tables", l.jsx(mi, {
              className: `w-3.5 h-3.5 transition-transform ${qe === "tables" ? "rotate-180" : ""}`
            })]
          }), qe === "tables" && l.jsxs("div", {
            onClick: i => i.stopPropagation(),
            className: "absolute right-0 top-full z-40 mt-2 min-w-[150px] rounded-xl border border-blue-100 bg-white/95 p-1 shadow-[0_18px_38px_-14px_rgba(15,23,42,0.26)] backdrop-blur",
            children: [l.jsxs("button", {
              onClick: () => {
                Fi(), at(null);
              },
              disabled: ot,
              className: "flex w-full items-center gap-1.5 rounded-lg border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-2 py-1.5 text-left text-xs font-semibold text-slate-700 transition-all hover:border-emerald-200 hover:from-emerald-100 hover:to-teal-100 disabled:cursor-not-allowed disabled:opacity-45",
              children: [l.jsx(Wg, {
                className: "h-3.5 w-3.5 text-emerald-600"
              }), l.jsx("span", {
                children: "Save"
              })]
            }), l.jsxs("button", {
              onClick: () => {
                ra(), at(null);
              },
              className: "mt-1 flex w-full items-center gap-1.5 rounded-lg border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 px-2 py-1.5 text-left text-xs font-semibold text-slate-700 transition-all hover:border-amber-200 hover:from-amber-100 hover:to-orange-100",
              children: [l.jsx(Ac, {
                className: "h-3.5 w-3.5 text-amber-600"
              }), l.jsx("span", {
                children: "Load"
              })]
            })]
          })]
        }), l.jsxs("div", {
          className: "relative",
          children: [l.jsxs("button", {
            onClick: i => {
              i.stopPropagation(), at(f => f === "batch" ? null : "batch");
            },
            className: "flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-white/20",
            children: ["Batch", l.jsx(mi, {
              className: `w-3.5 h-3.5 transition-transform ${qe === "batch" ? "rotate-180" : ""}`
            })]
          }), qe === "batch" && l.jsx("div", {
            onClick: i => i.stopPropagation(),
            className: "absolute right-0 top-full z-40 mt-2 min-w-[150px] rounded-xl border border-blue-100 bg-white/95 p-1 shadow-[0_18px_38px_-14px_rgba(15,23,42,0.26)] backdrop-blur",
            children: l.jsxs("button", {
              onClick: () => {
                rs(), at(null);
              },
              disabled: !p || Ln,
              className: "flex w-full items-center gap-1.5 rounded-lg border border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 px-2 py-1.5 text-left text-xs font-semibold text-slate-700 transition-all hover:border-violet-200 hover:from-violet-100 hover:to-indigo-100 disabled:cursor-not-allowed disabled:opacity-40",
              children: [Ln ? l.jsx(go, {
                className: "h-3.5 w-3.5 animate-spin text-violet-600"
              }) : l.jsx(Hp, {
                className: "h-3.5 w-3.5 text-violet-600"
              }), l.jsx("span", {
                children: "Batch Export"
              })]
            })
          })]
        }), l.jsx("input", {
          ref: xr,
          type: "file",
          accept: ".xlsx",
          className: "hidden",
          onChange: i => {
            const f = i.target.files?.[0];
            f && Ka(f), i.target.value = "";
          }
        }), l.jsx("input", {
          ref: La,
          type: "file",
          accept: ".xlsx",
          multiple: !0,
          className: "hidden",
          onChange: i => {
            as(i.target.files), i.target.value = "";
          }
        })]
      })]
    }), (_t || ot) && l.jsx("div", {
      className: `border-b px-5 py-2.5 text-sm ${ot ? "border-amber-200 bg-amber-50 text-amber-900" : "border-blue-100 bg-blue-50 text-blue-900"}`,
      children: l.jsxs("div", {
        className: "flex flex-wrap items-center justify-between gap-3",
        children: [l.jsxs("div", {
          className: "flex flex-wrap items-center gap-x-4 gap-y-1",
          children: [l.jsx("span", {
            className: "font-semibold",
            children: ot ? "Read-only settings mode" : "Settings file linked"
          }), _t && l.jsx("span", {
            children: _t
          }), Ut && l.jsxs("span", {
            className: "text-xs text-amber-800/80",
            children: ["Locked by ", Ut.ownerLabel, Ut.machineLabel ? ` · ${Ut.machineLabel}` : "", Ut.expiresAt ? ` · until ${new Date(Ut.expiresAt).toLocaleString()}` : ""]
          })]
        }), ot && l.jsxs("div", {
          className: "flex flex-wrap items-center gap-2",
          children: [l.jsx("button", {
            onClick: Po,
            className: "rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100",
            children: "Refresh Lock Status"
          }), l.jsx("button", {
            onClick: Ua,
            className: "rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700",
            children: "Force Take Over"
          })]
        }), !ot && Ye && l.jsx("div", {
          className: "flex flex-wrap items-center gap-2",
          children: l.jsx("button", {
            onClick: () => void Ql(),
            className: "rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-100",
            children: "Exit"
          })
        })]
      })
    }), l.jsxs("div", {
      className: "flex-1 flex overflow-hidden",
      children: [p && l.jsxs(l.Fragment, {
        children: [l.jsxs("div", {
          className: "flex-shrink-0 flex flex-col bg-white border-r border-gray-200 overflow-hidden select-none",
          style: {
            width: re
          },
          children: [l.jsxs("div", {
            className: "flex flex-col border-b border-gray-200",
            style: {
              height: "45%"
            },
            children: [l.jsxs("div", {
              className: "flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 flex-shrink-0",
              children: [l.jsx("span", {
                className: "text-[11px] font-bold text-gray-500 uppercase tracking-wide",
                children: "Tables List"
              }), l.jsxs("div", {
                className: "flex items-center gap-1",
                children: [l.jsx("button", {
                  onClick: () => Ro(),
                  className: "p-1 rounded hover:bg-blue-100 text-blue-600",
                  title: "เพิ่ม Table",
                  children: l.jsx(Nf, {
                    className: "w-4 h-4"
                  })
                }), l.jsx("button", {
                  onClick: Ha,
                  className: "p-1 rounded hover:bg-amber-100 text-amber-600",
                  title: "เพิ่ม Folder",
                  children: l.jsx(Sf, {
                    className: "w-4 h-4"
                  })
                })]
              })]
            }), l.jsxs("div", {
              className: "flex-1 overflow-y-auto py-1",
              children: [pa.map(i => l.jsx(Yp, {
                table: i,
                active: i.id === jo,
                selected: q.has(i.id),
                hasActiveFilter: fi(i.filter),
                filterSummary: or(i.filter),
                folders: Wn,
                onClick: f => qa(i.id, f, "row"),
                onDelete: () => Fo(i.id),
                onRename: f => un(i.id, {
                  name: f
                }),
                onToggleSelect: f => qa(i.id, f, "checkbox"),
                onMoveToFolder: f => Or(i.id, f),
                onDuplicate: () => Wa(i.id),
                onDragStart: () => {
                  ln.current = i.id;
                },
                onDropToRow: () => {
                  ln.current && (Mo(ln.current, i.id), ln.current = null);
                },
                indent: !1
              }, i.id)), Wn.map(i => {
                const f = Y.filter(g => g.folderId === i.id);
                return l.jsxs("div", {
                  children: [l.jsxs("div", {
                    className: "flex items-center gap-1 px-2 py-1.5 bg-gray-50 hover:bg-amber-50 border-b border-gray-100 group cursor-pointer",
                    onDragOver: g => g.preventDefault(),
                    onDrop: () => {
                      ln.current && (Or(ln.current, i.id), ln.current = null);
                    },
                    onClick: () => Io(i.id, {
                      expanded: !i.expanded
                    }),
                    children: [i.expanded ? l.jsx(mi, {
                      className: "w-3 h-3 text-gray-400 flex-shrink-0"
                    }) : l.jsx(Ag, {
                      className: "w-3 h-3 text-gray-400 flex-shrink-0"
                    }), l.jsx(Hp, {
                      className: "w-3.5 h-3.5 text-amber-500 flex-shrink-0"
                    }), l.jsx("input", {
                      value: i.name,
                      onClick: g => g.stopPropagation(),
                      onChange: g => Io(i.id, {
                        name: g.target.value
                      }),
                      className: "flex-1 text-xs font-semibold text-gray-700 bg-transparent outline-none min-w-0"
                    }), l.jsx("button", {
                      onClick: g => {
                        g.stopPropagation(), Ga(i.id);
                      },
                      className: "opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 flex-shrink-0 p-0.5",
                      title: "ลบ Folder",
                      children: l.jsx(Ul, {
                        className: "w-3 h-3"
                      })
                    })]
                  }), i.expanded && f.map(g => l.jsx(Yp, {
                    table: g,
                    active: g.id === jo,
                    selected: q.has(g.id),
                    hasActiveFilter: fi(g.filter),
                    filterSummary: or(g.filter),
                    folders: Wn,
                    onClick: w => qa(g.id, w, "row"),
                    onDelete: () => Fo(g.id),
                    onRename: w => un(g.id, {
                      name: w
                    }),
                    onToggleSelect: w => qa(g.id, w, "checkbox"),
                    onMoveToFolder: w => Or(g.id, w),
                    onDuplicate: () => Wa(g.id),
                    onDragStart: () => {
                      ln.current = g.id;
                    },
                    onDropToRow: () => {
                      ln.current && (Mo(ln.current, g.id), ln.current = null);
                    },
                    indent: !0
                  }, g.id))]
                }, i.id);
              })]
            })]
          }), l.jsxs("div", {
            className: "flex flex-col flex-1 overflow-hidden",
            children: [l.jsx("div", {
              className: "flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 flex-shrink-0",
              children: l.jsx("span", {
                className: "text-[11px] font-bold text-gray-500 uppercase tracking-wide",
                children: "VariableFolders"
              })
            }), l.jsx("div", {
              className: "flex-1 overflow-hidden",
              children: l.jsx(rx, {
                variables: Tn.list,
                onDragStart: Oo,
                onOpen: i => Ce(i),
                activeTarget: quickAddTarget,
                selectedNames: selectedVariableNames,
                onSelect: handleVarSelect,
                onClearSelection: handleVarClearSelection,
                onQuickAction: handleVarQuickAction,
                onSetActiveTarget: setQuickAddTarget
              })
            })]
          })]
        }), l.jsx("div", {
          onMouseDown: () => Ne(!0),
          className: `w-1.5 flex-shrink-0 cursor-col-resize transition-colors ${_ ? "bg-blue-300" : "bg-transparent hover:bg-blue-200"}`,
          title: "Resize sidebar"
        })]
      }), l.jsxs("div", {
        className: "flex-1 flex flex-col overflow-hidden bg-gray-50",
        children: [l.jsxs("div", {
          className: "grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-gray-200 bg-white px-4 py-2 flex-shrink-0",
          children: [l.jsxs("div", {
            className: "flex items-center gap-2",
            children: [l.jsxs("button", {
              onClick: es,
              disabled: !p || A || !Oi,
              className: "flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50",
              children: [A ? l.jsx(go, {
                className: "w-3.5 h-3.5 animate-spin"
              }) : l.jsx(Gp, {
                className: "w-3.5 h-3.5"
              }), A ? "Running..." : "Run All"]
            }), l.jsxs("button", {
              onClick: Ao,
              disabled: U || Uo === 0,
              className: "flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50",
              children: [U ? l.jsx(go, {
                className: "w-3.5 h-3.5 animate-spin"
              }) : l.jsx(ho, {
                className: "w-3.5 h-3.5"
              }), "Export Selected (", Uo, ")"]
            }), l.jsxs("button", {
              onClick: ns,
              disabled: U || !Vi,
              className: "flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50",
              children: [U ? l.jsx(go, {
                className: "w-3.5 h-3.5 animate-spin"
              }) : l.jsx(ho, {
                className: "w-3.5 h-3.5"
              }), "Export All"]
            })]
          }), l.jsx("div", {
            className: "justify-self-center",
            children: l.jsx("div", {
              className: "inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-1 shadow-sm ring-1 ring-blue-100",
              children: ["design", "filter", "results"].map(i => l.jsx("button", {
                onClick: () => H(i),
                className: `min-w-[100px] rounded-lg px-4 py-2 text-sm font-bold transition-all
                      ${le === i ? "bg-gradient-to-r from-[#1F4E78] to-[#2F6FE4] text-white shadow-md" : "text-gray-600 hover:bg-white hover:text-[#1F4E78]"}`,
                children: i === "design" ? "Design" : i === "filter" ? "Filter" : "Results"
              }, i))
            })
          }), l.jsx("div", {
            className: "justify-self-end",
            children: l.jsx(cx, {
              settings: $,
              onChange: i => ie(f => ({
                ...f,
                ...i
              }))
            })
          })]
        }), K && l.jsxs("div", {
          className: "mx-4 mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-center gap-2 flex-shrink-0",
          children: [l.jsx("span", {
            className: "flex-1",
            children: K
          }), l.jsx("button", {
            onClick: () => z(null),
            children: l.jsx(Wl, {
              className: "w-3.5 h-3.5"
            })
          })]
        }), l.jsx("div", {
          className: "flex-1 overflow-auto",
          children: p ? le === "design" ? l.jsx("div", {
            className: "min-h-full flex items-start justify-center p-8",
            children: De ? l.jsx(Hg, {
              table: De,
              batchEditCount: Vr,
              quickAddTarget: quickAddTarget,
              getVarLabel: tt,
              getVarTone: Co,
              onActivateQuickTarget: i => setQuickAddTarget(i),
              onDropTop: ca,
              onDropSide: Xl,
              onClearTop: () => Dt(De.id, i => ({
                ...i,
                colVar: null,
                result: null
              })),
              onClearSide: () => Dt(De.id, i => ({
                ...i,
                rowVar: null,
                result: null
              })),
              onReorderTop: (i, f) => Dt(De.id, g => ({
                ...g,
                colVar: zn(moveAxisOccurrenceToTarget(ct(g.colVar), i, f)),
                result: null
              })),
              onReorderSide: (i, f) => Dt(De.id, g => ({
                ...g,
                rowVar: zn(moveAxisOccurrenceToTarget(ct(g.rowVar), i, f)),
                result: null
              })),
              onRemoveTop: (i, f) => Dt(De.id, g => ({
                ...g,
                colVar: zn(Rp(ct(g.colVar), i, f)),
                result: null
              })),
              onRemoveSide: (i, f) => Dt(De.id, g => ({
                ...g,
                rowVar: zn(Rp(ct(g.rowVar), i, f)),
                result: null
              })),
              onMoveTopUp: i => Dt(De.id, f => ({
                ...f,
                colVar: zn(Fl(ct(f.colVar), i, -1)),
                result: null
              })),
              onMoveTopDown: i => Dt(De.id, f => ({
                ...f,
                colVar: zn(Fl(ct(f.colVar), i, 1)),
                result: null
              })),
              onMoveSideUp: i => Dt(De.id, f => ({
                ...f,
                rowVar: zn(Fl(ct(f.rowVar), i, -1)),
                result: null
              })),
              onMoveSideDown: i => Dt(De.id, f => ({
                ...f,
                rowVar: zn(Fl(ct(f.rowVar), i, 1)),
                result: null
              })),
              onUpdateName: i => un(De.id, {
                name: i
              }),
              onGenerate: () => Ri(De),
              canRun: Ii
            }) : l.jsx("p", {
              className: "text-gray-400 text-sm mt-16",
              children: "เลือก Table จากรายการซ้าย"
            })
          }) : le === "filter" ? l.jsx("div", {
            className: "min-h-full flex items-start justify-center p-8",
            children: De ? l.jsxs(l.Fragment, {
              children: [filterMismatchTableNames.length > 0 && l.jsxs("div", {
                className: "mb-3 w-full max-w-5xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900",
                children: ["Selected tables have different filters. Changes will use the active table as the source for: ", filterMismatchTableNames.join(", ")]
              }), l.jsx(qg, {
                table: De,
                batchEditCount: editingTableIds.length > 1 ? editingTableIds.length : Vr,
                isQuickTarget: quickAddTarget === "filter",
                getVarLabel: tt,
                getVarTone: Co,
                getFilterFieldMeta: Ba,
                onActivateQuickTarget: () => setQuickAddTarget("filter"),
                onUpdateDescription: i => is(De.id, i),
                onUpdateRootJoin: i => ls(De.id, i),
                onAddGroup: () => Mi(De.id),
                onClear: () => os(De.id),
                onDropVariable: i => ss(De.id, i),
                onUpdateGroupJoin: (i, f) => cs(De.id, i, f),
                onRemoveGroup: i => us(De.id, i),
                onUpdateCondition: (i, f, g) => ds(De.id, i, f, g),
                onRemoveCondition: (i, f) => Bo(De.id, i, f),
                onGenerate: () => Ri(De),
                canRun: Ii
              })]
            }) : l.jsx("p", {
              className: "text-gray-400 text-sm mt-16",
              children: "เน€เธฅเธทเธญเธ Table เธเธฒเธเธฃเธฒเธขเธเธฒเธฃเธเนเธฒเธข"
            })
          }) : l.jsx("div", {
            className: "min-h-full flex items-start justify-center px-4 py-4",
            children: De?.result ? l.jsxs("div", {
              className: "w-full max-w-none space-y-3",
              children: [l.jsxs("div", {
                className: "flex items-center justify-between",
                children: [l.jsxs("div", {
                  className: "space-y-1",
                  children: [l.jsxs("p", {
                    className: "text-xs text-gray-500 font-medium",
                    children: [De.name, " · ", De.result.rowValues.length, " rows × ", De.result.colValues.length, " cols · n=", De.result.grandTotal.toLocaleString(), " · ", $.showPercent ? $.percentType === "row" ? "Row %" : $.percentType === "column" ? "Column %" : "Total %" : ""]
                  }), $o && l.jsxs("p", {
                    className: "text-[11px] font-medium text-blue-700",
                    children: ["Filter: ", or(De.filter)]
                  })]
                }), l.jsxs("button", {
                  onClick: ts,
                  disabled: U,
                  className: "flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50",
                  children: [U ? l.jsx(go, {
                    className: "w-3.5 h-3.5 animate-spin"
                  }) : l.jsx(ho, {
                    className: "w-3.5 h-3.5"
                  }), "Export Excel"]
                })]
              }), l.jsx(Zg, {
                result: De.result,
                config: {
                  rowVar: De.rowVar,
                  colVar: De.colVar,
                  showCount: $.showCount,
                  showPercent: $.showPercent,
                  percentType: $.percentType,
                  hideZeroRows: $.hideZeroRows
                }
              }), l.jsxs("div", {
                className: "text-[10px] text-gray-400 space-y-0.5",
                children: [De.rowVar && Xe(ct(De.rowVar)).length > 0 && l.jsxs("p", {
                  children: ["Row: ", l.jsx("b", {
                    children: Xe(ct(De.rowVar)).join(" + ")
                  }), " — ", Xe(ct(De.rowVar)).map(tt).join(" + ")]
                }), De.colVar && Xe(ct(De.colVar)).length > 0 && l.jsxs("p", {
                  children: ["Col: ", l.jsx("b", {
                    children: Xe(ct(De.colVar)).join(" + ")
                  }), " — ", Xe(ct(De.colVar)).map(tt).join(" + ")]
                }), $o && l.jsxs("p", {
                  children: ["Filter: ", l.jsx("b", {
                    children: De.filter.description.trim() || "Custom filter"
                  }), " โ€” ", De.filter.groups.length, " group(s)"]
                })]
              })]
            }) : l.jsxs("div", {
              className: "flex flex-col items-center justify-center gap-3 mt-24 text-gray-400",
              children: [l.jsx(Ug, {
                className: "w-10 h-10"
              }), l.jsx("p", {
                className: "text-sm",
                children: "ยังไม่มีผลลัพธ์ — ไปที่ Design แล้วกด Run Table"
              })]
            })
          }) : l.jsx("div", {
            className: "min-h-full flex items-center justify-center p-8",
            children: l.jsxs("div", {
              ...Fa(),
              className: `w-full max-w-2xl rounded-[28px] border border-dashed p-10 text-center shadow-sm transition-all ${Eo ? "border-blue-500 bg-blue-50" : "border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50/40"}`,
              children: [l.jsx("input", {
                ...ql()
              }), l.jsxs("div", {
                className: "mx-auto flex max-w-xl flex-col items-center gap-4",
                children: [l.jsx("div", {
                  className: "inline-flex rounded-2xl bg-blue-50 p-4 text-blue-700",
                  children: l.jsx(ja, {
                    className: "h-10 w-10"
                  })
                }), l.jsxs("div", {
                  className: "space-y-2",
                  children: [l.jsx("h2", {
                    className: "text-2xl font-black text-slate-800",
                    children: Eo ? "Drop your SPSS file here" : "Start by loading an SPSS file"
                  }), l.jsx("p", {
                    className: "text-sm leading-6 text-slate-500",
                    children: "Entered the workspace already. Now load a `.sav` file from here or use the `Load SPSS` button in the top bar."
                  })]
                }), l.jsxs("div", {
                  className: "flex flex-wrap justify-center gap-3",
                  children: [l.jsxs("button", {
                    onClick: i => {
                      i.stopPropagation(), wr();
                    },
                    className: "inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#1F4E78] to-[#2F6FE4] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100",
                    children: [l.jsx(ja, {
                      className: "h-4 w-4"
                    }), "Load SPSS File"]
                  }), l.jsxs("button", {
                    onClick: i => {
                      i.stopPropagation(), ra();
                    },
                    className: "inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-sm hover:bg-blue-50",
                    children: [l.jsx(Ac, {
                      className: "h-4 w-4"
                    }), "Load Settings"]
                  })]
                })]
              })]
            })
          })
        })]
      })]
    }), Nt && l.jsx("div", {
      className: "fixed inset-0 z-[65] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm",
      children: l.jsxs("div", {
        className: "w-full max-w-lg rounded-[28px] border border-blue-100 bg-white p-6 shadow-2xl",
        children: [l.jsxs("div", {
          className: "flex items-start gap-4",
          children: [l.jsx("div", {
            className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600",
            children: l.jsx(ja, {
              className: "h-6 w-6"
            })
          }), l.jsxs("div", {
            className: "min-w-0 flex-1",
            children: [l.jsx("h3", {
              className: "text-lg font-bold text-slate-800",
              children: "Select SPSS File"
            }), l.jsx("p", {
              className: "mt-1 text-sm text-slate-500",
              children: "Settings นี้ผูกกับไฟล์ SPSS ด้านล่าง กรุณาเลือกไฟล์นี้เพื่อ restore workspace ต่อ"
            })]
          })]
        }), l.jsxs("div", {
          className: "mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3",
          children: [l.jsx("div", {
            className: "text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-500",
            children: "Expected File"
          }), l.jsx("div", {
            className: "mt-2 break-all text-base font-semibold text-slate-800",
            children: Nt.fileName
          }), Nt.filePath && l.jsx("div", {
            className: "mt-2 break-all text-xs text-slate-500",
            children: Nt.filePath
          })]
        }), l.jsx("div", {
          className: "mt-4 rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm text-amber-900",
          children: "ถ้าเครื่องนี้เก็บไฟล์ไว้คนละ path หรือชื่อไฟล์ต่างจากเดิม ให้ใช้ `Rebind SPSS File` แล้วระบบจะผูก settings นี้กับไฟล์ใหม่ให้ต่อจากนี้"
        }), l.jsxs("div", {
          className: "mt-6 flex items-center justify-end gap-3",
          children: [l.jsx("button", {
            onClick: () => {
              Hn.current = null, vt(null), nn("match");
            },
            className: "rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50",
            children: "Cancel"
          }), l.jsxs("button", {
            onClick: () => {
              vt(null), nn("match"), wr();
            },
            className: "inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100",
            children: [l.jsx(ja, {
              className: "h-4 w-4"
            }), "Choose Matching File"]
          }), l.jsxs("button", {
            onClick: () => {
              vt(null), nn("rebind"), wr();
            },
            className: "inline-flex items-center gap-2 rounded-xl bg-[#1F4E78] px-4 py-2 text-sm font-semibold text-white hover:bg-[#173b5c]",
            children: [l.jsx(ja, {
              className: "h-4 w-4"
            }), "Rebind SPSS File"]
          })]
        })]
      })
    }), E && l.jsx("div", {
      className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/18 p-6 backdrop-blur-[2px]",
      children: l.jsx("div", {
        className: "w-full max-w-lg rounded-[28px] border border-dashed border-blue-300 bg-white px-10 py-12 text-center shadow-2xl shadow-blue-100",
        children: l.jsxs("div", {
          className: "mx-auto flex max-w-xs flex-col items-center gap-4",
          children: [l.jsx(go, {
            className: "h-12 w-12 animate-spin text-blue-500"
          }), l.jsxs("div", {
            className: "space-y-1",
            children: [l.jsx("p", {
              className: "text-xl font-bold text-blue-700",
              children: "Loading SPSS file..."
            }), l.jsx("p", {
              className: "text-xs text-slate-400",
              children: C === "variables" ? "Reading variable metadata..." : C === "cases" ? `Loading case data${pe > 0 ? ` ${pe}%` : ""}...` : "Preparing file..."
            })]
          }), l.jsx("div", {
            className: "w-full overflow-hidden rounded-full bg-slate-200 h-1.5",
            children: l.jsx("div", {
              className: "h-full rounded-full bg-blue-500 transition-all duration-150",
              style: {
                width: C === "cases" && pe > 0 ? `${pe}%` : "100%",
                animation: C !== "cases" || pe === 0 ? "indeterminate 1.5s ease-in-out infinite" : "none"
              }
            })
          })]
        })
      })
    }), Se && da && l.jsx("div", {
      className: "fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4",
      children: l.jsxs("div", {
        className: "w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-200",
        children: [l.jsxs("div", {
          className: "flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50",
          children: [l.jsxs("div", {
            children: [l.jsxs("h3", {
              className: "text-sm font-bold text-gray-800",
              children: ["Edit Variable - ", Se]
            }), l.jsx("p", {
              className: "text-xs text-gray-500",
              children: da.label || da.longName || da.name
            })]
          }), l.jsx("button", {
            onClick: () => Ce(null),
            className: "p-1 rounded hover:bg-gray-200 text-gray-500",
            children: l.jsx(Wl, {
              className: "w-4 h-4"
            })
          })]
        }), l.jsxs("div", {
          className: "px-5 py-4 overflow-auto max-h-[calc(85vh-64px)] space-y-4",
          children: [l.jsxs("div", {
            className: "grid grid-cols-[1fr_auto] gap-4 items-start",
            children: [l.jsx("div", {
              className: "border border-gray-200 rounded-xl overflow-auto max-h-[62vh]",
              children: l.jsxs("table", {
                className: "w-full text-xs select-none",
                children: [l.jsx("thead", {
                  className: "bg-[#2E75B6] text-white sticky top-0 z-10",
                  children: l.jsxs("tr", {
                    children: [l.jsxs("th", {
                      onClick: Ci,
                      className: "px-2 py-2 text-left w-[72px] cursor-pointer select-none",
                      title: "Click to sort code",
                      children: ["Code ", hr === "asc" ? "↑" : "↓"]
                    }), l.jsx("th", {
                      className: "px-2 py-2 text-left",
                      children: "Label"
                    }), l.jsx("th", {
                      className: "px-2 py-2 text-right w-[90px]",
                      children: "Count"
                    }), l.jsx("th", {
                      className: "px-2 py-2 text-right w-[80px]",
                      children: "Percent"
                    }), l.jsx("th", {
                      className: "px-2 py-2 text-center w-[100px]",
                      children: "Factor"
                    }), l.jsx("th", {
                      className: "px-2 py-2 text-center w-[88px]",
                      children: "Select"
                    })]
                  })
                }), l.jsxs("tbody", {
                  children: [l.jsxs("tr", {
                    className: "bg-[#D9E1F2] font-semibold text-gray-800",
                    children: [l.jsx("td", {
                      className: "px-2 py-2 border-t border-[#BDD7EE]",
                      children: "Base"
                    }), l.jsx("td", {
                      className: "px-2 py-2 border-t border-[#BDD7EE]",
                      children: "All valid answers"
                    }), l.jsx("td", {
                      className: "px-2 py-2 border-t border-[#BDD7EE] text-right tabular-nums",
                      children: zr
                    }), l.jsx("td", {
                      className: "px-2 py-2 border-t border-[#BDD7EE] text-right",
                      children: "100.0"
                    }), l.jsx("td", {
                      className: "px-2 py-2 border-t border-[#BDD7EE]"
                    }), l.jsx("td", {
                      className: "px-2 py-2 border-t border-[#BDD7EE]"
                    })]
                  }), ze.map((i, f) => {
                    const g = rt.includes(i.key),
                      w = i.rowKind === "net";
                    return l.jsxs("tr", {
                      className: w ? "bg-emerald-50" : g ? "bg-blue-100" : f % 2 === 0 ? "bg-white" : "bg-[#EBF3FB]",
                      children: [l.jsx("td", {
                        className: `px-2 py-2 border-t border-[#BDD7EE] text-gray-700 ${w ? "font-semibold text-emerald-800" : "cursor-pointer"} ${g ? "font-semibold" : ""}`,
                        onMouseDown: N => N.preventDefault(),
                        onClick: N => {
                          w || Ei(i.key, N.shiftKey);
                        },
                        onContextMenu: N => {
                          w || (N.preventDefault(), g || ($t([i.key]), Vt(Qa.findIndex(F => F.key === i.key))), Dn({
                            x: N.clientX,
                            y: N.clientY
                          }));
                        },
                        children: i.code
                      }), l.jsx("td", {
                        className: `px-2 py-2 border-t border-[#BDD7EE] text-gray-800 ${w ? "font-semibold text-emerald-800" : "cursor-pointer"} ${g ? "font-semibold" : ""}`,
                        onMouseDown: N => N.preventDefault(),
                        onClick: N => {
                          w || Ei(i.key, N.shiftKey);
                        },
                        onContextMenu: N => {
                          w || (N.preventDefault(), g || ($t([i.key]), Vt(Qa.findIndex(F => F.key === i.key))), Dn({
                            x: N.clientX,
                            y: N.clientY
                          }));
                        },
                        onDoubleClick: N => {
                          N.stopPropagation(), Cn(i.key);
                        },
                        children: ta === i.key ? l.jsx("input", {
                          autoFocus: !0,
                          value: i.label,
                          onClick: N => N.stopPropagation(),
                          onChange: N => {
                            const F = N.target.value;
                            w && i.groupId && Pt(O => O.map(T => T.id === i.groupId ? {
                              ...T,
                              name: F.replace(/^(?:Sub)*net\s*:\s*/i, "").trimStart()
                            } : T)), We(O => O.map(T => T.key === i.key ? {
                              ...T,
                              label: F
                            } : T));
                          },
                          onBlur: () => Cn(null),
                          onKeyDown: N => {
                            (N.key === "Enter" || N.key === "Escape") && Cn(null);
                          },
                          className: "w-full bg-white border border-blue-200 rounded px-1.5 py-0.5 text-xs outline-none focus:ring-1 focus:ring-blue-300"
                        }) : l.jsx("span", {
                          className: w ? "text-emerald-800 font-semibold" : "",
                          style: {
                            paddingLeft: `${(i.indentLevel ?? 0) * 14}px`,
                            display: "inline-block"
                          },
                          children: i.label
                        })
                      }), l.jsx("td", {
                        className: `px-2 py-2 border-t border-[#BDD7EE] text-right tabular-nums ${w ? "font-semibold text-emerald-800" : ""}`,
                        children: i.count
                      }), l.jsxs("td", {
                        className: `px-2 py-2 border-t border-[#BDD7EE] text-right ${w ? "font-semibold text-emerald-800" : ""}`,
                        children: [i.percent.toFixed(1), "%"]
                      }), l.jsx("td", {
                        className: "px-2 py-2 border-t border-[#BDD7EE]",
                        children: w ? l.jsx("div", {
                          className: "text-center text-[11px] text-emerald-700",
                          children: "-"
                        }) : l.jsx("input", {
                          value: i.factor,
                          onChange: N => We(F => F.map((O, T) => T === f ? {
                            ...O,
                            factor: N.target.value
                          } : O)),
                          className: "w-full border border-gray-200 rounded px-2 py-1 text-xs text-center outline-none focus:ring-1 focus:ring-blue-300",
                          placeholder: i.autoFactor ? i.code : "-"
                        })
                      }), l.jsx("td", {
                        className: "px-2 py-2 border-t border-[#BDD7EE] text-center",
                        children: w ? l.jsx("span", {
                          className: "text-[10px] font-semibold text-emerald-700",
                          children: "NET"
                        }) : l.jsx("span", {
                          className: `inline-flex h-4 w-4 rounded-full border ${g ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"}`
                        })
                      })]
                    }, i.key);
                  })]
                })]
              })
            }), l.jsxs("div", {
              className: "w-[220px] rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3",
              children: [l.jsxs("div", {
                children: [l.jsx("div", {
                  className: "text-xs font-semibold text-gray-700",
                  children: "Calculation"
                }), l.jsx("p", {
                  className: "mt-1 text-[11px] text-gray-500",
                  children: "ใส่ค่า factor ตาม code เพื่อให้เวลานำตัวแปรนี้ไปไว้ที่ SIDE แบบข้อเดี่ยว ระบบเพิ่มแถว Mean ให้ในตาราง"
                })]
              }), l.jsxs("div", {
                children: [l.jsx("div", {
                  className: "text-xs font-semibold text-gray-700",
                  children: "Display"
                }), l.jsx("p", {
                  className: "mt-1 text-[11px] text-gray-500",
                  children: "ดับเบิ้ลคลิกที่ตัวแปรใน VariableFolders เพื่อกลับมาแก้ order และ factor ได้ทุกเมื่อ"
                })]
              }), l.jsx("div", {
                className: "text-[11px] text-gray-500",
                children: "Tip: ถ้าไม่ใส่ factor ระบบจะยังใช้ลำดับ code ใหม่ได้ แต่จะไม่สร้าง Mean"
              }), l.jsxs("div", {
                className: "pt-2",
                children: [ut.length > 0 && l.jsxs("div", {
                  className: "mb-3",
                  children: [l.jsx("div", {
                    className: "text-xs font-semibold text-gray-700 mb-2",
                    children: "Net Groups"
                  }), l.jsx("div", {
                    className: "space-y-2",
                    children: ut.map(i => l.jsxs("div", {
                      className: "rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5",
                      children: [l.jsxs("div", {
                        className: "flex items-center justify-between gap-2",
                        children: [l.jsxs("span", {
                          className: "text-[11px] font-semibold text-emerald-800",
                          children: [qc(wo(i, ut)), i.name]
                        }), l.jsx("button", {
                          onClick: () => la(i.id),
                          className: "text-[10px] text-emerald-700 hover:text-red-600",
                          children: "Remove"
                        })]
                      }), l.jsx("div", {
                        className: "mt-1 text-[10px] text-emerald-700",
                        children: i.members.join(", ")
                      })]
                    }, i.id))
                  })]
                }), Pn(Se) && l.jsxs("div", {
                  className: "mb-3",
                  children: [l.jsx("div", {
                    className: "text-xs font-semibold text-gray-700 mb-2",
                    children: "Statistics"
                  }), l.jsx("div", {
                    className: "grid grid-cols-2 gap-2 text-[11px] text-gray-600",
                    children: ["mean", "min", "max", "stddev"].map(i => l.jsxs("label", {
                      className: "flex items-center gap-1.5 cursor-pointer",
                      children: [l.jsx("input", {
                        type: "checkbox",
                        checked: _n.includes(i),
                        onChange: f => {
                          Bn(g => f.target.checked ? [...new Set([...g, i])] : g.filter(w => w !== i));
                        },
                        className: "accent-[#1F4E78]"
                      }), l.jsx("span", {
                        children: i === "stddev" ? "StdDev" : i[0].toUpperCase() + i.slice(1)
                      })]
                    }, i))
                  })]
                }), l.jsx("div", {
                  className: "text-xs font-semibold text-gray-700 mb-2",
                  children: "Order Controls"
                }), l.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [l.jsx("button", {
                    onClick: () => We(i => mo(Fp(i.filter(f => f.rowKind !== "net"), rt, -1), ut)),
                    disabled: rt.length === 0 || ps === 0,
                    className: "inline-flex items-center justify-center rounded-2xl bg-emerald-600 text-white p-2 shadow-sm hover:bg-emerald-500 disabled:opacity-30",
                    title: "Move selected up",
                    children: l.jsx(Vg, {
                      className: "w-4 h-4"
                    })
                  }), l.jsx("button", {
                    onClick: () => We(i => mo(Fp(i.filter(f => f.rowKind !== "net"), rt, 1), ut)),
                    disabled: rt.length === 0 || zi === Qa.length - 1,
                    className: "inline-flex items-center justify-center rounded-2xl bg-emerald-600 text-white p-2 shadow-sm hover:bg-emerald-500 disabled:opacity-30",
                    title: "Move selected down",
                    children: l.jsx(Ig, {
                      className: "w-4 h-4"
                    })
                  })]
                })]
              })]
            })]
          }), l.jsxs("div", {
            className: "flex items-center justify-end gap-2",
            children: [l.jsx("button", {
              onClick: () => Ce(null),
              className: "px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50",
              children: "Cancel"
            }), l.jsx("button", {
              onClick: () => ia(Se, ze),
              className: "px-3 py-1.5 rounded-lg bg-[#1F4E78] text-white text-sm font-semibold hover:bg-[#173b5c]",
              children: "Save Variable"
            })]
          })]
        }), $n && l.jsxs("div", {
          className: "fixed z-[60] min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-xl",
          style: {
            left: $n.x,
            top: $n.y
          },
          onClick: i => i.stopPropagation(),
          children: [l.jsx("button", {
            onClick: $a,
            disabled: rt.length === 0,
            className: "block w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-emerald-50 disabled:opacity-40",
            children: "Group Net"
          }), l.jsx("button", {
            onClick: sa,
            disabled: !Ai,
            className: "block w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-red-50 disabled:opacity-40",
            children: "Remove Selected From Net"
          })]
        }), Da && l.jsx("div", {
          className: "fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4",
          children: l.jsxs("div", {
            className: "w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl",
            children: [l.jsxs("div", {
              className: "border-b border-gray-100 px-5 py-4",
              children: [l.jsx("h4", {
                className: "text-base font-bold text-gray-800",
                children: "Create Net Group"
              }), l.jsx("p", {
                className: "mt-1 text-sm text-gray-500",
                children: "Set a name for the selected net group."
              })]
            }), l.jsxs("div", {
              className: "px-5 py-4",
              children: [l.jsx("label", {
                className: "mb-2 block text-sm font-medium text-gray-700",
                children: "Net name"
              }), l.jsx("input", {
                autoFocus: !0,
                value: Re,
                onChange: i => Ke(i.target.value),
                onKeyDown: i => {
                  i.key === "Enter" && Re.trim() && Di(), i.key === "Escape" && (he(!1), Ke("UPC"));
                },
                className: "w-full rounded-xl border border-blue-200 bg-blue-50/30 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
                placeholder: "e.g. UPC"
              })]
            }), l.jsxs("div", {
              className: "flex items-center justify-end gap-2 px-5 py-4",
              children: [l.jsx("button", {
                onClick: () => {
                  he(!1), Ke("UPC");
                },
                className: "rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50",
                children: "Cancel"
              }), l.jsx("button", {
                onClick: Di,
                disabled: !Re.trim(),
                className: "rounded-xl bg-[#1F4E78] px-4 py-2 text-sm font-semibold text-white hover:bg-[#173b5c] disabled:cursor-not-allowed disabled:opacity-40",
                children: "Create Net"
              })]
            })]
          })
        })]
      })
    }), Ln && l.jsx("div", {
      className: "fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 backdrop-blur-sm p-4",
      children: l.jsx("div", {
        className: "w-full max-w-md rounded-3xl border border-blue-100 bg-white shadow-2xl",
        children: l.jsxs("div", {
          className: "flex flex-col items-center px-6 py-8 text-center",
          children: [l.jsxs("div", {
            className: "relative flex h-28 w-28 items-center justify-center",
            children: [l.jsx("div", {
              className: "absolute inset-0 rounded-full border-4 border-blue-100"
            }), l.jsx("div", {
              className: "absolute inset-1 rounded-full border-4 border-transparent border-t-[#1F4E78] border-r-blue-400 animate-spin"
            }), l.jsx(Ml, {
              size: "lg",
              className: "relative"
            })]
          }), l.jsx("h3", {
            className: "mt-5 text-lg font-bold text-gray-800",
            children: "กำลังประมวลผล Batch Export"
          }), l.jsx("p", {
            className: "mt-2 text-sm text-gray-500",
            children: "กรุณารอสักครู่ ระบบกำลังรันทุก setting และ export ไฟล์ให้อัตโนมัติ"
          }), l.jsxs("div", {
            className: "mt-5 rounded-2xl bg-blue-50 px-5 py-3 text-center",
            children: [l.jsx("div", {
              className: "text-xs font-semibold uppercase tracking-[0.18em] text-blue-500",
              children: "Elapsed Time"
            }), l.jsx("div", {
              className: "mt-1 text-2xl font-bold tabular-nums text-[#1F4E78]",
              children: Uh(xi)
            })]
          })]
        })
      })
    }), Ir && !Ln && l.jsx("div", {
      className: "fixed inset-0 z-[95] flex items-center justify-center bg-black/45 p-4",
      children: l.jsxs("div", {
        className: "w-full max-w-md rounded-3xl border border-gray-200 bg-white shadow-2xl",
        children: [l.jsxs("div", {
          className: "border-b border-gray-100 px-6 py-5",
          children: [l.jsx("h3", {
            className: "text-lg font-bold text-gray-800",
            children: "Batch Export Complete"
          }), l.jsx("p", {
            className: "mt-1 text-sm text-gray-500",
            children: "สรุปผลการ export ของชุดไฟล์ settings รอบล่าสุด"
          })]
        }), l.jsxs("div", {
          className: "space-y-4 px-6 py-5",
          children: [l.jsxs("div", {
            className: "grid grid-cols-2 gap-3",
            children: [l.jsxs("div", {
              className: "rounded-2xl bg-emerald-50 px-4 py-3",
              children: [l.jsx("div", {
                className: "text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600",
                children: "Success"
              }), l.jsx("div", {
                className: "mt-1 text-2xl font-bold text-emerald-700",
                children: Ir.successCount
              }), l.jsx("div", {
                className: "text-xs text-emerald-700/80",
                children: "files exported"
              })]
            }), l.jsxs("div", {
              className: "rounded-2xl bg-blue-50 px-4 py-3",
              children: [l.jsx("div", {
                className: "text-xs font-semibold uppercase tracking-[0.16em] text-blue-600",
                children: "Time Used"
              }), l.jsx("div", {
                className: "mt-1 text-2xl font-bold text-[#1F4E78]",
                children: $h(Ir.elapsedMs)
              }), l.jsx("div", {
                className: "text-xs text-blue-700/80",
                children: "total runtime"
              })]
            })]
          }), Ir.skippedCount > 0 && l.jsxs("div", {
            className: "rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800",
            children: ["มีไฟล์ถูกข้าม ", Ir.skippedCount, " ไฟล์ กรุณาดูรายละเอียดในแถบแจ้งเตือนด้านบน"]
          })]
        }), l.jsx("div", {
          className: "flex justify-end px-6 py-5",
          children: l.jsx("button", {
            onClick: No,
            className: "rounded-xl bg-[#1F4E78] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#173b5c]",
            children: "OK"
          })
        })]
      })
    })]
  });
}
Em.createRoot(document.getElementById("root")).render(l.jsx(M.StrictMode, {
  children: l.jsx(ux, {})
}));
export { ng as F, Yc as _, Lr as f, zh as g };
