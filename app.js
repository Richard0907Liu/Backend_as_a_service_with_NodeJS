var createError = require('http-errors');
var express = require('express');  // to connect the Express Server
var path = require('path');
var cookieParser = require('cookie-parser'); // can use cookie
/**Morgan doing this work for you, it is printing out, 
 * tracing this information */
var logger = require('morgan'); 

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
app.use(cookieParser('12345-67890-09876-54321')); // signed cookie

// Add an authentication badge ///
/**adding a function called auth, which I am going to implement right now 
 *  what we are specifying is the default, the client can access any of these, 
 * either their static resources in the public folder, or any of the resources, 
 * dishes, promotions, or leaders, or even users as we will see later on */
function auth(req, res, next) { // request, response and next objects
  console.log(req.signedCookies); // send signed cookies
  // if the incoming request does not include the user field in the signed cookies, including username or password
  if(!req.signedCookies.user){ // If the cookie.user doesn't exist
    var authHeader = req.headers.authorization;

    if(!authHeader){ // if the authorization is null
      var err = new Error('You are not authenticated!');

      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401; // 401 means you are unauthorized access.
      return next(err);
    }

    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');

    var username = auth[0];
    var password = auth[1];

    // If req.signedCookies.use doesn't exist, and then expect the user to authenticate
    // by using the basic authentication.
    /** if the basic authentication is successful, then I will set up the cookie here and 
     * set up the cookie field in the outgoing response message here and this will prompt 
     * the client to set up */
    if(username === 'admin' && password === 'password') {
      //"signed: true." So which means that my cookie-parser will ensure that this cookie will be signed and setup.
      // this will include this particular name (user) into the signed cookie with this particular value (admin).
      res.cookie('user', 'admin', {signed: true}); //that is why abobe use 'req.signedCookies.user'

      /** The next()  means that from the auth their request will passed on the next set of 
       * middleware here and then Express will try to match the specific request to 
       * were specific middleware which will service that request*/ 
      next();
    }
    else{
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401; // 401 means you are unauthorized access.
      return next(err);
    }
  }
  else{  // cookie.user exists, so that means that the signed cooki already exists and  the user property di defined on that
    if(req.signedCookies.user === 'admin') {
      next(); // So which means that you will allow the request to pass through.
    } 
    else{ // This cookie is not valid because it doesn't contain this correct value
      var err = new Error('You are not authenticated!');
      err.status = 401; // 401 means you are unauthorized access.
      return next(err);
    }
  }
}


app.use(auth) // auth will take in three parameters
//this call here app.use(express.static) is what enables us to serve static data 
//from the public folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
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
