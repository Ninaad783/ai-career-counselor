const express = require("express");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure local storage engine for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the uploads folder exists before writing to it
    if (!fs.existsSync("uploads/")) {
      fs.mkdirSync("uploads/");
    }
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    console.log("FILE RECEIVED");

    // Read and extract plain text from the uploaded PDF file buffer
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;

    console.log("TEXT EXTRACTED");

    // Comprehensive expert prompt setup for dynamic analyzer output details
    const prompt = `
You are an expert Executive AI Talent Acquisition Specialist and Technical Career Coach. 
Analyze the provided resume text thoroughly and compile an exhaustive, high-end professional diagnostic report.

Format the output strictly using markdown h3 elements (###) for headers. Follow this structure precisely:

### Professional Executive Summary
(Write a detailed, high-level 3-4 sentence professional summary of the candidate based on their projects, experience, and background. Describe their professional persona and what type of engineering environments they would thrive in.)

### 1. ATS Score Diagnostic
**Score:** (Provide a realistic score out of 100, e.g., 85/100)
**Score Analysis:** (Provide a detailed 2-3 sentence technical breakdown of why they earned this score, mentioning keyword density, formatting structures, or potential parsing flaws.)

### 2. Primary & Secondary Target Job Roles
* **Primary Target:** (The absolute best job title that matches their skills)
* **Alternative Route 1:** (Secondary matching title)
* **Alternative Route 2:** (An emerging or adjacent industry title they could transition to easily)

### 3. Industry Experience Level
* **Current Status:** (e.g., Entry-Level / Fresher / Intermediate / Academic Transition)
* **Contextual Breakdown:** (Explain in 2 sentences their practical readiness based on the scale and complexity of projects listed in the text.)

### 4. Core Technical Strengths
* (List 4-5 major technical skills, tools, or architectural paradigms found in the text with a short explanation of how they used them)

### 5. Identified Critical Gaps & Missing Skills
* (List 3-4 highly relevant technologies, frameworks, or soft skills missing from this resume that are standard requirements for their target job roles)

### 6. Tailored Short-Term Career Trajectory
* **Next 6 Months:** (Actionable step-by-step upskilling or project goals)
* **Next 1-2 Years:** (Target industry milestones, certifications, or advancement opportunities)

### 7. Strategic Resume Optimization Tips
* (Provide 3 detailed, concrete recommendations to physically rewrite or restructure parts of their resume to boost recruiter conversion rates)

Resume Text to Evaluate:
${resumeText}

Ensure your tone remains highly professional, encouraging, analytical, and sharp. Do not use generic filler words.
`;

    let aiText = "";

    try {
      console.log("Attempting analysis with primary model (gemini-2.5-flash)...");
      const primaryModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const result = await primaryModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 8192, // Extended token space for thorough analytical breakdown
          temperature: 0.4,
        }
      });
      
      aiText = await result.response.text();

    } catch (primaryError) {
      // Automatic fallback switch if Google's primary model is overloaded (503)
      if (primaryError.status === 503) {
        // FIXED: Swapped out legacy 1.5 model with active supported gemini-2.5-flash-lite
        console.warn("Primary model busy (503). Initiating fallback sequence to gemini-2.5-flash-lite...");
        
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        
        const fallbackResult = await fallbackModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 1700,
            temperature: 0.4,
          }
        });
        
        aiText = await fallbackResult.response.text();
      } else {
        // Rethrow original error if it is structural (like a bad API key configuration)
        throw primaryError;
      }
    }

    console.log("AI GENERATED SUCCESSFULLY");

    // Clean up temporary local storage file asynchronously
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Temporary file cleanup failed:", err);
    });

    return res.status(200).json({
      success: true,
      aiText,
    });

  } catch (error) {
    console.error("BACKEND ERROR:", error);

    // Defensive handling: remove corrupted/hanging upload streams if execution fails mid-flight
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error.status === 503) {
      return res.status(503).json({
        success: false,
        message: "The AI engines are currently overloaded. Please wait a moment and try your file again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "An internal processing error occurred during diagnostics.",
    });
  }
});

module.exports = router;