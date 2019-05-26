// connect to Express Server
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Dishes = require('../models/dishes');
/**update my dish router to be able to interact with 
 * the MongoDB server using Mongoose */

 // finally go to postmand and then perform certain operation

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

/** from my Express server, I am accessing my MongoDB */
dishRouter.route('/')  
.get((req, res, next) => {
    Dishes.find({})  // send to the mongodb server using a mongoose methed
    .then((dishes) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json'); // use json 
        /**res.json() take as an input in json string and then send it back over to my client 
         * when you call res.json and supply the value and then it will simply take 
         * the parameter that you give here and then send it back as a json response*/
        res.json(dishes); 
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {
    /**Just take the request body and then parse it in as a parameter to my dishes.create
     *  method and handle the return value */
    Dishes.create(req.body)
    .then((dish) => {
        console.log('Dish Created', dish);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put((req, res, next) => {
    res.statusCode = 403; // 403 means their operation not supported
    res.end('PUT operation not supported on /dishes');
})
.delete((req, res, next) => { // Later on, we will learn how to use authentication
    Dishes.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

//////
// For route of /:dishId
dishRouter.route('/:dishId')
.get( (req,res,next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /dishes/'+ req.params.dishId);
})
.put((req, res, next) => {
    Dishes.findByIdAndUpdate(req.params.dishId, {
        $set: req.body
    }, {new: true})
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete( (req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = dishRouter;