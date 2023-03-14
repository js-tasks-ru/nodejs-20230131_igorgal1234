const stream = require("stream");
const os = require("os");
const { indexOf } = require("lodash");

EOL = os.EOL;
NOT_FOUND_VAL = -1;

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.line = "";
  }

  _transform(chunk, encoding, callback) {
    const chunkString = chunk.toString();
    let startPos = 0;
    let endPos = NOT_FOUND_VAL;

    while ((endPos = chunkString.indexOf(EOL, ++endPos)) != NOT_FOUND_VAL) {
      const lineOutput = this.line + chunkString.slice(startPos, endPos);

      if (lineOutput.length) {
        this.push(lineOutput);
        this.line = "";
      }

      startPos = endPos + EOL.length;
    }

    this.line += chunkString.slice(startPos);

    callback();
  }

  _flush(callback) {
    if (this.line.length) {
      this.push(this.line);
    }

    callback();
  }
}

module.exports = LineSplitStream;
