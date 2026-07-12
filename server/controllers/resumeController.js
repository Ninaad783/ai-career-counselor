const fs = require("fs");

const pdfParse = require("pdf-parse");

const {
  GoogleGenerativeAI,
} = require("@google/generative-ai");

const genAI =
  new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
  );

const analyzeResume =
  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({

          success: false,

          message:
            "No Resume Uploaded",
        });
      }

      console.log(
        "FILE RECEIVED"
      );

      const dataBuffer =
        fs.readFileSync(
          req.file.path
        );

      const pdfData =
        await pdfParse(
          dataBuffer
        );

      const resumeText =
        pdfData.text;

      console.log(
        "TEXT EXTRACTED"
      );

      const model =
        genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
        });

      const prompt = `

Analyze this resume and provide:

1. ATS Score out of 100
2. Best Career Role
3. Top Skills
4. Missing Skills
5. Resume Strengths
6. Resume Weaknesses
7. Improvement Suggestions

Resume:

${resumeText}

`;

      const result =
        await model.generateContent(
          prompt
        );

      const response =
        result.response.text();

      console.log(
        "AI RESPONSE GENERATED"
      );

      res.json({

        success: true,

        analysis: response,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Resume Analysis Failed",
      });
    }
  };

module.exports = {
  analyzeResume,
};