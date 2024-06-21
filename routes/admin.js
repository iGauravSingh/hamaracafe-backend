const router = require("express").Router();
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const { prisma } = require("../db");
const { authenticateToken } = require("../middlewares/auth");
const multer = require("multer")
const s3 = require('../scripts/aws-config')

const storage = multer.memoryStorage();
const upload = multer({ storage })

//// do modification according to admin table


//////////////////////////////////
/////// Affiliate SECTION
/////////////////////////////////

// login affailates

// Get All Affailates List
router.get("/getallAffiliates", async (req, res) => {
  try {
    const allAffiliates = await prisma.affiliate.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(allAffiliates);
  } catch (error) {
    console.log("error communicating database");
  }
});

//

// UPDATE Work Going On
router.patch('/updateaffwork/:id', async(req,res) => {
  const {id} = req.params;
  const { workgoingon } = req.body;

  try {
    const user = await prisma.affiliate.update({
      where: { id: parseInt(id)},
      data: { workgoingon: workgoingon }
    })
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: `User update failed: ${error.message}` });
  }
})

//

// UPDATE Total Inquires
router.patch('/updateainquires/:id', async(req,res) => {
  const {id} = req.params;
  const { totalInquiry } = req.body;

  try {
    const user = await prisma.affiliate.update({
      where: { id: parseInt(id)},
      data: { totalInquiry: parseInt(totalInquiry) }
    })
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: `User update failed: ${error.message}` });
  }
})

//

// UPDATE Total Earnings
router.patch('/updateeraning/:id', async(req,res) => {
  const {id} = req.params;
  const { totalEarning } = req.body;

  try {
    const user = await prisma.affiliate.update({
      where: { id: parseInt(id)},
      data: { totalMoney: parseInt(totalEarning) }
    })
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: `User update failed: ${error.message}` });
  }
})

//



//////////////////////////////////
//////////////////////////////////
//////////////////////////////////

//////////////////////////////////
/////// HELP SECTION
/////////////////////////////////

// Get all Help Queries
router.get("/getallHelp", async (req, res) => {
  // const people = [
  //     { id:1, name: 'Lindsay Walton', email: 'lindsay.walton@example.com', mobile: '987654345',  Query: 'Lorem ipsum dolor sit amet.' },
  //     { id:2, name: 'Lindsay Walton', email: 'lindsay1.walton@example.com', mobile: '987654345',  Query: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Mollitia, vitae?' },
  //     // More people...
  //   ]

  try {
    const allHelp = await prisma.help.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(allHelp);
  } catch (error) {
    console.log("error communicating database");
  }
});

//

//////////////////////////////////
//////////////////////////////////
//////////////////////////////////


//////////////////////////////////
/////// JOB SECTION
/////////////////////////////////

// Get all Job Queries

router.get("/getallJob", async (req, res) => {
  try {
    const allJob = await prisma.job.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(allJob);
  } catch (error) {
    console.log("error communicating database");
  }
});

// get all job querries by date
const getDateRange = (dateString) => {
  const date = new Date(dateString);
  const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
  return { startOfDay, endOfDay };
};


router.get('/getallJob/:date', async (req, res) => {
  const { date } = req.params;

  const { startOfDay, endOfDay } = getDateRange(date);

  try {
    const { startOfDay, endOfDay } = getDateRange(date);
    const data = await prisma.job.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    res.json(data);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add job Queries

router.post("/addjob", async (req, res) => {
  try {
    const { name, mobile, affiliateCode,work } = req.body;

    console.log(req.body);
    
    if (!affiliateCode || affiliateCode === "hamara/111") {

      newAffCode = "hamara/111";

      const allJob = await prisma.job.create({
        data: {
          name,
          mobile,
          affiliateCode: newAffCode,
          work: work,
        },
      });
      res.status(200).json({ success: true });
    } else {

      newAffCode = affiliateCode;

      const allJob = await prisma.job.create({
        data: {
          name,
          mobile,
          affiliateCode: newAffCode,
          work: work,
        },
      });

      const affiliate = await prisma.affiliate.findUnique({
        where: {
          affiliateCode: newAffCode,
        },
      });

      if (!affiliate) {
        // Handle error if affiliate record doesn't exist
        console.error('Affiliate not found');
        return;
      }

      // Increment totalClicks by one
    const updatedTotalClicks = affiliate.totalClicks + 1;

      // Update the database with the new value of totalClicks
    const updatedAffiliate = await prisma.affiliate.update({
      where: {
        affiliateCode: newAffCode,
      },
      data: {
        totalClicks: updatedTotalClicks,
      },
    });

    console.log('Total clicks updated successfully:', updatedAffiliate);
    res.status(200).json({ success: true });
    }
  } catch (error) {
    console.log(error);
  }
});

//

// UPDATE change MANAGER of JOB
router.patch('/change-manager', async(req,res) => {
  const { jobId, managerName } = req.body
  if(!jobId || !managerName){
    res.status(400).json({error: "Invalid Data"})
  }
  try {
    const updateJob = await prisma.job.update({
      where: { id: parseInt(jobId)},
      data: {managedBy: managerName}
    })
    res.status(201).json(updateJob)
  } catch (error) {
    console.log("error in update change job manager",error)
  }
})

//

// DELETE JOB Queres
router.delete("/delete-job/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.job.delete({
      where: {
        id: parseInt(id),
      },
    });

    res.status(200).json({ success: true, id });
  } catch (error) {
    console.log("error communicating database");
  }
});

/////////////////////////////////
/////////////////////////////////
/////////////////////////////////

//

/////////////////////////////////
///// WITHDRAW REQUEST SECTION
/////////////////////////////////////

// get all Withdraw Request

router.get("/getallwithdraw", async (req, res) => {
  try {
    const allWithdraw = await prisma.withdraw.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(allWithdraw);
  } catch (error) {
    console.log("error communicating database");
  }
});
//

// add withdraw request
router.post('/addwithdraw',authenticateToken,async(req,res) => {
  try {
    const { amount } = req.body;

    // you get email from req.user get rest of data of user from email 
    // save that data to withdraw table

    

    if(amount) {

      const newAmount = parseInt(amount)

      const affiliateDetails = await prisma.affiliate.findUnique({
      where: {
        email: req.user.email
      }
    })
      // console.log(affiliateDetails,amount)
      const newWithdraw = await prisma.withdraw.create({
        data: {
          name: affiliateDetails.name,
          email: affiliateDetails.email,
          mobile: affiliateDetails.mobile,
          affiliateCode: affiliateDetails.affiliateCode,
          withdrawAmount: newAmount
        }
      })

      if(newWithdraw){
         res.status(201).json({ success: true});
      }
    } else {
      res.status(400).json({ success: false});
    }
    
  } catch (error) {
    console.log("error communicating database");
  }
})

//

// DELETE Withdraw Queres
router.delete("/delete-withdraw/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.withdraw.delete({
      where: {
        id: parseInt(id),
      },
    });

    res.status(200).json({ success: true, id });
  } catch (error) {
    console.log("error communicating database");
  }
});

//////////////////////////////////
/////////////////////////////////////
///////////////////////////////////

//////////////////////////////////
// LATEST UPDATE SECTION
/////////////////////////////////

// get Latest updates
router.get("/getallLatest", async (req, res) => {
  try {
    const allLatest = await prisma.latest.findMany({});
    res.json(allLatest);
  } catch (error) {
    console.log("error communicating database");
  }
});
//

// ADD LATEST UPDATE
router.post("/addLatest", async (req, res) => {
  try {
    const { latestLink } = req.body;
    console.log(latestLink);
    const newLatest = await prisma.latest.create({
      data: {
        update: latestLink,
      },
    });
    console.log(newLatest);
    res.json(newLatest);
  } catch (error) {
    console.log("error communicating database");
  }
});
//

// DELETE LATEST UPDATE
router.delete("/deleteLatest/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.latest.delete({
      where: {
        id: parseInt(id),
      },
    });

    res.status(200).json({ success: true, id });
  } catch (error) {
    console.log("error communicating database");
  }
});

//

//////////////////////////////////
//////////////////////////////////
//////////////////////////////////

//////////////////////////////////
//Banner Image Upload And Download
//////////////////////////////////

// upload banner image 
router.post('/banner-upload', upload.single("file") ,async(req,res) => {
  const { originalname, buffer }  = req.file;

  const {imagename,buttonId} = req.body;

  console.log(imagename,buttonId)
  console.log(process.env.AWS_REGION)

  if(!imagename || !buttonId) res.status(400).json({error: 'invalid data'})

  const params = {
    Bucket: "hamaracafeimagehandle",
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
      const findBanner = await prisma.banner.findUnique({
        where: { buttonId: parseInt(buttonId)}
      })
      console.log('from if location ', findBanner)
      if(findBanner){
        try {
          const updateBannerimage = await prisma.banner.update({
            where: { buttonId: parseInt(buttonId)},
            data: {
              url: response.Location,
              key: response.Key,
            }
          })
          console.log('updated banner image', updateBannerimage)
        res.status(201).json({success: "Uploaded Successfully"})
        } catch (error) {
          console.log('error in updating')
        }
        
      } else {
        const newImage = await prisma.banner.create({
          data: {
            url: response.Location,
            key: response.Key,
            buttonId: parseInt(buttonId, 10)
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
//


// fetch Banners
router.get('/banner-fetch', async(req,res) => {
  try {
    const getBanner = await prisma.banner.findMany({})
    res.status(200).json(getBanner)
  } catch (error) {
    
  }
})


//////////////////////////////////
//////////////////////////////////
//////////////////////////////////

//////////////////////////////////
//// ADMIN SECTION
//////////////////////////////////

// admin signup

router.post(
  "/admin-signup",async (req, res) => {
    

    const { email, password } = req.body;
    console.log('in signup')
    console.log(req.body)

    try {
      const user = await prisma.admin.findUnique({
          where: {
            email,
          },
        });

        console.log('out of find unique')
    
        if (user) {
          return res.status(400).json({
            errors: [{ msg: "This username already exists" }],
          });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

      
        console.log('password hashed')
        const newUser = await prisma.admin.create({
          data: {
            email,
            password: hashedPassword,
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

//

// admin login
router.post('/admin-login', async (req,res) => {
  const {  email ,password } = req.body;

  //console.log(req.body)

  try {
    const user = await prisma.admin.findUnique({
      where: {
        email,
      },
    })

    // console.log(user)

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
      }

      const userPayload = {
        id: user.id,
        email: user.email,
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

//

// admin change password
router.patch('/password-update', authenticateToken ,async (req,res) => {
  const { password } = req.body;
  if(!password){
    res.status(400).json({msg: "password feild emply"})
  }
  
  //Hash the new password
  // const saltRounds = 10; // You can adjust the number of salt rounds as needed
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const updatedAffiliate = await prisma.admin.update({
      where: { email: "hamara@admin.com" },
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

// User Reset Password
router.patch('/user-password-update',authenticateToken, async (req,res) => {
  const { adminpassword, userEmail } = req.body;
  const adminemail = 'hamara@admin.com'
  if(!adminpassword){
    res.status(400).json({msg: "Unauthorized"})
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: {
        email: adminemail,
      },
    })

    // console.log(user)

    if (!admin) {
      return res.status(400).json({
        errors: [{ msg: "Invalid Credentials" }],
      });
    }

    const isMatch = await bcrypt.compare(adminpassword, admin.password);
    
      if (!isMatch) {
        return res.status(400).json({
          errors: [{ msg: "Invalid Credentials" }],
        });
      }
      const defaultPassword = "hamara123"
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      const updatedAffiliate = await prisma.affiliate.update({
        where: { email: userEmail },
        data: {
          password: hashedPassword
        }
      })
      return res.status(200).json({ msg: "success" });

  } catch (error) {
    console.log(error)
  }



})
//

//////////////////////////////////
//////////////////////////////////
//////////////////////////////////

module.exports = router;
