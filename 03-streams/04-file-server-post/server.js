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
        fs.access(filepath, (err) => {
          if (err && err.code === "ENOENT") {
            const stream = fs.createWriteStream(filepath);
            const limitSizeStream = new LimitSizeStream({ limit: 1e6 });

            limitSizeStream.on("error", (err) => {
              if (err.code === "LIMIT_EXCEEDED") {
                endResponse(413, "File size is too big. Max size is 1MB");
              } else {
                endResponse(500, "Something went wrong3");
              }
              stream.destroy();
              removeFile(filepath);
            });

            stream.on("error", () => {
              endResponse(500, "Something went wrong");
            });

            req.on("aborted", () => {
              stream.destroy();
              limitSizeStream.destroy();
              removeFile(filepath);
            });

            req.pipe(limitSizeStream).pipe(stream);
          } else if (err) {
            endResponse(500, "Something went wrong");
          } else {
            endResponse(409, "File already exists");
          }
        });
      }

      break;

    default:
      endResponse(501, "Not implemented");
  }

  req.on("end", () => {
    endResponse(201, "Ok");
  });

  function endResponse(statusCode, message) {
    res.statusCode = statusCode;
    res.end(message);
  }

  function removeFile(filepath) {
    fs.unlink(filepath, (err) => {
      if (err) {
        endResponse(500, "Something went wrong2");
      }
    });
  }
});

module.exports = server;
