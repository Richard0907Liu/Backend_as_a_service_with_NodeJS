// In postman, use "Bearer" not bearer in the Authenticate's value

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy; 
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign and verify tokens
var FacebookTokenStrategy = require('passport-facebook-token');

var config = require('./config.js');

exports.local = passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


 exports.getToken = function(user) {  
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600}) 
       
 }

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if(err){
                return done(err, false); 
            }
            else if(user) { 
                return done(null, user);
            }
            else{
                
                return done(null, false); 
            }
        });
    }));
exports.verifyUser = passport.authenticate('jwt', {session:false});

// For verifyAdmin()
exports.verifyAdmin = (req, res, next) =>{
    User.findOne({_id: req.user._id})
    .then((user) => {
        console.log("User: " + user)
        if(req.user.admin){  // user.admin also works
            next();
        }
        else{
            err = new Error("You are not authoried to perform this operation!");
            err.status = 403;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
};


exports.FacebookPassport = passport.use(new FacebookTokenStrategy(
    { clientID: config.facebook.clientId,
        clientSecret: config.facebook.clientSecret
    },
    // callback function
    (accessToken, refreshToken, profile, done) => {
        
        User.findOne({facebookId: profile.id}, (err, user) => { 
            if(err){
                return done(err, false);  // done function from 'passport'
            }
            if(!err && user != null){  // If users had logged in a facebook account before.
                console.log('Facebook user: ', uer);
                return done(null, user);
            }
            else{  // if users never logg in a facebook a facebook account before, we need to create a new user.
                console.log('Profile: ', profile);
                user = new User({username: profile.displayName});
                user.facebookId = profile.id; // This is returned from the user's Facebook profile
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.save((err, user) => {
                    if(err)
                        return done(err, false);
                    else
                        return done(null, user);
                });
            }
        });
    }    
));
