import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Upload, Play, CheckCircle, RefreshCw, Settings, ChevronLeft, 
  ChevronRight, Trophy, BrainCircuit, Send, User, LogOut, Lock, 
  ShieldAlert, Smartphone, ShieldCheck, Mail 
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
  
  // Dashboard states
  const [quizzesList, setQuizzesList] = useState([]);
  const [dashboardData, setDashboardData] = useState([]);

  // Fetch session on load and retrieve current quiz
  useEffect(() => {
    const savedUser = localStorage.getItem('current_user');
    let u = null;
    if (savedUser) {
      try {
        u = JSON.parse(savedUser);
        setUser(u);
        setView('home');
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }
    fetchQuizzes();
    if (u) fetchDashboardData(u);
  }, []);

  // Initialize Google Token Client for programmatically launching Google Account picker
  useEffect(() => {
    if (user) return;

    const initGoogleTokenClient = () => {
      if (window.google) {
        try {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: customClientId,
            scope: 'openid email profile',
            callback: async (tokenResponse) => {
              if (tokenResponse && tokenResponse.access_token) {
                setLoading(true);
                try {
                  // Fetch user details from Google UserInfo endpoint using the access token
                  const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                  });
                  
                  const payload = res.data;
                  if (payload) {
                    const loggedUser = {
                      name: payload.name || payload.given_name || payload.email.split('@')[0],
                      role: authPortalMode, 
                      email: payload.email,
                      picture: payload.picture
                    };
                    
                    setUser(loggedUser);
                    localStorage.setItem('current_user', JSON.stringify(loggedUser));
                    
                    if (authPortalMode === 'admin') {
                      setView('admin');
                    } else {
                      setView('home');
                    }
                  } else {
                    setAuthError('Unable to extract Google Account details.');
                  }
                } catch (err) {
                  console.error("Failed to fetch Google profile info:", err);
                  setAuthError('Failed to retrieve user details from Google.');
                } finally {
                  setLoading(false);
                }
              }
            }
          });
          setTokenClient(client);
        } catch (e) {
          console.error("Google OAuth token client initialization failed: ", e);
        }
      }
    };

    const timer = setTimeout(initGoogleTokenClient, 150);
    return () => clearTimeout(timer);
  }, [user, authPortalMode, customClientId]);

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

  const completeBypassSignIn = (email, name) => {
    setAuthError('');
    setAuthSuccess('');
    const loggedUser = {
      name: name,
      role: authPortalMode,
      email: email,
      picture: ''
    };
    setUser(loggedUser);
    localStorage.setItem('current_user', JSON.stringify(loggedUser));
    setShowBypassOverlay(false);
    
    if (authPortalMode === 'admin') {
      setView('admin');
    } else {
      setView('home');
    }
  };

  const fetchQuizzes = async () => {
    try {
      const res = await axios.get(`${API_URL}/quizzes`);
      setQuizzesList(res.data);
      const currentRes = await axios.get(`${API_URL}/get-quiz`);
      if (currentRes.data && currentRes.data.questions) {
        setQuizData(currentRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch quizzes");
    }
  };

  const fetchDashboardData = async (currentUser) => {
    if (!currentUser) return;
    try {
      if (currentUser.role === 'admin') {
        const res = await axios.get(`${API_URL}/faculty-quizzes?email=${currentUser.email}`);
        setDashboardData(res.data);
      } else {
        const res = await axios.get(`${API_URL}/student-attempts?email=${currentUser.email}`);
        setDashboardData(res.data);
      }
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
      const res = await axios.post(`${API_URL}/upload`, formData);
      setAdminPreview(res.data);
    } catch (err) {
      alert("Analysis failed. Try a smaller file or check API quota.");
    } finally {
      setLoading(false);
    }
  };

  const saveQuizToSystem = async () => {
    if (!adminPreview) return;
    try {
      const payload = { ...adminPreview, faculty_email: user.email };
      await axios.post(`${API_URL}/save-quiz`, payload);
      setAdminPreview(null);
      alert("Quiz Published!");
      fetchQuizzes();
      fetchDashboardData(user);
      setView('home'); 
    } catch (err) {
      alert("Failed to save quiz");
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

    // Auto-move to next after a tiny delay for visual confirmation
    setTimeout(() => {
      if (currentQuestionIdx < quizData.questions.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
      }
    }, 400); 
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
       });
       fetchDashboardData(user);
    } catch (err) {
       console.error("Failed to save attempt");
    }

    setView('results');
  };

  // Local Accounts Auth Submit
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
        const res = await axios.post(`${API_URL}/signup`, payload);
        const newUser = res.data;
        
        // Auto login directly
        setUser(newUser);
        localStorage.setItem('current_user', JSON.stringify(newUser));

        // Redirect
        if (authPortalMode === 'admin') {
          setView('admin');
        } else {
          setView('home');
        }

        // Reset
        setFormName('');
        setFormEmail('');
        setFormPassword('');
        setFormPhone('');
      } catch (err) {
        if (err.response && err.response.data && err.response.data.detail) {
          setAuthError(err.response.data.detail);
        } else {
          setAuthError('Sign up failed. Please try again.');
        }
      }
    } else {
      // Sign In Handler
      if (!formEmail || !formPassword) {
        setAuthError('Please enter your email and password.');
        return;
      }

      try {
        const payload = {
          email: formEmail,
          password: formPassword,
          role: authPortalMode
        };
        const res = await axios.post(`${API_URL}/signin`, payload);
        const matchingUser = res.data;

        setUser(matchingUser);
        localStorage.setItem('current_user', JSON.stringify(matchingUser));
        if (authPortalMode === 'admin') {
          setView('admin');
        } else {
          setView('home');
        }
      } catch (err) {
        if (err.response && err.response.data && err.response.data.detail) {
          setAuthError(err.response.data.detail);
        } else {
          setAuthError('Invalid email or password credentials. Please verify your entries.');
        }
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('current_user');
    setView('home');
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setAuthError('');
    setAuthSuccess('');
  };

  return (
    <div className={`app-container ${!user ? 'login-mode' : ''}`}>
      {/* HEADER SECTION - Only show if logged in to allow for split-screen login */}
      {user && (
        <header className="header">
        <div className="logo-container">
          <div className="logo-icon">
            <BrainCircuit size={28} color="#fff" />
          </div>
          <span className="logo-text">QuizGen AI</span>
          <span className="logo-badge">Portal</span>
        </div>

        <div className="user-profile-header">
          {/* Settings gear is hidden from public view as requested */}
          {user && user.role === 'admin' && (
            <button 
              className="duo-btn duo-btn-white" 
              style={{ width: 'auto', padding: '0.4rem 0.6rem', borderRadius: '12px', boxShadow: 'none' }}
              onClick={() => setShowConfig(!showConfig)}
              title="Google OAuth Settings"
            >
              <Settings size={16} />
            </button>
          )}

          {user && (
            <div className="user-badge-wrapper" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {user.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name} 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--playful-blue)' }}
                />
              ) : null}
              <div className={`user-badge ${user.role}`}>
                {user.role === 'admin' ? <ShieldCheck size={16} /> : <User size={16} />}
                <span>{user.name} ({user.role.toUpperCase()})</span>
              </div>
              <button 
                className="duo-btn duo-btn-white" 
                style={{ padding: '0.4rem 1rem', borderRadius: '12px', width: 'auto', boxShadow: 'none' }} 
                onClick={handleLogout}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </header>
      )}

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
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
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

                <div style={{ marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>
                    {authPortalMode === 'admin' ? 'Admin Portal Workspace' : 'Welcome back'}
                  </h2>
                  <p style={{ color: '#6b7280', marginTop: '5px', fontSize: '0.95rem' }}>
                    {authPortalMode === 'admin' ? 'Create, upload & distribute practice quizzes.' : 'Please enter your details to sign in.'}
                  </p>
                </div>

            {/* SIGN IN / SIGN UP TABS */}
            <div className="tab-switcher" style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: '1rem' }}>
              <button 
                type="button"
                className={`tab-btn`}
                onClick={() => { setActiveFormTab('signin'); setAuthError(''); setAuthSuccess(''); }}
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
                onClick={() => { setActiveFormTab('signup'); setAuthError(''); setAuthSuccess(''); }}
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

            {/* GOOGLE SIGN-IN CONTAINER */}
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
                  margin: '0 auto 10px',
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

            <div className="duo-divider" style={{ margin: '0.8rem 0' }}>or use email login</div>

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
                <input 
                  type="password" 
                  className="duo-input" 
                  placeholder="••••••••" 
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                />
              </div>

              <button type="submit" className={authPortalMode === 'admin' ? 'duo-btn duo-btn-blue' : 'duo-btn duo-btn-green'}>
                {activeFormTab === 'signin' ? 'Sign In' : 'Create Account'}
              </button>

              {activeFormTab === 'signup' && (
                <button 
                  type="button" 
                  className="duo-btn duo-btn-white" 
                  style={{ marginTop: '10px', boxShadow: 'none' }}
                  onClick={() => { setActiveFormTab('signin'); setAuthError(''); setAuthSuccess(''); }}
                >
                  Back to Sign In
                </button>
              )}
            </form>
            
            {activeFormTab === 'signin' && authPortalMode === 'admin' && (
              <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#6b7280', textAlign: 'center' }}>
                Default Seeded Credentials: <strong>admin@gmail.com</strong> / <strong>admin123</strong>
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
            className="main-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ maxWidth: '1000px', width: '100%', margin: '0 auto', textAlign: 'left' }}
          >
            {user.role === 'admin' ? (
              <div>
                <div className="dashboard-header-flex">
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 5px 0' }}>Admin Dashboard</h2>
                    <p style={{ color: 'var(--text-muted)', fontWeight: '700', margin: 0 }}>
                      Manage your uploaded quizzes, {user.name}.
                    </p>
                  </div>
                  <button className="duo-btn duo-btn-blue" onClick={() => setView('admin')} style={{ width: 'auto', padding: '0.6rem 1.2rem' }}>
                    <Settings size={20} /> Open AI Scanning Portal
                  </button>
                </div>

                <h3 style={{ marginTop: '2rem' }}>My Uploaded Quizzes</h3>
                {dashboardData.length === 0 ? (
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="dashboard-header-flex">
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 5px 0' }}>Welcome back, {user.name}!</h2>
                    <p style={{ color: 'var(--text-muted)', fontWeight: '700', margin: 0 }}>
                      Ready to level up your skills today?
                    </p>
                  </div>
                </div>

                {/* Dashboard Stats */}
                <h3 style={{ marginTop: '2rem' }}>My Dashboard & Past Attempts</h3>
                {dashboardData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed var(--border)', borderRadius: '20px', marginBottom: '2rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontWeight: '700' }}>You haven't attempted any quizzes yet.</p>
                  </div>
                ) : (
                  <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                    {dashboardData.slice(0, 6).map((attempt, idx) => (
                      <div key={idx} className="glass-card" style={{ textAlign: 'center' }}>
                        <div className="glass-card-header">{attempt.quiz_title}</div>
                        <div className="score-ring-container" style={{ '--percentage': attempt.percentage }}>
                          <div className="score-ring-inner">{attempt.percentage}%</div>
                        </div>
                        <div className="glass-card-body">
                          Score: {attempt.score} / {attempt.total} <br/>
                          <span style={{ fontSize: '0.8rem' }}>{new Date(attempt.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Available Quizzes */}
                <h3 style={{ marginTop: '2rem', borderTop: '2px solid var(--border)', paddingTop: '2rem' }}>Available Practice Tests</h3>
                {quizzesList.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontWeight: '700' }}>No tests available right now.</p>
                ) : (
                  <div className="dashboard-grid">
                    {quizzesList.map((quiz, idx) => (
                      <div key={idx} className="glass-card">
                        <div className="glass-card-header">{quiz.title || "Untitled Test"}</div>
                        <div className="glass-card-body">
                          <div>Questions: {quiz.questions?.length || 0}</div>
                          <div>By: {quiz.faculty_email || "Admin"}</div>
                        </div>
                        <button 
                          className="duo-btn duo-btn-green" 
                          onClick={() => startQuiz(quiz)}
                          style={{ marginTop: 'auto', padding: '0.6rem' }}
                        >
                          <Play size={18} fill="#fff" /> Play
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
            <div className="quiz-top-info">
              <button className="exit-btn" onClick={() => setView('home')}>
                <ChevronLeft size={20} /> Quit Practice
              </button>
              <div style={{ fontWeight: '800', color: 'var(--text-muted)' }}>
                Question {currentQuestionIdx + 1} of {quizData.questions.length}
              </div>
            </div>

            {/* Playful Progress Bar */}
            <div className="duo-progress-bar">
              <div 
                className="duo-progress-fill" 
                style={{ width: `${((currentQuestionIdx + 1) / quizData.questions.length) * 100}%` }}
              ></div>
            </div>

            <div className="question-text">
              {quizData.questions[currentQuestionIdx].question}
            </div>

            <div className="options-grid">
              {quizData.questions[currentQuestionIdx].options.map((opt, i) => {
                const charCode = String.fromCharCode(65 + i);
                return (
                  <button 
                    key={i} 
                    className={`option-card ${userAnswers[currentQuestionIdx] === opt ? 'selected' : ''}`}
                    onClick={() => selectOption(opt)}
                  >
                    <span className="option-badge">{charCode}</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            <div className="quiz-footer">
              <button 
                className="duo-btn duo-btn-white" 
                disabled={currentQuestionIdx === 0} 
                onClick={prevQuestion}
                style={{ flex: 1 }}
              >
                <ChevronLeft size={20} /> Back
              </button>

              {currentQuestionIdx === quizData.questions.length - 1 ? (
                <button 
                  className="duo-btn duo-btn-green" 
                  onClick={submitQuiz}
                  style={{ flex: 2 }}
                >
                  <Send size={20} /> Finish & Submit
                </button>
              ) : (
                <button 
                  className="duo-btn duo-btn-blue" 
                  onClick={nextQuestion}
                  style={{ flex: 2 }}
                >
                  Skip Question <ChevronRight size={20} />
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
            <div className="results-header">
              <div className="trophy-container">
                <span className="trophy-logo">🏆</span>
              </div>
              <h2>Lesson Complete!</h2>
              <p style={{ color: 'var(--text-muted)', fontWeight: '800' }}>
                You have finished your practice quiz. Here is your summary score!
              </p>
            </div>

            <div className="stats-grid">
              <div className="stat-box correct">
                <div className="stat-value">{score.correct}</div>
                <div className="stat-label">Correct</div>
              </div>
              <div className="stat-box wrong">
                <div className="stat-value">{score.wrong}</div>
                <div className="stat-label">Incorrect</div>
              </div>
            </div>

            <button className="duo-btn duo-btn-green" onClick={() => setView('home')} style={{ maxWidth: '300px', margin: '0 auto' }}>
              <RefreshCw size={20} /> Practice Again
            </button>
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
