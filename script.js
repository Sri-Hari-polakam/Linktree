/**
 * FUNNIII MEDIA - SRI HARI LINKTREE
 * Interactive Audio & Visual Engine, Tab Filtering, Particles & Micro-interactions
 */

document.addEventListener("DOMContentLoaded", () => {
  // Setup audio synthesizer
  const audio = new AudioSynthesizer();
  
  // Setup Intro Timeline
  initIntroSequence(audio);

  // Setup Dynamic Canvas Background
  initParticleCanvas();

  // Setup Mouse Glow Tracker (Desktop)
  initMouseGlow();

  // Setup Category Filtering Tabs
  initCategoryTabs(audio);

  // Setup Card Micro-interactions
  initCardAnimations(audio);

  // Setup Sound Toggle Button
  initSoundControl(audio);

  // Setup Share & Popup Features
  initPopupAndCopy(audio);

  // Setup Accent Theme Switcher
  initThemeSwitcher(audio);
});

/* ==========================================================================
   WEB AUDIO API SYNTHESIZER ENGINE
   ========================================================================== */
class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
    this.ambientGain = null;
    this.isMuted = localStorage.getItem("linktree_muted") === "true";
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.35;
      this.masterGain.connect(this.ctx.destination);

      this.isInitialized = true;
    } catch (e) {
      console.warn("AudioContext not supported or blocked", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.init();
    this.resume();

    this.isMuted = !this.isMuted;
    localStorage.setItem("linktree_muted", this.isMuted);

    if (this.masterGain) {
      const targetGain = this.isMuted ? 0 : 0.35;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    }

    if (!this.isMuted) {
      this.playChime();
    }

    return !this.isMuted;
  }

  playChime() {
    if (this.isMuted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chord

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.001, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.06 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.85);
    });
  }

  playClick() {
    if (this.isMuted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  playAmbientPad() {
    if (this.isMuted || this.ambientOsc1) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    this.ambientOsc1 = this.ctx.createOscillator();
    this.ambientOsc2 = this.ctx.createOscillator();
    this.ambientGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    this.ambientOsc1.type = "sine";
    this.ambientOsc2.type = "triangle";

    this.ambientOsc1.frequency.setValueAtTime(110, now); // A2
    this.ambientOsc2.frequency.setValueAtTime(164.81, now); // E3

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, now);

    this.ambientGain.gain.setValueAtTime(0.001, now);
    this.ambientGain.gain.exponentialRampToValueAtTime(0.03, now + 2);

    this.ambientOsc1.connect(filter);
    this.ambientOsc2.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.masterGain);

    this.ambientOsc1.start();
    this.ambientOsc2.start();
  }
}

/* ==========================================================================
   CINEMATIC INTRO CONTROLLER
   ========================================================================== */
function initIntroSequence(audio) {
  const intro = document.getElementById("intro-overlay");
  if (!intro) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    intro.classList.add("hidden");
    return;
  }

  setTimeout(() => {
    intro.classList.add("hidden");
    audio.playChime();
    audio.playAmbientPad();
  }, 1800);
}

/* ==========================================================================
   CATEGORY TABS FILTERING
   ========================================================================== */
function initCategoryTabs(audio) {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const sectionGroups = document.querySelectorAll(".section-group");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      audio.playClick();

      // Update active tab styling
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");

      sectionGroups.forEach(section => {
        if (filter === "all") {
          section.classList.remove("hidden");
        } else {
          const cat = section.getAttribute("data-category");
          if (cat === filter) {
            section.classList.remove("hidden");
          } else {
            section.classList.add("hidden");
          }
        }
      });
    });
  });
}

/* ==========================================================================
   DYNAMIC HTML5 CANVAS PARTICLES
   ========================================================================== */
function initParticleCanvas() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  let mouseX = width / 2;
  let mouseY = height / 2;

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const particleCount = Math.min(Math.floor(width / 24), 50);
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.8 + 1,
      alpha: Math.random() * 0.5 + 0.2
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139, 92, 246, ${p.alpha})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(6, 182, 212, ${0.15 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      const mdx = mouseX - p.x;
      const mdy = mouseY - p.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < 140) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = `rgba(236, 72, 153, ${0.2 * (1 - mdist / 140)})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
}

/* ==========================================================================
   DESKTOP MOUSE GLOW TRACKER
   ========================================================================== */
function initMouseGlow() {
  const glow = document.getElementById("mouse-glow");
  if (!glow || window.innerWidth < 768) return;

  let currentX = window.innerWidth / 2;
  let currentY = window.innerHeight / 2;
  let targetX = currentX;
  let targetY = currentY;

  window.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  function update() {
    currentX += (targetX - currentX) * 0.1;
    currentY += (targetY - currentY) * 0.1;
    glow.style.left = `${currentX}px`;
    glow.style.top = `${currentY}px`;
    requestAnimationFrame(update);
  }

  update();
}

/* ==========================================================================
   CARD INTERACTIONS & AUDIO FEEDBACK
   ========================================================================== */
function initCardAnimations(audio) {
  const interactiveElems = document.querySelectorAll(".project-card, .service-card, .direct-contact-card, .social-icon-pill, .action-btn, .contact-pill");
  
  interactiveElems.forEach((elem) => {
    elem.addEventListener("click", () => {
      audio.playClick();
    });
  });
}

/* ==========================================================================
   SOUND TOGGLE CONTROL
   ========================================================================== */
function initSoundControl(audio) {
  const soundBtn = document.getElementById("sound-toggle");
  if (!soundBtn) return;

  if (!audio.isMuted) {
    soundBtn.classList.add("active");
  }

  soundBtn.addEventListener("click", () => {
    const isNowActive = audio.toggleSound();
    if (isNowActive) {
      soundBtn.classList.add("active");
      showToast("Ambient Audio Enabled");
    } else {
      soundBtn.classList.remove("active");
      showToast("Audio Muted");
    }
  });
}

/* ==========================================================================
   POPUP MODAL & COPY TO CLIPBOARD
   ========================================================================== */
function initPopupAndCopy(audio) {
  const shareInput = document.getElementById("share-url-input");
  if (shareInput) {
    shareInput.value = window.location.href;
    
    // Update WhatsApp share link
    const waShare = document.getElementById("wa-share-link");
    if (waShare) {
      const shareText = encodeURIComponent(`Check out Sri Hari (Founder of Funniii Media & Funniii Tech): ${window.location.href}`);
      waShare.href = `https://api.whatsapp.com/send?text=${shareText}`;
    }
  }

  const popup = document.getElementById("popup");
  if (popup) {
    popup.addEventListener("click", (e) => {
      if (e.target === popup) {
        closePopup();
      }
    });
  }
}

function openPopup() {
  const popup = document.getElementById("popup");
  if (popup) {
    popup.classList.add("show");
  }
}

function closePopup() {
  const popup = document.getElementById("popup");
  if (popup) {
    popup.classList.remove("show");
  }
}

function copyLink() {
  const shareInput = document.getElementById("share-url-input");
  if (!shareInput) return;

  shareInput.select();
  shareInput.setSelectionRange(0, 99999);

  navigator.clipboard.writeText(shareInput.value).then(() => {
    showToast("Link copied to clipboard!");
    closePopup();
  }).catch(() => {
    document.execCommand("copy");
    showToast("Link copied to clipboard!");
    closePopup();
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toast-text");
  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* ==========================================================================
   ACCENT COLOR THEME SWITCHER
   ========================================================================== */
function initThemeSwitcher(audio) {
  const settingsBtn = document.getElementById("settings-btn");
  if (!settingsBtn) return;

  const colorPalettes = [
    { primary: "#8b5cf6", secondary: "#06b6d4", tertiary: "#ec4899" }, // Violet Cyber
    { primary: "#10b981", secondary: "#06b6d4", tertiary: "#8b5cf6" }, // Emerald Cyan
    { primary: "#f43f5e", secondary: "#fb923c", tertiary: "#a855f7" }, // Sunset Neon
    { primary: "#06b6d4", secondary: "#3b82f6", tertiary: "#ec4899" }  // Ocean Blue
  ];

  let currentIndex = 0;

  settingsBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % colorPalettes.length;
    const theme = colorPalettes[currentIndex];

    document.documentElement.style.setProperty("--primary-accent", theme.primary);
    document.documentElement.style.setProperty("--secondary-accent", theme.secondary);
    document.documentElement.style.setProperty("--tertiary-accent", theme.tertiary);

    showToast("Theme Accent Shifted!");
  });
}

/* ==========================================================================
   SMRU KPIS MODAL CONTROLLER
   ========================================================================== */
function openKpiModal() {
  const kpiModal = document.getElementById("kpi-modal");
  if (kpiModal) {
    kpiModal.classList.add("show");
  }
}

function closeKpiModal() {
  const kpiModal = document.getElementById("kpi-modal");
  if (kpiModal) {
    kpiModal.classList.remove("show");
  }
}

