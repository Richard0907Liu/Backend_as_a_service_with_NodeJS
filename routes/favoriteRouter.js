// connect to Express Server
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorite = require('../models/favorite');

favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorite) => {
        console.log('req.user._id: ', req.user._id);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => (err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id}) // find a specific dish
    .then((favorite) =>{
        if(favorite){  // if user apply the favorite function before
            for(var i = 0; i < req.body.length; i++){
                if(favorite.dishes.indexOf(req.body[i]._id) === -1){
                    favorite.dishes.push(req.body[i]);
                }
                favorite.save()
                .then((favorite) => {
                    console.log('User had added other favorite dishes!!');
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err));
            }
        }else{ // if user never apply the favorite function
            console.log('User never added any favorite dish before!!');
            Favorite.create({"user": req.user._id, "dishes": req.body})
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403; // 403 means their  operation not supported
    res.end('PUT operation not supported on /favorite');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403; // 403 means their  operation not supported
    res.end('POST operation not supported on /favorite');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    console.log('Beginning Delete.')
    Favorite.findOneAndDelete({"user":req.user._id}) // => show all favorite,  findOneAndDelete(req.user._id) is not useful.
    //Favorite.findByIdAndDelete(req.user._id) => null
    .then((favorite) => {
        console.log('Successfully delete favorite dishes:', favorite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
});

//// '/favorites/:dishId'
favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403; // 403 means their  operation not supported
    res.end('GET operation not supported on /favorite/:disheId');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then((favorite) => {   
        if(favorite){ // favorite exists
            if (favorite.dishes.indexOf(req.params.dishId) === -1) { // the dishes want to save is already in the favorite list
                favorite.dishes.push(req.params.dishId)
                favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err))
            }
        }else{ // favorite not exist
            Favorite.create({"user": req.user._id, "dishes": [req.params.dishId]})
            .then((favorite) => {
                console.log('Favorite Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
        }
    }, (err) => next(err) )
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403; // 403 means their  operation not supported
    res.end('PUT operation not supported on /favorite/:disheId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user:req.user._id})
    .then((favorite) => {
        console.log('favorite in delete: ', favorite);
        if(favorite != null){ // favorite exists
            console.log('req.param.dishId: ', req.param.dishId);
            console.log('req.params: ', req.params);
            console.log('req.param: ', req.param);
            favorite.dishes.remove(req.params.dishId);
            favorite.save()
            .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);  // returning the updated dish back to the user here.   
            }, (err) => next(err));
        }
        else{ // favorite not exist
            err = new Error('you are not authorized to delete this favorite ');
            err.status = 403;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;