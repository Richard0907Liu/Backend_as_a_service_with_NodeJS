const express = require('express');
const cors = require('cors');
const app = express();


const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    console.log("Origin in the req.header: ", req.header('Origin'));  //
   
    if(whitelist.indexOf(req.header('Origin')) !== -1) { 
        corsOptions = { origin: true }; // 
        console.log("req.headers with Origin", req.headers);
    }
    else{
        corsOptions = { origin: false }; // the access controller "allowOrigin" will not returned by my server site.
        console.log("req.headers with no Origin", req.headers);
    } 
    callback(null, corsOptions);
};

exports.cors = cors();
/**if you need to apply a cors with specific options to a particular route, we will use this function. */
exports.corsWithOptions = cors(corsOptionsDelegate);
