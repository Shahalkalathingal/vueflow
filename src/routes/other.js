var express = require('express');
var router = express.Router();
const User = require('../schema/User')
const Live = require('../schema/Lives')

/* GET lives listing. */
router.get('/search/:query',async function(req, res, next) {
  const {query} = req.params
  let users = await User.find({})
  let newusers = []
  users.filter((user)=>{
    if(user.username.includes(query)){
        console.log('ssad')
        newusers.push(user)
    }
  })
  return res.status(200).json({ users:newusers })
});

module.exports = router;
