const constants = require('./constants');
const utils = require('./utils');

class FrameSet {
  constructor (frange) {
    if(Array.isArray(frange)) {
      this._items = frange.sort();
      this._order = frange.sort();
      this._frange = FrameSet.framesToFrameRange(this._order, true);
      return
    }

    for(var key in constants.PAD_MAP) {
      frange = frange.replace(key, "");
    }
    this._frange = frange;

    var items = new Set();
    var order = [];

    var maxSize = constants.MAX_FRAME_SIZE;

    var frangeSplit = this._frange.split(",");

    for(var i = 0; i < frangeSplit.length; i++) {
      if(!frangeSplit[i]) {
        continue;
      }

      var range = this._parse_frange_part(frangeSplit[i]);
      var start = range.start;
      var end = range.end;
      var modifier = range.modifier;
      var chunk = range.chunk;

      if(modifier == "x") {
        var allFrames = utils.xfrange(start, end, chunk, maxSize);
        var frames = [];
        for(var f = 0; f < allFrames.length; f++) {
          if(!items.has(allFrames[f])) {
            frames.push(allFrames[f]);
          }
        }
        this._maxSizeCheck(frames.length + items.size);
        order = order.concat(frames);
        for(var f = 0; f < frames.length; f++) {
          items.add(frames[f]);
        }
      } else if(modifier == ":") {
        for(var stagger = chunk; stagger > 0; stagger--) {
          var allFrames = utils.xfrange(start, end, stagger, maxSize);
          var frames = [];
          for(var f = 0; f < allFrames.length; f++) {
            if(!items.has(allFrames[f])) {
              frames.push(allFrames[f]);
            }
          }
          this._maxSizeCheck(frames.length + items.size);
          order = order.concat(frames);
          for(var f = 0; f < frames.length; f++) {
            items.add(frames[f]);
          }
        }
      } else if(modifier == "y") {
        var notGood = utils.xfrange(start, end, chunk, maxSize);
        var notGoodSet = new Set(notGood);
        var allFrames = utils.xfrange(start, end , 1, maxSize);
        var goodFrames = [];
        for(var f = 0; f < allFrames.length; f++) {
          if(!notGoodSet.has(allFrames[f])) {
            goodFrames.push(allFrames[f]);
          }
        }
        var frames = [];
        for(var f = 0; f < goodFrames.length; f++) {
          if(!items.has(goodFrames[f])) {
            frames.push(goodFrames[f]);
          }
        }
        this._maxSizeCheck(frames.length + items.size);
        order = order.concat(frames);
        for(var f = 0; f < frames.length; f++) {
          items.add(frames[f]);
        }
      } else {
        var allFrames = xfrange(start, end, start < and ? 1 : -1, maxSize);
        var frames = [];
        for(var f = 0; f < allFrames.length; f++) {
          if(!items.has(allFrames[f])) {
            frames.push(allFrames[f]);
          }
        }
        this._maxSizeCheck(frames.length + items.size);
        order = order.concat(frames);
        for(var f = 0; f < frames.length; f++) {
          items.add(frames[f]);
        }
      }
    }

    this._items = items;
    this.order = order;
  }

  is_null() {
    return !(this._frange && this._items && this._order);
  }

  get frange() { return this._frange }
  get items() { return this._items }
  get order() { return this._order }

  index(frame) {
    return this._order.indexOf(frame);
  }

  frame(index) {
    return this._order[index];
  }

  hasFrame(frame) {
    return this.items.has(frame);
  }

  start() {
    return this._order[0];
  }

  end() {
    return this.order[this._order.length-1];
  }

  _maxSizeCheck(n) {
    if(n > constants.MAX_FRAME_SIZE) {
      throw `Frame size ${n} > ${constants.MAX_FRAME_SIZE} (MAX_FRAME_SIZE)`;
    }
  }

  _parse_frange_part(frange) {
    var match = frange.match(constants.FRANGE_PATTERN);
    if(!match) {
      throw `Could not parse "${frange}": did not match ${constants.FRANGE_PATTERN}`;
    }
    var start = parseInt(match[1]);
    var end = match[2];
    end = end == undefined ? start : parseInt(end);
    var modifier = match[3];
    var chunk = match[4];

    if(end > start && chunk != undefined && chunk < 0) {
      throw `Could not parse "${frange}: chunk can not be negative`;
    }

    chunk = chunk == undefined ? 1 : Math.abs(chunk);
    if(chunk == 0) {
      throw `Could not parse "${frange}": chunk cannot be 0`;
    }

    return {
      start: start,
      end: end,
      modifier: modifier,
      chunk: chunk
    }
  }

  static _buildFrangePart(start, stop, stride, zfill=0) {
    if(stop == undefined) {
      return '';
    }
    var padStart = utils.pad(start, zfill);
    var padStop = utils.pad(stop, zfill);
    if(stride == undefined || start == stop) {
      return `${padStart}`;
    } else if(Math.abs(stride) == 1) {
      return `${padStart}-${padStop}`;
    } else {
      return `${padStart}-${padStop}x${stride}`;
    }
  }

  static framesToFrameRanges(frames, zfill=0) {
    var _build = FrameSet._buildFrangePart;
    var currStart, currStride, currFrame, lastFrame;
    var currCount = 0;

    var ret = []

    for(var i = 0; i < frames.length; i++) {
      currFrame = frames[i];
      if(currStart == undefined) {
        currStart = currFrame;
        lastFrame = currFrame;
        currCount += 1;
        continue;
      }
      if(currStride == undefined) {
        currStride = Math.abs(currFrame-currStart);
      }
      var newStride = Math.abs(currFrame-lastFrame);
      if(currStride == newStride) {
        lastFrame = currFrame;
        currCount += 1;
      } else if(currCount == 2 && currStride !=1) {
        ret.push(_build(currStart, currStart, undefined, zfill));
        currStart = lastFrame;
        currStride = newStride;
        lastFrame = currFrame;
      } else {
        ret.push(_build(currStart, lastFrame, currStride, zfill));
        currStride = undefined;
        currStart = currFrame;
        lastFrame = currFrame;
        currCount = 1;
      }
    }
    if(currCount == 2 && currStride != 1) {
      ret.push(_build(currStart, currStart, undefined, zfill));
      ret.push(_build(currFrame, currFrame, undefined, zfill));
    } else {
      ret.push(_build(currStart, currFrame, currStride, zfill));
    }

    return ret;
  }

  static framesToFrameRange(frames, sort=true, zfill=0, compress=false) {
    if(compress){
      frames = new Set(array);
    }
    frames = Array.from(frames);
    if(!frames) {
      return '';
    }
    if(frames.length == 1) {
      return utils.pad(frames[0], zfill);
    }
    if(sort) {
      for(var i = 0; i < frames.length; i++) {
        frames[i] = parseInt(frames[i]);
      }
      frames = frames.sort(function(a,b) { return a - b });
    }
    var ret = FrameSet.framesToFrameRanges(frames, zfill).join(",");
    return ret;
  }
}

module.exports = FrameSet;
