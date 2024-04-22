const router = require("express").Router();
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const { prisma } = require("../db");

//// do modification according to admin table

// login affailates

// Get All Affailates List
router.get("/getallAffiliates", async (req, res) => {
  try {
    const allAffiliates = await prisma.affiliate.findMany({});
    res.json(allAffiliates);
  } catch (error) {
    console.log("error communicating database");
  }
});

//

// Get all Help Queries
router.get("/getallHelp", async (req, res) => {
  // const people = [
  //     { id:1, name: 'Lindsay Walton', email: 'lindsay.walton@example.com', mobile: '987654345',  Query: 'Lorem ipsum dolor sit amet.' },
  //     { id:2, name: 'Lindsay Walton', email: 'lindsay1.walton@example.com', mobile: '987654345',  Query: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Mollitia, vitae?' },
  //     // More people...
  //   ]

  try {
    const allHelp = await prisma.help.findMany({});
    res.json(allHelp);
  } catch (error) {
    console.log("error communicating database");
  }
});

//

//////////////////////////////////
// JOB SECTION
/////////////////////////////////

// Get all Job Queries

router.get("/getallJob", async (req, res) => {
  try {
    const allJob = await prisma.job.findMany({});
    res.json(allJob);
  } catch (error) {
    console.log("error communicating database");
  }
});

// Add job Queries

router.post("/addjob", async (req, res) => {
  try {
    const { name, mobile, affiliateCode } = req.body;

    console.log(req.body);
    var newAffCode = "";
    if (!affiliateCode || affiliateCode === "hamara/111") {

      newAffCode = "hamara/111";

      const allJob = await prisma.job.create({
        data: {
          name,
          mobile,
          affiliateCode: newAffCode,
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

//

// get all Withdraw Request

router.get("/getallwithdraw", async (req, res) => {
  try {
    const allWithdraw = await prisma.withdraw.findMany({});
    res.json(allWithdraw);
  } catch (error) {
    console.log("error communicating database");
  }
});
//

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

module.exports = router;
