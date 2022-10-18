//jshint esversion:6

const express = require("express");
const monggose = require('mongoose');
// const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://faizal-admin:faizal-admin@todolistdatabase.3gxe6br.mongodb.net/todoListDB", { useNewUrlParser: true });
//  

const itemsSchema = new mongoose.Schema({
  name: {
    type: String
  }
});

const Item = mongoose.model("Item", itemsSchema);

const newitem1 = new Item({
  name: "Welcome! to your todo List"
});
const newitem2 = new Item({
  name: "Hit + to add new items"
});
const newitem3 = new Item({
  name: "<-- hit this to delete an item"
});

const defaultItems = [newitem1, newitem2, newitem3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully inserted entries to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });

    }
  });

});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

});

app.post("/delete", function (req, res) {
  const checkedBoxId = (req.body.checkBox);
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedBoxId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Todo removed.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedBoxId } } }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    })
  }



})

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //create a new list here with entered name
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //show existing list
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }
  });


});


app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server started...");
});
