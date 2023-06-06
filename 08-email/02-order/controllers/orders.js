const Order = require("../models/Order");
const sendMail = require("../libs/sendMail");
const mapOrderConfirmation = require("../mappers/orderConfirmation");
const mapOrder = require("../mappers/order");

module.exports.checkout = async function checkout(ctx, next) {
  const { product, phone, address } = ctx.request.body;
  const user = ctx.user;
  let order;

  try {
    order = await Order.create({ user, product, phone, address });
  } catch (error) {
    if (error.errors) {
      throw error;
    }

    ctx.throw(500, "Ошибка при создании ордера.");
  }

  await sendMail({
    template: "order-confirmation",
    locals: mapOrderConfirmation(order, product),
    to: user.email,
    subject: "Подтвердите ордер",
  });

  ctx.status = 200;
  ctx.body = { order: order.id };
};

module.exports.getOrdersList = async function ordersList(ctx, next) {
  const orderList = await Order.find({ user: ctx.user });

  ctx.status = 200;
  ctx.body = { orders: orderList.map((order) => mapOrder(order)) };
};
