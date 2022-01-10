const express = require("express");
const bodyParser = require("body-parser");
const loDash = require('lodash');

// MongooseDB Connection Code
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://admin-pratik:test123@cluster0.drwzp.mongodb.net/todolistDB");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const route ="http://localhost:3000/"

const itemsSchema = new mongoose.Schema({
  name : String
});

const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name : "Welcome to your todolist!!"
});
const item2 = new Item({
  name : "Hit the + button to add new item."
});
const item3 = new Item({
  name : "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name : String,
  item : [itemsSchema]
});

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, result){
    if(result.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully added Default Items");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: result});
    }
  });  
  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name : itemName
  });
  if(listName === "today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name : listName}, function(err, foundList){
      foundList.item.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
  
});

app.post("/delete", function(req, res){
  const checkboxId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "today"){
    Item.deleteOne({_id : checkboxId}, function(err){
      if(!err){
        console.log("Succesfully deleted the checked item1");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name : listName},{$pull : {item : {_id :checkboxId}}}, function(err, foundList){
      res.redirect("/"+listName);
    });
  }
});

app.get("/:customListName", function(req,res){
  const customListName = loDash.capitalize(req.params.customListName);
  List.findOne({name : customListName},function(err, foundList){
    if(!err){
      if(!foundList){
        console.log(defaultItems);
        const list = new List({
          name : customListName,
          item : defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    }
    else{
      res.render("list",{listTitle : foundList.name, newListItems : foundList.item});
    }
  }
  
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port ==+ null || port === ""){
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
