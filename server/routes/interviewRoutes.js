const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ENDPOINT 1: Generate 5 custom interview questions based on the chosen role
router.post("/generate", async (req, res) => {
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ success: false, message: "Job role is required." });
  }

  const prompt = `
You are an expert technical interviewer for global tech firms. 
Generate exactly 5 highly realistic, challenging interview questions for a candidate applying for the role of: "${role}".
Mix technical core competency questions with 1 situational behavioral question.

Format your output strictly as a JSON array of strings, containing exactly 5 elements. Do not include markdown code block formatting (like \`\`\`json). Just return the raw JSON array string.
Example Format:
["Question 1...", "Question 2...", "Question 3...", "Question 4...", "Question 5..."]
`;

  try {
    console.log(`Generating interview questions for role: ${role}`);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const textResponse = await result.response.text();
    const questionsArray = JSON.parse(textResponse);
    
    return res.status(200).json({ success: true, questions: questionsArray });

  } catch (error) {
    console.error("Interview generation failed:", error);
    
    // Quota/Traffic Fallback safety switch
    if (error.status === 503 || error.status === 429) {
      try {
        console.warn("Primary model congested. Attempting fallback generation via Lite tier...");
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const fallbackResult = await fallbackModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        });
        const fallbackText = await fallbackResult.response.text();
        return res.status(200).json({ success: true, questions: JSON.parse(fallbackText) });
      } catch (fallbackErr) {
        return res.status(500).json({ success: false, message: "AI generation engines currently busy." });
      }
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ENDPOINT 2: Evaluate the user's answers and generate a full performance scorecard
router.post("/evaluate", async (req, res) => {
  const { role, questions, answers } = req.body;

  let interviewTranscript = "";
  questions.forEach((q, index) => {
    interviewTranscript += `\nQuestion ${index + 1}: ${q}\nCandidate Answer: ${answers[index] || "No answer provided."}\n`;
  });

  const prompt = `
You are a senior technical interviewer evaluating a candidate for the "${role}" position.
Review the following transcript of questions and answers thoroughly:

${interviewTranscript}

Provide an exhaustive diagnostic scorecard using markdown h3 elements (###) for headers. Follow this structure precisely:

### Interview Performance Rating
**Overall Score:** (Provide a score out of 100, e.g., 72/100)
**Summary Persona:** (2 sentences describing their performance demeanor and technical articulation depth)

### 1. Conceptual Technical Strengths
* (Detail what specific answers showed good technical accuracy or strong fundamental engineering logic)

### 2. Core Technical Gaps & Misconceptions
* (Identify flaws, incorrect statements, or shallow answers where they lacked domain depth)

### 3. Structural Question-by-Question Diagnostics
* **Q1 Assessment:** (1 concise sentence grading their first answer)
* **Q2 Assessment:** (1 concise sentence grading their second answer)
* **Q3 Assessment:** (1 concise sentence grading their third answer)
* **Q4 Assessment:** (1 concise sentence grading their fourth answer)
* **Q5 Assessment:** (1 concise sentence grading their fifth answer)

### 4. Roadmap to Ace This Interview
* (Provide 3 actionable upskilling tasks to fix the gaps identified in this session)
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 8192, temperature: 0.4 }
    });

    const evaluationText = await result.response.text();
    return res.status(200).json({ success: true, feedback: evaluationText });

  } catch (error) {
    console.error("Evaluation failed:", error);
    if (error.status === 503 || error.status === 429) {
      try {
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const fallbackResult = await fallbackModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1500, temperature: 0.4 }
        });
        const fallbackText = await fallbackResult.response.text();
        return res.status(200).json({ success: true, feedback: fallbackText });
      } catch (err) {
        return res.status(500).json({ success: false, message: "AI evaluation engines currently busy." });
      }
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;