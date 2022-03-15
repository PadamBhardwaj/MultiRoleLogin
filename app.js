
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { use } = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "My secret.",
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    isAdmin:String
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(function (user, done) {
    done(null, user.id);   
});
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});
const admin=new User({
    username:"admin@grey.com",
    password:process.env.PASSWORD,
    isAdmin:"true"
})
User.count({}, function( err, count){
    if(count===0){
        User.register({username:admin.username},admin.password,function(err,result){
            if(err){
                console.log(err)}
            // }else{console.log(" success")}
        });
        // console.log( "Number of users:", count );
    }
})
app.get("/", function (req, res) {
    res.render("home");
})
app.get("/adminlogin", function (req, res) {
        res.render("adminlogin");
    })
app.get("/login", function (req, res) {
    res.render("login");

})
app.get("/register", function (req, res) {
    if(req.isAuthenticated() && req.user.username==="admin@grey.com"){
        
        res.render("register");
    }
    else{res.sendStatus(403)}
})
app.get("/logout", function (req, res) {

    req.session.destroy(function (e) {
        req.logout();
        res.redirect('/');
    });
});
app.post("/adminlogin", function (req, res) {
        const logincred = {
            username: req.body.username,
            password: req.body.password,
            isAdmin:"true"
        }
        if (logincred.password === admin.password) {
            passport.authenticate("local")(req, res, function () {
    
                res.render("dashboard", { isAdmin: "true" });
            })
        }
        else {
            res.send("Admin not found")
        }
    })
app.post("/register", function (req, res) {
    User.register({ username: req.body.username }, req.body.password, function (err, result) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        }
        else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/login");
            })
        }
    })
});
app.post("/login", function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function (err) {
        if (err) {
            console.log(err);
        }
        else {
            passport.authenticate("local")(req, res, function () {
                res.render("dashboard",{isAdmin:"false"});
            })
        }
    })
});
app.listen(3000, function () {

    console.log("Server Started at port 3000");
});

























































































       

























































































































































