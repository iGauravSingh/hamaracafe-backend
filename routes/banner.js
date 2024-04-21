const router = require("express").Router();
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const { prisma } = require("../db");



// read banner 
router.get('/read-banner',(req,res) => {

})


//// THIS IS FUNCTION OF ADMIN SO MOVE IT TO ADMIN 
// add banner 
router.post('/add-banner', (req,res) => {

})
////