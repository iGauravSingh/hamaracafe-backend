
const router = require("express").Router();
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const crypto = require('crypto');
const { prisma } = require("../db");
// const { authenticateToken } = require("../middlewares/auth");

const { check, validationResult } = require("express-validator");

const { authenticateToken } = require("../middlewares/auth");



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
      console.log('in signup')
      console.log(req.body)

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
  
      try {
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

          const uniqueString = crypto.randomBytes(16).toString('hex');

          

          console.log(uniqueString)
      
          const newUser = await prisma.affiliate.create({
            data: {
              email,
              name: name,
              password: hashedPassword,
              mobile,
              website: newWeb,
              youtube: newYoutube,
              intagram: newInsta,
              coupon: uniqueString,
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
      } catch (error) {
        res.json({"message": "so error in sign up"})
      }
      
    }
  );
  

// login affailates
router.post('/login', async (req,res) => {

    const { email, password } = req.body;

    console.log(req.body)

   try {
    const user = await prisma.affiliate.findUnique({
        where: {
          email,
        },
      });

      console.log(user)
    
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
   } catch (error) {
    res.json({"message":error})
   }

})

// delete affailate 
router.delete('/delete/:id', async (req,res) => {
    
})

// send dashboard on authenticating
router.get('/dashboard' ,authenticateToken ,async (req,res) => {


    const cardsData = [
        { icon: '☝🏻', type: 'Total Clicks', value: 45 },
        { icon: 'ℹ️', type: 'Total Inquiries', value: 0 },
        { icon: '⚙️', type: 'Work Going On', value: 0 },
        { icon: '📣', type: 'Latest Update', value: 0 },
        { icon: '😄', type: 'Help & Support', value: 0 },
      ];

      try {
        console.log(req.user)
        
        const user = await prisma.affiliate.findUnique({
          where: {
            email: req.user.email,
          },
        });
        res.render('home', { cards: cardsData,title: 'dashboard',user: user.name, code: user.coupon, sharelink: `https://hamaracafe.com/job-work-form2/?coupon=${user.coupon}` });

      } catch (error) {
        res.json({message: "someerror in dashboard user fetching"})
      }
    
    
      

})

module.exports = router;
