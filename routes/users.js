var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');

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
  // The mongoose plugin provides us with a method called register, on the user schema and model.
  User.register(new User({username: req.body.username}), 
    req.body.password, (err, user)  => {
    if(err) { // username already exists
      res.stateCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      if(req.body.firstname)
        user.firstname = req.body.firstname;
      if(req.body.lastname)
        user.lastname = req.body.lastname;
      user.save((err, user) => {
        if(err){
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
          return ;
        }
              //  going to use passport to authenticate the user again. To ensure that the user registration was successful.
        passport.authenticate('local')(req, res, () => {
          res.stateCode = 200;
          res.setHeader('Content-Type', 'application/json');
          //if you want, we can load the user into this reply message here as a property in the json
          res.json({success: true, status: 'Registration Successful!'});
        });
      });
    }
  });
});

/** So, to logging a user will say "router.post" on the end point/login. 
 * Now, we will still use the Express sessions that we have done earlier to track the user.
*/
// So when the router post comes in on the login endpoint, we will first call 
// the passport authenticate local.
router.post('/login', passport.authenticate('local'), (req, res) => {
  //in the users.js file, I'm going to create a token by giving a payload, which only contains the ID of the user
  var token = authenticate.getToken({_id: req.user._id});
  res.stateCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are Successfully logged in'});
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
