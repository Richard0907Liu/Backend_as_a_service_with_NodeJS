const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  // connect to User schema
    },
    dishes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    }]

},  {
    timestamps: true
    }
);

 var Favorites = mongoose.model('Favotire', favoriteSchema);

module.exports = Favorites;