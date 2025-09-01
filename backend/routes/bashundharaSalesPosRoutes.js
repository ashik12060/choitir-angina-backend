const express = require("express");
const { sellProductBashundhara } = require("../controllers/bashundharaSalesPosController");

const router = express.Router();

// routes/bashundharaSalesRoutes.js
router.post("/bashundhara-sales/create", sellProductBashundhara);

// router.post("/bashundhara-sales/:shopId", sellProductBashundhara);


module.exports = router;
