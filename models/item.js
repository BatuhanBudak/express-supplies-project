const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String, required: true, maxlength: 100 },
  price: {
    type: Number,
    required: true,
    min: [0, "Item's price can't be lower than 0. This isn't a charity."],
  },
  number_in_stock: {
    type: Number,
    required: true,
    min: [0, "Stock number can't be lower than 0"],
  },
  category: [{ type: Schema.Types.ObjectId, ref: "Category", required: true }],
});

ItemSchema.virtual("url").get(function () {
  return `/catalog/item/${this._id}`;
});

module.exports = mongoose.model("Item", ItemSchema);
