var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/**we'll support the post operation on a route called signup and as you expect, 
 * this signup route will allow a user to signup on the system, so this will 
 * support the sign up of the user. 
 * 
 * So, to access this, since this users router is mounted on slash users, we would 
 * specify this endpoint as slash users slash signup (/user/signup), and this is 
 * the end point that will be used to sign up new users within the system*/
router.post('/signup', function(req, res, next){
  /**First check to make sure that the user with that username doesn't exist within the system
   * If the user already exists, then obviously you won't allow the new user to sign up with the same username */
  User.findOne({username: req.body.username})  // User from ./module/user.js
  .then((user) => { 
    /** if the user that is returned by this search is not null then that means that 
     * the user with that given username already exists, so you should not allow 
     * a duplicate signup. */
    if(user != null) { // username already exists
      var err = new Error('User ' + req.body.username + ' already exists!');
      err.status = 403; // forbidden operation
      next(err) ;
    }
    else {
      return User.create({
        username: req.body.username,
        password: req.body.password})
    }
  })
  .then((user) => {
    res.stateCode = 200;
    res.setHeader('Content-Type', 'application/json');
    //if you want, we can load the user into this reply message here as a property in the json
    res.json({status: 'Registration Successful', user: user});
  }, (err) => next(err))
  .catch((err) => next(err));
});

/** So, to logging a user will say "router.post" on the end point/login. 
 * Now, we will still use the Express sessions that we have done earlier to track the user.
*/
router.post('/login', (req, res, next) => {
  // If the session.user doesn't exist, that means you have to check the ueser login information
  if(!req.session.user){ 
    var authHeader = req.headers.authorization;

    if(!authHeader){ // if the authHeader is null
      var err = new Error('You are not authenticated!');

      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401; // 401 means you are unauthorized access.
      return next(err);
    }

   
    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');

    var username = auth[0];
    var password = auth[1];

     /** But now, what we're going to do is we're going to search in the database to see 
     * if that particular user exists */
    User.findOne({username: username})
    .then((user) => {  // The object from findOne() passes dwon to the parameter 'user'
      if(user === null) { // if user = null, couldn't find the user 
        var err = new Error('User ' + username + ' does not exist!');
        err.status = 403;
        return next(err);
      }
      else if (user.password !== password){
        var err = new Error('Your password is incorrect!');
        err.status = 403; // forbidden operation
        return next(err);
      }
      else if(user.username === username && user.password === password) {
        req.session.user = 'authenticated';  // used in req.session.user in app.js
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are authenticated! '+ user.username );
      }
    })
    .catch((err) => next(err));
  }
  else{ //If that is already set, then that means that the user is already logged in.
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated!');
  }
});

/** The last method that we will implement is for logging out the user. 
 * You must be wondering why do we do a get on the logout rather than a post which 
 * we did on login? On login, you need to submit the username and password. 
 * 
 * you don't need to supply  any further information because the server already is 
 * tracking you based upon your session ID and inside that session cookie here. 
*/
router.get('/logout', (req, res) => {
  /** the session itself provides this method called destroy and when you 
   * call the destroy method, the session is destroyed and the information 
   * is removed from the server side pertaining to this session. */
  if(req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    //this is a way of redirecting the user to enter their standard page, so for example, the homepage of your application.
    res.redirect('/');
  }
  else{ // req.session doesn't exist, that means yor're not logged in.
    var err = new Error('You are not logged in!');
    err.status = 403 // forbidden operation
    next(err);
  }
});

module.exports = router;
