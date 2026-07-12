import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar"; 
import ChatAssistant from "../components/ChatAssistant"; // 1. Import Nexus Bot

import Home from "../pages/Home";
import Login from "../pages/login";
import Signup from "../pages/signup";
import Dashboard from "../pages/Dashboard";
import Quiz from "../pages/Quiz";
import Result from "../pages/Result";
import ResumeAnalyzer from "../pages/ResumeAnalyzer";
import InterviewPrep from "../pages/InterviewPrep";
import LearningHub from "../pages/LearningHub";
import ProjectBuilder from "../pages/ProjectBuilder";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Navbar /> 
      
      {/* 2. Mount ChatAssistant here so it floats perfectly across the layout */}
      <ChatAssistant /> 
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/result" element={<Result />} />
        <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
        <Route path="/interview-prep" element={<InterviewPrep />} />
        <Route path="/project-builder" element={<ProjectBuilder />} />
        <Route 
          path="/learning-hub" 
          element={<LearningHub key={window.location.pathname + window.location.search} />} 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;