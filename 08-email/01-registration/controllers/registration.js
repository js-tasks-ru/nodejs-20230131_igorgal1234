const { v4: uuid } = require("uuid");
const User = require("../models/User");
const sendMail = require("../libs/sendMail");
const { useImperativeHandle } = require("react");

module.exports.register = async (ctx, next) => {
  const verificationToken = uuid();
  const { displayName, email, password } = ctx.request.body;

  if (!displayName || !email || !password) {
    ctx.throw(
      400,
      "Пожалуйста убедитесь, что параметры userName, email и password были установлены."
    );
  }

  try {
    const user = await User.create({ displayName, email, verificationToken });
    await user.setPassword(password);
    await user.save();
  } catch (error) {
    if (error.errors) {
      throw error;
    }

    ctx.throw(500, "Ошибка при сохранении пользователя");
  }

  await sendMail({
    template: "confirmation",
    locals: { token: verificationToken },
    to: email,
    subject: "Подтвердите почту",
  });

  ctx.status = 200;
  ctx.body = { status: "ok" };
};

module.exports.confirm = async (ctx, next) => {
  const verificationToken = ctx.request.body.verificationToken;

  if (!verificationToken) {
    ctx.throw(400, "Отсутствует токен подтверждения.");
  }

  const user = await User.findOne({ verificationToken });

  if (!user) {
    ctx.throw(400, "Ссылка подтверждения недействительна или устарела");
  }

  try {
    user.verificationToken = undefined;
    await user.save();
  } catch (error) {
    if (error.errors) {
      throw error;
    }

    ctx.throw(500, "Ошибка при сохранении пользователя");
  }

  const loginToken = await ctx.login(user);

  ctx.status = 200;
  ctx.body = { token: loginToken };
};
