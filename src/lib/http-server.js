'use strict';
//TO-DO: Implement New Http Library that accepts the options

var fs = require('fs');


function HttpServer(options) {
  options = options || {};
  if (options.root) {
    this.root = options.root;
  } else {
    try{
      fs.lstatSync('./public');
      this.root = './public';
    }catch(err){
      this.root = './';
    }
  }
  this.headers = options.headers || {};

  this.cache = options.cache == undefined ? 3600 : options.cache;
  this.showDir = options.showDir !== 'false';
  this.autoIndex = options.autoIndex !== 'false';
  this.showDotfiles = options.showDotFiles;
  this.gzip = options.gzip === true;
  this.contentType = options.contentType || 'application/octet-stream';
  if (options.ext) {
    this.ext = options.ext === true
      ? 'html'
      : options.ext;
  }  
}

HttpServer.prototype.listen = function () {
  console.log('Im listening')
};

HttpServer.prototype.close = function () {
  console.log('Im closing!');
};


exports.createServer = function (options) {
  return new HttpServer(options);
};