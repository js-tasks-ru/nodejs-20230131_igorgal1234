const stream = require("stream");
const LimitExceededError = require("./LimitExceededError");

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.limit = options.limit;
    this.size = 0;
    this.isObjectMode = !!options.writableObjectMode;
  }

  _transform(chunk, encoding, callback) {
    let resultChunk = chunk;

    if (this.isObjectMode) {
      this.size += 1;

      if (typeof chunk === "object") {
        resultChunk = JSON.stringify(chunk);
      }
      resultChunk = String(resultChunk);
    } else {
      this.size += chunk.length;
    }

    if (this.size > this.limit) {
      callback(new LimitExceededError());
    } else {
      callback(null, resultChunk);
    }
  }
}

module.exports = LimitSizeStream;
