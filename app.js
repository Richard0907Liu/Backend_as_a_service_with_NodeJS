var createError = require('http-errors');
var express = require('express');  // to connect the Express Server
var path = require('path');
var cookieParser = require('cookie-parser'); // can use cookie
/**Morgan doing this work for you, it is printing out, 
 * tracing this information */
var logger = require('morgan'); 
var session = require('express-session');
// This takes the session as its parameters. This session referring to 'cookie-parser' that we've just imported on here
var FileStore = require('session-file-store')(session); 
var passport = require('passport');
var authenticate = require('./authenticate');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

// connect to mongodb server and the collection Dishes
const mongoose = require('mongoose');

const Dishes = require('./models/dishes');

const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url,  { useNewUrlParser: true });
connect.then((db) => {
  console.log('Connected correctly to server');
}, (err) => { console.log(err); });
////  

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
/** The String just a key that can be used by our cookie-parser in order to encrypt the information 
 * and sign the cookie that is sent from the server to the client */
//app.use(cookieParser('12345-67890-09876-54321')); // signed cookie

app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));

// About passport
/** So, passport.authenitcate('local') add "req.user" and then, the passport session that we have done here will 
 * automatically serialize that user information and then store it in the session. */
app.use(passport.initialize());
app.use(passport.session());
////
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Add an authentication badge ///
/**adding a function called auth, which I am going to implement right now 
 *  what we are specifying is the default, the client can access any of these, 
 * either their static resources in the public folder, or any of the resources, 
 * dishes, promotions, or leaders, or even users as we will see later on */
function auth(req, res, next) { // request, response and next objects
  console.log(req.user);

  // if the incoming request does not include the user field in the signed cookies, including username or password
  if(!req.user){ // If the session.user doesn't exist
      var err = new Error('You are not authenticated!');
      err.status = 403; // 401 means you are unauthorized access.
      next(err);
  }
  else{ 
      next(); // So which means that you will allow the request to pass through.
  }
}


app.use(auth) // auth will take in three parameters
//this call here app.use(express.static) is what enables us to serve static data 
//from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// move app.use('/') and app.use('/users') up before the authentication step 
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);


// Those two are additional error handlers
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
