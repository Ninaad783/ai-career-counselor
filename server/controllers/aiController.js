require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateCareerAdvice = async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Invalid or missing answers array." });
    }

    console.log("Processing answers for career advice...");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are an AI Career Counselor for a specialized website called "AI Career Counselor". Your sole purpose is to analyze user responses and provide professional career guidance, roadmaps, and field-related advice.

CRITICAL INSTRUCTION:
Analyze the following user input. If the input consists of general knowledge questions, casual chitchat, coding requests, or anything entirely unrelated to career counseling, professional choices, or academic fields, do NOT follow the career format below. Instead, respond with a polite, direct message stating exactly what this website is for (e.g., "I can only help you with career counseling, identifying your professional strengths, and building career roadmaps. Please provide career-related information to get started!").

User Input/Answers:
${answers.join(", ")}

If the input IS career-related, give guidance in this exact format. Do not use markdown headers (##).

### Best Career:
(short answer)

### Why This Career Fits:
(3-5 bullet points)

### Skills To Learn:
(5 bullet points)

### Expected Salary In India:
(short answer)

### Career Roadmap:
(step-by-step roadmap)

### Future Scope:
(short paragraph)

Keep response clean, modern, and professional.
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 1700, // Adjusted to 1700 for complete and comprehensive report details
        temperature: 0.4, 
      }
    });
    
    const response = await result.response.text();

    res.json({
      response,
    });

  } catch (error) {
    console.error("BACKEND ERROR:", error);

    if (error.status === 503) {
      return res.status(503).json({
        message: "The AI service is currently experiencing high demand. Please try again in a few moments.",
      });
    }

    res.status(500).json({
      message: "An internal server error occurred while generating career advice.",
    });
  }
};

module.exports = {
  generateCareerAdvice,
};