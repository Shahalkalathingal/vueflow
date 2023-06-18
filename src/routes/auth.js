var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')
const User = require('../schema/User')


router.post('/register', async function (req, res, next) {
  const { username, name, email, password } = req.body

  if (!username || !name || !email || !password) {
    return res.json({ msg: "Please enter all the fields !" })
  }

  if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
    return res.json({ msg: "Please enter a valid email !" })
  }

  if (password.length < 8) {
    return res.json({ msg: "Password must contain at-least 8 chars !" })
  }

  let checkEmail = await User.findOne({ email: email })
  if (checkEmail) {
    return res.json({ msg: "Email is already taken !" })
  }

  let checkUsername = await User.findOne({ username: username })
  if (checkUsername) {
    return res.json({ msg: "Username is already taken !" })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await User.create({
    username,
    name,
    email,
    password: passwordHash
  }).then(user => {
    console.log(user)
    console.log(`\nNew user created with id ${user._id}`)

    return res.status(200).json({ msg: "user Created !", user: user })
  })

});

router.post('/login', async function (req, res, next) {
  const { username, password } = req.body

  if (!username || !password) {
    return res.json({ msg: "Please enter all the fields !" })
  }



  let checkEmail = await User.findOne({ email: username })
  let checkUsername = await User.findOne({ username: username })
  if (checkEmail) {
    const isMatch = await bcrypt.compare(password, checkEmail.password)
    if (!isMatch) {
      return res.json({ msg: "Invalid email or password !" })

    }

    return res.status(200).json({ msg: "Login Success!", user: checkEmail })

  } else if (checkUsername) {
    const isMatch = await bcrypt.compare(password, checkUsername.password)
    if (!isMatch) {
      return res.json({ msg: "Invalid email or password !" })
    }

    return res.status(200).json({ msg: "Login Success!", user: checkUsername })

  } else {
    return res.json({ msg: "Invalid email or password !" })
  }
});


router.get('/user/:id', async (req, res) => {
  if (!req.params.id) {
    return res.json({ msg: "No user with this id" })
  }
  try {
    const user = await User.findOne({ _id: req.params.id })
    return res.status(200).json({ msg: `_id:${user._id}`, user })

  } catch (error) {
    return res.json({ msg: "No user with this id !!" })

  }
})


router.post('/user/edit/:id', async (req, res) => {

  if (!req.params.id) {
    return res.json({ msg: "No user found with the id" })
  }
  try {
    const { username, name, email, image } = req.body
    if (!username || !name || !email ) {
      return res.json({ msg: "Please add all fields" })
    }else if(!image){
      return res.json({ msg: "Please select an image" })

    }
    let emailCheck = false
    let userNameCheck = false
    const currentUser = await User.findOne({ _id: req.params.id })

    const userEmail = await User.findOne({ email: email })
    const userName = await User.findOne({ username: username })
    if (userEmail || userEmail.email) {
      if (userEmail.email === currentUser.email) {
        emailCheck = true
      } else {
        emailCheck = false
        return res.json({ msg: "Email already exist" })
      }
    }
    if (userName || userName.username) {
      if (userName.username === currentUser.username) {
        userNameCheck = true
      } else {
        userNameCheck = false
        return res.json({ msg: "username already exist" })
      }
    }

     User.findOneAndUpdate({_id:req.params.id},{
      username,
      email,
      name,
      image
    }).then((res)=>{
      console.log(res);
      return res.status(200).json({ msg: `Updated User:${user._id}`, res })
    
    })
    

  } catch (error) {
    return res.json({ msg: "Internal error or something wrong !!" })

  }
})




module.exports = router;