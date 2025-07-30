const Contact = require("../models/contact.js");

const submitQuery = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await Contact.create({ name, email, message });
    res.json({ message: "Your query has been submitted successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error submitting query", error: err.message });
  }
};

const getAllQueries = async (req, res) => {
  try {
    const queries = await Contact.find().sort({ createdAt: -1 });
    res.json(queries);
  } catch (err) {
    res.status(500).json({ message: "Error fetching queries" });
  }
};

module.exports = { submitQuery, getAllQueries };