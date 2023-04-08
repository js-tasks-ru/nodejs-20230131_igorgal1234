const Product = require("../models/Product");
const mapProduct = require("../mappers/product");

module.exports.productsByQuery = async function productsByQuery(ctx, next) {
  const query = ctx.query.query;

  if (!query) {
    ctx.status = 400;
    ctx.body = "There is no query parameter.";

    return next();
  }

  const products = await Product.find(
    {
      $text: {
        $search: query,
      },
    },
    { score: { $meta: "textScore" } }
  );

  ctx.body = { products: products.map(mapProduct) };
};
