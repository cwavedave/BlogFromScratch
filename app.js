//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require ("mongoose");

const app = express();

// Run EJS in View Engine
app.set('view engine', 'ejs');

// Setup bodyParser
app.use(bodyParser.urlencoded({
  extended: true;
}))

// Set Database Access Port
var conn = mongoose.connect("mongodb+srv://cwavedave:icWN4Lk7wYU3w7hU@todo-project1-ev84n.mongodb.net/BlogSite", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

// Posts Schema

const postsSchema = {
  Title: String,
  Name: String
}

// Posts Model
const Post = mongoose.model("Post", postsSchema);


app.get("/", function(req,res) {

});

app.get("/about", function(req,res) {

});

app.get("/compose", function(req,res) {

});

app.post("/compose", function(req,res) {

});

app.get("/contact", function(req,res) {

});

app.get("/post", function(req,res) {

});
