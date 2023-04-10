const Product = require("../models/Product");
const mapProduct = require("../mappers/product");
const mongoose = require("mongoose");

module.exports.productsBySubcategory = async function productsBySubcategory(
  ctx,
  next
) {
  const { subcategory } = ctx.query;
  const findParam = subcategory ? { subcategory } : {};

  ctx.state.products = await Product.find(findParam);

  return next();
};

module.exports.productList = async function productList(ctx, next) {
  const productList = ctx.state.products ? ctx.state.products : [];

  ctx.body = { products: productList.map(mapProduct) };
};

module.exports.productById = async function productById(ctx, next) {
  const productId = ctx.params.id;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    ctx.status = 400;
    ctx.body = "Product ID is not valid.";

    return next();
  }

  const product = await Product.findById(productId);

  if (!product) {
    ctx.status = 404;
    ctx.body = "Product hasn't been found.";

    return next();
  }

  ctx.body = { product: mapProduct(product) };
};
