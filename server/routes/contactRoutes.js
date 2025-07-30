const express = require("express");
const router = express.Router();
const { submitQuery, getAllQueries } = require("../controllers/contactController.js");

// POST - Submit Query
router.post("/", submitQuery);

// GET - Admin fetch all queries
router.get("/", getAllQueries);

module.exports = router;