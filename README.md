# Very Ornate Code

So [Literate Coffeescript](http://coffeescript.org/#literate) is a cool idea,
but why isn't there a standard JS or compile-to-JS version?  JS Programmers want
some love too!  This is my effort to rectify this inequity.


## How to use this

To use in-browser, include the marked source (and optionally the coffee-script 
source if needed):

```html_noshow
<script src="https://raw.github.com/chjj/marked/master/lib/marked.js"></script>
<script src="http://coffeescript.org/extras/coffee-script.js"></script>
```

This exposes a VOC object.  See the complete example in 
[scriptify.js.md](https://github.com/Niggler/voc/blob/master/scriptify.js.md#complete-example) for a sample. 


The included `voc.njs` (which will install as `voc`) will read JS/coffee:

```js_noshow
#!/usr/bin/env node

var data =require('fs').readFileSync(process.argv[2],'utf8')
console.log(require('./voc').run(data));
```

As described in the code below, there are two exported methods: `add` and `run`.
To add your own language:

1. Define the handler function (accepts code and returns JS)

2. Add the language to the framework

3. Profit!

In the code below, both JS and coffee are added.

The `scriptify.js.md` file in this repo shows how coffee and JS can be mixed.


## The Code

Running `voc` against this code should produce the `voc.js` source.  Try it!

```bash_noshow
diff <(voc README.md) voc.js
```


Header comes first:

```js
var VOC = {};
(function(exports){
```

Handlers will store all of the handlers: 

```
  var handlers = {};
```

The `add` function takes two parameters: a language type and a handler.  If the type is an array, then each string will be a key.  Avoid using the suffix 
`_noshow` as it is used to suppress code blocks.

```
  var add = function(lang, handler) {
    if(typeof lang === "string") handlers[lang] = handler; 
    else lang.forEach(function(l) { handlers[l] = handler; });
  };
```

The default behavior is to "carry" the last language if one is omitted.  As seen
above, the `js` language tag was not applied to the last few code blocks, so the
engine automatically assumes they are the same as the last known language (in 
this case, the `js` from the header block).  The blocks are concatenated until a
block in a different language is found, and only then will it send the entire 
mess through the handler.

```
  var lastlang="js";
  var process_code = function(src) {
    if(lastlang.substr(-7) === "_noshow") return "";
    if(!(lastlang in handlers)) throw "Unrecognized language " + lastlang;
    return handlers[lastlang](src);
  };
```

The `run` function takes one parameter: the source code

```
  var run = function(src) {
```

It will first use [marked](https://npmjs.org/package/marked)'s excellent lexer
to extract the code blocks:

```
    var M = (typeof marked !== "undefined" ? marked : require('marked'));
    var data = M.lexer(src).filter(function(y) { return y.type === 'code'; });
```

Then it will iterate through each code block (`var t` will store the final `js`
code and `var s` will hold the code blocks that should be concatenated).  For
each code block:

If the language is specified, it differs from the last known language, and there
is code to be processed, it will combine and try to process it. Otherwise, push
it onto the list of code blocks in the current language:

```
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
```

Finally, process the last set of code blocks and return the final JS output:

```
    t.push(process_code(s.join("\n")));
    return t.join("\n");
  };
```

Export those functions:

```
  exports.add = add;
  exports.run = run;
```

Add the `js` and `coffee` standard languages:

```
  add(["js","javascript"], function(code) { return code; });
  add(["coffee","coffee-script"], function(code) {
    var CS = (typeof CoffeeScript !== "undefined") ? CoffeeScript : require('coffee-script');
    return CS.compile(code, {bare:true});
  });
```

Standard Footer

```
})(typeof exports !== "undefined" ? exports : VOC);
```

And we are done!
