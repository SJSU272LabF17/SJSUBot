var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');


// Login
router.get('/login', function(req, res){
	if(req.isAuthenticated()){
		res.render('index');
	} else {
		res.render('login');
	}
});

// Bot page / index 
router.get('/index', function(req, res){
	res.render('index');
});

// Register
router.get('/register', function(req, res){
	res.render('register', {layout :'other'});
});

// Register User
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	var student_id = req.body.student_id;
	var courses_completed = req.body.courses_completed;
	var courses_remaining = req.body.courses_remaining;
	var credits = req.body.credits;
	var due_assignments = req.body.due_assignments;
	var due_fees = req.body.due_fees;
	var gpa = req.body.gpa;
	var upcoming_quizes = req.body.upcoming_quizes;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			name: name,	
			email:email,
			password: password,
			student_id : student_id,
			courses_completed : courses_completed,
			courses_remaining : courses_remaining,
			credits : credits,
			due_assignments : due_assignments,
			due_fees : due_fees,
			gpa : gpa,
			upcoming_quizes : upcoming_quizes
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');
		// res.redirect('/users/login');
		res.redirect('/');
	}
});


passport.use(new LocalStrategy(
  function(email, password, done) {
   User.getUserByEmail(email, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login', passport.authenticate('local', {successRedirect:'index', failureRedirect:'/users/login',failureFlash: true}),
	function(req, res) {
		res.redirect('index');
	});


router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});

module.exports = router;