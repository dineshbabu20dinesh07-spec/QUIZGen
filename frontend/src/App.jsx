import React, { useState } from 'react';
import { 
  Home, Video, Image as ImageIcon, PenTool, Film, AlignLeft, 
  Mic, Folder, LayoutTemplate, Settings, HelpCircle, Moon, Globe,
  Search, Crown, Bell, Sparkles
} from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [promptText, setPromptText] = useState('');

  return (
    <div className="app-container">
      
      {/* LEFT SIDEBAR */}
      <aside className="sidebar">
        <div className="brand-logo">
          <AlignLeft size={24} color="#8B5CF6" />
          DHURVA 3.0
        </div>

        <div className="nav-section">
          <div className="nav-section-title">AI Tools</div>
          <a className={`nav-item ${activeTab === 'Home' ? 'active' : ''}`} onClick={() => setActiveTab('Home')}>
            <Home /> Home
          </a>
          <a className={`nav-item ${activeTab === 'Video' ? 'active' : ''}`} onClick={() => setActiveTab('Video')}>
            <Video /> AI Video Generator
            <span className="nav-badge badge-new">NEW</span>
          </a>
          <a className={`nav-item ${activeTab === 'Poster' ? 'active' : ''}`} onClick={() => setActiveTab('Poster')}>
            <ImageIcon /> AI Poster Maker
            <span className="nav-badge badge-new">NEW</span>
          </a>
          <a className={`nav-item ${activeTab === 'Design' ? 'active' : ''}`} onClick={() => setActiveTab('Design')}>
            <PenTool /> AI Design Engine
            <span className="nav-badge badge-pro">PRO</span>
          </a>
          <a className={`nav-item ${activeTab === 'Shorts' ? 'active' : ''}`} onClick={() => setActiveTab('Shorts')}>
            <Film /> AI Shorts / Reels
          </a>
          <a className={`nav-item ${activeTab === 'Script' ? 'active' : ''}`} onClick={() => setActiveTab('Script')}>
            <AlignLeft /> AI Script Writer
          </a>
          <a className={`nav-item ${activeTab === 'Voice' ? 'active' : ''}`} onClick={() => setActiveTab('Voice')}>
            <Mic /> AI Voice / Dubbing
          </a>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Library</div>
          <a className="nav-item">
            <Folder /> My Projects
          </a>
          <a className="nav-item">
            <LayoutTemplate /> Templates
          </a>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-around', padding: '20px' }}>
          <Moon size={20} color="#9CA3AF" style={{cursor: 'pointer'}} />
          <Globe size={20} color="#9CA3AF" style={{cursor: 'pointer'}} />
          <HelpCircle size={20} color="#9CA3AF" style={{cursor: 'pointer'}} />
          <Settings size={20} color="#9CA3AF" style={{cursor: 'pointer'}} />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        
        {/* Topbar */}
        <header className="topbar">
          <div className="search-bar">
            <Search size={18} color="#9CA3AF" />
            <input type="text" placeholder="Search projects, tools..." />
          </div>
          
          <div className="topbar-right">
            <button className="btn-premium">
              <Crown size={16} /> Premium Plan
            </button>
            <div className="credits-badge">
              <span style={{color: '#3B82F6'}}>&#8734;</span> 12,450
            </div>
            <Bell size={20} color="#9CA3AF" style={{cursor: 'pointer'}} />
            <div className="user-profile">
              <div className="avatar">DH</div>
              <span>Dhurva</span>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="content-scrollable">
          
          {/* Hero Banner */}
          <div className="hero-banner">
            <div className="hero-content">
              <div className="hero-subtitle">WELCOME TO DHURVA 3.0</div>
              <h1 className="hero-title">
                CREATE. <span>INNOVATE.</span><br/>DOMINATE.
              </h1>
              <p style={{color: '#9CA3AF', marginBottom: '25px', fontSize: '0.9rem'}}>
                AI-Powered Video & Poster Creation Platform
              </p>
              <button className="btn-primary">
                + New Project <Sparkles size={18} />
              </button>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="section-title">Powerful AI Tools</div>
          <div className="tools-grid">
            <div className="tool-card">
              <div className="tool-icon-wrapper">
                <Video size={24} />
              </div>
              <h3>AI Video Generator</h3>
              <p>Create stunning videos from text prompts.</p>
              <div className="tool-card-action">Start &gt;</div>
            </div>
            
            <div className="tool-card">
              <div className="tool-icon-wrapper">
                <ImageIcon size={24} />
              </div>
              <h3>AI Poster Maker</h3>
              <p>Design amazing posters automatically.</p>
              <div className="tool-card-action">Start &gt;</div>
            </div>
            
            <div className="tool-card">
              <div className="tool-icon-wrapper">
                <PenTool size={24} />
              </div>
              <h3>AI Design Engine</h3>
              <p>Canva-level smart design engine.</p>
              <div className="tool-card-action">Start &gt;</div>
            </div>
            
            <div className="tool-card">
              <div className="tool-icon-wrapper">
                <Film size={24} />
              </div>
              <h3>AI Shorts / Reels</h3>
              <p>Vertical videos in seconds.</p>
              <div className="tool-card-action">Start &gt;</div>
            </div>
            
            <div className="tool-card">
              <div className="tool-icon-wrapper">
                <AlignLeft size={24} />
              </div>
              <h3>AI Script Writer</h3>
              <p>Write scripts with AI.</p>
              <div className="tool-card-action">Start &gt;</div>
            </div>
          </div>

        </div>
      </main>

      {/* RIGHT PANEL */}
      <aside className="right-panel">
        <div className="panel-header">
          <div className="panel-title">What do you want to create?</div>
          <div className="prompt-box">
            <textarea 
              placeholder="Describe your idea... (video, poster, voice, script)"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
            />
            <div className="prompt-footer">
              <span className="char-count">{promptText.length} chars</span>
            </div>
          </div>
        </div>
        
        <div className="generate-area">
          <button className="btn-generate">
            🎬 Generate Story <Sparkles size={18} />
          </button>
          <div className="generate-hint">Enter a prompt to get started</div>
        </div>
      </aside>
      
    </div>
  );
}

export default App;
