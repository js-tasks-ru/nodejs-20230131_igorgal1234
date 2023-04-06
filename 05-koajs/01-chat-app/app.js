const path = require("path");
const Koa = require("koa");
const { nanoid } = require("nanoid");
const app = new Koa();

app.use(require("koa-static")(path.join(__dirname, "public")));
app.use(require("koa-bodyparser")());

const Router = require("koa-router");
const router = new Router();

let subscribers = {};

router.get("/subscribe", async (ctx, next) => {
  const id = nanoid();

  subscribers[id] = ctx;

  await new Promise((resolve) => {
    ctx.res.on("close", () => {
      delete subscribers[id];
      resolve();
    });
  });
});

router.post("/publish", async (ctx, next) => {
  const message = ctx.request.body.message;

  if (message?.length > 0) {
    for (let id in subscribers) {
      subscribers[id].status = 200;
      subscribers[id].res.end(message);
    }
  }

  ctx.status = 200;
});

app.use(router.routes());

module.exports = app;
