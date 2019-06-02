var createError = require('http-errors');
var express = require('express');  // to connect the Express Server
var path = require('path');
var cookieParser = require('cookie-parser');
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
app.use(cookieParser());
// Add an authentication badge ///
/**adding a function called auth, which I am going to implement right now 
 *  what we are specifying is the default, the client can access any of these, 
 * either their static resources in the public folder, or any of the resources, 
 * dishes, promotions, or leaders, or even users as we will see later on */
function auth(req, res, next) { // request, response and next objects
  console.log(req.headers); // once add the authorization header, we can see it here

  var authHeader = req.headers.authorization;

  if(!authHeader){ // if the authorization is null
    var err = new Error('You are not authenticated!');

    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401; // 401 means you are unauthorized access.
    return next(err);
  }
  
  // authorization header exists
  /** Going to extract the authorization header. 
   Since the authHeader is a string, I'm going to split that value and 
   this authorization header. 
   The buffer enables you to split the value and then we also give the encoding of 
   the buffer which is Base64 encoding here
   So we will convert that to a buffer by splitting that into two parts, using the 
   space as the splitting part 
   it will split that into an array, the second element of the array[1] is where 
   this base64 encoded string exist. So we could, we are picking up the base64 encoded string 
   from that.
   And then again, split the string one more time because the string itself will contain the 
   username and password separated by a colon
   So notice that I am loading two splits here, one on the space and the second one, using 
   the colon which separates the username and password.*/
   var auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':');

   var username = auth[0];
   var password = auth[1];

   // use defualt the username and password, later on will allow users to create 
   //their own username and password
   if(username === 'admin' && password === 'password') {
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
