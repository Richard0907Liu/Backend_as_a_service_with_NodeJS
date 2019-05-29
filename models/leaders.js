const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leaderSchema = new Schema({
    name:{
        type: String,
        require: true,
        unique: true
    },
    designation:{
        type: String,
        require: true
    },
    image:{
        type: String,
        require: true
    },
    abbr:{
        type: String,
        require: true
    },
    featured:{
        type: Boolean,
        default: false
    },
    description:{
        type: String,
        require: true
    }
})

var Leaders = mongoose.model('Leader', leaderSchema);

module.exports = Leaders;