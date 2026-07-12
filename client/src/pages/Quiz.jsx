import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useToast } from "../context/ToastContext";
import { FaArrowLeft } from "react-icons/fa";

const questions = [
  {
    question: "Which area of technology excites you the most?",
    options: [
      "Building Predictive Models (ML/AI)",
      "Analyzing Data & Drawing Insights (Data Science)",
      "Creating Scalable Data Pipelines (Data Engineering)",
      "Deploying & Monitoring AI Models (MLOps)",
      "Developing Generative AI/LLM Apps"
    ],
  },
  {
    question: "What is your mathematical and statistical comfort level?",
    options: [
      "I love statistics and probability",
      "I prefer linear algebra and optimization",
      "I like basic statistics but prefer writing code",
      "I prefer avoiding heavy math and focusing on software architecture"
    ],
  },
  {
    question: "Which programming language/toolkit would you prefer to use daily?",
    options: [
      "Python (Pandas, PyTorch, Scikit-learn)",
      "SQL & Big Data Tools (Spark, Snowflake)",
      "JavaScript/Python for building AI APIs and interfaces",
      "Bash, Docker & Cloud Infrastructure (AWS, Terraform)"
    ],
  },
  {
    question: "How do you prefer to solve problems?",
    options: [
      "Experimenting with model architectures and parameters",
      "Cleaning complex datasets and mapping schemas",
      "Writing clean, production-ready pipeline integrations",
      "Visualizing trends and presenting reports to business stakeholders"
    ],
  },
  {
    question: "What is your attitude towards model training vs. application development?",
    options: [
      "I want to train deep learning models",
      "I want to clean data and structure datasets",
      "I want to host models and build automated CI/CD pipelines",
      "I want to build full-stack interfaces powered by LLMs"
    ],
  },
  {
    question: "Which workflow step excites you the most?",
    options: [
      "Feature Engineering & Exploratory Data Analysis (EDA)",
      "Hyperparameter tuning & validation loops",
      "Constructing ETL/ELT pipelines",
      "Model testing, containerization & cloud deployment"
    ],
  },
  {
    question: "What kind of projects do you enjoy building?",
    options: [
      "Neural networks for text/image processing",
      "Interactive dashboards and analytics tools",
      "High-throughput streaming databases",
      "Automated deployment monitoring systems"
    ],
  },
  {
    question: "What is your main motivator in a technical role?",
    options: [
      "Scientific discovery and model optimization",
      "Driving business decisions through data charts",
      "Building bulletproof data infrastructure",
      "Automating AI system operations in production"
    ],
  },
];

const Quiz = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAnswer = (option) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = option;
    setAnswers(updatedAnswers);
  };

  const nextQuestion = () => {
    // GUARD: Ensure user selected an option before proceeding
    if (!answers[currentQuestion]) {
      toast.warning("Please select an option before moving forward.");
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = async () => {
    // GUARD: Verify final question answer exists inside state object matrix
    if (!answers[currentQuestion]) {
      toast.warning("Please select an option before submitting your answers.");
      return;
    }

    // Ensure entire array sequence is complete
    if (answers.length < questions.length || answers.includes(undefined)) {
      toast.error("Some questions were skipped. Please go back and complete all answers.");
      return;
    }

    try {
      setLoading(true);
      
      // Matches your exact backend endpoint handler payload structure matrix
      const res = await API.post("/ai/career-advice", { answers });

      setLoading(false);

      // Transition smoothly over to the calculation result dashboard view panel
      navigate("/result", {
        state: {
          aiResponse: res.data.response,
        },
      });
    } catch (error) {
      setLoading(false);
      console.error("AI Evaluation System Failure:", error);
      toast.error("AI Analysis generation pipeline timed out. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col justify-center items-center p-6 selection:bg-indigo-500/30 gap-6">
      
      {/* Back Button */}
      <div className="w-full max-w-3xl flex justify-start">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-gray-300 hover:text-white text-xs font-semibold hover:bg-white/[0.07] active:scale-95 transition-all cursor-pointer"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 md:p-12 rounded-3xl w-full max-w-3xl shadow-[0_0_40px_rgba(255,255,255,0.05)] relative overflow-hidden">
        
        <h1 className="text-4xl md:text-5xl font-extrabold mb-10 text-center tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
          Career Quiz
        </h1>

        <div className="mb-8">
          <p className="text-gray-400 mb-3 text-sm tracking-wide uppercase font-semibold">
            Question {currentQuestion + 1} / {questions.length}
          </p>
          <progress
            className="w-full h-2 rounded-full overflow-hidden bg-white/10 [&::-webkit-progress-bar]:bg-white/10 [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-indigo-500 [&::-webkit-progress-value]:to-purple-500 transition-all duration-300"
            value={currentQuestion + 1}
            max={questions.length}
          />
        </div>

        <h2 className="text-2xl md:text-3xl mb-10 font-semibold leading-relaxed text-gray-100 min-h-[80px]">
          {questions[currentQuestion].question}
        </h2>

        <div className="flex flex-col gap-4">
          {questions[currentQuestion].options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleAnswer(option)}
              className={`rounded-2xl border px-6 py-4 text-lg font-medium transition-all duration-200 text-left active:scale-[0.99] cursor-pointer ${
                answers[currentQuestion] === option
                  ? "bg-white text-black border-white shadow-[0_0_25px_rgba(255,255,255,0.15)] font-bold pl-8"
                  : "bg-white/[0.02] text-gray-300 border-white/10 hover:bg-white/[0.06] hover:border-white/20"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* CONTROLLER ACTION FOOTER NAVIGATION */}
        <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/5">
          <button
            type="button"
            onClick={prevQuestion}
            disabled={currentQuestion === 0 || loading}
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-20 disabled:pointer-events-none cursor-pointer text-gray-300"
          >
            Previous
          </button>

          {currentQuestion === questions.length - 1 ? (
            <button
              type="button"
              onClick={submitQuiz}
              disabled={loading || !answers[currentQuestion]}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-95 active:scale-95 transition-all duration-200 py-3.5 px-8 rounded-xl text-sm font-bold tracking-wider uppercase shadow-lg shadow-indigo-500/20 disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Profiles...</span>
                </>
              ) : (
                "Submit Evaluation"
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={nextQuestion}
              disabled={!answers[currentQuestion]}
              className="bg-white text-black font-bold text-sm py-3.5 px-8 rounded-xl transition-all duration-200 hover:bg-gray-100 active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-md cursor-pointer"
            >
              Next Question
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Quiz;