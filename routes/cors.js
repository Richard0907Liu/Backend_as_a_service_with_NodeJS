// In Postman, the key is "Access-Control-Allow-Origin" for cors first, and then can set as "Origin". (Using Origin, it cannot connect to any other website).
const express = require('express');
const cors = require('cors');
const app = express();


/**The whitelist contains all the origins that this server is willing to accept. *
 * if you need more origins to be added to your whitelist, you can simply add them to 
 * your whitelist because I am explicitly trying to configure my cors Module*/
const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    console.log("Origin in the req.header: ", req.header('Origin'));  //
    /**Looking for that particular origin in req.header, is it present in this whitelist? 
     * So that's why we are saying whitelist.indexOf. 
     * The index of operation will return the index greater than or equal to zero if this is present in this array
     * It'll return -1 if this is not present in this array.
     * Check the request origin is in the whitelist? */
    if(whitelist.indexOf(req.header('Origin')) !== -1) { 
        /**The req.header has "origin", allow it to be accepted. When origin is 'true', cors Module will 
         * reply back saying access control allow origin, and then include that origin into the headers with 
         * with the access control allow origin key there  */
        corsOptions = { origin: true }; // 
        console.log("req.headers with Origin", req.headers);
    }
    else{
        corsOptions = { origin: false }; // the access controller "allowOrigin" will not returned by my server site.
        console.log("req.headers with no Origin", req.headers);
    } 
    callback(null, corsOptions);
};
/** The standard cors without any options, then that means this will reply back with access control allowOrigin 
 * with the wild cards toll.
 * There are certain rules on which this is acceptable to do, especially whenever we perform "GET operations". */
exports.cors = cors();
/**if you need to apply a cors with specific options to a particular route, we will use this function. */
exports.corsWithOptions = cors(corsOptionsDelegate);