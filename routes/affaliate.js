
const router = require("express").Router();
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
// const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { prisma } = require("../db");
// const { authenticateToken } = require("../middlewares/auth");

const multer = require("multer")
const s3 = require('../scripts/aws-config')

const storage = multer.memoryStorage();
const upload = multer({ storage })




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
  
      const { email, password, name, mobile, website,youtube,instagram } = req.body;
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

      if(instagram){
        newInsta = instagram
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

          const uniqueString = uuidv4();

          

          console.log(uniqueString)
      
          const newUser = await prisma.affiliate.create({
            data: {
              email,
              name: name,
              password: hashedPassword,
              mobile,
              website: newWeb,
              youtube: newYoutube,
              instagram: newInsta,
              affiliateCode: uniqueString,
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
        res.json({"error": error})
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
        mobile: user.mobile,
        name: user.name,
        website: user.website,
        youtube: user.youtube,
        instagram: user.instagram,
        affiliateCode: user.affiliateCode,
        imageUrl: user.imageUrl,
        totalClicks: user.totalClicks,
        totalInquiry: user.totalInquiry,
        workgoingon: user.workgoingon,
        totalMoney: user.totalMoney
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
//// PUT IT IN ADMIN
// delete affailate 
router.delete('/delete/:id', async (req,res) => {
    
})
////

// Password Update 
router.patch('/password-update', authenticateToken ,async (req,res) => {
const { password } = req.body;
if(!password){
  res.status(400).json({msg: "password feild emply"})
}

//Hash the new password
// const saltRounds = 10; // You can adjust the number of salt rounds as needed
const hashedPassword = await bcrypt.hash(password, 10);

try {
  const updatedAffiliate = await prisma.affiliate.update({
    where: { email: req.user.email },
    data: {
      password: hashedPassword
    }
  })
  return res.status(200).json({ msg: "success" });
} catch (error) {
  return res.status(500).json({ errors: error });
}

})

//

// Image Update 
router.patch('/imageupload',upload.single("file"),async (req,res) => {

  const { buffer }  = req.file;

  const {imagename,userid} = req.body;

  console.log('from image upload',req.body)

  console.log(imagename)
  console.log(process.env.AWS_REGION)

  if(!imagename) res.status(400).json({error: 'invalid data'})

  const params = {
    Bucket: "new-hamaracafe-testing-limited",
    Key: imagename,
        Body: buffer,
        ContentType: req.file.mimetype,
  }

  try {

    console.log('from try in user image upload upper')
    // upload to s3 
    const response = await s3.upload(params).promise();

    console.log('from try in user image upload upload', response)

    const updateUserimage = await prisma.affiliate.update({
      where: { id: parseInt(userid)},
      data: {
        imageUrl: response.Location,
      }
    })
    res.status(201).json({success: true})
  } catch (error) {
    console.log('error in storing image url', error)
  }

})

//

module.exports = router;
