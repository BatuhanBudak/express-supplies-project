const Category = require("../models/category");
const Item = require("../models/item");
const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all Categories.
exports.category_list = (req, res, next) => {
  Category.find()
    .sort([["name", "ascending"]])
    .exec(function (err, list_category) {
      if (err) {
        return next(err);
      }
      res.render("category_list", {
        title: "Category List",
        category_list: list_category,
      });
    });
};

// Display detail page for a specific Category.
exports.category_detail = (req, res, next) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.params.id).exec(callback);
      },
      category_items(callback) {
        Item.find({ category: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.category === null) {
        const error = new Error("Category not found");
        error.status = 404;
        return next(error);
      }
      res.render("category_detail", {
        title: "Category Detail",
        category: results.category,
        category_items: results.category_items,
      });
    }
  );
};

// Display Category create form on GET.
exports.category_create_get = (req, res) => {
  res.render("category_form", {
    title: "Create Category",
  });
};

// Handle Category create on POST.
exports.category_create_post = [
  body("name", "Category name is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Category description is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Create Category",
        category,
        errors: errors.array(),
      });
      return;
    } else {
      Category.findOne({ name: req.body.name }).exec((err, found_category) => {
        if (err) {
          return next(err);
        }
        if (found_category) {
          res.redirect(found_category.url);
        } else {
          category.save((err) => {
            if (err) {
              return next(err);
            }
            res.redirect(category.url);
          });
        }
      });
    }
  },
];

// Display Category delete form on GET.
exports.category_delete_get = (req, res, next) => {
  async.parallel(
    {
      items(callback) {
        Item.find({ category: req.params.id }).exec(callback);
      },
      category(callback) {
        Category.findById(req.params.id).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.category === null) {
        res.redirect("/catalog/categories");
      }
      res.render("category_delete", {
        title: "Delete Category",
        category: results.category,
        items: results.items,
      });
    }
  );
};

// Handle Category delete on POST.
exports.category_delete_post = (req, res, next) => {
  async.parallel(
    {
      items(callback) {
        Item.find({ category: req.body.categoryid }).exec(callback);
      },
      category(callback) {
        Category.findById(req.body.categoryid).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.category === null) {
        res.redirect("/catalog/categories");
      }

      if (results.items.length > 0) {
        res.render("category_delete", {
          title: "Delete Category",
          category: results.category,
          items: results.items,
        });
        return;
      }
      Category.findByIdAndRemove(req.body.categoryid, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/catalog/categories");
      });
    }
  );
};

// Display Category update form on GET.
exports.category_update_get = (req, res, next) => {
  Category.findById(req.params.id).exec((err, category) => {
    if (err) {
      return next(err);
    }
    if (category === null) {
      const err = new Error("Category not found");
      err.status = 404;
      return next(err);
    }
    res.render("category_form", {
      title: "Update category",
      category,
    });
  });
};

// Handle Category update on POST.
exports.category_update_post = [
  body("name", "Category name is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Category description is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });
    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Update Category",
        category,
        errors: errors.array(),
      });
      return;
    }
    Category.findByIdAndUpdate(
      req.params.id,
      category,
      {},
      (err, thecategory) => {
        if (err) {
          return next(err);
        }
        res.redirect(thecategory.url);
      }
    );
  },
];
