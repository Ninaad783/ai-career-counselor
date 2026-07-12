import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
// Added FaTrashAlt to our explicit layout icons bundle
import { FaBrain, FaFileAlt, FaUserTie, FaGraduationCap, FaBookmark, FaChevronRight, FaTrashAlt, FaLaptopCode, FaArrowLeft } from "react-icons/fa";
import { useToast } from "../context/ToastContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [username, setUsername] = useState("User");
  const [userId, setUserId] = useState(null);
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const currentId = parsedUser._id || parsedUser.id;
        setUserId(currentId);

        if (parsedUser.name) setUsername(parsedUser.name);
        else if (parsedUser.username) setUsername(parsedUser.username);
      }
    } catch (error) {
      console.error("Failed to parse local auth context data:", error);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchSavedRoadmaps = async () => {
      try {
        const res = await API.get(`/learning/user/${userId}`);
        if (res.data.success) {
          setSavedRoadmaps(res.data.roadmaps);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSavedRoadmaps();
  }, [userId]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [roadmapToDelete, setRoadmapToDelete] = useState(null);

  // Handler function to process individual MongoDB collection removals
  const handleDeleteRoadmap = (e, roadmapId) => {
    e.stopPropagation(); // Stops the event from bubbling up and clicking the parent card navigate redirect!
    setRoadmapToDelete(roadmapId);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!roadmapToDelete) return;
    try {
      const res = await API.delete(`/learning/delete/${roadmapToDelete}`);
      if (res.data.success) {
        // Cleanly slice out the item from state array to update UI without browser refreshes
        setSavedRoadmaps((prev) => prev.filter((map) => map._id !== roadmapToDelete));
        toast.success("Saved learning track successfully removed.");
      }
    } catch (err) {
      console.error("Failed to delete roadmap:", err);
      toast.error("Error deleting track from database.");
    } finally {
      setShowConfirmModal(false);
      setRoadmapToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white px-6 pt-28 pb-12 flex flex-col items-center justify-center selection:bg-indigo-500/30 gap-6">
      
      {/* Back Button */}
      <div className="max-w-5xl w-full flex justify-start">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-gray-300 hover:text-white text-xs font-semibold hover:bg-white/[0.07] active:scale-95 transition-all cursor-pointer"
        >
          <FaArrowLeft />
          <span>Back to Landing</span>
        </button>
      </div>

      <div className="max-w-5xl w-full mx-auto bg-white/[0.02] border border-white/10 rounded-[32px] p-8 md:p-12 backdrop-blur-2xl shadow-2xl flex flex-col gap-10 relative overflow-hidden">
        
        {/* HERO HEADER */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight capitalize leading-tight">
            Welcome, <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">{username}</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
            Discover your perfect career path with AI-powered guidance, resume refinement, interactive interview simulations, and tailored learning roadmaps.
          </p>
        </div>

        {/* SAVED ROADMAPS HISTORICAL PILLS PANEL (WITH INTEGRATED DELETE ACTION RULES) */}
        {savedRoadmaps.length > 0 && (
          <div className="w-full max-w-3xl mx-auto border border-white/5 bg-white/[0.01] rounded-2xl p-5 backdrop-blur-sm transition-all">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-2 mb-4">
              <FaBookmark className="text-xs" />
              <span>Your Saved Learning Tracks ({savedRoadmaps.length})</span>
            </h4>
            <div className="flex flex-wrap gap-3">
              {savedRoadmaps.map((map) => (
                <div
                  key={map._id}
                  onClick={() => navigate("/learning-hub", { state: { savedRoadmap: map } })}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm bg-white/[0.03] border border-white/10 hover:border-purple-500/30 hover:bg-white/[0.06] text-gray-300 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <span className="capitalize tracking-wide">{map.topic}</span>
                  
                  {/* Action Segment Frame */}
                  <div className="flex items-center gap-2 border-l border-white/10 pl-2">
                    <FaTrashAlt 
                      onClick={(e) => handleDeleteRoadmap(e, map._id)}
                      className="text-xs text-gray-500 hover:text-red-400 transition-colors duration-200 p-0.5"
                      title="Remove this track"
                    />
                    <FaChevronRight className="text-[10px] text-gray-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INTERACTIVE ACTION BUTTONS ROW */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 my-2">
          <button
            onClick={() => navigate("/quiz")}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold bg-white text-black hover:bg-gray-100 active:scale-[0.98] transition-all duration-200 shadow-xl cursor-pointer"
          >
            <FaBrain className="text-lg text-indigo-600" />
            <span>Start Career Quiz</span>
          </button>

          <button
            onClick={() => navigate("/resume-analyzer")}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold bg-white/[0.03] border border-white/10 hover:bg-white/[0.07] active:scale-[0.98] transition-all duration-200 shadow-xl cursor-pointer"
          >
            <FaFileAlt className="text-lg text-purple-400" />
            <span>Resume Analyzer</span>
          </button>

          <button
            onClick={() => navigate("/interview-prep")}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold bg-white/[0.03] border border-white/10 hover:bg-white/[0.07] active:scale-[0.98] transition-all duration-200 shadow-xl cursor-pointer"
          >
            <FaUserTie className="text-lg text-pink-400" />
            <span>AI Interview Prep</span>
          </button>

          <button
            onClick={() => navigate("/project-builder")}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold bg-white/[0.03] border border-white/10 hover:bg-white/[0.07] active:scale-[0.98] transition-all duration-200 shadow-xl cursor-pointer"
          >
            <FaLaptopCode className="text-lg text-emerald-400" />
            <span>AI-ML Project Builder</span>
          </button>

          <button
            onClick={() => navigate("/learning-hub")}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-95 active:scale-[0.98] transition-all duration-200 shadow-xl shadow-indigo-500/10 border border-white/10 cursor-pointer"
          >
            <FaGraduationCap className="text-lg" />
            <span>AI Learning Hub</span>
          </button>
        </div>

        {/* BOTTOM ECOSYSTEM FEATURE MATRIX ARCHITECTURE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
          <div 
            onClick={() => navigate("/quiz")}
            className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 hover:border-indigo-500/20 transition-all duration-300 cursor-pointer hover:bg-white/[0.02]"
          >
            <h3 className="text-xl font-bold mb-2 text-indigo-400">AI Guidance</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              Personalized AI career suggestions and algorithmic tracking based on your technical interests and skill profiles.
            </p>
          </div>

          <div 
            onClick={() => navigate("/resume-analyzer")}
            className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 hover:border-purple-500/20 transition-all duration-300 cursor-pointer hover:bg-white/[0.02]"
          >
            <h3 className="text-xl font-bold mb-2 text-purple-400">Resume Analysis</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              Upload your portfolio resume to calculate live industry ATS keyword optimization matching and scoring matrices.
            </p>
          </div>

          <div 
            onClick={() => navigate("/project-builder")}
            className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 hover:border-emerald-500/20 transition-all duration-300 cursor-pointer hover:bg-white/[0.02]"
          >
            <h3 className="text-xl font-bold mb-2 text-emerald-400">AI-ML Projects</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              Build custom Data Science & AI-ML portfolio project blueprints with dataset recommendations and MLOps milestones.
            </p>
          </div>

          <div 
            onClick={() => navigate("/learning-hub")}
            className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 hover:border-pink-500/20 transition-all duration-300 cursor-pointer hover:bg-white/[0.02]"
          >
            <h3 className="text-xl font-bold mb-2 text-pink-400">Career Roadmap</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              Train interactively against field-mapped tech stack modules to generate granular, time-based upskilling roadmaps.
            </p>
          </div>
        </div>

      {/* MODERN GLASSMORPHIC CONFIRM MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0b0f24] border border-white/10 rounded-[24px] p-6 max-w-sm w-full mx-4 shadow-2xl text-center flex flex-col gap-6 animate-scaleIn">
            <h3 className="text-xl font-bold text-gray-100">Delete Roadmap?</h3>
            <p className="text-sm text-gray-400 font-light leading-relaxed">
              Are you sure you want to remove this saved learning track? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setShowConfirmModal(false); setRoadmapToDelete(null); }}
                className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 text-sm font-bold text-white hover:bg-rose-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default Dashboard;