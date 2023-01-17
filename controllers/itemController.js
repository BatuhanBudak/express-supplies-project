const Item = require("../models/item");
const Category = require("../models/category");
const async = require("async");

exports.index = (req, res) => {
  async.parallel(
    {
      item_count(callback) {
        //Pass and empty object as match condition to find all documents of this collection
        Item.countDocuments({}, callback);
      },
      category_count(callback) {
        Category.countDocuments({}, callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("index", {
        title: "Supplies Store Home",
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all Authors.
exports.item_list = (req, res, next) => {
  Item.find({}, "name description")
    .sort({ name: 1 })
    .populate("category")
    .exec(function (err, list_item) {
      if (err) {
        return next(err);
      }
      res.render("item_list", {
        title: "List of all Items",
        item_list: list_item,
      });
    });
};

// Display detail page for a specific Author.
exports.item_detail = (req, res) => {
  res.send(`NOT IMPLEMENTED: Author detail: ${req.params.id}`);
};

// Display Author create form on GET.
exports.item_create_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Author create GET");
};

// Handle Author create on POST.
exports.item_create_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Author create POST");
};

// Display Author delete form on GET.
exports.item_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Author delete GET");
};

// Handle Author delete on POST.
exports.item_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Author delete POST");
};

// Display Author update form on GET.
exports.item_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Author update GET");
};

// Handle Author update on POST.
exports.item_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Author update POST");
};
