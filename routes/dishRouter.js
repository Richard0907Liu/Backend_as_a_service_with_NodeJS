const express = require('express');
const bodyParser = require('body-parser');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

/**And then on the dishRouter, it supports a method called route method, 
 * which can take in an endpoint as a parameter. 
 *  dishRouter.route means that by using this approach, we are declaring the endpoint 
 * at one single location, Whereby you can chain all get, PUT, POST, delete methods 
 * already do this dish router.*/
dishRouter.route('/') 
/** simply chain that into the route, so I will simply say .all and then 
 * I no longer need this end point definition there */
.all((req, res, next) => { // not need app
    
    // use '/plain' just for test, later we will send the data in form of JSON once 
    // we are able to retrieve tha data from the database
    // call the next(). It continue on to look for additionall specification down 
    // below here which match /dishes endpoint
    /** Below three lines would be done for all the requests, get, put, post, and delete,
     *  on the dishes, and it'll continue on to the next one*/
    res.statsuCode = 200;
    res.setHeader('Contect-Type', 'text/plain'); 
    next();    // Use next(), that would drop into informtaiton to next app.post process etc.
})
.get((req, res, next) => {
    res.end('Will send all the dishes to you!');
})
/**I will extract the information from the bodyParser, And so here when we use the body parser, what happens is that for the incoming request, 
 * the body of the incoming request will be parsed and then added into the req object as req.body. 
 * So the req.body will give you access to whatever is inside that body of the message.*/
.post((req, res, next) => {
    res.end('Will add the dish: ' + req.body.name + // price property, image property and all of that in a JSON file
             ' with details: ' + req.body.description);
})
.put((req, res, next) => {
    res.statusCode = 403; // 403 means their operation not supported
    res.end('PUT operation not supported on /dishes');
})
 // Later on, we will learn how to use authentication
.delete((req, res, next) => {
    res.end('Deleting all the dishes!');
});
//////
// For route of /:dishId
dishRouter.route('/:dishId')
.get( (req,res,next) => {
    res.end('Will send details of the dish: ' + req.params.dishId +' to you!');
})
.post((req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /dishes/'+ req.params.dishId);
})
.put((req, res, next) => {
  res.write('Updating the dish: ' + req.params.dishId + '\n');
  res.end('Will update the dish: ' + req.body.name + 
        ' with details: ' + req.body.description);
})
.delete( (req, res, next) => {
    res.end('Deleting dish: ' + req.params.dishId);
});




module.exports = dishRouter;