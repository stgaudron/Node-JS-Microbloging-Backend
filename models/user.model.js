const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    login: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 20,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default : false
    },
    followers: {
        type: [mongoose.Schema.Types.ObjectID],
        ref: 'User'
      },
    following: {
      type: [mongoose.Schema.Types.ObjectID],
      ref: 'User'
    },
    blocked: {
      type: [mongoose.Schema.Types.ObjectID],
      ref: 'User'
    }
});

// Custom validation for email
userSchema.path('email').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');

mongoose.model('User', userSchema);
