const mongoose = require('mongoose');

var postSchema = new mongoose.Schema({

  post_content:{
    type: String,
    require: true
  },
  post_author:{
    type: String
  }
},{timestamps: true});

mongoose.model('Post', postSchema);
