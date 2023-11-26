module.exports = function mustBeAuthenticated(ctx, next) {
  if (!ctx.user) {
    const error = new Error("Пользователь не залогинен");
    error.status = 401;
    throw error;
  }

  return next();
};
