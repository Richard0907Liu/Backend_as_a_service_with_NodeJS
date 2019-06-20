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
var config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
var uploadRouter = require('./routes/uploadRouter');



// connect to mongodb server and the collection Dishes
const mongoose = require('mongoose');

const Dishes = require('./models/dishes');

const url = config.mongoUrl;
const connect = mongoose.connect(url,  { useNewUrlParser: true });
connect.then((db) => {
  console.log('Connected correctly to server');
}, (err) => { console.log(err); });
////  

var app = express();

// Secure traffic only
/*This is port 3000 (http), it'll redirect that request to the secure port , let me 
set up a middleware right after we declare the app.express. */
app.all('*', (req, res, next) => {
  if(req.secure){ // the request  is already a secure req, the secure flag is true
    return next(); // just go to next step
  }
  else{ // regular http
    //Redirecting to the same server.  http://localhost:3000/dishes => 3443
    // status code ad 307, here represents that the target resource resides temporarily under different URL
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
}); // all() means all request no matter what the path in the request is.


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
/** The String just a key that can be used by our cookie-parser in order to encrypt the information 
 * and sign the cookie that is sent from the server to the client */
//app.use(cookieParser('12345-67890-09876-54321')); // signed cookie

/** use token-base authenticate, not use session authenticate
app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));
*/

// About passport
/** So, passport.authenitcate('local') add "req.user" and then, the passport session that we have done here will 
 * automatically serialize that user information and then store it in the session. */
app.use(passport.initialize());
// app.use(passport.session()); not use session
////
app.use('/', indexRouter);
app.use('/users', usersRouter);


//this call here app.use(express.static) is what enables us to serve static data 
//from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// move app.use('/') and app.use('/users') up before the authentication step 
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/imageUpload', uploadRouter);



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
