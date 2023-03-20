const stream = require("stream");
const LimitExceededError = require("./LimitExceededError");

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.limit = options.limit;
    this.bytesTransferred = 0;
  }

  _transform(chunk, encoding, callback) {
    const bufferFromChunk = Buffer.from(chunk);

    this.bytesTransferred += bufferFromChunk.byteLength;

    if (this.bytesTransferred > this.limit) {
      callback(new LimitExceededError());
    } else {
      callback(null, bufferFromChunk);
    }
  }
}

module.exports = LimitSizeStream;
