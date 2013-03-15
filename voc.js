var VOC = {};
(function(exports){
  var handlers = {};
  var add = function(lang, handler) {
    if(typeof lang === "string") handlers[lang] = handler; 
    else lang.forEach(function(l) { handlers[l] = handler; });
  };
  var lastlang="js";
  var process_code = function(src) {
    if(lastlang.substr(-7) === "_noshow") return "";
    if(!(lastlang in handlers)) throw "Unrecognized language " + lastlang;
    return handlers[lastlang](src);
  };
  var run = function(src) {
    var M = (typeof marked !== "undefined" ? marked : require('marked'));
    var data = M.lexer(src).filter(function(y) { return y.type === 'code'; });
    var t = [], s = [];
    data.forEach(function(x) {
      if(x.lang) {
        if(x.lang !== lastlang && s.length > 0) {
          var c = process_code(s.join("\n"));
          if(c) t.push(c);
          s = [];
        }
        lastlang = x.lang; 
      } else x.lang = lastlang;
      s.push(x.text);
    });
    t.push(process_code(s.join("\n")));
    return t.join("\n");
  };
  exports.add = add;
  exports.run = run;
  add(["js","javascript"], function(code) { return code; });
  add(["coffee","coffee-script"], function(code) {
    var CS = (typeof CoffeeScript !== "undefined") ? CoffeeScript : require('coffee-script');
    return CS.compile(code, {bare:true});
  });
})(typeof exports !== "undefined" ? exports : VOC);
