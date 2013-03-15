#!/usr/bin/env node

var data =require('fs').readFileSync(process.argv[2],'utf8') 
console.log(require('./voc').run(data));
