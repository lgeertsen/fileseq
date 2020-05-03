var lenRange = function(start, stop, step=1) {
  return Math.floor((stop - start + step - 1 + 2 * (step < 0)) / step);
}

var xfrange = function(start, stop, step=1, maxSize=1) {
  if(start <= stop) {
    stop += 1;
    step = Math.abs(step);
  } else {
    stop -= 1;
    step = -Math.abs(step);
  }

  if(maxSize >= 0) {
    var size = lenRange(start, stop, step);
    if(size > maxSize) {
      throw `Size ${size} > ${maxSize} (MAX_FRAME_SIZE)`;
    }
  }

  var frames = [];
  for(var i = start; i < stop; i += step) {
    frames.push(i);
  }
  return frames;
}

var pad = function(number, width=0) {
  return parseInt(number).toString().padStart(width);
}

exports.lenRange = lenRange;
exports.xfrange = xfrange;
exports.pad = pad;
