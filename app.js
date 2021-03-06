//jshint esversion:6

require('dotenv').config()
"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require ("mongoose");
const location = require('countrycitystatejson')
const date = require(__dirname + "/date.js");
const titleGeneration = require(__dirname + "/titleGenerator.js");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
var session = require('express-session')
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require('mongoose-findorcreate');
var async = require('async');

const app = express();

import { LoremIpsum } from "lorem-ipsum";

// Run EJS in View Engine
app.set('view engine', 'ejs');

// Setup bodyParser
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "SecretState",
  resave: false,
  saveUninitialized: false
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/register');
    }
}

// Set Database Access Port
var conn = mongoose.connect("mongodb+srv://blogsite:Testing001@cluster0-ybqsl.mongodb.net/BlogDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

// Fixes Third Party Deprecation warning
mongoose.set("useCreateIndex", true);

// =============================================================================
//                         SCHEMAS / MODELS / PLUGINS
// =============================================================================

const postsSchema = new mongoose.Schema ({
  title: String,
  content: String,
  category: String,
  emojiLocation: String,
  date: String,
});

// Posts Model
const Post = mongoose.model("Post", postsSchema);

const userSchema = new mongoose.Schema ({
  email : String,
  password : String,
  googleId: String,
  posts: Array,
});

// Uses PassportLocalMongoose Plugin & findOr Create plugin
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

//--------------------------------------------------------------------------------

// passportLocalMongoose used to create local login strategy
passport.use(User.createStrategy());

// Passport used to serialize & deseralize User
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


//==============================================================================
//                        Google Login Strategy
//                            Passport JS
//==============================================================================


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:4000/auth/google/posts",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log("profile = " + profile);

    console.log(profile);
    console.log("email = " + profile.emails[0].value);

    User.findOrCreate({ googleId: profile.id, username: profile.name.givenName, email:profile.emails[0].value }, function (err, user) {
      return cb(err, user);
    });
  }
));


//==============================================================================
//                            Site Generation
//                        Could be better organised
//==============================================================================


let firstPost = "Create a post";
const day = date.getDate();

// Filler Text Generation
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

//==============================================================================
//                               HOME PAGE
//    Currently console logging user profile even though not from active session
//==============================================================================

app.route("/")
.get (function(req, res){

  let countrySelection = location.getCountries();
  let citySelection = location.getCities();

  console.log(req.user);

// Get Users
User.find({}, function(err, users){
  // If No Users found - render Register Page
  if (users.length === 0) {
    res.render("register", {
      firstPost: firstPost,
      countrySelection: countrySelection,
      citySelection: citySelection,
      randomTitle: titleGeneration.getTitle().split('_').join(' '),
      lorem: loremGeneration,
      date: date
    });

  } else {
    // find posts
      Post.find({}, function(err,posts) {
          // if no posts found - Redirect to new post page
          if (posts.length === 0) {
             firstPost = "Create the First Post!";
             res.redirect("/compose")
          }

          else {
             // Find Featured Post
                Post.findOne().sort('-date').limit(1).find(function(err, featurePost) {
                    res.render("home",
                    {
                    posts: posts,
                    countrySelection: countrySelection,
                    citySelection: citySelection,
                    featurePost: featurePost[0],
                    users: users,
                    username: req.user
                  }
                ) // end render home

                  }) //end post find featured

              } // end else Post.find

            }) // end post.find posts
          } // end else
        }) // end User find route
      }) // end get "/" route


// });
// About Page
app.route("/about")

.get(function(req, res){
  res.render("about", {});
});

// =============================================================================
//                               REGISTER PAGE
// =============================================================================
app.route("/register")

  .get(function(req,res) {
    res.render("register");
  })

  .post(function(req,res) {
    // Middleman from passportLocalMongoose package
    // Register information collection using local package
     User.register({username:req.body.username, email: req.body.email}, req.body.password, function(err,user){
       if (err) {
         console.error(err);
         res.redirect("/register")
       } else {
         passport.authenticate("local")(req,res, function() {
           res.redirect("/");
         });
       }
     });
  });

// =============================================================================
//                                 LOGIN PAGE
// =============================================================================

app.route("/login")

.get(function(req, res){
  res.render("login");
})

// login submit
.post(function(req,res) {

  User.loggedIn()

  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
                                 });


// =============================================================================
//                                COMPOSE PAGE
// =============================================================================
app.route("/compose")
.get(loggedIn,(function(req,res) {
  req.isAuthenticated();
  console.log(req.user);
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
        }))

.post(function(req, res) {

    console.log(req.user);
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
       title: _.capitalize(req.body.title),
       content: req.body.content,
       category: req.body.category,
       emojiLocation: req.body.Country,
       date: getDate()
       });

       User.findById(req.user.id, function(err, foundUser){
         if (err) {
           throw err;
           console.log(err);
         } else {
           if (foundUser) {
             post.save();
             console.log(post._id);
             console.log(foundUser);
             foundUser.posts.push(post._id);
             foundUser.save();
             foundUser.save(function(){
               res.redirect("/");
             });
           }
         }
       });
     });


// =============================================================================
//                              DYNAMIC POST PAGE
// =============================================================================

app.route("/posts/:newpost")

.get(function(req,res) {

  const requestedTitle = _.lowerCase(req.params.newpost);

    Post.findOne({title:requestedTitle}, (err, postFound) => {
    if (postFound)
    {
      res.render("post", {
        title: postFound.title,
        content: postFound.content,
        category: postFound.category,
        posts: postFound,
        emojiLocation: postFound.emoji,
        date: postFound.date
     });

    } else {
      console.error(err);
      console.log("error creating post page");
         }
      });
    });

//==============================================================================
//                              CONTACT PAGE
//==============================================================================

app.get("/contact", function(req,res) {
  Post.find({}, function (err, posts) {
  res.render("contact",
   {posts:posts});
 });
});

//==============================================================================
//                       SEARCH PAGE OR ROUTE HANDLING
//                             *** TODO ***
//==============================================================================
app.route("/search")

.get(function(req,res) {
  res.render("search");
})

.post(function(req,res) {
    console.log(req.body.search);
   requestedSearch = req.body.search;
   Post.find({title:str.includes(req.body.search)})
 });

//==============================================================================
//                        HANDLE GOOGLE AUTHENTICATION
//==============================================================================

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile", 'email'] })
);


app.get("/auth/google/posts", passport.authenticate('google', { failureRedirect: "/failed" }),

   function(req, res) {
     res.redirect("/compose");
 }
);

// Logout
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });


  app.get("/loggedinsuccess", function(req,res) {
    res.render("logged-in");
    function redirect() {
      setTimeout(function(){ res.redirect("/compose") }, 3000);
    }
    redirect();
  })


//==============================================================================
//                         DB RESET FUNCTIONALITY
//                        AUTOMATIC NIGHTLY RESET?
//==============================================================================

app.post("/resetDB", function(req, res) {
    conn.db.dropDatabase();
  });

app.listen(process.env.PORT || 4000, function() {
  console.log("Server started on port 4000");
});
