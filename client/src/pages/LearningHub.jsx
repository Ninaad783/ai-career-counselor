import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; 
import API from "../services/api";
import ReactMarkdown from "react-markdown";
import { FaGraduationCap, FaPaperPlane, FaBookmark, FaCheck, FaInbox, FaArrowLeft } from "react-icons/fa";
import { useToast } from "../context/ToastContext";

const LearningHub = () => {
  const location = useLocation(); 
  const navigate = useNavigate();
  const toast = useToast();
  
  const [topic, setTopic] = useState("");
  const [roadmap, setRoadmap] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState(null);
  const [completedItems, setCompletedItems] = useState({});

  const toggleItem = (itemText) => {
    setCompletedItems((prev) => ({
      ...prev,
      [itemText]: !prev[itemText]
    }));
  };

  // Hook 1: Handle User Authenticated Token Initialization Once on Mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed._id) setUserId(parsed._id);
      else if (parsed.id) setUserId(parsed.id);
    }
  }, []);

  // Hook 2: Isolate, Listen, and Correctly Bind Incoming MongoDB Document Objects
  useEffect(() => {
    if (location.state && location.state.savedRoadmap) {
      const targetMap = location.state.savedRoadmap;
      
      // 1. Force state input field alignment strings
      if (targetMap.topic) {
        setTopic(targetMap.topic);
      }
      
      // 2. Strict Casing Fallback Selector: Reads roadmapData (matches your Atlas collection) or roadmap
      const exactContent = targetMap.roadmapData || targetMap.roadmap;
      if (exactContent) {
        setRoadmap(exactContent);
        setSaved(true); // Lock the action state to avoid accidental duplicate saves
      }
    }
  }, [location.state]); 

  // Native modal triggers replaced with global toast hook

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    try {
      setLoading(true);
      setRoadmap("");
      setSaved(false);
      const res = await API.post("/learning/roadmap", { topic });
      if (res.data.success) {
        setRoadmap(res.data.roadmap);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to compile custom technical syllabus. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoadmap = async () => {
    if (!userId) {
      toast.warning("Active session token invalid. Please log in again.");
      return;
    }

    try {
      setSaveLoading(true);
      const res = await API.post("/learning/save", {
        userId,
        topic,
        roadmapData: roadmap, // Sends the correct schema field value down to Node.js
      });

      if (res.data.success) {
        setSaved(true);
        toast.success(`"${topic}" roadmap has been successfully locked into your profile archive!`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Database storage mapping failed. Check connection strings.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white px-6 py-12 flex flex-col items-center justify-center selection:bg-indigo-500/30 gap-6 relative">
      
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

      <div className="max-w-4xl w-full mx-auto bg-white/[0.02] border border-white/10 rounded-[32px] p-8 md:p-12 backdrop-blur-2xl shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text mb-3">
            AI Learning Hub
          </h1>
          <p className="text-gray-400 text-base md:text-lg font-light max-w-xl mx-auto">
            Input any framework, technology, or computer science domain to spin up an interactive learning path.
          </p>
        </div>

        <form onSubmit={handleGenerateRoadmap} className="flex gap-4 max-w-2xl mx-auto mb-6">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Next.js Microservices, Docker & Kubernetes..."
            className="flex-1 p-4 rounded-xl bg-white/[0.03] border border-white/10 text-gray-200 placeholder-gray-500 text-lg focus:outline-none focus:border-indigo-500/50 transition-all focus:ring-1 focus:ring-indigo-500/20"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40 shadow-lg shadow-indigo-500/10 cursor-pointer"
          >
            {loading ? "Planning..." : "Build Path"}
            <FaPaperPlane className="text-xs" />
          </button>
        </form>

        <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto mb-12">
          <span className="text-xs text-gray-500 flex items-center">Quick AI-ML Templates:</span>
          {[
            "Generative AI & LLMs",
            "Deep Learning with PyTorch",
            "MLOps & Model Deployment Pipelines",
            "Big Data Engineering with Spark"
          ].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setTopic(tag)}
              className="text-xs px-2.5 py-1 rounded-full bg-white/[0.02] border border-white/5 text-gray-400 hover:text-white hover:border-indigo-500/30 transition-all cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>

        {roadmap && (
          <div className="border-t border-white/10 pt-8 transition-all">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-indigo-400 flex items-center gap-2">
                <FaGraduationCap /> Your Tailored Roadmap
              </h2>
              
              <button
                onClick={handleSaveRoadmap}
                disabled={saveLoading || saved}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-300 active:scale-95 ${
                  saved 
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                    : "bg-white/[0.03] border-white/10 hover:border-purple-500/30 hover:bg-white/[0.06] text-gray-200"
                }`}
              >
                {saved ? <FaCheck /> : <FaBookmark />}
                <span>{saved ? "Saved to Dashboard" : saveLoading ? "Securing..." : "Save Roadmap"}</span>
              </button>
            </div>

            <div className="max-h-[550px] overflow-y-auto pr-2 text-gray-300 leading-relaxed space-y-4 bg-white/[0.01] border border-white/5 p-6 rounded-2xl backdrop-blur-sm">
              <ReactMarkdown
                components={{
                  h3: ({ node, ...props }) => (
                    <h3 className="text-xl font-bold text-purple-400 mt-6 mb-2 tracking-wide border-b border-white/5 pb-1" {...props} />
                  ),
                  p: ({ node, ...props }) => <p className="mb-4 text-gray-200 text-lg font-normal leading-relaxed" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-none pl-1 mb-4 space-y-3 text-gray-400" {...props} />,
                  li: ({ node, children, ...props }) => {
                    const getCleanText = (c) => {
                      if (!c) return "";
                      if (typeof c === "string") return c;
                      if (Array.isArray(c)) return c.map(getCleanText).join("");
                      if (c.props && c.props.children) return getCleanText(c.props.children);
                      return "";
                    };
                    const textContent = getCleanText(children);
                    const isChecked = !!completedItems[textContent];
                    return (
                      <li className="flex items-start gap-3 my-3 text-base md:text-lg text-gray-200" {...props}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleItem(textContent)}
                          className="mt-1.5 w-5 h-5 rounded border-white/15 bg-white/[0.04] text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer flex-shrink-0"
                        />
                        <span className={`transition-all duration-150 flex-1 text-left ${isChecked ? "line-through text-gray-500 opacity-60" : ""}`}>
                          {children}
                        </span>
                      </li>
                    );
                  },
                  strong: ({ node, ...props }) => <strong className="font-semibold text-white bg-white/10 px-1.5 py-0.5 rounded" {...props} />,
                }}
              >
                {roadmap}
              </ReactMarkdown>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LearningHub;