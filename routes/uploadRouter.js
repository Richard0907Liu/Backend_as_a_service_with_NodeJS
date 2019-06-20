// connect to Express Server
// Can upload files to the server from the client side
// The file gets uploaded to a specified folder on the server side
const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer'); // can upload files
const cors = require('./cors');

// this disk storage function which enables us to define the storage engine 
// and in here we can configure a few things.
const storage = multer.diskStorage({
    /**receive "request" and also an object called the "file", which contains information 
     * about the file that has been processed by multer and also a "callback function" */
    destination: (req, file, cb) => {
        /** first parameter is the error, second parameter is the destination folder, which 
         * can be expressed as a string where the files will be stored. */
        cb(null, 'public/images');
    },
    /**  */
    filename: (req, file, cb) => {
         /**first parameter is the error, Then the second one insists on the file name, that is 
          * going to be used for the specific file that has just been uploaded, how it is going 
          * to be stored.   
          * This file object that I obtained here, supports a set of several properties on it from prompt*/
         cb(null, file.originalname); //original name of the file from the client side that has been uploaded.
    }
}); 

/** Through the callback function, I will pass information back to my multer configuration that 
 * enables me to specify how  I'm going to store this information. 
 * An error function*/
const imageFileFilter = (req, file, cb) => {
    // match() for regular expression
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
        // cb's first para is an Error, second one false, no file
        return cb(new Error('You can upload only image files!!'), false);
    }
    //"true" which means that the file that is trying to be uploaded matches the pattern and so It is an image file, 
    //and so we're willing to let it be uploaded
    cb(null, true);

};

//multer module is now configured to enable me to upload the image files here.
const upload = multer({storage: storage,
        fileFilter: imageFileFilter});



/**The file filter will enable me to specify which kind of files I am willing to upload or that I'm willing to 
 * accept for uploading. */

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());


uploadRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); }) // preflighting request
.get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403; 
    res.end('GET operation not supported on /imageUpload');
})
// post not need next()
/**That single file will specify in the upload form from the client side in the multi-part form 
 * upload by using that name there. 
 * upload contain a lot of function*/
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
    upload.single('imageFile'),(req, res) => {  // imageFile for key
    console.log('Request headers',req.headers, '\n', 'Request file', req.file);
    // The name of the form field  in single() which specifies that file.
    // Upload single means that it is going to allow me to upload only a single file here
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file); 
    /** pass back this req.file object from the server back to the client
     * This req.file object will also contain the path to the file in there and that path 
     * can be used by the client to configure any place where it needs to know the 
     * location of this image file.*/
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403; 
    res.end('PUT operation not supported on /imageUpload');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403; 
    res.end('DELETE operation not supported on /imageUpload');
})

module.exports = uploadRouter;