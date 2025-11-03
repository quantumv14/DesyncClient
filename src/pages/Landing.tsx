import { Link } from 'react-router-dom'
import ServerStatus from '../components/ServerStatus'
import './Landing.css'

interface LandingProps {
  onGetDesync: () => void
}

function Landing({ onGetDesync }: LandingProps) {
  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-links">
          <Link to="/" className="nav-link active">HOME</Link>
          <Link to="/#features" className="nav-link">FEATURES</Link>
          <Link to="/#download" className="nav-link">DOWNLOAD</Link>
          <ServerStatus />
          <a href="https://discord.gg/desync" className="nav-link" target="_blank" rel="noopener noreferrer">DISCORD</a>
        </div>
        <div className="nav-auth">
          <Link to="/auth" className="nav-link">Log in</Link>
          <Link to="/auth" className="nav-link">Register</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="title-main">DESYNC</span>
          </h1>
          <p className="hero-subtitle">DOMINATE MOVEMENT WITH DESYNC.CC</p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={onGetDesync}>GET DESYNC</button>
            <button className="btn btn-secondary">READ MORE...</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="features-header">
          <h2 className="section-title">Why Choose Desync?</h2>
          <p className="section-subtitle">Desync is engineered to perfect every aspect of your movement</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon icon-bolt"></div>
            <h3 className="feature-title">Movement Perfection</h3>
            <p className="feature-description">
              Master strafe jumping, bunny hopping, and advanced movement techniques with precision assistance.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-target"></div>
            <h3 className="feature-title">Undetected Performance</h3>
            <p className="feature-description">
              Stay hidden with our advanced protection. Software engineered for maximum security and reliability.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-lock"></div>
            <h3 className="feature-title">Secure & Private</h3>
            <p className="feature-description">
              Your account stays protected. Our software ensures you maintain complete anonymity.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-chat"></div>
            <h3 className="feature-title">24/7 Support</h3>
            <p className="feature-description">
              Active community and support team. We're here around the clock to keep you moving smoothly.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-gear"></div>
            <h3 className="feature-title">Easy Setup</h3>
            <p className="feature-description">
              No complex configuration needed. Activate your advantage with our intuitive interface in seconds.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-diamond"></div>
            <h3 className="feature-title">Premium Quality</h3>
            <p className="feature-description">
              Elite-tier performance at an accessible price. Experience top-tier movement enhancement.
            </p>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="video-section">
        <div className="video-content">
          <h2 className="section-title">Desync in Action</h2>
          <p className="section-description">
            Experience the power of desync live in-game. Watch as precision, speed, and innovation combine to 
            dominate every match. With fluid movement and intuitive controls, desync sets the standard for 
            Counter-Strike 2 movement enhancement.
          </p>
          <div className="video-placeholder">
            <div className="video-play-button">▶</div>
            <p className="video-text">Movement Showcase Video</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="download">
        <div className="cta-content">
          <h3 className="cta-label">STARTING AT $3.00/MONTH</h3>
          <h2 className="cta-title">COUNTER STRIKE 2</h2>
          <p className="cta-description">
            Unleash your inner legend in Counter-Strike 2 with desync. This premium, budget-friendly software 
            offers unmatched movement customization and exclusive features, putting you on the fast track to 
            dominating the battlefield. Don't settle for average, elevate your CS2 experience today.
          </p>
          <div className="cta-buttons">
            <button className="btn btn-primary" onClick={onGetDesync}>BUY NOW</button>
            <button className="btn btn-secondary">READ MORE...</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">D</span>
            <span className="footer-text">All rights reserved to Desync © 2024</span>
          </div>
          <div className="footer-links">
            <a href="#features" className="footer-link">Features</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
