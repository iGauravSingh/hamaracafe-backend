const router = require("express").Router();
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const { prisma } = require("../db");
const { authenticateToken } = require("../middlewares/auth");


// add Query 
router.post('/add-querry', authenticateToken ,async (req,res) => {
    const { name, email , mobile , affiliateCode, query } = req.body

    // console.log(req.body)

    try {
        const newHelp = await prisma.help.create({
            data: {
                name,
                email,
                mobile,
                query,
                affiliateCode
            }
        })
        // console.log(newHelp)
        res.status(201).json({ message: 'success' })
    } catch (error) {
        // console.log('error communicating database')
        res.status(400).json({ message: 'server Error' })
    }

})

//

//// THIS IS FUNCTION OF ADMIN SO MOVE IT TO ADMIN 
// remove Query 
router.delete('/delete-query/:id', async (req,res) => {
    try {
        const { id } = req.params;
        await prisma.help.delete({
          where: {
            id: parseInt(id)
          }
        })
    
        res.status(200).json({ success: true, id });
      } catch (error) {
        console.log('error communicating database')
      }
})

router.get('/read-query', (req,res) => {

})


//
////




module.exports = router;