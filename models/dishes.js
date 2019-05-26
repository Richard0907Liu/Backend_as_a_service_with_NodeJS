const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Load the mongoose-currency to process the currecy of money
/** "Load the type and Mongoose."So, what this will do is to load this new currency type 
 * into Mongoose. */
require('mongoose-currency').loadType(mongoose); 
const Currency = mongoose.Types.Currency; // used in the price 


const commentSchema = new Schema({
    rating:{
        type: Number,
        min: 1,
        max: 5,
        require: true
    },
    comment:{
        type: String,
        require: true
    },
    author:{
        type: String,
        require:true
    }
},{
    timestamps:true
});

const dishSchema = new Schema({
    name:{
        type: String,
        require: true,
        unique: true
    },
    description:{
        type: String,
        require: true
    },
    image:{
        type: String,
        require: true
    },
    category:{
        type: String,
        require: true
    },
    label:{
        type: String,
        defualt: '' // empty string
    },
    price:{
        type: Currency,
        require: true,
        min: 0
    },
    featured:{
        type: Boolean,
        defualt: false  // if my document is missing here, then the defual value will be added into the doc.
    },
    comments: [commentSchema] // an array of the type commentSchema
},{
    timestamps:true
});

// Dish is the collection name
var Dishes = mongoose.model('Dish', dishSchema);

module.exports = Dishes;