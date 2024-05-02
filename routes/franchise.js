const router = require("express").Router();
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
// const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { prisma } = require("../db");

const multer = require("multer")
const s3 = require('../scripts/aws-config')

const storage = multer.memoryStorage();
const upload = multer({ storage })

const { check, validationResult } = require("express-validator");

const { authenticateToken } = require("../middlewares/auth");

// fetch all franchise

//

// signup franchise to database
router.post(
    "/signup",
    [
      
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
  
      const { password, name, mobile, option } = req.body;
      console.log('in franchise signup')
      console.log(req.body)

     
  
      try {
        const user = await prisma.franchise.findUnique({
            where: {
              mobile,
            },
          });
      
          if (user) {
            return res.status(400).json({
              errors: [{ msg: "This mobile nnumber already exists" }],
            });
          }

          const hashedPassword = await bcrypt.hash(password, 10);

          

          

      
          const newUser = await prisma.franchise.create({
            data: {
              name: name,
              password: hashedPassword,
              mobile,
              about: option
            },
            select: {
              id: true,
              name: true,
              mobile: true,
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


  // login franchise
router.post('/login', async (req,res) => {

    const { mobile, password } = req.body;

    console.log(req.body)

   try {
    const user = await prisma.franchise.findUnique({
        where: {
          mobile,
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
        mobile: user.mobile,
        name: user.name,
        about: user.about,
        imageUrl: user.imageUrl
      };
    
      //console.log(user)
      const userPayload = {
        id: user.id,
        mobile: user.mobile,
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
  
      const updateUserimage = await prisma.franchise.update({
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

//////////////////////////
// Franchise Admin Section
//////////////////////////

router.get('/allfranchie', async (req,res) => {
    //console.log('in all franchise')
    try {
        const allFranchie = await prisma.franchise.findMany({})

        //console.log('in all franchise after',allFranchie)
        res.status(200).json(allFranchie)
    } catch (error) {
        console.log("error in get all franchie", error)
    }
})

// Get All Work Of An Franchise
router.get('/getall/:id', async(req,res) => {
  const  id  = req.params.id
  // console.log('from get all work of id',id)
  if(!id){
    res.status(400).json({error: 'no id provided'})
  }

  try {
    const allWork = await prisma.franchisework.findMany({
      where: { franchiseId: parseInt(id)}
    })
    res.status(200).json(allWork)
  } catch (error) {
    
  }
})

// create franchise work
router.post('/addwork', async (req,res) => {
    const { franchiseName,franchiseId,detail } = req.body

    if(!franchiseName || !franchiseId || !detail){
        res.status(400).json({error: "Input Fields Can Not Be Empty"})
    }

    

    try {

      console.log("first in try")
      // First, check if the franchise exists
    const franchise = await prisma.franchise.findUnique({
      where: { id: parseInt(franchiseId) },
    });

    console.log('after find franchise',franchise)
    if (!franchise) {
      return res.status(404).json({ error: "Franchise not found" });
    }

    console.log('Before nEw work')
        const newWork = await prisma.franchisework.create({
            data: {
                detail: detail,
                franchiseName: franchiseName,
                franchiseId: parseInt(franchiseId)
            }
        })
        
        res.status(201).json(newWork)
        
    } catch (error) {
        console.log("error communicating database in add franchise",error)
    }
})

//

// update franchise work

router.patch('/updatework', async(req,res) => {
    const {workid, completestatus} = req.body

    try {
       // Check if the Franchisework exists
    const existingFranchisework = await prisma.franchisework.findUnique({
      where: { id: parseInt(workid) },
    });
    if (!existingFranchisework) {
      return res.status(404).json({ error: "Franchisework not found" });
    }

    // Update the completestatus
    const updatedFranchisework = await prisma.franchisework.update({
      where: { id: parseInt(workid) },
      data: {
        completestatus
      },
    });

    res.json(updatedFranchisework);
        
    } catch (error) {
        console.log('error in update work', error)
    }
})

//

// DELETE Franchise Work
router.delete('/deletework/:id', async(req,res) => {
  const { id } = req.params;

  try {
    // Check if the Franchisework exists
    const existingFranchisework = await prisma.franchisework.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingFranchisework) {
      return res.status(404).json({ error: "Franchisework not found" });
    }

    // Delete the franchisework
    const deletedFranchisework = await prisma.franchisework.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: `An error occurred: ${error.message}` });
  }
})
//

// upload franchise letter
router.post('/banner-upload', upload.single("file") ,async(req,res) => {
    const { originalname, buffer }  = req.file;
  
    const {imagename,letterId} = req.body;
  
    console.log(imagename,letterId)
    console.log(process.env.AWS_REGION)
  
    if(!imagename || !letterId) res.status(400).json({error: 'invalid data'})
  
    const params = {
      Bucket: "new-hamaracafe-testing-limited",
      Key: imagename,
          Body: buffer,
          ContentType: req.file.mimetype,
    }
  
    try {
  
      console.log('from try in banner upload upper')
      // upload to s3 
      const response = await s3.upload(params).promise();
  
      console.log('from try in banner upload', response)
  
      if(response.Location){
        const findBanner = await prisma.letter.findUnique({
          where: { letterId: parseInt(letterId)}
        })
        console.log('from if location ', findBanner)
        if(findBanner){
          try {
            const updateBannerimage = await prisma.letter.update({
              where: { letterId: parseInt(letterId)},
              data: {
                letterLink: response.Location,
                name: imagename,
              }
            })
            console.log('updated banner image', updateBannerimage)
          res.status(201).json({success: true})
          } catch (error) {
            console.log('error in updating')
          }
          
        } else {
          const newImage = await prisma.letter.create({
            data: {
                letterLink: response.Location,
              name: imagename,
              letterId: parseInt(letterId, 10)
            }
          })
          console.log('new banner image', newImage)
          res.status(201).json({success: "Uploaded Successfully"})
        }
        
      } else {
        res.json({ err: 'Something went wrong!' });
      }
  
    } catch (error) {
      console.log('error in storing image url', error)
    }
  
  })




//////////////////////////
//////////////////////////
//////////////////////////

module.exports = router;