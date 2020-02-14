//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require ("mongoose");
const location = require('countrycitystatejson')
const date = require(__dirname + "/date.js");
const titleGeneration = require(__dirname + "/titleGenerator.js");
const app = express();

import { LoremIpsum } from "lorem-ipsum";
// const LoremIpsum = require("lorem-ipsum").LoremIpsum;

// Run EJS in View Engine
app.set('view engine', 'ejs');

// Setup bodyParser
app.use(bodyParser.urlencoded({
  extended: true
}));

// Set Database Access Port
var conn = mongoose.connect("mongodb://localhost:27017/blogDB", {

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
  Category: String,
  emojiLocation: String,
  date: String
};

// Posts Model
const Post = mongoose.model("Post", postsSchema);
let firstPost = "Create a post";
const day = date.getDate();


const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 200,
    min: 16
  }
});

const loremGeneration = lorem.generateParagraphs(1);

// HOMEPAGE

app.route("/")
.get (function(req, res){

  let countrySelection = location.getCountries();
  let citySelection = location.getCities();

 Post.find({}, function(err, posts) {
   if (posts.length === 0)
   {
     firstPost = "Create your First Post";
     res.render("compose", {
       firstPost: firstPost,
       countrySelection: countrySelection,
       citySelection: citySelection,
       randomTitle: titleGeneration.getTitle().split('_').join(' '),
       lorem: loremGeneration,
       date: date,})
   }
     else {
       let firstPost = "";
       Post.find().sort('-date').limit(1).find(function(err, latestPost) {
         latestPost.forEach(function(featurePost){
       res.render("home", {
         posts: posts,
         countrySelection: countrySelection,
         citySelection: citySelection,
         featurePost: featurePost
       });
     }
  )}
)};
});
});

// About Page
app.route("/about")

.get(function(req, res){
  res.render("about", {});
});

// COMPOSE

app.route("/compose")
.get(function(req,res) {

let countrySelection = location.getCountries();
let citySelection = location.getCities();


  Post.find({}, function (err, posts) {
  res.render("compose",
   {
    posts:posts,
    firstPost: firstPost,
    countrySelection: countrySelection,
    citySelection: citySelection,
    randomTitle: titleGeneration.getTitle(),
    lorem: loremGeneration,
    date: date

        });
      });
    })


.post(function(req, res) {

      function getDate()
      {
          var today = new Date();

          const options = {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "numeric",
            minute: "numeric",
          };

          return today.toLocaleDateString("en-ES", options);;
      }

       const post = new Post ({
       Title: _.capitalize(req.body.title),
       Content: req.body.content,
       Category: req.body.category,
       emojiLocation: req.body.Country,
       date: getDate()
       });

       function myFunc() {
           res.redirect("/");  }
       setTimeout(myFunc, 200);
       post.save(function(err){
       });
     });

app.route("/posts/:newpost")

.get(function(req,res) {

  const requestedTitle = _.lowerCase(req.params.newpost);
  console.log(requestedTitle);

    Post.findOne({Title:requestedTitle}, (err, postFound) => {
    if (postFound)
    {
      console.log("New Post Generated");
      res.render("post", {
        title: postFound.Title,
        content: postFound.Content,
        category: postFound.Category,
        posts: postFound,
        emojiLocation: postFound.emoji,
        date: postFound.date
     });

    } else {
      console.log(err);
      console.log("error creating post page");
    } // END ELSE
      }); // END POSTS FOR EACH LOOP

    }); // END POST FIND

// CONTACT GET
app.get("/contact", function(req,res) {
  Post.find({}, function (err, posts) {
  res.render("contact",
   {posts:posts});
 });
});

app.route("/search")

.get(function(req,res) {
  res.render("search");
})

.post(function(req,res) {
    console.log(req.body.search);
   requestedSearch = req.body.search;
        
})

app.post("/resetDB", function(req, res) {
  mongoose.connect("mongodb://localhost:27017/blogDB", {
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
