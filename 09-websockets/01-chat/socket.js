const socketIO = require("socket.io");

const Session = require("./models/Session");
const Message = require("./models/Message");

function socket(server) {
  const io = socketIO(server, {
    // fix mismatch between versions of socket.io-client and socket.io server
    allowEIO3: true,
  });

  io.use(async function (socket, next) {
    const token = socket.handshake.query.token;

    if (!token) next(new Error("anonymous sessions are not allowed"));

    const session = await Session.findOne({ token }).populate("user");

    if (!session) next(new Error("wrong or expired session token"));

    socket.user = session.user;
    next();
  });

  io.on("connection", async function (socket) {
    socket.on("message", async (msg) => {
      try {
        const message = await Message.create({
          user: socket.user.displayName,
          chat: socket.user.id,
          text: msg,
          date: new Date(),
        });
        await message.save();
      } catch (error) {
        console.log(error);
        /* If we had callback in http://localhost:3000/static/js/components/Chat/Chat.js line 46 
          socket.emit('message', msg, cb);
          we would have opportunity to send something in response
        */
      }
    });
  });

  return io;
}

module.exports = socket;
