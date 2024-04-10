const router = require("express").Router();
const { prisma } = require("../db");
// const { authenticateToken } = require("../middlewares/auth");

const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");



// fetch all affailates
router.get('/getall' , async (req,res) => {
    res.json("in get all")

})

// signup affailates to database
router.post(
    "/signup",
    [
      check("email", "Please input valid email").isEmail(),
      check(
        "password",
        "Please input a password with a minium of 3 character"
      ).isLength({ min: 3 }),
      check(
        "name",
        "Please input a username with a minium of 3 character"
      ).isLength({ min: 3 }),
    ],
    async (req, res) => {
      const errors = validationResult(req);
  
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
        });
      }
  
      const { email, password, name, mobile, website,youtube,intagram } = req.body;
      //console.log(req.body)

      var newWeb = ''
      var newYoutube = ''
      var newInsta = ''
      if(website){
        newWeb = website
      }

      if(youtube){
        newYoutube = youtube
      }

      if(intagram){
        newInsta = intagram
      }
  
      const user = await prisma.affiliate.findUnique({
        where: {
          email,
        },
      });
  
      if (user) {
        return res.status(400).json({
          errors: [{ msg: "This username already exists" }],
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = await prisma.affiliate.create({
        data: {
          email,
          name: name,
          password: hashedPassword,
          mobile,
          website: newWeb,
          youtube: newYoutube,
          intagram: newInsta
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
  
      const token = await JWT.sign(newUser, process.env.JSON_WEB_TOKEN_SECRET, {
        expiresIn: 3600000,
      });
      return res.json({
        user: newUser,
        token,
      });
    }
  );
  

// login affailates
router.post('/login', async (req,res) => {

    const { email, password } = req.body;

    const user = await prisma.affiliate.findUnique({
      where: {
        email,
      },
    });
  
    if (!user) {
      return res.status(400).json({
        errors: [{ msg: "Invalid Credentials" }],
      });
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
  
    if (!isMatch) {
      return res.status(400).json({
        errors: [{ msg: "Invalid Credentials" }],
      });
    }
  
    const sendingPayload = {
      id: user.id,
      email: user.email,
    };
  
    //console.log(user)
    const userPayload = {
      id: user.id,
      email: user.email,
      username: user.name,
    };
    const token = await JWT.sign(userPayload, process.env.JSON_WEB_TOKEN_SECRET, {
      expiresIn: 3600000,
    });
    return res.json({
      user: sendingPayload,
      token,
    });

})

// delete affailate 
router.delete('/delete/:id', async (req,res) => {
    
})

module.exports = router;
