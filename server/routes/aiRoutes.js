const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse"); 
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// CONFIGURE MULTER TO USE BUFFER IN-MEMORY STORAGE
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- FLOATING AI ASSISTANT CHAT ROUTE ---
router.post("/chat-assistant", async (req, res) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ success: false, message: "Message text is required." });

  const systemInstruction = `
You are 'Nexus Bot', a brilliant, supportive, and sharp AI career assistant integrated into the AI Career Counselor platform.
Your goal is to provide concise, direct, and actionable advice regarding resume building, technical preparation, coding interviews, and upskilling tracks. Keep responses short and use bolding for emphasis.
`;

  let formattedHistory = [];
  if (history && history.length > 0) {
    const startingIndex = history[0].sender === "bot" ? 1 : 0;
    formattedHistory = history.slice(startingIndex).map(msg => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction });
    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(message);
    const responseText = await result.response.text();
    return res.status(200).json({ success: true, response: responseText });
  } catch (error) {
    if (error.status === 429 || error.status === 503) {
      try {
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite", systemInstruction });
        const fallbackChat = fallbackModel.startChat({ history: formattedHistory });
        const fallbackResult = await fallbackChat.sendMessage(message);
        return res.status(200).json({ success: true, response: await fallbackResult.response.text() });
      } catch (fErr) {
        return res.status(429).json({ success: false, message: "AI services busy." });
      }
    }
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});


// --- REWRITTEN RESUME ANALYZER ROUTE WITH MULTER & PDF-PARSE ---
router.post("/analyze-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file detected in upload stream matrix." });
    }

    const { jobDescription } = req.body;

    let resumeTextContent = "";

    if (req.file.mimetype === "application/pdf") {
      const parsedPdf = await pdfParse(req.file.buffer);
      resumeTextContent = parsedPdf.text;
    } else {
      resumeTextContent = req.file.buffer.toString("utf-8");
    }

    if (!resumeTextContent || !resumeTextContent.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "The uploaded file appears to be empty or contains unscannable image layers." 
      });
    }

    let targetContext = "";
    if (jobDescription && jobDescription.trim()) {
      targetContext = `Target Job Description Context:\n${jobDescription.trim()}\n\nEvaluate the resume specifically against this Job Description for semantic alignment and keyword matching.`;
    } else {
      targetContext = `Evaluate the resume against general industry standards for the candidate's field (e.g. software engineering, data science, web development).`;
    }

    const prompt = `
You are an expert technical recruiter and ATS screening engine. 
Analyze the provided resume context thoroughly.
${targetContext}

You MUST format your response string so that it contains the following metadata headers at the very start:
1. An exact numerical score between 0 and 100 based on its keyword performance matching, formatted EXACTLY like this: [SCORE: 75]
2. A list of key technical skills found in the resume, formatted EXACTLY like this: [PRESENT_KEYWORDS: python, pytorch, machine learning, sql]
3. A list of missing core keywords or recommended skills that are standard for this target role, formatted EXACTLY like this: [MISSING_KEYWORDS: docker, kubernetes, aws, dvc]

Following those metadata lines, output your detailed professional feedback, key gap analysis, and formatting optimization guidelines using standard markdown text.

Resume Content Matrix:
${resumeTextContent}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    return res.status(200).json({ success: true, analysis: responseText });
    
  } catch (error) {
    console.error("Resume parsing engine failure:", error);
    
    if (error.status === 429 || error.status === 503) {
      try {
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        
        let fallbackText = "";
        if (req.file.mimetype === "application/pdf") {
          const parsedPdfFallback = await pdfParse(req.file.buffer).catch(() => ({ text: "" }));
          fallbackText = parsedPdfFallback.text;
        } else {
          fallbackText = req.file.buffer.toString("utf-8");
        }

        const result = await fallbackModel.generateContent(`[SCORE: 60]\n[PRESENT_KEYWORDS: python, pandas]\n[MISSING_KEYWORDS: pytorch]\nFallback processing activated. Here is an evaluation of the document context:\n${fallbackText}`);
        return res.status(200).json({ success: true, analysis: await result.response.text() });
      } catch (fallbackError) {
        return res.status(429).json({ success: false, message: "AI compute quota exhausted on all clusters." });
      }
    }
    
    return res.status(500).json({ success: false, message: "Server configuration mapping error." });
  }
});


// --- NEW: CAREER QUIZ ADVICE ENDPOINT WITH FULL GRACEFUL FALLBACKS ---
router.post("/career-advice", async (req, res) => {
  const { answers } = req.body;

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ success: false, message: "Invalid or missing quiz answers array." });
  }

  const prompt = `
You are an elite, supportive technical career counselor specializing in Data Science, Analytics, and AI/ML domains.
Analyze these user responses to a specialized Data Science & AI-ML career quiz and provide clear, direct guidance on the optimal career niches.
List 2 optimal career paths within the Data Science, Analytics, and AI/ML space (e.g. Machine Learning Engineer, MLOps Engineer, Data Scientist, Data Engineer, GenAI Developer, Data Analyst) that match these choices, along with a 2-sentence explanation of why they fit.
Keep your output cleanly structured using standard Markdown layout syntax.

User Quiz Answers Matrix:
1. Technical Area of Excitement: ${answers[0]}
2. Mathematical & Statistical Comfort: ${answers[1]}
3. Preferred Programming Language/Toolkit: ${answers[2]}
4. Problem Solving Style: ${answers[3]}
5. Model Training vs Application Dev: ${answers[4]}
6. Workflow Step Excitement: ${answers[5]}
7. Preferred Projects: ${answers[6]}
8. Core Motivator: ${answers[7]}
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    return res.status(200).json({ success: true, response: responseText });
  } catch (error) {
    console.error("Quiz evaluation failure log:", error);

    if (error.status === 429 || error.status === 503) {
      try {
        console.warn("⚠️ Main engine bottleneck. Switching quiz analytics processing to gemini-2.5-flash-lite backup tier...");
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const fallbackResult = await fallbackModel.generateContent(prompt);
        const fallbackText = await fallbackResult.response.text();
        return res.status(200).json({ success: true, response: fallbackText });
      } catch (fallbackError) {
        return res.status(429).json({ success: false, message: "AI compute quota exhausted on all clusters." });
      }
    }

    return res.status(500).json({ success: false, message: "Internal analysis engine configuration error." });
  }
});

// --- NEW: DATA SCIENCE & AI-ML PROJECT BLUEPRINT BUILDER ---
router.post("/project-blueprint", async (req, res) => {
  const { niche, complexity, tools } = req.body;

  if (!niche || !complexity) {
    return res.status(400).json({ success: false, message: "Niche area and complexity level are required." });
  }

  const prompt = `
You are an elite AI-ML Architect and Senior Data Scientist.
Create a detailed, production-grade project blueprint for a candidate's portfolio.

Target Profile Parameters:
- Domain Niche: ${niche}
- Complexity Level: ${complexity}
- Specific Tools Requested: ${tools || "Any relevant industry-standard libraries (PyTorch, TensorFlow, Scikit-learn, HuggingFace, Docker, etc.)"}

Format your output strictly using markdown h3 elements (###) for headers. Follow this structure precisely:

### Project Title
(Provide a catchy, industry-realistic title for the project)

### 1. Business Problem & Objective
(Explain in 3 sentences the real-world value of this project and what problem it solves.)

### 2. Dataset Recommendations
(Recommend 1-2 specific public datasets, e.g. Kaggle datasets, UCI ML repository, or Hugging Face datasets. Describe what files/features are needed.)

### 3. Production Architecture & Tech Stack
(Describe the data pipeline, training setup, model hosting API, containerization, and monitoring setup. List PyTorch/Scikit-learn, FastAPI, Docker, MLflow, etc.)

### 4. Step-by-Step Implementation Milestone Map
* **Milestone 1 (Data Prep & EDA):** (Actionable tasks)
* **Milestone 2 (Modeling & Evaluation):** (Training loop, metrics)
* **Milestone 3 (Deployment & MLOps):** (API, containerization)

### 5. Advanced Portfolio Interview Talking Points
* (Provide 2 challenging technical issues or trade-offs that candidate can discuss in interviews to prove deep domain expertise, e.g. dealing with class imbalance or low latency hosting.)
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 8192, temperature: 0.5 }
    });

    const responseText = await result.response.text();
    return res.status(200).json({ success: true, blueprint: responseText });
  } catch (error) {
    console.error("Project blueprint generation failed:", error);
    if (error.status === 429 || error.status === 503) {
      try {
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const fallbackResult = await fallbackModel.generateContent(prompt);
        return res.status(200).json({ success: true, blueprint: await fallbackResult.response.text() });
      } catch (fErr) {
        return res.status(429).json({ success: false, message: "AI services busy." });
      }
    }
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;