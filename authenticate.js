/** The password is not directly stored inside the hashed value of the password 
 * which is hashed using this salt key here, that we see here, is stored in 
 * the record there */
var passport = require('passport');
// use this file to store the authentication strategies that we will configure
// so the passport local module exports a strategy that we can use for our application.
var LocalStrategy = require('passport-local').Strategy; 
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign and verify tokens

var config = require('./config.js');

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


 /**We'll say, exports.getToken, this function when supply with a parameter there which 
  * I will simply call user, which will be a JSON object, this will create the token 
  * and give it for us. 
  * To create the token, we will be using the jsonwebtoken module that we just imported.*/
 exports.getToken = function(user) {
    /** So, here we'll say return JWT.sign, this helps us to create the JSON Web Token and 
     * so inside that it'll allow me to supply the payload and the payload here comes in 
     * as the parameter here called user, and then the second parameter is the secret or 
     * private key which I get from config.secret key, which I have just configured 
     * a little bit earlier */ 
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600}) 
        /**how long the jsonwebtoken will be valid so in this case I say 
         * 3,600 meaning 3,600 seconds or about an hour. 
         * An hour later you will have to renew the jsonwebtoken.*/
 }
  
/** we will also next configure the jsonwebtoken based strategy for our passport application.
let me declare a variable called opts, which is nothing but the options that 
I'm going to specify for my JWT based strategy. */
var opts = {};
//This option specifies how the jsonwebtoken should be extracted from the incoming request message.
// ExtractJwt includes a lot of method.
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// The secret key which I'm going to be using within my strategy for the sign-in.
opts.secretOrKey = config.secretKey;

/**when this function is called, the done is the callback that is provided by passport. 
 * Through this done parameter, you will be passing back information to passport which it 
 * will then use for loading things onto the request message. */
exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        // Search for the user
        // jwt_payload, there is a ID field that comes in, the second one is a callback function
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if(err){
                // This done is the callback that passport will pass into your strategy here.
                // Because this is an error, I'm not going to be passing in a user value.
                // First para for err, second for user is availible or not, third for optional
                return done(err, false); 
            }
            else if(user) { // if the user is not null
                return done(null, user);
            }
            else{
                // If you want, you can create a new user account at this point (the second parameter) 
                //but I'm going to keep this simple just so that it's easy for us to understand.
                return done(null, false); 
            }
        });
    }));

// The strategy is "jwt strategy" which I've just configured, the JsonWebToken strategy that I've just configuredㄥ
// session: false, that means we aren't going to be creating session in the case.
// Because we use token-based authentication, we're not going to be creating sessions 
// => set the session to false .
exports.verifyUser = passport.authenticate('jwt', {session:false});