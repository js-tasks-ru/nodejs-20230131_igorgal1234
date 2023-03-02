const stream = require("stream");
const LimitExceededError = require("./LimitExceededError");

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.limit = options.limit;
    this.bytesTransferred = 0;
  }

  _transform(chunk, encoding, callback) {
    this.bytesTransferred += chunk.byteLength;

    if (this.bytesTransferred > this.limit) {
      callback(new LimitExceededError());
    } else {
      callback(null, chunk);
    }
  }
}

module.exports = LimitSizeStream;
