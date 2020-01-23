//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require ("mongoose");

const app = express();

// Run EJS in View Engine
app.set('view engine', 'ejs');

// Setup bodyParser
app.use(bodyParser.urlencoded({
  extended: true
}));

// Set Database Access Port
var conn = mongoose.connect("mongodb://localhost:27017/BlogDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Posts Schema

const postsSchema = {
  Title: String,
  Content: String,
  Category: String
};

// Posts Model
const Post = mongoose.model("Post", postsSchema);
let firstPost = "Create a post";


// HOMEPAGE GET
app.get("/", function(req, res){

let firstPost = "";
 Post.find({}, function(err, posts) {
   if (posts.length === 0)
   {
     firstPost = "Create your First Post";
     res.render("compose", {firstPost: firstPost})
   }
     else {
       firstPost = "Create a Post";
       res.render("home", {posts: posts});
     }
  });
});

// About Page
app.get("/about", function(req, res){
  res.render("about", {posts: posts});
});

// COMPOSE GET

app.get("/compose", function(req,res) {
  Post.find({}, function (err, posts) {
  res.render("compose",
   {posts:posts,
    firstPost: firstPost});
 });
});

// Dynamic POST
app.get("/posts/:newpost", function(req,res) {

  const requestedTitle = _.lowerCase(req.params.newpost);
  console.log("new post created");
  Post.forEach(function(post) {
    const storedTitle = _.lowerCase(req.body.title);
    if (storedTitle === requestedTitle) {
      res.render("post", {
        title: post.Title,
        content: post.Content,
       category: post.Category
      })
    }

  })
})

// POST COMPOSE
app.post("/compose", function(req, res) {
   const post = new Post ({
   Title: req.body.title,
   Content: req.body.content,
  Category: req.body.category
   });
   console.log(post.Category);
   post.save(function(err){
   res.redirect("/")});
});

// CONTACT GET
app.get("/contact", function(req,res) {
  Post.find({}, function (err, posts) {
  res.render("contact",
   {posts:posts});
 });
});

// POST(SINGLE) GET
app.get("/post", function(req,res) {
  Post.find({}, function (err, posts) {
  res.render("post",
   {posts:posts});
 });
});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
