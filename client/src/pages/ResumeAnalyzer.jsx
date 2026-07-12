import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import ReactMarkdown from "react-markdown";
import { FaFileAlt, FaCloudUploadAlt, FaRobot, FaCheckCircle, FaExclamationCircle, FaCheck, FaTimes, FaArrowLeft } from "react-icons/fa";
import { useToast } from "../context/ToastContext";

const ResumeAnalyzer = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upload"); // upload vs sandbox
  const [resumeText, setResumeText] = useState("");
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [atsScore, setAtsScore] = useState(null); 
  const [presentKeywords, setPresentKeywords] = useState([]);
  const [missingKeywords, setMissingKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResumeText("");
      setStatusMessage(`File loaded: ${e.target.files[0].name}`);
      setIsError(false);
      // Reset past runs cleanly on new file drop
      setAnalysis("");
      setAtsScore(null);
      setPresentKeywords([]);
      setMissingKeywords([]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    if (activeTab === "upload") {
      if (!file) {
        toast.warning("Please upload a file first!");
        return;
      }
      formData.append("resume", file);
    } else {
      if (!resumeText.trim()) {
        toast.warning("Please enter or paste your resume text first!");
        return;
      }
      const fileBlob = new Blob([resumeText], { type: "text/plain" });
      formData.append("resume", fileBlob, "resume.txt");
    }
    formData.append("jobDescription", jobDescription);

    try {
      setLoading(true);
      setAnalysis("");
      setAtsScore(null);
      setPresentKeywords([]);
      setMissingKeywords([]);
      setStatusMessage("Uploading document context to security matrix...");
      setIsError(false);

      const res = await API.post("/ai/analyze-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      let rawResponse = res.data.analysis || "";

      // Regex parser: Searches for the structure [SCORE: XX]
      const scoreMatch = rawResponse.match(/\[SCORE:\s*(\d+)\]/i);
      if (scoreMatch) {
        setAtsScore(parseInt(scoreMatch[1]));
        rawResponse = rawResponse.replace(/\[SCORE:\s*\d+\]/i, "").trim();
      }

      // Parse present keywords
      const presentMatch = rawResponse.match(/\[PRESENT_KEYWORDS:\s*([^\]]+)\]/i);
      if (presentMatch) {
        setPresentKeywords(presentMatch[1].split(",").map(s => s.trim()).filter(Boolean));
        rawResponse = rawResponse.replace(/\[PRESENT_KEYWORDS:\s*[^\]]+\]/i, "").trim();
      }

      // Parse missing keywords
      const missingMatch = rawResponse.match(/\[MISSING_KEYWORDS:\s*([^\]]+)\]/i);
      if (missingMatch) {
        setMissingKeywords(missingMatch[1].split(",").map(s => s.trim()).filter(Boolean));
        rawResponse = rawResponse.replace(/\[MISSING_KEYWORDS:\s*[^\]]+\]/i, "").trim();
      }

      if (rawResponse) {
        setAnalysis(rawResponse);
        setStatusMessage("Analysis processing completed successfully.");
        toast.success("Resume analysis complete!");
      } else {
        throw new Error("Empty feedback payload received from the engine.");
      }

    } catch (error) {
      console.error(error);
      setIsError(true);
      const errMsg = error.response?.data?.message || "Failed to analyze resume context.";
      setStatusMessage(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 shadow-emerald-500/10";
    if (score >= 50) return "text-amber-400 border-amber-500/30 shadow-amber-500/10";
    return "text-rose-400 border-rose-500/30 shadow-rose-500/10";
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white px-6 pt-28 pb-12 flex flex-col items-center justify-center selection:bg-indigo-500/30 gap-6">
      
      {/* Back Button */}
      <div className="max-w-4xl w-full flex justify-start">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-gray-300 hover:text-white text-xs font-semibold hover:bg-white/[0.07] active:scale-95 transition-all cursor-pointer"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>
      </div>

      <div className="max-w-4xl w-full mx-auto bg-white/[0.02] border border-white/10 rounded-[32px] p-8 md:p-12 backdrop-blur-2xl shadow-2xl">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 text-transparent bg-clip-text mb-3">
            AI Resume ATS Analyzer
          </h1>
          <p className="text-gray-400 text-base max-w-lg mx-auto font-light">
            Drop your portfolio resume to run real-time industry compliance matching and algorithmic scoring profiles.
          </p>
        </div>

        {/* TABS CONTROLLERS */}
        <div className="flex gap-4 justify-center mb-8 max-w-xl mx-auto border-b border-white/5 pb-4">
          <button
            type="button"
            onClick={() => { setActiveTab("upload"); setAnalysis(""); setAtsScore(null); }}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
              activeTab === "upload"
                ? "bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            Upload Document
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("sandbox"); setAnalysis(""); setAtsScore(null); }}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
              activeTab === "sandbox"
                ? "bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            Resume Text Sandbox
          </button>
        </div>

        <form onSubmit={handleUpload} className="max-w-xl mx-auto space-y-6 mb-8">
          {activeTab === "upload" ? (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 rounded-2xl bg-white/[0.01] hover:bg-white/[0.02] transition-all relative group">
              <input 
                type="file" 
                onChange={handleFileChange} 
                accept=".pdf,.docx,.txt" 
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                disabled={loading} 
              />
              <FaCloudUploadAlt className="text-4xl text-purple-400 mb-3 group-hover:scale-110 transition-transform duration-200" />
              <p className="text-sm text-gray-300 font-medium">
                {file ? `Selected: ${file.name}` : "Drag and drop your file here, or click to browse"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Supports PDF, DOCX, TXT formats</p>
            </div>
          ) : (
            <div className="text-left animate-fadeIn">
              <label className="block text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">
                Paste / Edit Your Resume Text
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste or type your raw resume text here..."
                rows={10}
                disabled={loading}
                className="w-full p-5 rounded-2xl bg-[#0a0f24]/30 border border-white/10 text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all duration-200 resize-none leading-relaxed"
              />
            </div>
          )}

          <div className="text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">
              Target Job Description (Optional, for JD Keyword Alignment)
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job posting description here to calculate direct alignment matching..."
              rows={4}
              disabled={loading}
              className="w-full p-4 rounded-xl bg-[#0a0f24]/30 border border-white/10 text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all duration-200 resize-none leading-relaxed"
            />
          </div>

          {(file || (activeTab === "sandbox" && resumeText.trim())) && (
            <div className="text-center">
              <button 
                type="submit" 
                disabled={loading} 
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 font-bold text-sm tracking-wide shadow-lg hover:opacity-95 active:scale-95 transition-all cursor-pointer"
              >
                {loading ? "Analyzing Matrix..." : "Begin ATS Audit"}
              </button>
            </div>
          )}
        </form>

        {/* LIVE SYSTEM STATUS TRACKER BANNER */}
        {statusMessage && (
          <div className={`max-w-xl mx-auto mb-8 p-3 rounded-xl border text-xs flex items-center gap-2 animate-fadeIn justify-center ${
            isError ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-white/[0.02] border-white/5 text-gray-400"
          }`}>
            {isError ? <FaExclamationCircle /> : loading ? <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /> : <FaCheckCircle className="text-emerald-400" />}
            <span>{statusMessage}</span>
          </div>
        )}

        {/* METRIC SCORE RENDERING DISPLAY ZONE */}
        {atsScore !== null && (
          <div className="flex flex-col items-center justify-center mb-8 animate-scaleIn">
            <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center bg-white/[0.01] shadow-2xl relative ${getScoreColor(atsScore)}`}>
              <span className="text-3xl font-black">{atsScore}%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">ATS Score</span>
            </div>
          </div>
        )}

        {/* KEYWORDS ANALYTICS BADGES */}
        {(presentKeywords.length > 0 || missingKeywords.length > 0) && (
          <div className="max-w-2xl mx-auto mb-10 p-6 border border-white/5 bg-white/[0.01] rounded-2xl animate-fadeIn space-y-4 text-left">
            {presentKeywords.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2.5 flex items-center gap-1.5">
                  <FaCheck className="text-[10px]" /> Present Technical Keywords ({presentKeywords.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {presentKeywords.map((kw, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium capitalize">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {missingKeywords.length > 0 && (
              <div className="border-t border-white/5 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2.5 flex items-center gap-1.5">
                  <FaTimes className="text-[10px]" /> Recommended Missing Keywords ({missingKeywords.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {missingKeywords.map((kw, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-medium capitalize">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {analysis && (
          <div className="border-t border-white/10 pt-8 animate-fadeIn">
            <h3 className="text-2xl font-bold text-purple-400 mb-6 flex items-center gap-2">
              <FaRobot /> Analysis Optimization Feedback
            </h3>
            <div className="max-h-[500px] overflow-y-auto bg-white/[0.01] border border-white/5 p-6 rounded-2xl text-gray-300 leading-relaxed font-light space-y-4 custom-scrollbar">
              <ReactMarkdown
                components={{
                  h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-indigo-400 mt-4 mb-2 tracking-wide border-b border-white/5 pb-1" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-3 text-sm text-gray-400 leading-relaxed" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1.5 text-gray-400" {...props} />,
                  li: ({ node, ...props }) => <li className="text-sm text-gray-300" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-semibold text-white bg-white/10 px-1.5 py-0.5 rounded" {...props} />,
                }}
              >
                {analysis}
              </ReactMarkdown>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ResumeAnalyzer;