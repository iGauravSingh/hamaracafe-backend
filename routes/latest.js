const router = require("express").Router();
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const { prisma } = require("../db");


// read latest updates 
router.get('/read-latest',(req,res) => {

})


//// THIS IS FUNCTION OF ADMIN SO MOVE IT TO ADMIN 
// add latest updates
router.post('/add-latest',(req,res) => {

})

// delete Latest 
router.delete('/delete-latest/:id',(req,res) => {

})

////


module.exports = router;