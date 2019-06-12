// connect to Express Server
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

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
    .populate('comments.author')
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
/** First execute this middleware (authenticate.verifyUser), which I have exported 
 * from the authentic.js file, I first apply that, which is equivalent to saying passport 
 * authenticate JWT and you are checking the user. If this is sucessful, then I will move on
 * to do the rest of it */
.post(authenticate.verifyUser, (req, res, next) => {
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
.put(authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403; // 403 means their  operation not supported
    res.end('PUT operation not supported on /dishes');
})
.delete(authenticate.verifyUser, (req, res, next) => { // Later on, we will learn how to use authentication
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
    .populate('comments.author')
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser,(req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /dishes/'+ req.params.dishId);
})
.put(authenticate.verifyUser,(req, res, next) => {
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
.delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

////////////
// For /comments and /commentsId
dishRouter.route('/:dishId/comments')  
.get((req, res, next) => {
    Dishes.findById(req.params.dishId)  // send to the mongodb server using a mongoose methed
    .populate('comments.author')
    .then((dish) => {
        if(dish != null){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments);  // return the comments
        }
        else{ // dish not exist
            err = new Error('Dish' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err); // we're just going to return that error here from the get operation
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => { // update comments
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish != null){
            req.body.author = req.user._id; // save _id to author and save
            // Before pass back the value
            dish.comments.push(req.body);
            dish.save() // save the collection 
            .then((dish) => {
                Dishes.findById(dish._id) // find a certain dish and populate comments.author
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);  // returning the updated dish back to the user here.
                });
            }, (err) => next(err));
        }
        else{ // dish not exist
            err = new Error('Dish' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err); // we're just going to return that error here from the get operation
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403; // 403 means their  operation not supported
    res.end('PUT operation not supported on /dishes'
        + req.params.dishId + '/comments');
})
.delete(authenticate.verifyUser,(req, res, next) => { // Later on, we will learn how to use authentication
    Dishes.findById(req.params.dishId)
    .then((dish) => { // resp, Server response
        if(dish != null){
            /** have to go in and delete each of the comments */
            for(var i = (dish.comments.length -1); i >=0; i--){ 
                /** inside here (dish.comments[i]._id) you will specify the id of the subdocuments 
                that you're trying to access*/
                dish.comments.id(dish.comments[i]._id).remove();
            }
            dish.save() // save the collection 
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);  // returning the updated dish back to the user here.
            }, (err) => next(err));
        }
        else{ // dish not exist
            err = new Error('Dish' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err); // we're just going to return that error here from the get operation
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

// For route of /:dishId/comments/:commentId
dishRouter.route('/:dishId/comments/:commentId')
.get( (req,res,next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        if(dish != null && dish.comments.id(req.params.commentId) != null){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments.id(req.params.commentId));  // return the comments
        }
        else if (dish == null){ // dish not exist
            err = new Error('Dish' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err); // we're just going to return that error here from the get operation
        }
        else{ // commentID doesn't exist
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);
            }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser,(req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /dishes/'+ req.params.dishId 
        + '/comments/' + req.params.commentId);
})
.put(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish != null && dish.comments.id(req.params.commentId) != null){
            // can update comments
            /**if a comment already exists then I don't want to allow the user to change 
             * the author of the comment, the author should retained. The only two fields 
             * that I would allow the user update is the rating and the comment*/
            if(req.body.rating){
                dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if(req.body.comment){
                dish.comments.id(req.params.commentId).comment = req.body.comment;
            }
            dish.save() // save the collection 
            .then((dish) => {
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;  // res for sending back the reply
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);  // returning the updated dish back to the user here.
                })
            }, (err) => next(err));
        }
        else if (dish == null){ // dish doesn't exist, cannot update comments
            err = new Error('Dish' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err); // we're just going to return that error here from the get operation
        }
        else{ // commentID doesn't exist, cannot update comments
            err = new Error('Comment' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);
            }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => { // resp, Server response
        if(dish != null && dish.comments.id(req.params.commentId) != null){
            /** have to go in and delete a specific comments */
            dish.comments.id(req.params.commentId).remove();           
            dish.save() // save the collection 
            .then((dish) => {
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);  // returning the updated dish back to the user here.
                })
            }, (err) => next(err));
        }
        else if (dish == null){ // dish doesn't exist, cannot update comments
            err = new Error('Dish' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err); // we're just going to return that error here from the get operation
         }
        else{ // commentID doesn't exist, cannot update comments
            err = new Error('Comment' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = dishRouter;