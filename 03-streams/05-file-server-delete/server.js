const url = require("url");
const http = require("http");
const path = require("path");
const fs = require("fs");

const server = new http.Server();

server.on("request", (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, "files", pathname);

  switch (req.method) {
    case "DELETE":
      if (pathname.includes("/")) {
        endResponse(400, "Nested folders are not supported");
      } else {
        fs.unlink(filepath, (err) => {
          if (err && err.code === "ENOENT") {
            endResponse(404, "There is no such file.");
          } else if (err) {
            endResponse(500, "Something went wrong.");
          } else {
            endResponse(200, "File has been deleted successfully");
          }
        });
      }

      break;

    default:
      res.statusCode = 501;
      res.end("Not implemented");
  }

  function endResponse(statusCode, message) {
    res.statusCode = statusCode;
    res.end(message);
  }
});

module.exports = server;
