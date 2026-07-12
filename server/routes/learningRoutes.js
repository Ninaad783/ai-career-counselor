const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Roadmap = require("../models/Roadmap");

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. Generate Roadmap (Existing)
router.post("/roadmap", async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ success: false, message: "Topic is required." });
  }

  const prompt = `
You are an elite open-source technical instructor. 
Generate an exhaustive, highly structured learning roadmap to master the following topic/field: "${topic}".
Provide a complete timeline guide using markdown h3 elements (###) for headers.
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1600, temperature: 0.5 }
    });
    const roadmapText = await result.response.text();
    return res.status(200).json({ success: true, roadmap: roadmapText });
  } catch (error) {
    console.error(error);
    // Fallback logic safely preserved
    try {
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
      const fallbackResult = await fallbackModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      const fallbackText = await fallbackResult.response.text();
      return res.status(200).json({ success: true, roadmap: fallbackText });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Engines busy." });
    }
  }
});

// NEW 2. Save Generated Roadmap to MongoDB Database
router.post("/save", async (req, res) => {
  const { userId, topic, roadmapData } = req.body;
  if (!userId || !topic || !roadmapData) {
    return res.status(400).json({ success: false, message: "All processing fields are required." });
  }

  try {
    const newRoadmap = new Roadmap({ userId, topic, roadmapData });
    await newRoadmap.save();
    return res.status(201).json({ success: true, message: "Roadmap tracked successfully!" });
  } catch (error) {
    console.error("Database tracking failed:", error);
    return res.status(500).json({ success: false, message: "Failed to securely save roadmap data cluster." });
  }
});

// NEW 3. Fetch All Saved Roadmaps for a Specific User
router.get("/user/:userId", async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, roadmaps });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to recall historical documents." });
  }
});

// NEW: Delete a specific saved roadmap document entry from MongoDB
router.delete("/delete/:id", async (req, res) => {
  try {
    const roadmapId = req.params.id;
    const deletedRoadmap = await Roadmap.findByIdAndDelete(roadmapId);

    if (!deletedRoadmap) {
      return res.status(404).json({ success: false, message: "Roadmap record not found." });
    }

    return res.status(200).json({ success: true, message: "Roadmap track removed successfully." });
  } catch (error) {
    console.error("Failed to delete roadmap document:", error);
    return res.status(500).json({ success: false, message: "Server database deletion error." });
  }
});

module.exports = router;