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
        res.statusCode = 400;
        res.end("Nested folders are not supported");
      }

      fs.access(filepath, (err) => {
        if (err === null) {
          res.statusCode = 409;
          res.end("File already exists");
        } else if (err.code === "ENOENT") {
          const stream = fs.createWriteStream(filepath);
          const limitSizeStream = new LimitSizeStream({ limit: 1e6 });

          req.pipe(limitSizeStream).pipe(stream);

          stream.on("error", (err) => {
            res.statusCode = 500;
            res.end(err);
          });

          limitSizeStream.on("error", (err) => {
            res.statusCode = 500;
            fs.unlink(filepath, (err) => {
              if (err) {
                throw Error("Error during file removing.");
              }
            });

            if (err.code === "LIMIT_EXCEEDED") {
              res.statusCode = 413;
              res.end("File size is too big. Max size is 1MB");
            } else {
              res.end("Something went wrong");
            }
          });

          req.on("aborted", () => {
            stream.destroy();
            limitSizeStream.destroy();
          });
        } else {
          res.end("Something went wrong");
        }
      });

      break;

    default:
      res.statusCode = 501;
      res.end("Not implemented");
  }

  req.on("end", () => {
    res.end("Ok");
  });
});

module.exports = server;
