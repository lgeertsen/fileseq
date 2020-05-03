/**********************
constants - General constants of use to fileseq operations.
**********************/

// The max frame count of a FrameSet before a MaxSizeException
// exception is raised
exports.MAX_FRAME_SIZE = 10000000;

exports.PAD_MAP = {"#": 4, "@": 1};

// Regular expression for matching a file sequence string.
// Example: /film/shot/renders/bilbo_bty.1-100#.exr
// Example: /film/shot/renders/bilbo_bty.1-100@.exr
// Example: /film/shot/renders/bilbo_bty.1-100@@@@#.exr
// Example: /film/shot/renders/bilbo_bty.1-100%04d.exr
// Example: /film/shot/renders/bilbo_bty.1-100$F4d.exr
exports.SPLIT_PATTERN = /((?:[-\d][-:,xy\d]*)?)([#@]+|%(?:\d)*d|\$F(?:\d)*)/;

// Regular expression pattern for matching padding against a printf syntax
// padding string E.g. %04d
exports.PRINTF_SYNTAX_PADDING_PATTERN = /^%(\d+)*d$/;

// Regular expression pattern for matching padding against houdini syntax
exports.HOUDINI_SYNTAX_PADDING_PATTERN = /\$F(\d)*$/;

// Regular expression pattern for matching file names on disk.
exports.DISK_PATTERN = /^((?:.*[/\\])?)(.*?)(-?\d+)?((?:\.\w*[a-zA-Z]\w)*(?:\.[^.]+)?)$/;

// Regular expression pattern for matching frame set strings.
// Examples: '1' or '1-100', '1-100x5', '1-100:5', '1-100y5', '1,2', etc.
exports.FRANGE_PATTERN = /^(-?\d+)(?:-(-?\d+)(?:([:xy]{1})(-?\d+))?)?$/;

// Regular expression for padding a frame range.
exports.PAD_PATTERN = /(-?)(\d+)(?:(-)(-?)(\d+)(?:([:xy]{1})(\d+))?)?/;
