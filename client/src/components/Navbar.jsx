import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("User");

  const currentPath = location.pathname.toLowerCase().replace(/\/$/, "");

  const isLandingPage = currentPath === "" || currentPath === "/";
  const isAuthPage = currentPath === "/login" || currentPath === "/signup" || currentPath === "/register";
  const isPublicZone = isLandingPage || isAuthPage;

  const hideMiddleNavPaths = ["/resume-analyzer", "/quiz", "/interview-prep", "/learning-hub", "/project-builder"];
  const shouldMinimize = hideMiddleNavPaths.includes(location.pathname);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setIsLoggedIn(true);
        setUsername(parsed.name || parsed.username || "User");
      } catch (e) {
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [location]);

  const initialLetter = username.charAt(0).toUpperCase();

  return (
    <nav className="fixed top-0 left-0 w-full z-40 bg-[#050816]/80 backdrop-blur-md border-b border-white/5 py-4 px-6">
      {/* DYNAMIC LAYOUT: Switches flex-justify to center when on auth forms */}
      <div className={`max-w-3xl w-full mx-auto flex items-center ${isAuthPage ? "justify-center" : "justify-between"}`}>
        
        {/* BRANDING LOGO */}
        <div 
          onClick={() => navigate(isLoggedIn ? "/dashboard" : "/")} 
          className="text-xl font-black bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text cursor-pointer hover:opacity-90 transition-all tracking-tight"
        >
          AI Career Counselor
        </div>

        {/* MIDDLE NAV LINKS - Hidden on public landing and auth forms */}
        {isLoggedIn && !shouldMinimize && !isPublicZone && (
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400 animate-fadeIn">
            <button onClick={() => navigate("/dashboard")} className={`hover:text-white transition-colors ${location.pathname === "/dashboard" ? "text-white" : ""}`}>
              Dashboard
            </button>
            <button onClick={() => navigate("/quiz")} className={`hover:text-white transition-colors ${location.pathname === "/quiz" ? "text-white" : ""}`}>
              Quiz
            </button>
            <button onClick={() => navigate("/resume-analyzer")} className={`hover:text-white transition-colors ${location.pathname === "/resume-analyzer" ? "text-white" : ""}`}>
              Resume ATS
            </button>
            <button onClick={() => navigate("/project-builder")} className={`hover:text-white transition-colors ${location.pathname === "/project-builder" ? "text-white" : ""}`}>
              Project Builder
            </button>
            <button onClick={() => navigate("/learning-hub")} className={`hover:text-white transition-colors ${location.pathname === "/learning-hub" ? "text-white" : ""}`}>
              Learning Hub
            </button>
          </div>
        )}

        {/* RIGHT ACTION SEGMENT */}
        {(() => {
          if (isAuthPage) return null; // Render absolutely nothing to preserve pure central alignment

          if (isLoggedIn && !isLandingPage) {
            return (
              <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 px-4 py-1.5 rounded-full shadow-inner animate-fadeIn">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
                  {initialLetter}
                </div>
                <span className="text-xs font-semibold tracking-wide text-gray-200 capitalize hidden sm:inline">
                  {username}
                </span>
              </div>
            );
          }

          return (
            <button 
              onClick={() => navigate("/login")}
              className="text-xs font-bold bg-white text-black px-4 py-2 rounded-xl hover:bg-gray-200 transition-all active:scale-95 cursor-pointer shadow-md"
            >
              Get Started
            </button>
          );
        })()}

      </div>
    </nav>
  );
};

export default Navbar;