/**
 * Source code that runs INSIDE the sandbox context before any student code:
 * a port of the parts of Node's `util.inspect` that console.log needs (so the
 * output students see matches what they get in Node), a console that records
 * lines, and virtual timers so `setTimeout` finishes instantly and in order.
 *
 * It is a string because it must be defined in the guest context, never shared
 * from the host. `String.raw` keeps backslashes; do not use backticks or
 * dollar-brace in here.
 */
export const GUEST_RUNTIME = String.raw`
(function () {
  var BREAK = 80;
  var COMPACT = 3;
  var MAX_DEPTH = 2;
  var BT = String.fromCharCode(96);
  var objToString = Object.prototype.toString;
  var hasOwn = Object.prototype.hasOwnProperty;
  var getProto = Object.getPrototypeOf;
  var getDesc = Object.getOwnPropertyDescriptor;
  var fnToString = Function.prototype.toString;

  function quote(s) {
    var q = "'";
    if (s.indexOf("'") !== -1) {
      if (s.indexOf('"') === -1) q = '"';
      else if (s.indexOf(BT) === -1 && s.indexOf('$' + '{') === -1) q = BT;
    }
    var out = q;
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      var code = s.charCodeAt(i);
      if (c === q || c === '\\') out += '\\' + c;
      else if (c === '\n') out += '\\n';
      else if (c === '\t') out += '\\t';
      else if (c === '\r') out += '\\r';
      else if (c === '\b') out += '\\b';
      else if (c === '\f') out += '\\f';
      else if (c === '\v') out += '\\v';
      else if (code < 32 || code === 127) out += '\\x' + (code < 16 ? '0' : '') + code.toString(16).toUpperCase();
      else out += c;
    }
    return out + q;
  }

  var IDENT = /^[a-zA-Z_][a-zA-Z_0-9]*$/;
  function keyText(k) {
    if (typeof k === 'symbol') return '[' + String(k) + ']';
    return IDENT.test(k) ? k : quote(k);
  }

  function ctorName(obj) {
    var o = obj;
    while (o) {
      var d = getDesc(o, 'constructor');
      if (d && typeof d.value === 'function' && d.value.name !== '') return d.value.name;
      o = getProto(o);
    }
    return null;
  }

  function isClass(f) {
    try { return /^class[\s{]/.test(fnToString.call(f)); } catch (e) { return false; }
  }

  function fnBase(f) {
    var name = f.name;
    if (isClass(f)) {
      var s = '[class ' + (name || '(anonymous)');
      var sup = getProto(f);
      if (typeof sup === 'function' && sup.name) s += ' extends ' + sup.name;
      return s + ']';
    }
    var kind = 'Function';
    var tag = objToString.call(f).slice(8, -1);
    if (tag === 'AsyncFunction') kind = 'AsyncFunction';
    else if (tag === 'GeneratorFunction') kind = 'GeneratorFunction';
    else if (tag === 'AsyncGeneratorFunction') kind = 'AsyncGeneratorFunction';
    return '[' + kind + (name ? ': ' + name : ' (anonymous)') + ']';
  }

  function fmtNumber(n) { return n === 0 && 1 / n === -Infinity ? '-0' : String(n); }

  function fmtPrimitive(v, top) {
    switch (typeof v) {
      case 'string': return top ? v : quote(v);
      case 'number': return fmtNumber(v);
      case 'bigint': return String(v) + 'n';
      case 'boolean': return String(v);
      case 'undefined': return 'undefined';
      case 'symbol': return String(v);
    }
    return String(v);
  }

  function isBelowBreakLength(output, start, base) {
    var total = output.length + start;
    if (total + output.length > BREAK) return false;
    for (var i = 0; i < output.length; i++) {
      total += output[i].length;
      if (total > BREAK) return false;
    }
    return base === '' || base.indexOf('\n') === -1;
  }

  function groupArrayElements(output, indentLvl, value, hasMore) {
    var totalLength = 0;
    var maxLength = 0;
    var i = 0;
    var outputLength = output.length;
    if (hasMore) outputLength--;
    var sep = 2;
    var dataLen = new Array(outputLength);
    for (; i < outputLength; i++) {
      var len = output[i].length;
      dataLen[i] = len;
      totalLength += len + sep;
      if (maxLength < len) maxLength = len;
    }
    var actualMax = maxLength + sep;
    if (actualMax * 3 + indentLvl < BREAK && (totalLength / actualMax > 5 || maxLength <= 6)) {
      var averageBias = Math.sqrt(actualMax - totalLength / output.length);
      var biasedMax = Math.max(actualMax - 3 - averageBias, 1);
      var columns = Math.min(
        Math.round(Math.sqrt(2.5 * biasedMax * outputLength) / biasedMax),
        Math.floor((BREAK - indentLvl) / actualMax),
        COMPACT * 4,
        15
      );
      if (columns <= 1) return output;
      var tmp = [];
      var maxLineLength = [];
      for (var c = 0; c < columns; c++) {
        var lineLength = 0;
        for (var j = c; j < output.length; j += columns) {
          if (dataLen[j] > lineLength) lineLength = dataLen[j];
        }
        maxLineLength.push(lineLength + sep);
      }
      var padStart = true;
      if (value !== undefined) {
        for (var k = 0; k < output.length; k++) {
          if (typeof value[k] !== 'number' && typeof value[k] !== 'bigint') { padStart = false; break; }
        }
      }
      function pad(str, width) {
        while (str.length < width) str = padStart ? ' ' + str : str + ' ';
        return str;
      }
      for (var r = 0; r < outputLength; r += columns) {
        var max = Math.min(r + columns, outputLength);
        var str = '';
        var m = r;
        for (; m < max - 1; m++) str += pad(output[m] + ', ', maxLineLength[m - r]);
        if (padStart) str += pad(output[m], maxLineLength[m - r] - sep);
        else str += output[m];
        tmp.push(str);
      }
      if (hasMore) tmp.push(output[outputLength]);
      output = tmp;
    }
    return output;
  }

  function reduceToSingleString(output, base, braces, isArrayLike, indentLvl, currentDepth, recurseTimes, value, hasMore) {
    var entries = output.length;
    if (isArrayLike && entries > 6) output = groupArrayElements(output, indentLvl, value, hasMore);
    if (currentDepth - recurseTimes < COMPACT && entries === output.length) {
      var start = output.length + indentLvl + braces[0].length + base.length + 10;
      if (isBelowBreakLength(output, start, base)) {
        var joined = output.join(', ');
        if (joined.indexOf('\n') === -1) {
          return (base ? base + ' ' : '') + braces[0] + ' ' + joined + ' ' + braces[1];
        }
      }
    }
    var ind = '\n' + ' '.repeat(indentLvl);
    return (base ? base + ' ' : '') + braces[0] + ind + '  ' + output.join(',' + ind + '  ') + ind + braces[1];
  }

  function formatValue(v, recurseTimes, ctx, top) {
    if (v === null) return 'null';
    var t = typeof v;
    if (t !== 'object' && t !== 'function') return fmtPrimitive(v, top);
    if (ctx.seen.indexOf(v) !== -1) {
      var idx = ctx.circular.indexOf(v);
      if (idx === -1) { ctx.circular.push(v); idx = ctx.circular.length - 1; }
      return '[Circular *' + (idx + 1) + ']';
    }
    return formatRaw(v, recurseTimes, ctx);
  }

  function formatProp(obj, key, recurseTimes, ctx, arrayStyle) {
    var d = getDesc(obj, key);
    var str;
    if (d && d.value !== undefined || (d && 'value' in d)) {
      ctx.indentationLvl += 2;
      str = formatValue(d.value, recurseTimes, ctx, false);
      ctx.indentationLvl -= 2;
    } else if (d && d.get) {
      str = d.set ? '[Getter/Setter]' : '[Getter]';
    } else if (d && d.set) {
      str = '[Setter]';
    } else {
      str = 'undefined';
    }
    if (arrayStyle) return str;
    return keyText(key) + ': ' + str;
  }

  function ownKeys(obj, skipIndices) {
    var keys = Object.keys(obj);
    if (skipIndices) keys = keys.filter(function (k) { return !/^(0|[1-9][0-9]*)$/.test(k); });
    var syms = Object.getOwnPropertySymbols(obj).filter(function (s) { return getDesc(obj, s).enumerable; });
    return keys.concat(syms);
  }

  function formatRaw(v, recurseTimes, ctx) {
    var tag = objToString.call(v).slice(8, -1);
    var ctor = ctorName(v);
    var base = '';
    var braces = ['{', '}'];
    var keys;
    var isArrayLike = false;
    var formatter = null;
    var prefix = '';
    var hasMore = false;
    var arrayValue;

    if (Array.isArray(v)) {
      keys = ownKeys(v, true);
      prefix = ctor !== 'Array' ? (ctor || '[Array: null prototype]') + '(' + v.length + ') ' : '';
      braces = [prefix + '[', ']'];
      isArrayLike = true;
      arrayValue = v;
      if (v.length === 0 && keys.length === 0) return braces[0] + ']';
      formatter = function () {
        var out = [];
        var holes = 0;
        var limit = Math.min(100, v.length);
        var shown = 0;
        for (var i = 0; i < v.length && shown < limit; i++) {
          if (!hasOwn.call(v, i)) {
            holes++;
            continue;
          }
          if (holes) { out.push('<' + holes + ' empty item' + (holes > 1 ? 's' : '') + '>'); holes = 0; shown++; }
          out.push(formatProp(v, String(i), recurseTimes, ctx, true));
          shown++;
        }
        if (holes) out.push('<' + holes + ' empty item' + (holes > 1 ? 's' : '') + '>');
        if (v.length > 100 && shown >= limit) {
          out.push('... ' + (v.length - 100) + ' more item' + (v.length - 100 > 1 ? 's' : ''));
          hasMore = true;
        }
        return out;
      };
    } else if (tag === 'Map') {
      keys = ownKeys(v, false);
      braces = [(ctor || 'Map') + '(' + v.size + ') {', '}'];
      if (v.size === 0 && keys.length === 0) return braces[0] + '}';
      formatter = function () {
        var out = [];
        v.forEach(function (val, key) {
          ctx.indentationLvl += 2;
          out.push(formatValue(key, recurseTimes, ctx, false) + ' => ' + formatValue(val, recurseTimes, ctx, false));
          ctx.indentationLvl -= 2;
        });
        return out;
      };
    } else if (tag === 'Set') {
      keys = ownKeys(v, false);
      braces = [(ctor || 'Set') + '(' + v.size + ') {', '}'];
      if (v.size === 0 && keys.length === 0) return braces[0] + '}';
      formatter = function () {
        var out = [];
        v.forEach(function (val) {
          ctx.indentationLvl += 2;
          out.push(formatValue(val, recurseTimes, ctx, false));
          ctx.indentationLvl -= 2;
        });
        return out;
      };
    } else {
      keys = ownKeys(v, false);
      if (typeof v === 'function') {
        base = fnBase(v);
        keys = keys.filter(function (k) { return k !== 'prototype'; });
        if (keys.length === 0) return base;
      } else if (tag === 'RegExp') {
        base = RegExp.prototype.toString.call(v);
        if (keys.length === 0) return base;
      } else if (tag === 'Date') {
        base = isNaN(v.getTime()) ? 'Invalid Date' : v.toISOString();
        if (keys.length === 0) return base;
      } else if (tag === 'Error' || v instanceof Error) {
        var stack = typeof v.stack === 'string' && v.stack ? v.stack : '[' + (v.name || 'Error') + ': ' + v.message + ']';
        keys = keys.filter(function (k) { return k !== 'stack' && k !== 'message'; });
        base = stack;
        if (keys.length === 0) return base;
      } else if (tag === 'Promise') {
        braces = ['Promise {', '}'];
        formatter = function () { return ['<pending>']; };
      } else if (tag === 'WeakMap' || tag === 'WeakSet') {
        return tag + ' { <items unknown> }';
      } else if (tag === 'Number' || tag === 'String' || tag === 'Boolean') {
        base = '[' + tag + ': ' + fmtPrimitive(v.valueOf(), false) + ']';
        keys = keys.filter(function (k) { return !(tag === 'String' && /^[0-9]+$/.test(k)); });
        if (keys.length === 0) return base;
      } else {
        var name = ctor;
        var stag = v[Symbol.toStringTag];
        var proto = getProto(v);
        if (proto === null) prefix = '[Object: null prototype] ';
        else if (name && name !== 'Object') prefix = name + ' ';
        else if (name === null) prefix = '[Object: null prototype] ';
        if (typeof stag === 'string' && stag !== '' && stag !== name) prefix += '[' + stag + '] ';
        braces = [prefix + '{', '}'];
        if (keys.length === 0) return prefix + '{}';
      }
    }

    if (recurseTimes > MAX_DEPTH) {
      var nm = ctor || tag || 'Object';
      return Array.isArray(v) ? '[Array]' : '[' + nm + ']';
    }

    recurseTimes += 1;
    ctx.seen.push(v);
    ctx.currentDepth = recurseTimes;
    var output = formatter ? formatter() : [];
    for (var i = 0; i < keys.length; i++) output.push(formatProp(v, keys[i], recurseTimes, ctx, false));
    ctx.seen.pop();

    var res = reduceToSingleString(output, base, braces, isArrayLike, ctx.indentationLvl, ctx.currentDepth, recurseTimes, arrayValue, hasMore);
    var cidx = ctx.circular.indexOf(v);
    if (cidx !== -1) res = '<ref *' + (cidx + 1) + '> ' + res;
    return res;
  }

  function inspect(v, top) {
    return formatValue(v, 0, { seen: [], circular: [], indentationLvl: 0, currentDepth: 0 }, top);
  }

  function format(args) {
    var first = args[0];
    var i = 0;
    var out = '';
    if (typeof first === 'string') {
      if (args.length === 1) return first;
      i = 1;
      var last = 0;
      var s = '';
      for (var p = 0; p < first.length - 1; p++) {
        if (first.charCodeAt(p) === 37) {
          var c = first[p + 1];
          if (i !== args.length || c === '%') {
            var rep = null;
            switch (c) {
              case 's': {
                var a = args[i];
                rep = typeof a === 'string' ? a : (typeof a === 'object' && a !== null) || typeof a === 'function' ? inspect(a, false) : fmtPrimitive(a, true);
                i++;
                break;
              }
              case 'd': { var n = args[i++]; rep = typeof n === 'bigint' ? n + 'n' : typeof n === 'symbol' ? 'NaN' : fmtNumber(Number(n)); break; }
              case 'i': { var n2 = args[i++]; rep = typeof n2 === 'bigint' ? n2 + 'n' : typeof n2 === 'symbol' ? 'NaN' : fmtNumber(parseInt(n2)); break; }
              case 'f': { var n3 = args[i++]; rep = typeof n3 === 'symbol' ? 'NaN' : fmtNumber(parseFloat(n3)); break; }
              case 'j': { try { rep = JSON.stringify(args[i++]); } catch (e) { rep = '[Circular]'; } break; }
              case 'o': case 'O': rep = inspect(args[i++], false); break;
              case 'c': i++; rep = ''; break;
              case '%': s += first.slice(last, p) + '%'; last = p + 2; p++; continue;
              default: continue;
            }
            if (last !== p) s += first.slice(last, p);
            s += rep;
            last = p + 2;
            p++;
          }
        }
      }
      if (last !== 0) {
        if (last < first.length) s += first.slice(last);
        out = s;
      } else {
        out = first;
      }
    }
    for (; i < args.length; i++) {
      var a2 = args[i];
      out += (i === 0 ? '' : ' ') + (typeof a2 === 'string' ? a2 : inspect(a2, false));
    }
    return out;
  }

  globalThis.__out = [];
  globalThis.__outChars = 0;
  globalThis.__outCut = false;
  globalThis.__inspect = function (v) { return inspect(v, false); };
  globalThis.__setupConsole = function (capture) {
    function line() {
      if (!capture) return;
      var text;
      try { text = format(Array.prototype.slice.call(arguments)); } catch (e) { text = '[could not print this value]'; }
      if (__out.length >= 200 || __outChars > 20000) { __outCut = true; return; }
      if (text.length > 600) text = text.slice(0, 600) + '…';
      __outChars += text.length;
      __out.push(text);
    }
    globalThis.console = { log: line, error: line, warn: line, info: line, debug: line, table: line, group: function () {}, groupEnd: function () {} };
  };

  var timers = [];
  var seq = 0;
  var now = 0;
  globalThis.setTimeout = function (fn, ms) {
    if (typeof fn !== 'function') return 0;
    if (timers.length >= 1000) return 0;
    var id = ++seq;
    timers.push({ id: id, at: now + Math.max(0, Number(ms) || 0), fn: fn, args: Array.prototype.slice.call(arguments, 2) });
    return id;
  };
  globalThis.clearTimeout = function (id) { timers = timers.filter(function (t) { return t.id !== id; }); };
  globalThis.__fire = function () {
    if (timers.length === 0) return false;
    var best = 0;
    for (var i = 1; i < timers.length; i++) {
      if (timers[i].at < timers[best].at || (timers[i].at === timers[best].at && timers[i].id < timers[best].id)) best = i;
    }
    var t = timers.splice(best, 1)[0];
    now = t.at;
    t.fn.apply(undefined, t.args);
    return true;
  };
})();
`;
