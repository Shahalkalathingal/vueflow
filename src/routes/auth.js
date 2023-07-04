var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')
const User = require('../schema/User')


router.post('/register', async function (req, res, next) {
  const { username, name, email, password } = req.body

  if (!username || !name || !email || !password) {
    return res.json({ msg: "enter_all_fields" })
  }

  if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
    return res.json({ msg: "invalid_email" })
  }

  if (password.length < 8) {
    return res.json({ msg: "small_password" })
  }


  let checkEmail = await User.findOne({ email: email })
  if (checkEmail) {
    return res.json({ msg: "email_already_in_use" })
  }

  let checkUsername = await User.findOne({ username: username })
  if (checkUsername) {
    return res.json({ msg: "username_already_in_use" })
  }


  const passwordHash = await bcrypt.hash(password, 10)

  await User.create({
    username,
    name,
    email,
    password: passwordHash
  }).then(user => {
    console.log(user)

    return res.status(200).json({ msg: "register_success", user: user })
  })

});

router.post('/login', async function (req, res, next) {
  const { username, password } = req.body

  if (!username || !password) {
    return res.json({ msg: "enter_all_fields" })
  }



  let checkEmail = await User.findOne({ email: username })
  if (checkEmail) {
    const isMatch = await bcrypt.compare(password, checkEmail.password)
    if (!isMatch) {
      return res.json({ msg: "invalid_email_or_password" })

    }

    return res.status(200).json({ msg: "Login Success!", user: checkEmail })

  } else {
    return res.json({ msg: "internal_error" })
  }
});


router.get('/user/:id', async (req, res) => {
  if (!req.params.id) {
    return res.json({ msg: "user_not_found" })
  }
  try {
    const user = await User.findOne({ _id: req.params.id })
    return res.status(200).json({ msg: `_id:${user._id}`, user })

  } catch (error) {
    return res.json({ msg: "internal_error" })

  }
})


router.post('/user/edit/:id', async (req, res) => {

  if (!req.params.id) {
    return res.json({ msg: "user_not_found" })
  }
  try {
    const { username, name, email, image } = req.body

if(!username || !name || !email || !image){
  return res.json({msg:"fill_all_fields"})
}
    const currentUser = await User.findOne({ _id: req.params.id })

    const userEmail = await User.findOne({ email: email })
    const userName = await User.findOne({ username: username })
    
      let emailCheck = true
      let userNameCheck = true
      console.log("asdfsad")
      if (userEmail != null && userEmail.email) {

        if (userEmail.email != currentUser.email) {


          emailCheck = false

        }
      }
      if (userName != null && userName.username) {

        if (userName.username != currentUser.username ) {


          userNameCheck = false

        }
      }

     



      
      if (!userNameCheck) {

        return res.json({ msg: "username_already_in_use" })
      } else if (!emailCheck) {
        return res.json({ msg: "email_already_in_use" })

      }
      
      User.updateOne({_id:req.params.id}, {
        $set: {
          username,
          email,
          name,
          image
        }
      }).then(async(response) => {
        console.log(response);
        const userData = await User.findById(req.params.id)
        return res.json({ msg: `Updated User Id: ${req.params.id}`, response,user:userData })

      })




  } catch (error) {
    console.log(error)
    return res.json({ error, msg: "internal_error" })

  }
})




module.exports = router;