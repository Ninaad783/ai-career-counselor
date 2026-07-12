import axios from "axios";

// Automatically toggles between your local test server and your live Render deployment
const API = axios.create({
  baseURL: import.meta.env.MODE === "production"
    ? "https://ai-career-counselor-backend-ninaad.onrender.com/api"
    : "http://localhost:5000/api"
});

export default API;