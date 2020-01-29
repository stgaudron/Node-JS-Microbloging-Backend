const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const bcrypt = require('bcrypt');
const authRegister = require("../auth/register");
const authLogin = require("../auth/login");
const jwt = require('jsonwebtoken');
const TOKEN_SECRET = 'shouldbeinenvhiddenfile';



mongoose.set('useFindAndModify', false);

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, TOKEN_SECRET, (err, user) => {
    console.log(err)
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

function generateAccessToken(payload) {
  return jwt.sign(payload, TOKEN_SECRET, { expiresIn: '7200s' })
}

router.get('/getuser', authenticateToken, (req, res) => {
    User.find({_id: req.user._id}, (err, user) =>{
      if (err) res.status(400).send(err)
      console.log(user);
      res.json(user[0].login)
    })
});

router.get('/', authenticateToken, (req, res) => {
    User.find(function(err, users) {
        if (err) {
            console.log(err);
        } else {
            res.json(users);
        }
    });
});

router.route('/:id').get(function(req, res) {
    let id = req.params.id;
    User.findById(id, function(err, user) {
        res.json(user);
    });
});


router.route('/add').post(function (req, res)  {
  const userparams ={
    login: req.body.login,
    email: req.body.email,
    hashpwd: sha1(req.body.password)}
  const user = new User(userparams);
  user.save()
    .then((user) =>{
      res.status(200).json({user});
    })
    .catch(err =>{
      res.status(400).send('adding user failed');
    });
  });

router.post("/register", (req, res) => {
    const { errors, isValid } = authRegister(req.body);
    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    User.findOne(
            { email: req.body.email, login: req.body.login }
        )
        .then(user => {
            if (user) {
                return res.status(400).json({ email: "Email/Login already exists" });
            } else {
                const newUser = new User({
                    login: req.body.login,
                    email: req.body.email,
                    password: req.body.password
                });// Hash password before saving in database
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    });
                });
            }
    });
});


router.route('/delete/:id').delete((req, res, next) => {
  User.findByIdAndRemove(req.params.id, (err, user) => {
        if (err)
          return next(error);
        else {
          res.status(200).json({msg: user});
          }
      });
});

router.route('/update/:id').put((req, res, next) => {
  User.findById(req.params.id, (err, user) => {
        if (err)
          return next(error);
        else {
          user.login = req.body.login;
          user.email = req.body.email;
          user.hashpwd = sha1(req.body.password);
          user.save();
          res.status(200).json({_id:req.params.id, login:user.login, email:user.email, hashpwd:user.hashpwd});
          }
      });
});

router.post("/login", (req, res) => {
    const { errors, isValid } = authLogin(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const login = req.body.login;
    const password = req.body.password;
    User.findOne({ login }).then(user => {
        console.log(user.login);
        if (!user) {
            return res.status(404).json({ loginnotfound: "Login not found" });
        }
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
            const payload = {_id: user._id, login: user.login }
            const accessToken = generateAccessToken(payload);
            res.json({accessToken: accessToken})
            }
            else {
            return res
                .status(400)
                .json({ passwordincorrect: "Password incorrect" });
            }
        });
    });
});


router.put('/follow/:id', authenticateToken, (req, res, next) => {
  User.findOne({_id: req.user._id}, (err, user) => {
    if (err) res.status(400).send(err)
    else{
    if (user.following.some((follow) =>{
     return follow.equals(req.params.id)}) == true)

      res.status(400).send('already following');
    else{
    user.following.push(req.params.id)
    user.save()
    .then((user) => {
      res.status(200).json(user)
    })
    .catch(err =>{
      res.status(400).send('follow failed')
    });}
  }
  User.findById(req.params.id, (err, user) =>{
    if (err) res.send(err)
    else{
    if (user.followers.some((follower) =>{
     return follower.equals(req.user._id)}) == true)
      res.send('already followed');
    else {
      user.followers.push(req.user._id);
      user.save()
      .then((user) => {
        res.json(user)
      })
      .catch(err => {
        res.send('followed failed')
      })
    }
  }
  })
  });
});

router.put('/unfollow/:id', authenticateToken, (req, res, next) => {
  User.findOne({_id: req.user._id}, (err, user) => {
    if (err) res.status(400).send(err)
    else{
    user.following.splice( user.following.indexOf(req.params.id), 1 );
    user.save()
    .then((user) => {
      res.status(200).json(user)
    })
    .catch(err =>{
      res.status(400).send('follow failed')
    });
  }
  User.findById(req.params.id, (err, user) =>{
    if (err) res.send(err)
    else{
    if (user.followers.some((follower) =>{
     return follower.equals(req.user._id)}) == false)
      res.send('not followed');
    else {
      user.followers.splice( user.followers.indexOf(req.user._id), 1 );
      user.save()
      .then((user) => {
        res.json(user)
      })
      .catch(err => {
        res.send('followed failed')
      })
    }
  }
  })
  });
});

router.put('/block/:id', authenticateToken, (req, res, next) => {
  User.findOne({_id: req.user._id}, (err, user) => {
    if (err) res.status(400).send(err)
    else{
      user.blocked.push(req.params.id)

      user.save()
      .then((user) => {
        res.status(200).json(user)
      })
      .catch(err =>{
        res.status(400).send('follow failed')
      });
    }
  });
});

router.put('/unblock/:id', authenticateToken, (req, res, next) => {
  User.findOne({_id: req.user._id}, (err, user) => {
    if (err) res.status(400).send(err)
    else{
      user.blocked.splice( user.blocked.indexOf(req.user._id), 1 );

      user.save()
      .then((user) => {
        res.status(200).json(user)
      })
      .catch(err =>{
        res.status(400).send('follow failed')
      });
    }
  });
});



module.exports = router;
