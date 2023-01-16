#! /usr/bin/env node

console.log(
  "This script populates some data to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/?retryWrites=true&w=majority"
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const async = require("async");
const Category = require("./models/category");
const Item = require("./models/item");

const mongoose = require("mongoose");
const mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const categories = [];

function categoryCreate(name, description, cb) {
  const category = new Category({ name, description });

  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Category" + category);
    categories.push(category);
    cb(null, category);
  });
}

function itemCreate(name, description, price, number_in_stock, category, cb) {
  const item = new Item({
    name,
    description,
    price,
    number_in_stock,
    category,
  });
  item.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Item" + item);
    cb(null, item);
  });
}

function createCategories(cb) {
  async.series(
    [
      function (callback) {
        categoryCreate("School", "School items", callback);
      },
      function (callback) {
        categoryCreate("Office", "Office Items", callback);
      },
      function (callback) {
        categoryCreate("General", "General Items", callback);
      },
      function (callback) {
        categoryCreate("Organization", "Organization Items", callback);
      },
      function (callback) {
        categoryCreate("Writing", "Writing Items", callback);
      },
    ],
    // optional callback
    cb
  );
}

function createItems(cb) {
  async.parallel(
    [
      function (callback) {
        itemCreate(
          "Envelopes",
          "Basic envelopes for your mailing needs",
          8.05,
          10,
          [categories[1], categories[2]],
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Notepad",
          "Top quality notepads for taking notes",
          20.95,
          20,
          [categories[0], categories[2]],
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Printer paper",
          "Suitable for all printers",
          37.55,
          87,
          [categories[3], categories[4]],
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Backpack",
          "Created from reusable materials this the backpack recommended by Greta herself!",
          83.28,
          5,
          [categories[0], categories[2]],
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Pens",
          "Basic pens for taking notes",
          20.95,
          200,
          [categories[2], categories[3]],
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Laptop",
          "This product is designed for your gaming needs",
          300,
          10,
          [categories[3], categories[4]],
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

async.series(
  [createCategories, createItems],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
