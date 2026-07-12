import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import ReactMarkdown from "react-markdown";
import { FaGraduationCap, FaArrowRight, FaCheck, FaRedo, FaArrowLeft, FaVolumeUp, FaMicrophone } from "react-icons/fa";
import { useToast } from "../context/ToastContext";

const InterviewPrep = () => {
  const toast = useToast();
  const navigate = useNavigate();
  
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("setup"); // Stages: setup -> active -> feedback
  const [feedback, setFeedback] = useState("");

  // Narration cleanup on unmount or question step change
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [currentStep, stage]);

  const speakQuestion = () => {
    if ("speechSynthesis" in window) {
      if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(questions[currentStep]);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Text-to-Speech is not supported in this browser.");
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech Recognition is not supported in this browser.");
      return;
    }

    if (listening) {
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setListening(true);
      toast.info("Listening... Speak your answer now.");
    };

    recognition.onerror = (e) => {
      console.error(e);
      setListening(false);
      toast.error("Voice input error. Try again.");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const updated = [...answers];
      updated[currentStep] = updated[currentStep]
        ? `${updated[currentStep]} ${transcript}`.trim()
        : transcript;
      setAnswers(updated);
      toast.success("Voice transcript captured!");
    };

    recognition.start();
  };

  // Handler to call Endpoint 1: Generate Questions
  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!role.trim()) {
      toast.warning("Please specify a target role first!");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/interview/generate", { role });
      
      if (res.data.success && res.data.questions.length > 0) {
        setQuestions(res.data.questions);
        setAnswers(Array(res.data.questions.length).fill(""));
        setStage("active");
        setCurrentStep(0);
        toast.success("Interview questionnaire generated successfully!");
      } else {
        toast.error("Failed to compile custom questions block. Try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not connect to AI generation engines.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (val) => {
    const updated = [...answers];
    updated[currentStep] = val;
    setAnswers(updated);
  };

  const handleNext = async () => {
    if (!answers[currentStep].trim()) {
      toast.warning("Please provide some response observations before advancing.");
      return;
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await handleFinishInterview();
    }
  };

  // Handler to call Endpoint 2: Evaluate Answers
  const handleFinishInterview = async () => {
    try {
      setLoading(true);
      const res = await API.post("/interview/evaluate", {
        role,
        questions,
        answers
      });

      if (res.data.success) {
        setFeedback(res.data.feedback);
        setStage("feedback");
        toast.success("Interview evaluation completed!");
      } else {
        toast.error("Evaluation generation stalled out.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze text response scorecards.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRole("");
    setQuestions([]);
    setAnswers([]);
    setFeedback("");
    setStage("setup");
  };

  const activeProgress = questions.length ? ((currentStep + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#050816] text-white px-6 py-12 flex flex-col items-center justify-center selection:bg-indigo-500/30 gap-6">
      
      {/* Back Button */}
      <div className="max-w-4xl w-full flex justify-start pt-16">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-gray-300 hover:text-white text-xs font-semibold hover:bg-white/[0.07] active:scale-95 transition-all cursor-pointer"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>
      </div>

      <div className="max-w-4xl w-full mx-auto bg-white/[0.02] border border-white/10 rounded-[32px] p-8 md:p-12 backdrop-blur-2xl shadow-2xl relative">
        
        {/* STAGE A: SETUP FORM SCREEN */}
        {stage === "setup" && (
          <div className="text-center py-6">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text mb-4">
              AI Interview Simulation Prep
            </h1>
            <p className="text-gray-400 text-lg font-light max-w-xl mx-auto mb-10">
              Pick your target domain specialization to launch an immersive technical interview checkpoint.
            </p>

            <form onSubmit={handleStartInterview} className="max-w-md mx-auto space-y-6">
              <div className="text-left">
                <label className="block text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                  Target Professional Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., MERN Stack Developer, Java Backend Engineer..."
                  className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 text-gray-200 placeholder-gray-500 text-lg focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200"
                  disabled={loading}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Machine Learning Engineer", "Data Scientist", "MLOps Engineer"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRole(preset)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        role === preset
                          ? "bg-purple-500/20 border-purple-500 text-purple-300 font-medium"
                          : "bg-white/[0.02] border-white/10 text-gray-400 hover:bg-white/[0.05] hover:text-white"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !role.trim()}
                className="w-full py-4 rounded-xl text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-95 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-40"
              >
                {loading ? "Assembling Questionnaire..." : "Generate Interview Questions"}
                <FaArrowRight className="text-xs" />
              </button>
            </form>
          </div>
        )}

        {/* STAGE B: ACTIVE QUESTION SYSTEM WINDOW */}
        {stage === "active" && (
          <div>
            {/* Top Navigation Snapshot */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3 text-sm font-medium text-gray-400 uppercase tracking-wider">
                <span>Active Candidate Assessment</span>
                <span className="text-indigo-400 font-bold">Question {currentStep + 1} of {questions.length}</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full transition-all duration-500 ease-out"
                  style={{ width: `${activeProgress}%` }}
                />
              </div>
            </div>

            {/* Conversational Layout Area */}
            <div className="min-h-[220px] flex flex-col justify-center text-left">
              <div className="flex justify-between items-start gap-4 mb-6">
                <label className="text-2xl md:text-3xl font-extrabold tracking-wide leading-relaxed text-gray-100 flex-1">
                  {questions[currentStep]}
                </label>
                <button
                  type="button"
                  onClick={speakQuestion}
                  className={`p-3.5 rounded-full border transition-all cursor-pointer ${
                    speaking 
                      ? "bg-purple-500/20 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)] animate-pulse"
                      : "bg-white/[0.03] border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.06]"
                  }`}
                  title={speaking ? "Stop Narration" : "Listen to Question"}
                >
                  <FaVolumeUp className="text-lg" />
                </button>
              </div>
              
              <div className="relative">
                <textarea
                  value={answers[currentStep]}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Type or dictate your structured solution parameters or technical analysis responses here..."
                  disabled={loading}
                  rows={5}
                  className="w-full p-5 pr-14 rounded-2xl bg-white/[0.03] border border-white/10 text-gray-200 placeholder-gray-500 text-lg focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200 resize-none leading-relaxed disabled:opacity-40"
                />
                <button
                  type="button"
                  onClick={startListening}
                  className={`absolute right-4 bottom-4 p-3 rounded-xl border transition-all cursor-pointer ${
                    listening
                      ? "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse"
                      : "bg-white/[0.05] border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.1]"
                  }`}
                  title={listening ? "Stop Recording" : "Dictate Answer"}
                >
                  <FaMicrophone className="text-base" />
                </button>
              </div>
            </div>

            {/* Navigation Controller Footers */}
            <div className="mt-10 flex justify-between items-center border-t border-white/5 pt-8">
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                disabled={currentStep === 0 || loading}
                className="text-gray-400 hover:text-white text-lg font-semibold px-4 py-2 transition-colors disabled:opacity-0"
              >
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-95 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <span>Compiling Metrics...</span>
                ) : currentStep === questions.length - 1 ? (
                  <>
                    <span>Submit & Score</span>
                    <FaCheck className="text-xs" />
                  </>
                ) : (
                  <>
                    <span>Next Question</span>
                    <FaArrowRight className="text-xs" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STAGE C: AI SCORECARD REVIEW FEEDBACK */}
        {stage === "feedback" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-white/10 pb-6">
              <div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-pink-400 text-transparent bg-clip-text">
                  Session Evaluation Scorecard
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Target Role Field Mapping: <span className="text-indigo-400 font-semibold">{role}</span>
                </p>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors text-sm font-bold"
              >
                <FaRedo className="text-xs" />
                <span>Restart</span>
              </button>
            </div>

            {/* Structured Markdowns Output Panel */}
            <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4 text-gray-300 leading-relaxed text-base">
              <ReactMarkdown
                components={{
                  h3: ({ node, ...props }) => (
                    <h3 className="text-xl font-bold text-indigo-400 mt-6 mb-2 tracking-wide" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="mb-4 text-gray-400 leading-relaxed" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-5 mb-4 space-y-2 text-gray-400" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="text-gray-300 pl-1" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-semibold text-white bg-white/10 px-1.5 py-0.5 rounded" {...props} />
                  ),
                }}
              >
                {feedback}
              </ReactMarkdown>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InterviewPrep;