//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require ("mongoose");
const location = require('countrycitystatejson')


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

  let countrySelection = location.getCountries();
  let citySelection = location.getCities();

let firstPost = "";
 Post.find({}, function(err, posts) {
   if (posts.length === 0)
   {
     firstPost = "Create your First Post";
     res.render("compose", {
       firstPost: firstPost,
       countrySelection: countrySelection,
       citySelection: citySelection,})
   }
     else {
       firstPost = "Create a Post";
       res.render("home", {
         posts: posts,
         countrySelection: countrySelection,
         citySelection: citySelection,
       });
     }
  });
});

// About Page
app.get("/about", function(req, res){
  res.render("about", {posts: posts});
});

// COMPOSE GET

app.get("/compose", function(req,res) {

let countrySelection = location.getCountries();
let citySelection = location.getCities();

  Post.find({}, function (err, posts) {
  res.render("compose",
   {posts:posts,
    firstPost: firstPost,
    countrySelection: countrySelection,
  citySelection: citySelection,
});
 });
});

// Dynamic POST
app.get("/posts/:newPost", function(req,res) {

  console.log("new post created");

 Post.find({}, (err, posts) => {
  posts.forEach(function(post){
    const requestedTitle = _.lowerCase(req.params.newPost);
    const storedTitle = _.lowerCase(post.Title);
    console.log(storedTitle);
    console.log(requestedTitle);
    if (storedTitle === requestedTitle) {
      res.render("post", {
        title: post.Title,
        content: post.Content,
       category: post.Category
     });
    } else {
      console.log("error creating post page");
        }
      });
    });
  });

// POST COMPOSE
app.post("/compose", function(req, res) {

   const post = new Post ({
   Title: req.body.title,
   Content: req.body.content,
  Category: req.body.category
   });

   function myFunc() {
       res.redirect("/");  }
   setTimeout(myFunc, 200);
   post.save(function(err){
   });
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

app.post("/resetDB", function(req, res) {
  mongoose.connect('mongodb://localhost:27017/BlogDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false }, function(){
    mongoose.connection.db.dropDatabase();

  });
  function myFunc() {
    res.redirect("/");  }
setTimeout(myFunc, 1000);
});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
