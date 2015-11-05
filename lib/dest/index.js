'use strict';

var through2 = require('through2');
var sourcemaps = require('gulp-sourcemaps');
var duplexify = require('duplexify');
var prepareWrite = require('../prepareWrite');
var writeContents = require('./writeContents');

function dest(outFolder, opt) {
  if (!opt) {
    opt = {};
  }

  function saveFile(file, enc, cb) {
    /* jshint validthis: true */
    var stream = this;

    function complete(err, file) {
      cb(err, file);
      if (!err) {
        stream.read();
      }
    }

    prepareWrite(outFolder, file, opt, function(err, writePath) {
      if (err) {
        return complete(err);
      }
      writeContents(writePath, file, complete);
    });
  }

  var saveStream = through2.obj(saveFile);
  if (!opt.sourcemaps) {
    return saveStream;
  }

  var mapStream = sourcemaps.write(opt.sourcemaps.path, opt.sourcemaps);
  var outputStream = duplexify.obj(mapStream, saveStream);
  mapStream.pipe(saveStream);

  return outputStream;
}

module.exports = dest;
