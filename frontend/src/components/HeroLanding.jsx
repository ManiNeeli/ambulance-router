import React, { useState } from 'react';
import { Siren, ArrowRight, ArrowLeft, ShieldCheck, Zap, Activity, Navigation } from 'lucide-react';

export default function HeroLanding({ onLaunchDemo, onExploreMap }) {
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = [
    {
      titleRed: "CLEARING TRAFFIC.",
      titleDark: "SAVING LIVES IN SECONDS.",
      tag: "REAL-TIME CAD NAVIGATION ENGINE",
      desc: "Autonomous emergency routing that dynamically evaluates active school zones, weather hazards, and triggers instant green-wave preemption across congested city grids."
    },
    {
      titleRed: "GREEN WAVE EVP.",
      titleDark: "400M INTERSECTION OVERRIDE.",
      tag: "EMERGENCY VEHICLE PREEMPTION",
      desc: "Simultaneous traffic light synchronization that sweeps civilian vehicles out of emergency corridors before the ambulance arrives."
    },
    {
      titleRed: "SAFETY FIRST.",
      titleDark: "ZERO SCHOOL ZONE TRADEOFFS.",
      tag: "INTELLIGENT RISK ASSESSMENT",
      desc: "Automated speed-zone sensing detects 07:30–09:00 & 14:30–16:00 school hours, safeguarding pediatric zones while prioritizing critical patient acuity."
    }
  ];

  const currentSlide = slides[slideIndex];

  const nextSlide = () => setSlideIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="hero-landing-wrapper">
      <div className="hero-landing-container">
        
        {/* ================= LEFT SECTION (YELLOW) ================= */}
        <div className="hero-split hero-left">
          {/* Top Brand Tag */}
          <div className="hero-eyebrow">
            <span className="eyebrow-dot"></span>
            <span className="eyebrow-text">{currentSlide.tag}</span>
          </div>

          {/* Main Heading with Bold Oversized Typography & Strong Red Accent */}
          <h1 className="hero-heading">
            <span className="hero-text-red">{currentSlide.titleRed}</span>
            <br />
            <span className="hero-text-dark">{currentSlide.titleDark}</span>
          </h1>

          {/* Subtitle Description */}
          <p className="hero-description">
            {currentSlide.desc}
          </p>

          {/* Call-to-Action Buttons */}
          <div className="hero-actions">
            <button
              type="button"
              className="btn-hero-primary"
              onClick={onLaunchDemo}
            >
              <span>Launch Live Mission</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              className="btn-hero-secondary"
              onClick={onExploreMap}
            >
              <span>Explore Corridors</span>
              <Navigation size={17} strokeWidth={2} />
            </button>
          </div>

          {/* Bottom-Left Circular Navigation Buttons */}
          <div className="hero-bottom-nav">
            <div className="hero-nav-buttons">
              <button
                type="button"
                className="btn-circular"
                onClick={prevSlide}
                aria-label="Previous feature"
              >
                <ArrowLeft size={18} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                className="btn-circular"
                onClick={nextSlide}
                aria-label="Next feature"
              >
                <ArrowRight size={18} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="hero-dots">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`dot-indicator ${idx === slideIndex ? 'active' : ''}`}
                  onClick={() => setSlideIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ================= VERTICAL DECORATIVE STRIPES ================= */}
        <div className="hero-divider-stripes" aria-hidden="true">
          <span className="stripe stripe-1"></span>
          <span className="stripe stripe-2"></span>
          <span className="stripe stripe-3"></span>
        </div>

        {/* ================= RIGHT SECTION (TEAL) ================= */}
        <div className="hero-split hero-right">
          
          {/* Top-Right Compact Navigation Menu */}
          <nav className="hero-top-nav">
            <a href="#operation-console" className="nav-link" onClick={onExploreMap}>Live Map</a>
            <a href="#operation-console" className="nav-link" onClick={onLaunchDemo}>Green Wave</a>
            <a href="#operation-console" className="nav-link" onClick={onLaunchDemo}>CAD Telemetry</a>
            <button
              type="button"
              className="btn-nav-emergency"
              onClick={onLaunchDemo}
            >
              <Siren size={15} />
              <span>DISPATCH 911</span>
            </button>
          </nav>

          {/* Center Product / Hero Visual Stage */}
          <div className="hero-product-stage">
            
            {/* Playful Organic / Blob-Shaped Decorative Elements */}
            <div className="blob-element blob-yellow" aria-hidden="true"></div>
            <div className="blob-element blob-white" aria-hidden="true"></div>
            <div className="blob-element blob-red" aria-hidden="true"></div>

            {/* Floating Feature Badges */}
            <div className="floating-badge badge-preemption">
              <Zap size={16} color="#D71920" />
              <div>
                <strong>400m Preemption</strong>
                <span>Green Wave Active</span>
              </div>
            </div>

            <div className="floating-badge badge-speed">
              <Activity size={16} color="#08B7BA" />
              <div>
                <strong>-42% Delay</strong>
                <span>Direct Arterial Route</span>
              </div>
            </div>

            <div className="floating-badge badge-safety">
              <ShieldCheck size={16} color="#FFB91A" />
              <div>
                <strong>Safety Index 98/100</strong>
                <span>Pedestrian Safe</span>
              </div>
            </div>

            {/* Large Centered Product/Hero Image - Rapid Emergency Vehicle */}
            <div className="hero-product-container">
              <svg
                viewBox="0 0 520 280"
                className="hero-ambulance-svg"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Road surface & Speed lines */}
                <rect x="20" y="240" width="480" height="12" rx="6" fill="#222222" opacity="0.9" />
                <rect x="70" y="244" width="70" height="4" rx="2" fill="#FFFFFF" />
                <rect x="180" y="244" width="70" height="4" rx="2" fill="#FFFFFF" />
                <rect x="290" y="244" width="70" height="4" rx="2" fill="#FFFFFF" />
                <rect x="400" y="244" width="50" height="4" rx="2" fill="#FFFFFF" />

                {/* Ambulance Main Chassis (Flat White & Red livery) */}
                <path
                  d="M 60 215 
                     L 60 115 
                     Q 60 90, 85 90 
                     L 340 90 
                     L 395 125 
                     L 455 145 
                     Q 465 155, 465 175 
                     L 465 215 
                     Z"
                  fill="#FFFFFF"
                  stroke="#222222"
                  strokeWidth="5"
                  strokeLinejoin="round"
                />

                {/* Red Emergency Livery Stripe */}
                <path
                  d="M 60 160 L 465 160 L 465 190 L 60 190 Z"
                  fill="#D71920"
                />

                {/* Driver & Cabin Windows */}
                <path
                  d="M 345 100 L 390 128 L 390 152 L 345 152 Z"
                  fill="#222222"
                />
                <path
                  d="M 398 128 L 440 148 L 440 152 L 398 152 Z"
                  fill="#222222"
                />

                {/* Medical Cross Symbol */}
                <g transform="translate(180, 115)">
                  <circle cx="20" cy="20" r="26" fill="#FFB91A" stroke="#222222" strokeWidth="3" />
                  <rect x="16" y="6" width="8" height="28" rx="2" fill="#D71920" />
                  <rect x="6" y="16" width="28" height="8" rx="2" fill="#D71920" />
                </g>

                {/* Avionics Radar Dome & Lightbar */}
                <rect x="200" y="78" width="80" height="12" rx="6" fill="#222222" />
                <rect x="210" y="72" width="25" height="8" rx="3" fill="#D71920" />
                <rect x="245" y="72" width="25" height="8" rx="3" fill="#08B7BA" />
                <circle cx="360" cy="80" r="7" fill="#FFB91A" stroke="#222222" strokeWidth="3" />

                {/* Front Headlight & Grill */}
                <path d="M 458 175 L 465 175 L 465 195 L 458 195 Z" fill="#FFB91A" stroke="#222222" strokeWidth="2" />
                <rect x="450" y="200" width="15" height="12" rx="3" fill="#222222" />

                {/* Heavy-Duty Wheels */}
                {/* Rear Wheel */}
                <circle cx="140" cy="220" r="34" fill="#222222" />
                <circle cx="140" cy="220" r="20" fill="#FFFFFF" stroke="#222222" strokeWidth="4" />
                <circle cx="140" cy="220" r="8" fill="#D71920" />
                
                {/* Front Wheel */}
                <circle cx="395" cy="220" r="34" fill="#222222" />
                <circle cx="395" cy="220" r="20" fill="#FFFFFF" stroke="#222222" strokeWidth="4" />
                <circle cx="395" cy="220" r="8" fill="#08B7BA" />

                {/* Motion Lines */}
                <line x1="25" y1="130" x2="48" y2="130" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                <line x1="15" y1="150" x2="45" y2="150" stroke="#FFB91A" strokeWidth="4" strokeLinecap="round" />
                <line x1="30" y1="170" x2="50" y2="170" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
