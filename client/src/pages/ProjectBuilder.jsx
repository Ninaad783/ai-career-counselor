import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import ReactMarkdown from "react-markdown";
import { FaLaptopCode, FaCheck, FaExclamationCircle, FaBrain, FaWrench, FaFolderOpen, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { useToast } from "../context/ToastContext";

const ProjectBuilder = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [niche, setNiche] = useState("Computer Vision");
  const [complexity, setComplexity] = useState("Intermediate / Applied Industry");
  const [tools, setTools] = useState("");
  const [blueprint, setBlueprint] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setBlueprint("");
      toast.info("Assembling project architecture blueprint...");

      const res = await API.post("/ai/project-blueprint", {
        niche,
        complexity,
        tools,
      });

      if (res.data.success) {
        setBlueprint(res.data.blueprint);
        toast.success("AI-ML Project Blueprint generated!");
      } else {
        toast.error("Failed to generate blueprint. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Connection failure with project builder engine.");
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-400 text-transparent bg-clip-text mb-3">
            AI-ML Portfolio Project Builder
          </h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto font-light">
            Specify parameters to generate a production-grade, step-by-step portfolio project blueprint including architectures, datasets, and talking points.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="max-w-2xl mx-auto space-y-6 mb-10 bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">
                Domain Niche Specialization
              </label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#0a0f24]/50 border border-white/10 text-gray-300 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all cursor-pointer"
              >
                {["Computer Vision", "Natural Language Processing (NLP)", "Tabular Machine Learning", "Generative AI & LLMs", "Time Series & Forecasting", "MLOps & Deployments"].map((n) => (
                  <option key={n} value={n} className="bg-[#0a0f24] text-gray-300">
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">
                Complexity Profile
              </label>
              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#0a0f24]/50 border border-white/10 text-gray-300 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all cursor-pointer"
              >
                {["Beginner / Portfolio Starter", "Intermediate / Applied Industry", "Advanced / Research & MLOps scale"].map((c) => (
                  <option key={c} value={c} className="bg-[#0a0f24] text-gray-300">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">
              Preferred Technologies & Frameworks (Optional)
            </label>
            <input
              type="text"
              value={tools}
              onChange={(e) => setTools(e.target.value)}
              placeholder="e.g. PyTorch, Hugging Face, MLflow, Docker, FastAPI"
              className="w-full p-4 rounded-xl bg-[#0a0f24]/30 border border-white/10 text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all duration-200"
              disabled={loading}
            />
          </div>

          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 font-bold text-sm tracking-wide shadow-lg hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center gap-2 mx-auto disabled:opacity-40"
            >
              {loading ? "Constructing Architecture..." : "Generate Project Blueprint"}
              <FaArrowRight className="text-xs" />
            </button>
          </div>
        </form>

        {blueprint && (
          <div className="border-t border-white/10 pt-8 animate-fadeIn text-left">
            <h3 className="text-2xl font-bold text-purple-400 mb-6 flex items-center gap-2">
              <FaLaptopCode /> Project Blueprint Spec
            </h3>
            <div className="max-h-[600px] overflow-y-auto bg-white/[0.01] border border-white/5 p-6 md:p-8 rounded-2xl text-gray-300 leading-relaxed font-light space-y-4 custom-scrollbar">
              <ReactMarkdown
                components={{
                  h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-indigo-400 mt-6 mb-3 tracking-wide border-b border-white/5 pb-1.5 first:mt-0" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-4 text-sm text-gray-400 leading-relaxed" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-2 text-gray-400" {...props} />,
                  li: ({ node, ...props }) => <li className="text-sm text-gray-300" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-semibold text-white bg-white/10 px-1.5 py-0.5 rounded" {...props} />,
                }}
              >
                {blueprint}
              </ReactMarkdown>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProjectBuilder;
