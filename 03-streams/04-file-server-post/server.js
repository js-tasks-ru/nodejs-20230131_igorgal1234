const url = require("url");
const http = require("http");
const path = require("path");
const fs = require("fs");

const server = new http.Server();

const LimitSizeStream = require("./LimitSizeStream");

server.on("request", (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, "files", pathname);

  switch (req.method) {
    case "POST":
      if (pathname.includes("/")) {
        endResponse(400, "Nested folders are not supported");
      } else {
        const stream = fs.createWriteStream(filepath, { flags: "wx" });
        const limitSizeStream = new LimitSizeStream({ limit: 1e6 });

        req.on("aborted", () => {
          stream.destroy();
          limitSizeStream.destroy();
          removeFile(filepath);
        });

        limitSizeStream.on("error", (err) => {
          if (err.code === "LIMIT_EXCEEDED") {
            endResponse(413, "File size is too big. Max size is 1MB");
          } else {
            endResponse(500, "Something went wrong");
          }
          stream.destroy();
          removeFile(filepath);
        });

        stream.on("error", (err) => {
          if (err.code === "EEXIST") {
            endResponse(409, "File already exists");
          } else {
            endResponse(500, "Something went wrong");
          }
        });

        stream.on("finish", () => {
          endResponse(201, "Ok");
        });

        req.pipe(limitSizeStream).pipe(stream);
      }

      break;

    default:
      endResponse(501, "Not implemented");
  }

  function endResponse(statusCode, message) {
    res.statusCode = statusCode;
    res.end(message);
  }

  function removeFile(filepath) {
    fs.unlink(filepath, (err) => {
      if (err) {
        endResponse(500, "Something went wrong");
      }
    });
  }
});

module.exports = server;
