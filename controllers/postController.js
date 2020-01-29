const express = require('express');
var router = express.Router();

const mongoose = require('mongoose');
const Post = mongoose.model('Post');

const bodyParser = require('body-parser');
const cors = require('cors');

const jwt = require('jsonwebtoken');
const TOKEN_SECRET = 'shouldbeinenvhiddenfile';


mongoose.set('useFindAndModify', false);

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

router.get('/', authenticateToken, (req, res) => {
    Post.find({post_author: req.user.login}, (err, posts) => {
        if (err) {
            console.log(err);
        } else {
            res.json(posts);
        }
    });
});

router.route('/:id').get(function(req, res) {
    let id = req.params.id;
    Post.findById(id, function(err, post) {
        res.json(post);
    });
});

router.post('/add', authenticateToken, (req, res) => {
  const postparams={
    post_content: req.body.post_content,
    post_author: req.user.login
  }
  const post = new Post(postparams);

  post.save()
    .then((post) =>{
      res.status(200).json({post});
    })
    .catch(err =>{
      res.status(400).send('post failed');
    });
  });

router.delete('/delete/:id', authenticateToken, (req, res, next) => {
  Post.findByIdAndRemove(req.params.id, (err, post) => {
        if (err)
          return next(error);
        else {
          res.status(200).json({msg: post});
          }
      });
});

router.put('/update/:id', authenticateToken, (req, res, next) => {
  Post.findById(req.params.id, (err, post) => {
        if (err)
          return next(error);
        else {
          post.post_content = req.body.post_content;
          post.save();
          res.status(200).json({_id:req.params.id, post_content:post.post_content});
          }
      });
});

module.exports = router;
