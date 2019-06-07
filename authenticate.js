var passport = require('passport');
// use this file to store the authentication strategies that we will configure
// so the passport local module exports a strategy that we can use for our application.
var LocalStrategy = require('passport-local').Strategy; 
var User = require('./models/user');

//export this from this file (.local) because this is going to be a node module
/**So the local strategy will need to be supplied with the verify function. 
 * This verify function will be called with the username and password that passport will 
 * extract from our incoming request. The username and password should be supplied 
 * in the body of message in the form of a Json string.
 * Since we are using passport mongoose plugin, the mongoose plugin itself adds this 
 * function called User.authenticate.
*/
exports.local = passport.use(new LocalStrategy(User.authenticate()));
/** Also since we are still using sessions to track users in our application,
 * we need to serialize and deserialize the user.*/
/** These two functions they serialize user and deserialize user are provided on the user 
 * schema and model by the use of the passport-local-mongoose plugin here. */
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/** So once we have completed this update to the authenticate.js file, this file will required 
 * wherever it is needed for us to use in our authentication. */