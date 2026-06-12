import axios from "axios";
import log from "loglevel";

// 1. Configure the Logger
log.setLevel("info"); // Will print info, warn, and error logs

const API_BASE_URL =
  import.meta.env?.VITE_API_URL ||
  "https://youtube-ai-tutor-backend-vubx.onrender.com/api";

// 2. Create the Base Axios Instance
const apiClient = axios.create({
  baseURL: API_BASE_URL, // Your FastAPI URL
  headers: {
    "Content-Type": "application/json",
  },
});

// 3. The Authentication Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    let token = null;

    // Smart Token Retrieval:
    // Check if we are running in the Chrome Extension or the Web App
    if (typeof chrome !== "undefined" && chrome.storage) {
      // We are in the Chrome Extension
      const result = await chrome.storage.local.get(["jwtToken"]);
      token = result.jwtToken;
    } else if (typeof window !== "undefined") {
      // We are in the normal Web App
      token = localStorage.getItem("jwtToken");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    log.info(`[API CALL] 🚀 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    log.error(`[API ERROR] ❌ Request failed before sending`, error);
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    log.info(
      `[API SUCCESS] ✅ ${response.config.url} - Status: ${response.status}`,
    );
    return response;
  },
  (error) => {
    log.error(
      `[API ERROR] ❌ ${error.response?.config?.url} - Status: ${error.response?.status}`,
    );
    return Promise.reject(error);
  },
);

// 4. Export all our API methods so the UI can use them easily
export const api = {
  // Authentication
  login: (data) => apiClient.post("/auth/login", data),
  register: (data) => apiClient.post("/auth/register", data),

  // Video Processing
  processVideo: (url) => apiClient.post("/video/process", { url }),
  getVideoStatus: (videoId) => apiClient.get(`/video/${videoId}`),

  // Chat & Generation (Create)
  askQuestion: (data) => apiClient.post("/chat/ask", data),
  generateNotes: (videoId) =>
    apiClient.post("/notes/generate", {
      video_id: videoId,
      note_type: "detailed_summary",
    }),
  generateQuiz: (videoId) =>
    apiClient.post("/quiz/generate", {
      video_id: videoId,
      difficulty: "medium",
      question_count: 5,
    }),

  // --- NEW: Dashboard Retrieval (Read) ---
  getNotes: () => apiClient.get("/notes/"),
  getQuizzes: () => apiClient.get("/quiz/"),
  getChatSessions: () => apiClient.get("/chat/sessions"),
  getSessionMessages: (sessionId) =>
    apiClient.get(`/chat/sessions/${sessionId}/messages`),

  // --- NEW: Dashboard Management (Delete) ---
  deleteNote: (noteId) => apiClient.delete(`/notes/${noteId}`),
  deleteQuiz: (quizId) => apiClient.delete(`/quiz/${quizId}`),
  deleteChatSession: (sessionId) =>
    apiClient.delete(`/chat/sessions/${sessionId}`), // <-- ADD THIS
  // (Optional: add deleteChatSession if you added it to the backend)
};
