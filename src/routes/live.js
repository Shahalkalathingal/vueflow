var express = require('express');
var router = express.Router();
const User = require('../schema/User')
const Live = require('../schema/Lives');
const { default: mongoose } = require('mongoose');

/* GET lives listing. */
router.get('/', async function(req, res, next) {
  const lives = await Live.find({})
  return res.status(200).json({ lives })
});

router.get('/:id', async function(req, res, next) {
  if(!mongoose.isValidObjectId(req.params.id)){
    return res.json({ msg:"no live found!" })
  }
  const live = await Live.findOne({user:req.params.id})
  if(live === null || !live){
    return res.json({ msg:"no live found!" })
  }
  return res.status(200).json({msg:"Live found!", live })
});

module.exports = router;
