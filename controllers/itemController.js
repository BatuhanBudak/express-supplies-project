const Item = require("../models/item");
const Category = require("../models/category");
const async = require("async");
const { body, validationResult } = require("express-validator");

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

// Display list of all Items.
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

// Display detail page for a specific Item.
exports.item_detail = (req, res, next) => {
  Item.findById(req.params.id)
    .populate("category")
    .exec(function (err, item) {
      if (err) {
        return next(err);
      }
      if (item === null) {
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      res.render("item_detail", {
        item,
      });
    });
};

// Display Item create form on GET.
exports.item_create_get = (req, res, next) => {
  Category.find({}).exec(function (err, categories) {
    if (err) {
      return next(err);
    }
    res.render("item_form", { title: "Create Item", categories });
  });
};

// Handle Item create on POST.
exports.item_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },

  body("name", "Item name is required").trim().isLength({ min: 1 }).escape(),
  body("description", "Item description is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Item price is required")
    .trim()
    .isDecimal({ decimal_digits: "2" })
    .isFloat({ min: 0.1 })
    .escape(),
  body("number_in_stock", "Stock amount is required")
    .trim()
    .isNumeric()
    .isInt({ gt: 0 })
    .escape(),
  body("category.*").escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
      category: req.body.category,
    });

    if (!errors.isEmpty()) {
      Category.find({}).exec((err, categories) => {
        if (err) {
          return next(err);
        }
        for (const category of categories) {
          if (item.category.includes(category._id)) {
            category.checked = true;
          }
        }
        res.render("item_form", {
          title: "Create Item",
          item,
          categories,
          errors: errors.array(),
        });
      });
      return;
    }
    item.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect(item.url);
    });
  },
];

// Display Item delete form on GET.
exports.item_delete_get = (req, res, next) => {
  Item.findById(req.params.id).exec((err, item) => {
    if (err) {
      return next(err);
    }
    if (item === null) {
      res.redirect("/catalog/items");
    }
    res.render("item_delete", {
      title: "Delete item",
      item,
    });
  });
};

// Handle Item delete on POST.
exports.item_delete_post = (req, res) => {
  Item.findByIdAndRemove(req.body.itemid, (err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/catalog/items");
  });
};

// Display Item update form on GET.
exports.item_update_get = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        Item.findById(req.params.id).populate("category").exec(callback);
      },
      categories(callback) {
        Category.find({}).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.item === null) {
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      for (const category of results.categories) {
        for (const itemCategory of results.item.category) {
          if (category._id.toString() === itemCategory._id.toString()) {
            category.checked = true;
          }
        }
      }
      res.render("item_form", {
        title: "Update Item",
        item: results.item,
        categories: results.categories,
      });
    }
  );
};

// Handle Item update on POST.
exports.item_update_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },
  body("name", "Item name is required").trim().isLength({ min: 1 }).escape(),
  body("description", "Item description is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Item price is required")
    .trim()
    .isDecimal({ decimal_digits: "2" })
    .isFloat({ min: 0.1 })
    .escape(),
  body("number_in_stock", "Stock amount is required")
    .trim()
    .isNumeric()
    .isInt({ gt: 0 })
    .escape(),
  body("category.*").escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
      category:
        typeof req.body.category === "undefined" ? [] : req.body.category,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      Category.find({}).exec((err, categories) => {
        if (err) {
          return next(err);
        }
        for (const category of categories) {
          if (item.category.includes(category._id)) {
            category.checked = "true";
          }
        }
        res.render("item_form", {
          title: "Update Form",
          categories,
          item,
          errors: errors.array(),
        });
      });
      return;
    }
    Item.findByIdAndUpdate(req.params.id, item, {}, (err, theitem) => {
      if (err) {
        return next(err);
      }
      res.redirect(theitem.url);
    });
  },
];
