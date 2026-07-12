import { Link } from "react-router-dom";
import { Typewriter } from "react-simple-typewriter";

const Home = () => {
  // Smooth scroll handler targeting the details block matrix ID
  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col items-center justify-start px-4 pt-44 pb-20 relative overflow-hidden">
      
      {/* BACKGROUND GRADIENT GLOW FLARES FOR DEPTH STYLE */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* CORE HERO SECTION LANDING INFRASTRUCTURE */}
      <div className="text-center max-w-4xl mx-auto space-y-6 z-10 select-none mb-12">
        
        {/* ANIMATED TYPEWRITER HEADER */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight min-h-[140px] md:min-h-[180px] leading-tight">
          Discover{" "}
          <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-400 text-transparent bg-clip-text">
            <Typewriter
              words={["Your Perfect", "A MERN Stack", "A Cloud Systems", "Your Dream"]}
              loop={0} // 0 means it will loop infinitely
              cursor
              cursorStyle="|"
              typeSpeed={80}
              deleteSpeed={50}
              delaySpeed={1500}
            />
          </span>
          <br />
          Career Path
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed pt-2">
          Personalized AI-powered career guidance, smart roadmaps, resume analysis, and future-ready recommendations.
        </p>

        <div className="flex gap-5 justify-center items-center pt-6">
          <Link
            to="/signup"
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-4 rounded-2xl font-bold shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Start Journey
          </Link>

          {/* UPDATED: Converted Link to structural action button supporting smooth grid anchors */}
          <button
            type="button"
            onClick={scrollToFeatures}
            className="border border-white/10 bg-white/[0.02] text-gray-300 px-8 py-4 rounded-2xl font-bold hover:bg-white/5 hover:text-white active:scale-95 transition-all duration-300 cursor-pointer"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* --- ADDED BRAND FEATURES INTEGRATION DISCLOSURE BLOCK --- */}
      <div 
        id="features" 
        className="max-w-5xl w-full mx-auto px-6 py-20 mt-16 border-t border-white/5 scroll-mt-24 z-10 animate-fadeIn"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text mb-4">
            Engineered to Accelerate Your Career
          </h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto font-light leading-relaxed">
            Explore the core system layers of our AI ecosystem built to scale your tech preparation portfolio loops.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Feature Card 1 */}
          <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm mb-4 group-hover:scale-105 transition-transform duration-200">
              01
            </div>
            <h3 className="text-lg font-bold text-gray-100 mb-2 group-hover:text-purple-400 transition-colors">AI Career Advisor</h3>
            <p className="text-sm text-gray-400 font-light leading-relaxed">
              Complete a localized psychometric evaluation layout track to map options, lock motivators, and receive personalized role tracks.
            </p>
          </div>

          {/* Feature Card 2 */}
          <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm mb-4 group-hover:scale-105 transition-transform duration-200">
              02
            </div>
            <h3 className="text-lg font-bold text-gray-100 mb-2 group-hover:text-indigo-400 transition-colors">ATS Resume Review</h3>
            <p className="text-sm text-gray-400 font-light leading-relaxed">
              Upload compiled PDF records to run strict binary stream text extractions, checking keyword density index metrics instantly.
            </p>
          </div>

          {/* Feature Card 3 */}
          <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-sm mb-4 group-hover:scale-105 transition-transform duration-200">
              03
            </div>
            <h3 className="text-lg font-bold text-gray-100 mb-2 group-hover:text-pink-400 transition-colors">Dynamic Roadmap Hub</h3>
            <p className="text-sm text-gray-400 font-light leading-relaxed">
              Generate customizable development structures powered directly by Gemini LLM vectors and track progress matrices from your cluster.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Home;