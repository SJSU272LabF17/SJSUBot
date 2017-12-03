var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Dropbox');
var db = mongoose.connection;
var MongoStore = require('connect-mongo')(session);

var routes = require('./routes/index');
var users = require('./routes/users');

//Init App
var app = express();

//view engine
app.set('views', path.join(__dirname, 'views'));
//app.use(express.static(__dirname + '/views')); // html
//app.use(express.static(__dirname + '/public')); // js, css, images

app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

//bodyparses middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
	secret: 'cmpe273zee',
	saveUninitialized: true,
	resave : true,
	store : new MongoStore({mongooseConnection : mongoose.connection})
}));

//passport init
app.use(passport.initialize());
app.use(passport.session());

//express validator
app.use(expressValidator({
	errorFormatter : function(param, msg, value){
		var namespace = param.split('.'),
			root = namespace.shift(),
			formParam = root;

		while(namespace.length){
			formParam += '[' + namespace.shift() + ']';
		}
		return{
			param : formParam,
			msg : msg,
			value : value
		};
	}

}));

//connect flash
app.use(flash());

//Global variables
app.use(function(req, res, next){
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	//for passport error
	res.locals.error = req.flash('error');
	//to access user from anywhere
	res.locals.user = req.user || null;
	next();
});

app.use('/', routes);
app.use('/users', users);

//set port
app.set('port', (process.env.PORT || 3000));

const server = app.listen(app.get('port'), function(){
		console.log('Server started on port ' + app.get('port'));
});

const APIAI_TOKEN = '0bca16a37999442b809ef9570f7049e6 ';
const APIAI_SESSION_ID = 'ffcb8c2ed46e45e993e859d110b9d228';

const io = require('socket.io')(server);
io.on('connection', function(socket){
  console.log('a user connected');
});

const apiai = require('apiai')(APIAI_TOKEN);

io.on('connection', function(socket) {
  socket.on('chat message', (text) => {
    console.log('Message: ' + text);

    // Get a reply from API.ai

    let apiaiReq = apiai.textRequest(text, {
      sessionId: APIAI_SESSION_ID
    });

    apiaiReq.on('response', (response) => {
      var aiText = response.result.fulfillment.speech;
      var gpa = 3.5;
      var feesDue = '$6431.5';
      var upcomingQuizzes = 'Quiz on Distributed Systems on coming Friday';
      var dueAssignments = 'Assignment on Distributed Systems due coming Friday';
      var creditEarned = '16 credits';
      var creditsRemaining = 24;
      var coursesCompleted = 'Distributed Systems, Enterprise Overview , Database Systems';
      var coursesRemaining = 'Cloud, Operating Systems , Fayad';
      // console.log("response json:" + JSON.stringify(response));
      var intent = response.result.metadata.intentName;
  //    console.log("intent name:" + intent);

      if(intent === 'gpa')
        aiText = response.result.fulfillment.speech + gpa;
      if(intent === 'feesDue')
        aiText = response.result.fulfillment.speech + feesDue;
      if(intent === 'upcomingQuizzes')
        aiText = response.result.fulfillment.speech + upcomingQuizzes;
      if(intent === 'dueAssignments')
        aiText = response.result.fulfillment.speech + dueAssignments;
      if(intent === 'creditEarned')
        aiText = response.result.fulfillment.speech + creditEarned;
      if(intent === 'creditsRemaining')
        aiText = response.result.fulfillment.speech + creditsRemaining;
      if(intent === 'coursesCompleted')
        aiText = response.result.fulfillment.speech + coursesCompleted;
      if(intent === 'coursesRemaining')
        aiText = response.result.fulfillment.speech + coursesRemaining;

    //  console.log("aiText is :" +  aiText);

      console.log('Bot reply: ' + aiText);
      socket.emit('bot reply', aiText);
    });

    apiaiReq.on('error', (error) => {
      console.log(error);
    });

    apiaiReq.end();

  });
});