const router = require("express").Router();
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const { prisma } = require("../db");


//// do modification according to admin table


  

// login affailates


// Get All Affailates List
router.get('/getallAffiliates', async (req,res) => {
  
  try {
    const allAffiliates = await prisma.affiliate.findMany({})
    res.json(allAffiliates)
  } catch (error) {
    console.log('error communicating database')
  }
  
})

//

// Get all Help Queries
router.get('/getallHelp', async (req,res) => {

  // const people = [
//     { id:1, name: 'Lindsay Walton', email: 'lindsay.walton@example.com', mobile: '987654345',  Query: 'Lorem ipsum dolor sit amet.' },
//     { id:2, name: 'Lindsay Walton', email: 'lindsay1.walton@example.com', mobile: '987654345',  Query: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Mollitia, vitae?' },
//     // More people...
//   ]

  try {
    const allHelp = await prisma.help.findMany({})
    res.json(allHelp)
  } catch (error) {
    console.log('error communicating database')
  }
})

//

// Get all Job Queries

router.get('/getallJob', async (req,res) => {

  try {
    const allJob = await prisma.job.findMany({})
    res.json(allJob)
  } catch (error) {
    console.log('error communicating database')
  }
})


//

// get all Withdraw Request

router.get('/getallwithdraw', async (req,res) => {
  try {
    const allWithdraw = await prisma.withdraw.findMany({})
    res.json(allWithdraw)
  } catch (error) {
    console.log('error communicating database')
  }
})
//

// get Latest updates 
router.get('/getallLatest', async(req,res) => {
  try {
    const allLatest = await prisma.latest.findMany({})
    res.json(allLatest)
  } catch (error) {
    console.log('error communicating database')
  }
})
//

module.exports = router;