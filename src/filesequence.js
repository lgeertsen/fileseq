const path = require('path');
const fs = require('fs');
const format = require('string-format');

const constants = require('./constants');
const utils = require('./utils');
const FrameSet = require('./frameset');


module.exports = class FileSequence {
  constructor(sequence) {
    this._frameSet = undefined;

    if(sequence) {
      try {
        var split = constants.SPLIT_PATTERN[Symbol.split](sequence);
        var pathParse = path.parse(split[0]);
        var sep = path.sep;
        if(!pathParse.dir.endsWith(sep)) {
          pathParse.dir += sep;
        }
        this._dir = pathParse.dir;
        this._base = pathParse.base;
        this._frameSet = new FrameSet(split[1])
        this._pad = split[2];
        this._ext = split[3];
      } catch (e) {
        console.log(e);
      }
    }
  }

  format(template="{basename}{frameRange}{padding}{extension}") {
    return format(template, this);
  }

  get dirname() { return this._dir }
  set dirname(dir) {
    var sep = path.sep;
    if(!dir.endsWith(sep)) {
      dir += sep;
    }
    this._dir = dir;
  }

  get basename() { return this._base }
  set basename(base) { this._base = base }

  get padding() { return this._pad }
  set padding(pad) { this._pad = pad } // TODO: complete function with zfill

  get frameSet() { return this._frameSet }
  set frameSet(frameSet) { this._frameSet = frameSet }

  get extension() { return this._ext }
  set extension(ext) {
    if(ext[0] != ".") {
      ext = "." + ext;
    }
    this._ext = ext;
  }

  get frameRange() {
    if(!this._frameSet) {
      return "";
    }
    return this._frameSet.frameRange(this._zfill); // TODO: framerange fct
  }

  set frameRange(frange) { this.frameSet = new FrameSet(frange) }

  static yieldSequencesInList(paths, usingTemplate=false) {
    var seqs = {}

    if(usingTemplate) {

    } else {
      for(var i = 0; i < paths.length; i++) {
        var split = constants.DISK_PATTERN[Symbol.split](paths[i]);
        var dirname = split[1];
        var basename = split[2];
        var frame = split[3];
        var ext = split[4];
        if(!basename && !ext) {
          continue;
        }
        var key = [dirname, basename, ext];
        if(seqs[key]) {
          seqs[key].push(frame);
        } else {
          seqs[key] = [frame];
        }
      }
    }

    var sequences = []

    for(var key in seqs) {
      var keyValues = key.split(",");
      var seq = new FileSequence();
      seq._dir = keyValues[0] ? keyValues[0] : "";
      seq._base = keyValues[1] ? keyValues[1] : "";
      seq._ext = keyValues[2] ? keyValues[2] : "";
      var frames = seqs[key];
      if(frames && !frames.includes(undefined)) {
        seq._frameSet = new FrameSet(frames);
        var pad = frames[0].length;
        for(var i = 1; i < frames.length; i++) {
          if(frames[i].length < pad) {
            pad = frames[i].length;
          }
        }
        seq._pad = FileSequence.getPaddingChars(pad);
      } else {
        seq._frameSet = undefined;
        seq._pad = "";
      }
      sequences.push(seq);
    }
    return sequences;
  }

  static findSequencesOnDisk(pattern, includeHidden=false, strictPadding=false) {
    var _notHidden = function(v) { return !v.startsWith(".") };
    var _matchPattern = undefined;
    var _filterPadding = undefined;
    var _join = path.join;

    var seq = undefined;
    var dirpath = pattern;

    var seqs = [];

    if (fs.existsSync(pattern)) {
      var stats = fs.lstatSync(pattern);
      var isDir = stats.isDirectory();
      if(!isDir) {

      }
      var filelist = fs.readdirSync(dirpath);
      var files = [];
      filelist.forEach(function(file) {
        if (!fs.statSync(_join(dirpath,file)).isDirectory()) {
          files.push(file);
        }
      });

      if(!includeHidden) {
        files = files.filter(_notHidden);
      }

      if(_matchPattern) {
        files = files.filter(_matchPattern);
      }

      if(_filterPadding) {
        files = _filterPadding(files);
      }

      var sep = path.sep;
      if(!dirpath.endsWith(sep)) {
        dirpath += sep;
      }

      for(var i = 0; i < files.length; i++) {
        files[i] = _join(dirpath, files[i]);
      }

      seqs = FileSequence.yieldSequencesInList(files);
      if(_filterPadding && seq) {

      }
    }
    return seqs;
  }

  static getPaddingChars(num) {
    if(num == 0) {
      return "@";
    } else if(num % 4 == 0) {
      return "#".repeat(Math.floor(num / 4));
    } else {
      return "@".repeat(num);
    }
  }
}
