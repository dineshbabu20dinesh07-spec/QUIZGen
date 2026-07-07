import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Upload, Play, CheckCircle, RefreshCw, Settings, ChevronLeft, 
  ChevronRight, Trophy, BrainCircuit, Send, User, LogOut, Lock, 
  ShieldAlert, Smartphone, ShieldCheck, Mail, Eye, EyeOff, FileText, BarChart2, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || '';

// USER'S GOOGLE CLIENT ID
const GOOGLE_CLIENT_ID = "653610501656-emigf3rjghphaki1kphg25gt74u8rvfa.apps.googleusercontent.com";

// Helper to decode google JWT client side
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
    } catch (error) {
    console.error("JWT Decode error:", error);
    return null;
  }
};

// ----------------------------------------------------------------------
// Custom Animated Quiz Flow Component (Replaces Video)
// ----------------------------------------------------------------------
const QuizAnimatedBg = () => {
  const [phase, setPhase] = useState(0); // 0: Generating, 1: Answering, 2: Result

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((prev) => (prev + 1) % 3);
    }, 4000); // Change phase every 4 seconds
    return () => clearInterval(timer);
  }, []);

  return (
      // Animated Laptop/Glass Screen
      <div style={{
        position: 'relative',
        width: '100%', maxWidth: '440px', height: '300px',
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px', backdropFilter: 'blur(16px)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)',
        zIndex: 2
      }}>
        {/* Fake Window Header */}
        <div style={{ height: '30px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 15px', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }}></div>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }}></div>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }}></div>
        </div>

        {/* Dynamic Content area */}
        <div style={{ flex: 1, position: 'relative', padding: '20px' }}>
          <AnimatePresence mode="wait">
            
            {phase === 0 && (
              <motion.div key="phase0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '15px' }}>
                <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}>
                  <BrainCircuit size={64} color="#6c63ff" />
                </motion.div>
                <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>Skill up Quizz zone</div>
                <div style={{ width: '60%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <motion.div style={{ height: '100%', background: '#6c63ff' }} animate={{ width: ['0%', '100%'] }} transition={{ duration: 3.5, ease: 'easeInOut' }}></motion.div>
                </div>
              </motion.div>
            )}

            {phase === 1 && (
              <motion.div key="phase1" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.5 }}
                style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '15px' }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 'bold' }}>QUESTION 1 OF 10</div>
                <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', lineHeight: 1.4 }}>Which technology drives modern Large Language Models?</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                  {['Transformers', 'Decision Trees', 'Linear Regression'].map((opt, i) => (
                    <motion.div key={opt}
                      initial={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                      animate={ i === 0 ? { background: 'rgba(39,201,63,0.2)', borderColor: '#27c93f' } : {}}
                      transition={{ delay: i === 0 ? 1.5 : 0, duration: 0.3 }}
                      style={{ padding: '12px 15px', borderRadius: '10px', border: '1px solid', color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {i === 0 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }}></div></motion.div>}
                      </div>
                      {opt}
                    </motion.div>
                  ))}
                </div>
                {/* Fake Cursor */}
                <motion.div initial={{ x: 100, y: 150, opacity: 0 }} animate={{ x: 20, y: 80, opacity: [0, 1, 1, 0] }} transition={{ duration: 2, ease: 'easeOut' }}
                  style={{ position: 'absolute', zIndex: 10 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="#333" strokeWidth="1"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>
                </motion.div>
              </motion.div>
            )}

            {phase === 2 && (
              <motion.div key="phase2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '15px' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                  style={{ width: '100px', height: '100px', borderRadius: '50%', border: '6px solid #ffd700', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,215,0,0.1)', position: 'relative' }}>
                  <Trophy size={40} color="#ffd700" style={{ position: 'absolute', top: '-25px' }} />
                  <span style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>98<span style={{ fontSize: '1rem' }}>%</span></span>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <div style={{ color: '#ffd700', fontSize: '1.4rem', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>Excellent!</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginTop: '5px', textAlign: 'center' }}>You mastered this topic.</div>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
  );
};

function App() {
  const [user, setUser] = useState(null); // { name, role, email, picture }
  const [authPortalMode, setAuthPortalMode] = useState('student'); // 'student' or 'admin'
  const [activeFormTab, setActiveFormTab] = useState('signin'); // 'signin' or 'signup'
  const [customClientId, setCustomClientId] = useState(GOOGLE_CLIENT_ID);
  const [showConfig, setShowConfig] = useState(false);
  const [showBypassOverlay, setShowBypassOverlay] = useState(false);
  const [tokenClient, setTokenClient] = useState(null);
  
  // Auth Form Inputs
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCountryCode, setFormCountryCode] = useState('+91');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Quiz States
  const [view, setView] = useState('home'); // 'home', 'quiz', 'results', 'admin'
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState({ questions: [] });
  const [adminPreview, setAdminPreview] = useState(null);
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); 
  const [score, setScore] = useState({ correct: 0, wrong: 0, total: 0 });
  const fileInputRef = useRef(null);
  const profileInputRef = useRef(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSidebarProfileMenu, setShowSidebarProfileMenu] = useState(false);
  
  // Dashboard states
  const [quizzesList, setQuizzesList] = useState([]);
  const [dashboardData, setDashboardData] = useState([]);
  const [activeDashboardTab, setActiveDashboardTab] = useState('overview');

  // Session loading — prevents white screen while checking cookie
  const [sessionLoading, setSessionLoading] = useState(true);

  // Pagination state
  const [quizzesPage, setQuizzesPage] = useState(1);
  const [quizPageInfo, setQuizPageInfo] = useState({ total: 0, total_pages: 1 });
  const [attemptsPage, setAttemptsPage] = useState(1);
  const [attemptsPageInfo, setAttemptsPageInfo] = useState({ total: 0, total_pages: 1 });

  // Fetch session from cookie on app load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Try cookie-based session (/me reads the HttpOnly session cookie)
        const res = await axios.get(`${API_URL}/me`, { withCredentials: true });
        const u = {
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
          domain_id: res.data.domain_id,
          picture: '',
        };
        setUser(u);
        setView('home');
        fetchDashboardData(u);
        fetchQuizzes();
      } catch {
        // No active session — show login page
        setUser(null);
        // Still fetch current quiz (no auth needed)
        try {
          const currentRes = await axios.get(`${API_URL}/get-quiz`, { withCredentials: true });
          if (currentRes.data && currentRes.data.questions) {
            setQuizData(currentRes.data);
          }
        } catch {
          // ignore
        }
      } finally {
        setSessionLoading(false); // Done checking — now show UI
      }
    };
    restoreSession();
  }, []);

  // Initialize Google Token Client for programmatically launching Google Account picker
  useEffect(() => {
    if (user) return;

    let initInterval;

    const initGoogleTokenClient = () => {
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        try {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: customClientId,
            scope: 'openid email profile',
            callback: async (tokenResponse) => {
              if (tokenResponse && tokenResponse.access_token) {
                setLoading(true);
                try {
                  // Use fetch directly to get user info (more reliable than axios for cross-origin)
                  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { 
                      Authorization: `Bearer ${tokenResponse.access_token}`,
                      'Accept': 'application/json'
                    }
                  });
                  
                  if (!res.ok) {
                    throw new Error(`Google userinfo failed: ${res.status}`);
                  }
                  
                  const payload = await res.json();
                  if (payload && payload.email) {
                    const googleUser = {
                      name: payload.name || payload.given_name || payload.email.split('@')[0],
                      role: authPortalMode, 
                      email: payload.email,
                      picture: payload.picture || ''
                    };
                    
                    const backendRes = await axios.post(`${API_URL}/signin-google`, googleUser, { withCredentials: true });
                    const loggedUser = backendRes.data.user;
                    
                    setUser(loggedUser);
                    
                    setView('home');
                    setActiveDashboardTab('overview');
                    fetchQuizzes();
                    fetchDashboardData(loggedUser);
                  } else {
                    setAuthError('Unable to extract Google Account details. Please try email/password login.');
                  }
                } catch (err) {
                  console.error("Failed to fetch Google profile info:", err);
                  // Fallback: try to extract from token response directly
                  if (tokenResponse.email) {
                    try {
                      const googleUser = {
                        name: tokenResponse.name || tokenResponse.email.split('@')[0],
                        role: authPortalMode,
                        email: tokenResponse.email,
                        picture: tokenResponse.picture || ''
                      };
                      const backendRes = await axios.post(`${API_URL}/signin-google`, googleUser, { withCredentials: true });
                      setUser(backendRes.data.user);
                      setView('home');
                      setActiveDashboardTab('overview');
                      fetchQuizzes();
                      fetchDashboardData(backendRes.data.user);
                      return;
                    } catch {}
                  }
                  setAuthError('Google Sign-In failed. Please use Email/Password login instead.');
                } finally {
                  setLoading(false);
                }
              }
            }
          });
          setTokenClient(client);
          clearInterval(initInterval);
        } catch (e) {
          console.error("Google OAuth token client initialization failed: ", e);
          clearInterval(initInterval);
        }
      }
    };

    // Attempt immediately
    initGoogleTokenClient();
    
    // If window.google is not ready yet, set an interval to check
    if (!tokenClient) {
      initInterval = setInterval(initGoogleTokenClient, 300);
    }

    return () => clearInterval(initInterval);
  }, [user, authPortalMode, customClientId, tokenClient]);

  // Handler for custom Google Login button click
  const handleGoogleSignInClick = () => {
    if (tokenClient) {
      setAuthError('');
      setAuthSuccess('');
      tokenClient.requestAccessToken();
    } else {
      setAuthError('Google Sign-In is initializing. Please try again.');
    }
  };

  const completeBypassSignIn = async (email, name) => {
    setAuthError('');
    setAuthSuccess('');
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/signin-google`, {
        email: email,
        name: name,
        role: authPortalMode,
        picture: ''
      }, { withCredentials: true });
      
      const loggedUser = res.data.user;
      setUser(loggedUser);
      setShowBypassOverlay(false);
      
      setView('home');
      setActiveDashboardTab('overview');
      fetchQuizzes();
      fetchDashboardData(loggedUser);
    } catch (err) {
      setAuthError(err.response?.data?.detail || 'Bypass sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, picture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchQuizzes = async (page = 1) => {
    try {
      // Get current quiz (no auth needed)
      const currentRes = await axios.get(`${API_URL}/get-quiz`, { withCredentials: true });
      if (currentRes.data && currentRes.data.questions) {
        setQuizData(currentRes.data);
      }
      // Get paginated quiz list (requires auth — catch silently if not logged in)
      try {
        const res = await axios.get(`${API_URL}/quizzes?page=${page}&page_size=10`, { withCredentials: true });
        setQuizzesList(res.data.items || []);
        setQuizPageInfo({ total: res.data.total, total_pages: res.data.total_pages });
        setQuizzesPage(page);
      } catch {
        // Not logged in yet — skip quiz list
      }
    } catch (err) {
      console.error("Failed to fetch quizzes");
    }
  };

  const fetchDashboardData = async (currentUser, page = 1) => {
    if (!currentUser) return;
    try {
      if (currentUser.role === 'admin' || currentUser.role === 'faculty') {
        const res = await axios.get(`${API_URL}/faculty-quizzes?page=${page}&page_size=10`, { withCredentials: true });
        setDashboardData(res.data.items || []);
        setAttemptsPageInfo({ total: res.data.total, total_pages: res.data.total_pages });
      } else {
        const res = await axios.get(`${API_URL}/student-attempts?page=${page}&page_size=10`, { withCredentials: true });
        setDashboardData(res.data.items || []);
        setAttemptsPageInfo({ total: res.data.total, total_pages: res.data.total_pages });
      }
      setAttemptsPage(page);
    } catch (err) {
      console.error("Failed to fetch dashboard data");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setAdminPreview(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_URL}/upload`, formData, { withCredentials: true });
      setAdminPreview(res.data);
    } catch (err) {
      if (err.response?.status === 403) {
        alert("Access Denied: Only Faculty and Admin can upload quiz files.");
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        alert("Request timed out. The server may be waking up (Render free tier). Please wait 30 seconds and try again.");
      } else {
        const detail = err.response?.data?.detail || err.message || "Unknown error";
        alert(`Analysis failed: ${detail}\n\nTip: Check that the server is running and GEMINI_API_KEY is set on Render.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveQuizToSystem = async () => {
    if (!adminPreview) return;
    try {
      const payload = { ...adminPreview, faculty_email: user.email };
      await axios.post(`${API_URL}/save-quiz`, payload, { withCredentials: true });
      setAdminPreview(null);
      alert("Quiz Published!");
      fetchQuizzes();
      fetchDashboardData(user);
      setView('home'); 
    } catch (err) {
      if (err.response?.status === 403) {
        alert("Access Denied: Only Faculty and Admin can save quizzes.");
      } else {
        alert("Failed to save quiz");
      }
    }
  };

  const startQuiz = (selectedQuiz = null) => {
    if (selectedQuiz) {
      setQuizData(selectedQuiz);
    } else if (!quizData.questions || !quizData.questions.length) {
      return alert("No quiz available! Please ask the Admin to upload a quiz first.");
    }
    if (!user || user.role !== 'student') {
      return alert("Only logged-in Students can play the quiz.");
    }
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setScore({ correct: 0, wrong: 0, total: 0 });
    setView('quiz');
  };

  const selectOption = (option) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIdx]: option
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < quizData.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const submitQuiz = async () => {
    let correct = 0;
    quizData.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) correct++;
    });
    const finalScore = { 
      correct, 
      wrong: quizData.questions.length - correct, 
      total: quizData.questions.length 
    };
    setScore(finalScore);

    try {
       await axios.post(`${API_URL}/submit-attempt`, {
          student_email: user.email,
          quiz_id: quizData._id || 'unknown',
          quiz_title: quizData.title || quizData.filename || 'Untitled Quiz',
          score: finalScore.correct,
          total: finalScore.total,
          percentage: Math.round((finalScore.correct / finalScore.total) * 100)
       }, { withCredentials: true });
       fetchDashboardData(user);
    } catch (err) {
       console.error("Failed to save attempt");
    }

    setView('results');
  };

  // Local Accounts Auth Submit — Now uses cookie-based auth
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (activeFormTab === 'signup') {
      // Sign Up Handler
      if (!formName || !formEmail || !formPassword) {
        setAuthError('All fields are required.');
        return;
      }
      if (formPassword.length < 4) {
        setAuthError('Password must be at least 4 characters long.');
        return;
      }

      try {
        const payload = {
          name: formName,
          email: formEmail,
          password: formPassword,
          phone: `${formCountryCode} ${formPhone}`,
          role: authPortalMode
        };
        await axios.post(`${API_URL}/signup`, payload, { withCredentials: true });

        // ✅ Account created — show Sign In tab with success message
        const createdEmail = formEmail;
        setFormName(''); setFormPhone('');
        setFormPassword('');
        // Keep email pre-filled for easy sign in
        setFormEmail(createdEmail);
        setAuthSuccess('✅ Account created successfully! Please sign in below.');
        setActiveFormTab('signin'); // Switch to Sign In tab
      } catch (err) {
        setAuthError(err.response?.data?.detail || 'Sign up failed. Please try again.');
      }
    } else {
      // Sign In Handler — cookie is set by server response
      if (!formEmail || !formPassword) {
        setAuthError('Please enter your email and password.');
        return;
      }

      try {
        const res = await axios.post(
          `${API_URL}/signin`,
          { email: formEmail, password: formPassword, role: authPortalMode },
          { withCredentials: true }  // 🍪 Cookie is received here!
        );
        const matchingUser = res.data.user;
        setUser(matchingUser);

        setView('home');
        setActiveDashboardTab('overview');

        // Fetch data for the newly logged-in user
        fetchQuizzes();
        fetchDashboardData(matchingUser);
      } catch (err) {
        setAuthError(err.response?.data?.detail || 'Invalid email or password. Please verify your entries.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      // Tell server to clear cookie
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
    } catch {
      // Ignore errors — clear client state anyway
    }
    setUser(null);
    setView('home');
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setShowPassword(false);
    setAuthError('');
    setAuthSuccess('');
    setDashboardData([]);
    setQuizzesList([]);
    setActiveDashboardTab('overview');
  };

  // Don't render anything until session check is done (prevents white screen flicker)
  if (sessionLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a2e 0%, #1e1e4a 100%)',
        gap: '20px'
      }}>
        <div style={{
          width: '60px', height: '60px',
          border: '4px solid rgba(108,99,255,0.2)',
          borderTop: '4px solid #6c63ff',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: '600', fontSize: '1rem', margin: 0 }}>
          Loading QuizGen...
        </p>
      </div>
    );
  }

  return (
    <div className={`app-container ${!user ? 'login-mode' : ''}`}>
      {/* HEADER SECTION - Removed for SaaS layout */ }

      {/* CLIENT ID CONFIGURATION DRAWER */}
      <AnimatePresence>
        {showConfig && (
          <motion.div 
            className="login-card"
            style={{ padding: '1.5rem', marginBottom: '2rem' }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <h4 style={{ margin: '0 0 10px 0', fontWeight: '800' }}>⚙️ Google Client ID Settings</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
              Set your Google OAuth client ID here if you want to update it.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                className="duo-input" 
                style={{ fontSize: '0.8rem' }}
                value={customClientId} 
                onChange={(e) => setCustomClientId(e.target.value)}
                placeholder="Enter Client ID"
              />
              <button 
                className="duo-btn duo-btn-blue" 
                style={{ width: 'auto', padding: '0 0.8rem', fontSize: '0.8rem' }}
                onClick={() => {
                  setShowConfig(false);
                  alert("Google Client ID successfully updated!");
                }}
              >
                Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIMULATED GOOGLE OAUTH BYPASS POPUP OVERLAY */}
      <AnimatePresence>
        {showBypassOverlay && (
          <div className="google-popup-overlay">
            <motion.div 
              className="google-popup"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="google-popup-header">
                <svg className="google-icon-svg" viewBox="0 0 24 24" style={{ width: '40px', height: '40px', marginBottom: '10px' }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem' }}>Google Sign In (Bypass Mode)</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#5f6368' }}>Select a simulated test Google account</p>
              </div>
              <div className="google-popup-body">
                <div className="google-account-list">
                  {authPortalMode === 'admin' ? (
                    <>
                      <div className="google-account-item" onClick={() => completeBypassSignIn('admin.test@gmail.com', 'Dinesh Admin (OAuth)')}>
                        <div className="google-avatar">A</div>
                        <div className="google-account-info">
                          <span className="google-account-name">Dinesh Admin (OAuth)</span>
                          <span className="google-account-email">admin.test@gmail.com</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="google-account-item" onClick={() => completeBypassSignIn('dineshbabu20dinesh07@gmail.com', 'Dineshbabu (OAuth)')}>
                        <div className="google-avatar">D</div>
                        <div className="google-account-info">
                          <span className="google-account-name">Dineshbabu</span>
                          <span className="google-account-email">dineshbabu20dinesh07@gmail.com</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <button 
                  className="duo-btn duo-btn-white" 
                  style={{ marginTop: '20px', padding: '0.6rem 1rem', fontSize: '0.9rem', boxShadow: 'none' }} 
                  onClick={() => setShowBypassOverlay(false)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN VIEWING CONTAINER */}
      <AnimatePresence mode="wait">
        
        {/* LOGIN SCREEN IF NOT AUTHENTICATED */}
        {!user && (
          <motion.div 
            key="login" 
            className="login-split-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Branding Side with CSS Animated UI Quiz Flow Component */}
            <div className="login-branding-side" style={{ position: 'relative', overflow: 'hidden' }}>
              
              {/* Background Gradients */}
              <div style={{
                position: 'absolute', inset: 0, overflow: 'hidden', 
                background: 'linear-gradient(135deg, #0a0a2e 0%, #1e1e4a 100%)', zIndex: 0
              }}>
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)' }}></div>
                <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)' }}></div>
              </div>

              {/* Dark overlay for contrast */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(10,10,46,0.5) 0%, rgba(102,126,234,0.3) 100%)',
                zIndex: 1
              }}></div>

              <div style={{ zIndex: 2, position: 'absolute', inset: 0, padding: '3rem', display: 'flex', flexDirection: 'column' }}>
                
                {/* Top Left: Logo and Text Box */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '600px', textAlign: 'left' }}>
                  
                  {/* Logo Top Left */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                    <div style={{
                      background: 'rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: '16px',
                      padding: '0.8rem',
                      border: '1px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 4px 20px rgba(102,126,234,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <BrainCircuit size={36} color="#a78bfa" />
                    </div>
                    <span style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '800', letterSpacing: '0.5px' }}>QuizGen</span>
                  </div>

                  {/* Main Text Below Logo */}
                  <h1 style={{
                    fontSize: '2.2rem',
                    fontWeight: '900',
                    margin: '0 0 1rem 0',
                    textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    letterSpacing: '-1px',
                    lineHeight: 1.15,
                    color: '#fff',
                    whiteSpace: 'nowrap'
                  }}>Master Every Quiz Challenge</h1>
                  <p style={{
                    fontSize: '1.1rem',
                    lineHeight: 1.6,
                    color: 'rgba(255,255,255,0.85)',
                    textShadow: '0 2px 10px rgba(0,0,0,0.4)',
                    margin: 0
                  }}>Welcome to Quiz Platform</p>
                </div>

                {/* Video positioned perfectly in the center below the text */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2rem' }}>
                  <div style={{ width: '100%', maxWidth: '480px' }}>
                    <QuizAnimatedBg />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Side */}
            <div className="login-form-side">
              <div className="login-card">
                {/* PROFESSIONAL PORTAL TOGGLE */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                  <div style={{
                    display: 'flex',
                    background: '#f1f5f9',
                    borderRadius: '50px',
                    padding: '5px',
                    gap: '4px',
                    border: '1px solid #e2e8f0',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.06)'
                  }}>
                    {/* Student Option */}
                    <button
                      type="button"
                      onClick={() => { setAuthPortalMode('student'); setAuthError(''); setAuthSuccess(''); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        padding: '0.5rem 1.4rem',
                        borderRadius: '50px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                        fontWeight: '700',
                        fontFamily: 'inherit',
                        transition: 'all 0.25s ease',
                        background: authPortalMode === 'student'
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'transparent',
                        color: authPortalMode === 'student' ? '#fff' : '#64748b',
                        boxShadow: authPortalMode === 'student'
                          ? '0 4px 15px rgba(102,126,234,0.4)'
                          : 'none',
                        transform: authPortalMode === 'student' ? 'scale(1.02)' : 'scale(1)',
                      }}
                    >
                      <User size={15} />
                      Student
                    </button>

                    {/* Admin Option */}
                    <button
                      type="button"
                      onClick={() => { setAuthPortalMode('admin'); setAuthError(''); setAuthSuccess(''); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        padding: '0.5rem 1.4rem',
                        borderRadius: '50px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                        fontWeight: '700',
                        fontFamily: 'inherit',
                        transition: 'all 0.25s ease',
                        background: authPortalMode === 'admin'
                          ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                          : 'transparent',
                        color: authPortalMode === 'admin' ? '#fff' : '#64748b',
                        boxShadow: authPortalMode === 'admin'
                          ? '0 4px 15px rgba(245,87,108,0.4)'
                          : 'none',
                        transform: authPortalMode === 'admin' ? 'scale(1.02)' : 'scale(1)',
                      }}
                    >
                      <Lock size={15} />
                      Admin
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>
                    {authPortalMode === 'admin' ? 'Admin Portal' : 'Welcome back'}
                  </h2>
                  <p style={{ color: '#6b7280', marginTop: '3px', fontSize: '0.9rem', marginBottom: 0 }}>
                    {authPortalMode === 'admin' ? 'Create, upload & distribute practice quizzes.' : 'Please enter your details to sign in.'}
                  </p>
                </div>

            {/* SIGN IN / SIGN UP TABS */}
            <div className="tab-switcher" style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: '0.6rem' }}>
              <button 
                type="button"
                className={`tab-btn`}
                onClick={() => { setActiveFormTab('signin'); setAuthError(''); setAuthSuccess(''); setShowPassword(false); }}
                style={{
                  flex: 1, padding: '0.8rem', background: 'none', border: 'none',
                  fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                  borderBottom: activeFormTab === 'signin' ? '4px solid var(--playful-blue)' : 'none',
                  color: activeFormTab === 'signin' ? 'var(--playful-blue-border)' : 'var(--text-muted)'
                }}
              >
                Sign In
              </button>
              <button 
                type="button"
                className={`tab-btn`}
                onClick={() => { setActiveFormTab('signup'); setAuthError(''); setAuthSuccess(''); setShowPassword(false); }}
                style={{
                  flex: 1, padding: '0.8rem', background: 'none', border: 'none',
                  fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                  borderBottom: activeFormTab === 'signup' ? '4px solid var(--playful-blue)' : 'none',
                  color: activeFormTab === 'signup' ? 'var(--playful-blue-border)' : 'var(--text-muted)'
                }}
              >
                Sign Up
              </button>
            </div>

            {authError && (
              <div className="duo-alert duo-alert-error">
                <ShieldAlert size={20} />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="duo-alert duo-alert-success">
                <CheckCircle size={20} />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* GOOGLE SIGN-IN CONTAINER — only on Sign In tab */}
            {activeFormTab === 'signin' && (
              <div className="google-oauth-btn-wrapper">
                <button 
                  type="button" 
                  className="duo-btn duo-btn-white" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px', 
                    width: '320px', 
                    margin: '0 auto 8px',
                    textTransform: 'none',
                    fontSize: '0.95rem'
                  }}
                  onClick={handleGoogleSignInClick}
                >
                  <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
                
                {/* BYPASS BUTTON FOR LOCAL DEV */}
                {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                  <button 
                    type="button" 
                    className="google-bypass-link"
                    onClick={() => setShowBypassOverlay(true)}
                  >
                    Mock Google OAuth bypass (locally test login)
                  </button>
                )}
              </div>
            )}

            {activeFormTab === 'signin' && (
              <div className="duo-divider" style={{ margin: '0.5rem 0' }}>or use email login</div>
            )}

            {/* DYNAMIC SIGN IN / SIGN UP FORM */}
            <form onSubmit={handleAuthSubmit}>
              {activeFormTab === 'signup' && (
                <>
                  <div className="duo-input-group">
                    <label className="duo-input-label">Full Name</label>
                    <input 
                      type="text" 
                      className="duo-input" 
                      placeholder="Enter your name" 
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>
                  
                  <div className="duo-input-group">
                    <label className="duo-input-label">Phone Number</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        className="duo-input" 
                        style={{ width: '100px', padding: '0.8rem 0.5rem' }}
                        value={formCountryCode}
                        onChange={(e) => setFormCountryCode(e.target.value)}
                      >
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+61">🇦🇺 +61</option>
                        <option value="+81">🇯🇵 +81</option>
                        <option value="+49">🇩🇪 +49</option>
                        <option value="+33">🇫🇷 +33</option>
                        <option value="+86">🇨🇳 +86</option>
                        <option value="+7">🇷🇺 +7</option>
                        <option value="+55">🇧🇷 +55</option>
                        <option value="+27">🇿🇦 +27</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+65">🇸🇬 +65</option>
                        <option value="+60">🇲🇾 +60</option>
                        <option value="+64">🇳🇿 +64</option>
                        <option value="+39">🇮🇹 +39</option>
                        <option value="+34">🇪🇸 +34</option>
                        <option value="+82">🇰🇷 +82</option>
                        <option value="+52">🇲🇽 +52</option>
                        <option value="+62">🇮🇩 +62</option>
                      </select>
                      <input 
                        type="tel" 
                        className="duo-input" 
                        placeholder="Mobile Number" 
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="duo-input-group">
                <label className="duo-input-label">Email ID</label>
                <input 
                  type="email" 
                  className="duo-input" 
                  placeholder={authPortalMode === 'admin' ? "admin@gmail.com" : "student@gmail.com"}
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>

              <div className="duo-input-group">
                <label className="duo-input-label">Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="duo-input" 
                    placeholder="••••••••" 
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    style={{ paddingRight: '40px', width: '100%' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#4b5563'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className={authPortalMode === 'admin' ? 'duo-btn duo-btn-blue' : 'duo-btn duo-btn-green'}>
                {activeFormTab === 'signin' ? 'Sign In' : 'Create Account'}
              </button>

              {activeFormTab === 'signup' && (
                <button 
                  type="button" 
                  className="duo-btn duo-btn-white" 
                  style={{ marginTop: '6px', boxShadow: 'none' }}
                  onClick={() => { setActiveFormTab('signin'); setAuthError(''); setAuthSuccess(''); }}
                >
                  Back to Sign In
                </button>
              )}
            </form>
            
            {activeFormTab === 'signin' && authPortalMode === 'admin' && (
              <div style={{ marginTop: '0.8rem', fontSize: '0.82rem', color: '#6b7280', textAlign: 'center' }}>
                Default: <strong>admin@gmail.com</strong> / <strong>admin123</strong>
              </div>
            )}
              </div>
            </div>
          </motion.div>
        )}

        {/* HOME / WELCOME VIEW */}
        {user && view === 'home' && (
          <motion.div 
            key="home" 
            style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* GLOBAL BLUE TOP NAVBAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px', minHeight: '64px', padding: '0 2rem', background: '#1e88e5', color: '#fff', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <BrainCircuit size={28} color="#fff" />
                <span style={{ fontWeight: '800', fontSize: '1.4rem', letterSpacing: '0.5px' }}>QuizGen AI</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                   <Search size={16} color="#6b7280" style={{ position: 'absolute', left: '12px' }} />
                   <input type="text" placeholder="Search..." style={{ padding: '0.5rem 1rem', paddingLeft: '36px', borderRadius: '20px', border: 'none', background: '#ffffff', color: '#111827', fontSize: '0.85rem', outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <Settings size={20} color="rgba(255,255,255,0.8)" style={{ cursor: 'pointer' }} />
                  <div style={{ position: 'relative' }}>
                    <div onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <input type="file" ref={profileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleProfileUpload} />
                      {user.picture ? (
                        <img src={user.picture} alt={user.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }} />
                      ) : (
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={20} color="#fff" />
                        </div>
                      )}
                    </div>
                    
                    {showProfileMenu && (
                      <div style={{ position: 'absolute', top: '120%', right: 0, background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '0.5rem', zIndex: 100, minWidth: '150px' }}>
                        <div 
                          onClick={() => { setShowProfileMenu(false); profileInputRef.current?.click(); }} 
                          style={{ padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.9rem', color: '#374151', borderRadius: '4px' }}
                          onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
                          onMouseOut={(e) => e.target.style.background = 'transparent'}
                        >
                          Change Profile
                        </div>
                        {user.picture && (
                          <div 
                            onClick={() => { setShowProfileMenu(false); setUser({ ...user, picture: '' }); }} 
                            style={{ padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.9rem', color: '#ef4444', borderRadius: '4px' }}
                            onMouseOver={(e) => e.target.style.background = '#fee2e2'}
                            onMouseOut={(e) => e.target.style.background = 'transparent'}
                          >
                            Remove Profile
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-layout" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* SIDEBAR NAVIGATION */}
              <div className="dashboard-sidebar">
                {/* Profile Banner */}
                <div style={{ position: 'relative', height: '140px', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '1rem' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '90px', background: 'url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600&h=200) center/cover no-repeat' }}></div>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '90px', background: 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4))' }}></div>
                  <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div onClick={() => setShowSidebarProfileMenu(!showSidebarProfileMenu)} style={{ cursor: 'pointer', marginBottom: '5px' }}>
                      {user.picture ? (
                        <img src={user.picture} alt={user.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                      ) : (
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                          <User size={28} color="#6b7280" />
                        </div>
                      )}
                    </div>
                    
                    {showSidebarProfileMenu && (
                      <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '0.5rem', minWidth: '150px' }}>
                        <div 
                          onClick={() => { setShowSidebarProfileMenu(false); profileInputRef.current?.click(); }} 
                          style={{ padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.9rem', color: '#374151', borderRadius: '4px', textAlign: 'center' }}
                          onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
                          onMouseOut={(e) => e.target.style.background = 'transparent'}
                        >
                          Change Profile
                        </div>
                        {user.picture && (
                          <div 
                            onClick={() => { setShowSidebarProfileMenu(false); setUser({ ...user, picture: '' }); }} 
                            style={{ padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.9rem', color: '#ef4444', borderRadius: '4px', textAlign: 'center' }}
                            onMouseOver={(e) => e.target.style.background = '#fee2e2'}
                            onMouseOut={(e) => e.target.style.background = 'transparent'}
                          >
                            Remove Profile
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ zIndex: 2, fontWeight: '700', color: '#111827', fontSize: '0.95rem' }}>{user.name}</div>
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#9ca3af', padding: '0 1.5rem', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>PERSONAL</div>

              <button 
                className={`sidebar-nav-btn ${activeDashboardTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveDashboardTab('overview')}
              >
                <Trophy size={18} /> Overview
              </button>
              
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#9ca3af', padding: '0 1.5rem', marginTop: '1rem', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>APPS</div>

              {user.role === 'student' ? (
                <>
                  <button 
                    className={`sidebar-nav-btn ${activeDashboardTab === 'quizzes' ? 'active' : ''}`}
                    onClick={() => setActiveDashboardTab('quizzes')}
                  >
                    <Play size={18} /> Practice Tests
                  </button>
                  <button 
                    className={`sidebar-nav-btn ${activeDashboardTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveDashboardTab('history')}
                  >
                    <CheckCircle size={18} /> Attempts History
                  </button>
                  <button 
                    className={`sidebar-nav-btn ${activeDashboardTab === 'progress' ? 'active' : ''}`}
                    onClick={() => setActiveDashboardTab('progress')}
                  >
                    <BarChart2 size={18} /> Progress Graph
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className={`sidebar-nav-btn ${activeDashboardTab === 'quizzes' ? 'active' : ''}`}
                    onClick={() => setActiveDashboardTab('quizzes')}
                  >
                    <FileText size={18} /> Uploaded Quizzes
                  </button>
                  <button 
                    className="sidebar-nav-btn"
                    onClick={() => setView('admin')}
                  >
                    <Upload size={18} /> Upload New Quiz
                  </button>
                </>
              )}

              <button 
                className={`sidebar-nav-btn ${activeDashboardTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveDashboardTab('profile')}
              >
                <User size={18} /> Profile & Role
              </button>

              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <button className="sidebar-nav-btn" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </div>

            {/* MAIN CONTENT PANEL */}
            <div className="dashboard-main-content" style={{ backgroundColor: '#e5e7eb' }}>
              {activeDashboardTab === 'overview' && (
                <>
                  {/* Page Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 5px 0', color: '#111827' }}>QuizGen AI Platform</h2>
                      <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>
                        {user.role === 'admin' ? "Manage and scan quizzes, view analytics and projects." : "Ready to practice and level up your skills today?"}
                      </p>
                    </div>
                    {user.role === 'admin' ? (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button style={{ background: '#111827', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }} onClick={() => setView('admin')}>Scan Quiz</button>
                        <button style={{ background: '#fff', color: '#111827', border: '1px solid #e5e7eb', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>Import Config</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button style={{ background: '#111827', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }} onClick={() => setActiveDashboardTab('quizzes')}>Start Practice</button>
                      </div>
                    )}
                  </div>

                  {/* Metrics grid */}
                  {user.role === 'student' ? (
                    <div className="metrics-grid">
                      <div className="metric-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={16} color="#6b7280" />
                            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>+12.5%</span>
                          </div>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginTop: '10px' }}>{dashboardData.length}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500', lineHeight: 1.2, marginTop: '4px' }}>Total Quizzes<br/>Played</div>
                      </div>

                      <div className="metric-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Trophy size={16} color="#6b7280" />
                            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>+23.1%</span>
                          </div>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginTop: '10px' }}>
                          {dashboardData.length > 0 
                            ? Math.round(dashboardData.reduce((acc, curr) => acc + curr.percentage, 0) / dashboardData.length) 
                            : 0}%
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500', lineHeight: 1.2, marginTop: '4px' }}>Avg Accuracy<br/>All time</div>
                      </div>

                      <div className="metric-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle size={16} color="#6b7280" />
                            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>+8.2%</span>
                          </div>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginTop: '10px' }}>
                          {dashboardData.length > 0 ? Math.max(...dashboardData.map(d => d.percentage)) : 0}%
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500', lineHeight: 1.2, marginTop: '4px' }}>Peak Score<br/>Best attempt</div>
                      </div>

                      <div className="metric-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BrainCircuit size={16} color="#6b7280" />
                            <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600' }}>-2.1%</span>
                          </div>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginTop: '10px' }}>{quizzesList.length}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500', lineHeight: 1.2, marginTop: '4px' }}>Available Tests<br/>Active modules</div>
                      </div>
                    </div>
                  ) : (
                    <div className="metrics-grid">
                      <div className="metric-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Upload size={16} color="#6b7280" />
                            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>+12.5%</span>
                          </div>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginTop: '10px' }}>{dashboardData.length}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500', lineHeight: 1.2, marginTop: '4px' }}>Uploaded Quizzes<br/>Total available</div>
                      </div>

                      <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => setView('admin')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BrainCircuit size={16} color="#6b7280" />
                            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>+23.1%</span>
                          </div>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginTop: '10px' }}>SCAN</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500', lineHeight: 1.2, marginTop: '4px' }}>AI Portal<br/>Scan & Generate</div>
                      </div>
                    </div>
                  )}

                  {/* Chart Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div className="glass-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ fontWeight: '700', color: '#111827' }}>Performance Analytics</div>
                        <select style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #e5e7eb', fontSize: '0.8rem', background: '#f9fafb' }}>
                          <option>Last 12 months</option>
                        </select>
                      </div>
                      <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid #e5e7eb', color: '#9ca3af', fontSize: '0.9rem' }}>
                         [Line Chart Canvas]
                      </div>
                    </div>
                    <div className="glass-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ fontWeight: '700', color: '#111827' }}>Activity by Category</div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>This year</div>
                      </div>
                      <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid #e5e7eb', color: '#9ca3af', fontSize: '0.9rem' }}>
                         [Bar Chart Canvas]
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeDashboardTab === 'quizzes' && (
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0 0 10px 0' }}>
                    {user.role === 'admin' ? "My Uploaded Quizzes" : "Available Practice Tests"}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', margin: '0 0 1.5rem 0' }}>
                    {user.role === 'admin' ? "All quizzes generated or published by you." : "Test your knowledge and level up your skills."}
                  </p>

                  {user.role === 'admin' ? (
                    dashboardData.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border)', borderRadius: '20px' }}>
                        <p style={{ color: 'var(--text-muted)', fontWeight: '700' }}>You haven't uploaded any quizzes yet.</p>
                      </div>
                    ) : (
                      <div className="dashboard-grid">
                        {dashboardData.map((q, idx) => (
                          <div key={idx} className="glass-card">
                            <div className="glass-card-header">{q.title || "Untitled Quiz"}</div>
                            <div className="glass-card-body">
                              <div>Questions: {q.questions?.length || 0}</div>
                              <div>Uploaded: {new Date(q.created_at).toLocaleDateString()}</div>
                              <div style={{ fontSize: '0.8rem', marginTop: '10px' }}>Engine: {q.analysis_type || "AI"}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    quizData && quizData.questions && quizData.questions.length > 0 ? (
                      <div className="dashboard-grid">
                        <div className="glass-card">
                          <div className="glass-card-header">{quizData.title || quizData.filename || "Latest Practice Test"}</div>
                          <div className="glass-card-body">
                            <div>Questions: {quizData.questions?.length || 0}</div>
                            <div>By: {quizData.faculty_email || "Admin"}</div>
                          </div>
                          <button 
                            className="duo-btn duo-btn-green" 
                            onClick={() => startQuiz(quizData)}
                            style={{ marginTop: 'auto', padding: '0.6rem' }}
                          >
                            <Play size={18} fill="#fff" /> Play
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border)', borderRadius: '20px' }}>
                        <p style={{ color: 'var(--text-muted)', fontWeight: '700' }}>No tests available right now. Ask your faculty to upload a quiz!</p>
                      </div>
                    )
                  )}
                </div>
              )}

              {activeDashboardTab === 'history' && user.role === 'student' && (
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0 0 10px 0' }}>Past Quiz Attempts</h2>
                  <p style={{ color: 'var(--text-muted)', margin: '0 0 1.5rem 0' }}>A log of your attempts, accuracy, and scores.</p>
                  
                  {dashboardData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border)', borderRadius: '20px' }}>
                      <p style={{ color: 'var(--text-muted)', fontWeight: '700' }}>You haven't attempted any quizzes yet.</p>
                    </div>
                  ) : (
                    <div className="history-table-container">
                      <table className="history-table">
                        <thead>
                          <tr>
                            <th>Quiz Name</th>
                            <th>Score</th>
                            <th>Accuracy</th>
                            <th>Date Attempted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.map((attempt, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: '800' }}>{attempt.quiz_title}</td>
                              <td>{attempt.score} / {attempt.total}</td>
                              <td>
                                <span style={{ 
                                  color: attempt.percentage >= 80 ? 'var(--playful-green-border)' : attempt.percentage >= 50 ? 'var(--playful-orange-border)' : 'var(--playful-red)',
                                  fontWeight: '800'
                                }}>
                                  {attempt.percentage}%
                                </span>
                              </td>
                              <td style={{ color: 'var(--text-muted)' }}>{new Date(attempt.timestamp).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeDashboardTab === 'profile' && (
                <div className="profile-card">
                  <div className="profile-header">
                    <label className="profile-avatar" style={{ cursor: 'pointer', overflow: 'hidden', padding: 0 }}>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfileUpload} />
                      {user.picture ? (
                        <img src={user.picture} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        user.name ? user.name.charAt(0).toUpperCase() : 'U'
                      )}
                    </label>
                    <div className="profile-meta">
                      <h3 className="profile-name">{user.name || "User"}</h3>
                      <span className={`profile-role-badge ${user.role}`} style={{
                        background: user.role === 'admin' ? 'rgba(28,176,246,0.1)' : 'rgba(88,204,2,0.1)',
                        color: user.role === 'admin' ? 'var(--playful-blue-border)' : 'var(--playful-green-border)',
                        border: user.role === 'admin' ? '1px solid rgba(28,176,246,0.2)' : '1px solid rgba(88,204,2,0.2)'
                      }}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="profile-details-grid">
                    <div className="profile-detail-item">
                      <span className="profile-detail-label">Email ID</span>
                      <span className="profile-detail-value">{user.email}</span>
                    </div>

                    <div className="profile-detail-item">
                      <span className="profile-detail-label">Domain Scope</span>
                      <span className="profile-detail-value">{user.domain_id || "default"}</span>
                    </div>

                    <div className="profile-detail-item">
                      <span className="profile-detail-label">Role Category</span>
                      <span className="profile-detail-value">{user.role === 'admin' ? 'System administrator / Faculty' : 'Registered Student'}</span>
                    </div>
                  </div>

                  <div style={{ borderTop: '2px solid var(--border)', paddingTop: '1.5rem' }}>
                    <span className="profile-detail-label">Your Permissions</span>
                    <div className="permission-badges">
                      {user.role === 'admin' ? (
                        <>
                          <span className="permission-badge">upload_quizzes</span>
                          <span className="permission-badge">save_quizzes</span>
                          <span className="permission-badge">manage_api_keys</span>
                          <span className="permission-badge">manage_domains</span>
                          <span className="permission-badge">view_all_attempts</span>
                        </>
                      ) : (
                        <>
                          <span className="permission-badge">view_quizzes</span>
                          <span className="permission-badge">take_quizzes</span>
                          <span className="permission-badge">view_own_attempts</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {activeDashboardTab === 'progress' && user.role === 'student' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 5px 0', color: '#111827' }}>Your Progress</h2>
                  <p style={{ color: '#6b7280', margin: '0 0 2rem 0', fontSize: '0.9rem' }}>
                    Track your learning progress over time across different topics.
                  </p>
                  
                  <div className="glass-card" style={{ padding: '2rem' }}>
                    {dashboardData.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6b7280' }}>No progress data available yet. Start practicing!</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={dashboardData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="quiz_title" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                            cursor={{ fill: 'rgba(0,188,212,0.1)' }}
                          />
                          <Bar dataKey="percentage" name="Score (%)" fill="#00bcd4" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* End of dashboard-main-content */}
          </div>
          {/* End of dashboard-layout */}
        </motion.div>
        )}

        {/* STUDENT QUIZ GAME PLAY VIEW */}
        {user && user.role === 'student' && view === 'quiz' && (
          <motion.div 
            key="quiz" 
            className="quiz-play-view"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            {/* ── TOP BAR ── */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <button
                onClick={() => setView('home')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px', padding: '0.5rem 1rem', cursor: 'pointer',
                  color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem',
                  backdropFilter: 'blur(8px)', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              >
                <ChevronLeft size={16} /> Quit
              </button>

              <div style={{
                background: 'linear-gradient(135deg,#6c63ff,#48b0f7)',
                borderRadius: '50px', padding: '0.35rem 1.2rem',
                fontSize: '0.82rem', fontWeight: '800', color: '#fff',
                letterSpacing: '0.5px', boxShadow: '0 4px 14px rgba(108,99,255,0.35)'
              }}>
                {currentQuestionIdx + 1} / {quizData.questions.length}
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                {quizData.title || quizData.filename || 'Practice Test'}
              </div>
            </div>

            {/* ── PROGRESS BAR ── */}
            <div style={{
              height: '8px', background: 'rgba(255,255,255,0.08)',
              borderRadius: '99px', overflow: 'hidden', marginBottom: '2rem',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
            }}>
              <div style={{
                height: '100%',
                width: `${((currentQuestionIdx + 1) / quizData.questions.length) * 100}%`,
                background: 'linear-gradient(90deg,#6c63ff,#48b0f7)',
                borderRadius: '99px',
                transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: '0 0 12px rgba(108,99,255,0.5)'
              }} />
            </div>

            {/* ── QUESTION CARD ── */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(72,176,247,0.05) 100%)',
              border: '1px solid rgba(108,99,255,0.2)',
              borderRadius: '20px', padding: '1.8rem 2rem',
              marginBottom: '1.5rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
            }}>
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px'
              }}>
                {/* Question number chip */}
                <div style={{
                  minWidth: '36px', height: '36px',
                  background: 'linear-gradient(135deg,#6c63ff,#48b0f7)',
                  borderRadius: '10px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: '900', fontSize: '0.85rem',
                  color: '#fff', boxShadow: '0 4px 12px rgba(108,99,255,0.4)',
                  flexShrink: 0, marginTop: '2px'
                }}>
                  Q{currentQuestionIdx + 1}
                </div>
                <p style={{
                  margin: 0, fontSize: '1.05rem', fontWeight: '700',
                  lineHeight: 1.65, color: 'var(--text)'
                }}>
                  {quizData.questions[currentQuestionIdx].question}
                </p>
              </div>
            </div>

            {/* ── OPTIONS ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
              {quizData.questions[currentQuestionIdx].options.map((opt, i) => {
                const letter = String.fromCharCode(65 + i);
                const isSelected = userAnswers[currentQuestionIdx] === opt;
                const correctAnswer = quizData.questions[currentQuestionIdx].answer;
                const isCorrect = opt === correctAnswer;
                const hasAnswered = userAnswers[currentQuestionIdx] !== undefined;
                const isWrongSelected = isSelected && !isCorrect;

                // Determine styling state
                let bg = 'rgba(255,255,255,0.04)';
                let border = '1px solid rgba(255,255,255,0.1)';
                let textColor = 'var(--text)';
                let badgeBg = 'rgba(255,255,255,0.1)';
                let badgeColor = 'var(--text-muted)';
                let icon = null;
                let shadow = 'none';

                if (hasAnswered) {
                  if (isWrongSelected) {
                    // Red - wrong answer selected
                    bg = 'rgba(239,68,68,0.12)';
                    border = '2px solid rgba(239,68,68,0.6)';
                    textColor = '#f87171';
                    badgeBg = 'rgba(239,68,68,0.2)';
                    badgeColor = '#f87171';
                    shadow = '0 0 20px rgba(239,68,68,0.15)';
                    icon = '✕';
                  } else if (isCorrect) {
                    // Green - correct answer
                    bg = 'rgba(34,197,94,0.12)';
                    border = '2px solid rgba(34,197,94,0.6)';
                    textColor = '#4ade80';
                    badgeBg = 'rgba(34,197,94,0.2)';
                    badgeColor = '#4ade80';
                    shadow = '0 0 20px rgba(34,197,94,0.15)';
                    icon = '✓';
                  } else {
                    // Dimmed - other options
                    bg = 'rgba(255,255,255,0.02)';
                    textColor = 'rgba(var(--text-rgb, 30,30,30),0.4)';
                    border = '1px solid rgba(255,255,255,0.05)';
                  }
                } else if (isSelected) {
                  bg = 'rgba(108,99,255,0.15)';
                  border = '2px solid rgba(108,99,255,0.6)';
                  textColor = '#a78bfa';
                  badgeBg = 'rgba(108,99,255,0.3)';
                  badgeColor = '#a78bfa';
                  shadow = '0 0 20px rgba(108,99,255,0.15)';
                }

                return (
                  <button
                    key={i}
                    onClick={() => { if (!hasAnswered) selectOption(opt); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '1rem 1.2rem',
                      background: bg, border, borderRadius: '14px',
                      cursor: hasAnswered ? 'default' : 'pointer',
                      transition: 'all 0.25s ease', textAlign: 'left',
                      boxShadow: shadow, width: '100%',
                      transform: hasAnswered ? 'scale(1)' : undefined
                    }}
                    onMouseEnter={e => {
                      if (!hasAnswered) {
                        e.currentTarget.style.background = 'rgba(108,99,255,0.08)';
                        e.currentTarget.style.border = '1px solid rgba(108,99,255,0.3)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!hasAnswered) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    {/* Letter badge */}
                    <div style={{
                      minWidth: '32px', height: '32px',
                      background: badgeBg, borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '900', fontSize: '0.85rem', color: badgeColor,
                      flexShrink: 0, transition: 'all 0.25s'
                    }}>
                      {icon ? icon : letter}
                    </div>
                    <span style={{
                      fontSize: '0.95rem', fontWeight: '600',
                      color: textColor, lineHeight: 1.4,
                      transition: 'color 0.25s'
                    }}>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* ── FEEDBACK BANNER (wrong answer reveal) ── */}
            {userAnswers[currentQuestionIdx] !== undefined &&
             userAnswers[currentQuestionIdx] !== quizData.questions[currentQuestionIdx].answer && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: '14px', padding: '1rem 1.2rem',
                marginBottom: '1.2rem',
                animation: 'fadeIn 0.3s ease'
              }}>
                <div style={{
                  minWidth: '28px', height: '28px', borderRadius: '50%',
                  background: 'rgba(34,197,94,0.2)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', flexShrink: 0
                }}>💡</div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.82rem', color: '#4ade80', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Correct Answer</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: '600', color: 'var(--text)', lineHeight: 1.4 }}>
                    {quizData.questions[currentQuestionIdx].answer || 'Answer not specified in this quiz'}
                  </div>
                </div>
              </div>
            )}

            {/* ── FOOTER BUTTONS ── */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                disabled={currentQuestionIdx === 0}
                onClick={prevQuestion}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '6px', padding: '0.9rem',
                  background: currentQuestionIdx === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px', cursor: currentQuestionIdx === 0 ? 'not-allowed' : 'pointer',
                  color: currentQuestionIdx === 0 ? 'rgba(255,255,255,0.2)' : 'var(--text)',
                  fontWeight: '700', fontSize: '0.9rem', transition: 'all 0.2s'
                }}
              >
                <ChevronLeft size={18} /> Back
              </button>

              {currentQuestionIdx === quizData.questions.length - 1 ? (
                <button
                  onClick={submitQuiz}
                  style={{
                    flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', padding: '0.9rem',
                    background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                    border: 'none', borderRadius: '14px', cursor: 'pointer',
                    color: '#fff', fontWeight: '800', fontSize: '0.95rem',
                    boxShadow: '0 6px 20px rgba(34,197,94,0.35)',
                    transition: 'all 0.2s'
                  }}
                >
                  <Send size={18} /> Finish & Submit
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  style={{
                    flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', padding: '0.9rem',
                    background: 'linear-gradient(135deg,#6c63ff,#48b0f7)',
                    border: 'none', borderRadius: '14px', cursor: 'pointer',
                    color: '#fff', fontWeight: '800', fontSize: '0.95rem',
                    boxShadow: '0 6px 20px rgba(108,99,255,0.35)',
                    transition: 'all 0.2s'
                  }}
                >
                  {userAnswers[currentQuestionIdx] !== undefined ? 'Next Question' : 'Skip'}
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* RESULTS SCREEN */}
        {user && user.role === 'student' && view === 'results' && (
          <motion.div 
            key="results" 
            className="results-view center-text"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Score Header */}
            <div style={{
              textAlign: 'center', marginBottom: '2rem'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
                {Math.round((score.correct / score.total) * 100) >= 80 ? '🏆' :
                 Math.round((score.correct / score.total) * 100) >= 50 ? '⭐' : '💪'}
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: '2rem', fontWeight: '900' }}>Quiz Complete!</h2>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontWeight: '600' }}>
                {Math.round((score.correct / score.total) * 100) >= 80
                  ? 'Outstanding performance! 🎉'
                  : Math.round((score.correct / score.total) * 100) >= 50
                  ? 'Good effort! Keep practicing 📚'
                  : 'Keep going! Every attempt makes you better 💡'}
              </p>
            </div>

            {/* Score Cards */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '2rem', justifyContent: 'center' }}>
              <div style={{
                flex: 1, maxWidth: '160px', padding: '1.5rem 1rem', textAlign: 'center',
                background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)',
                borderRadius: '20px'
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#4ade80' }}>{score.correct}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#4ade80', marginTop: '4px' }}>✓ Correct</div>
              </div>
              <div style={{
                flex: 1, maxWidth: '160px', padding: '1.5rem 1rem', textAlign: 'center',
                background: 'rgba(108,99,255,0.1)', border: '2px solid rgba(108,99,255,0.3)',
                borderRadius: '20px'
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#a78bfa' }}>
                  {Math.round((score.correct / score.total) * 100)}%
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#a78bfa', marginTop: '4px' }}>Score</div>
              </div>
              <div style={{
                flex: 1, maxWidth: '160px', padding: '1.5rem 1rem', textAlign: 'center',
                background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.3)',
                borderRadius: '20px'
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#f87171' }}>{score.wrong}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f87171', marginTop: '4px' }}>✕ Wrong</div>
              </div>
            </div>

            {/* Answer Review */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontWeight: '800', marginBottom: '1rem', fontSize: '1rem' }}>📝 Answer Review</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
                {quizData.questions.map((q, idx) => {
                  const userAns = userAnswers[idx];
                  const correct = q.answer;
                  const isRight = userAns === correct;
                  return (
                    <div key={idx} style={{
                      padding: '1rem 1.2rem',
                      background: isRight ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                      border: `1px solid ${isRight ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                      borderRadius: '12px'
                    }}>
                      <div style={{ fontWeight: '700', fontSize: '0.82rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                        Q{idx + 1}. {q.question.length > 80 ? q.question.slice(0, 80) + '...' : q.question}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.78rem', fontWeight: '700', padding: '3px 10px',
                          borderRadius: '99px',
                          background: isRight ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                          color: isRight ? '#4ade80' : '#f87171'
                        }}>
                          {isRight ? '✓ ' : '✕ '} Your: {userAns || 'Skipped'}
                        </span>
                        {!isRight && correct && (
                          <span style={{
                            fontSize: '0.78rem', fontWeight: '700', padding: '3px 10px',
                            borderRadius: '99px',
                            background: 'rgba(34,197,94,0.15)', color: '#4ade80'
                          }}>
                            💡 Correct: {correct}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => startQuiz(quizData)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '8px', padding: '0.9rem',
                  background: 'linear-gradient(135deg,#6c63ff,#48b0f7)',
                  border: 'none', borderRadius: '14px', cursor: 'pointer',
                  color: '#fff', fontWeight: '800', fontSize: '0.95rem',
                  boxShadow: '0 6px 20px rgba(108,99,255,0.35)'
                }}
              >
                <RefreshCw size={18} /> Retry Quiz
              </button>
              <button
                onClick={() => setView('home')}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '8px', padding: '0.9rem',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '14px', cursor: 'pointer',
                  color: 'var(--text)', fontWeight: '700', fontSize: '0.9rem'
                }}
              >
                Dashboard
              </button>
            </div>
          </motion.div>
        )}

        {/* ADMIN FILE SCANNING PORTAL */}
        {user && user.role === 'admin' && view === 'admin' && (
          <motion.div 
            key="admin" 
            className="admin-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>AI Scanning Center</h2>
              <button className="duo-btn duo-btn-white" onClick={() => setView('home')} style={{ width: 'auto', padding: '0.6rem 1.2rem' }}>
                <ChevronLeft size={18} /> Back Dashboard
              </button>
            </div>

            <div className="admin-badge-notice">
              🔒 Admin Access Level Authorized. Scanning large PDFs or Docx files will load generated MCQs directly.
            </div>

            <div className="file-dropzone" onClick={() => fileInputRef.current.click()}>
              <Upload size={48} color="var(--playful-blue)" />
              <p>Click to Upload Study Document</p>
              <span>Supports PDF, DOCX, DOC files</span>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx,.doc" hidden />
            </div>

            {loading && (
              <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                <div className="spinner"></div>
                <p style={{ fontWeight: '700', color: 'var(--text-muted)' }}>
                  Analyzing study document... please wait.
                </p>
              </div>
            )}

            {adminPreview && (
              <div className="admin-preview-box">
                <div className="preview-title-bar">
                  <div>
                    <h3>Scan Detected {adminPreview.total_questions} Questions</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                      File: {adminPreview.filename}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="duo-btn duo-btn-white" 
                      onClick={() => setAdminPreview(null)} 
                      style={{ width: 'auto', padding: '0.6rem 1.5rem', boxShadow: 'none' }}
                    >
                      Discard & Back
                    </button>
                    <button className="duo-btn duo-btn-green" onClick={saveQuizToSystem} style={{ width: 'auto', padding: '0.6rem 1.5rem' }}>
                      <CheckCircle size={18} /> Save & Publish Quiz
                    </button>
                  </div>
                </div>

                <div className="admin-preview-list">
                  {adminPreview.questions.map((q, idx) => (
                    <div key={idx} className="admin-preview-item">
                      <p>{idx + 1}. {q.question}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', margin: '8px 0', fontSize: '0.9rem' }}>
                        {q.options.map((opt, i) => (
                          <div key={i} style={{ color: opt === q.answer ? 'var(--playful-green-border)' : 'var(--text)', fontWeight: opt === q.answer ? '700' : '400' }}>
                            • {opt}
                          </div>
                        ))}
                      </div>
                      <div className="correct-ans">Correct Answer: {q.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

export default App;
