const router = require("express").Router();
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const { prisma } = require("../db");
const { authenticateToken } = require("../middlewares/auth");


// add Query 
router.post('/add-querry', authenticateToken ,(req,res) => {

})




//

//// THIS IS FUNCTION OF ADMIN SO MOVE IT TO ADMIN 
// remove Query 
router.delete('/delete-query/:id', (req,res) => {

})

router.get('/read-query', (req,res) => {

})


//
////




module.exports = router;