/**
 * Zetinator Portfolio Interactive Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSkillFilters();
  initModals();
  initClipboardActions();
  initBackgroundControls();
  initTiltEffect();
  initReadingQuotes();
});

/* ==========================================================================
   Navigation & Scrollspy
   ========================================================================== */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  // Sticky header blur effect on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // IntersectionObserver for scrollspy
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // Mobile drawer controls
  function openDrawer() {
    mobileDrawer.classList.add('open');
    drawerOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    mobileToggle.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
    document.body.style.overflow = '';
    mobileToggle.setAttribute('aria-expanded', 'false');
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      if (mobileDrawer.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', closeDrawer);
  }

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* ==========================================================================
   Skill Filter Chips
   ========================================================================== */
function initSkillFilters() {
  const filterBtns = document.querySelectorAll('.skill-filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px) scale(0.96)';
          setTimeout(() => {
            card.classList.add('hidden');
          }, 200);
        }
      });
    });
  });
}

/* ==========================================================================
   Modals (Video, Resume)
   ========================================================================== */
function initModals() {
  const videoModal = document.getElementById('video-modal');
  const videoPlayerContainer = document.getElementById('video-player-container');
  const openVideoBtns = document.querySelectorAll('[data-open-video]');
  const closeVideoBtn = document.getElementById('close-video-modal');

  const resumeModal = document.getElementById('resume-modal');
  const openResumeBtns = document.querySelectorAll('[data-open-resume]');
  const closeResumeBtn = document.getElementById('close-resume-modal');

  const modalOverlays = document.querySelectorAll('.modal-backdrop');

  // Video Modal Open
  openVideoBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // YouTube Embed for Erick's Autonomous Car project (ID: LT-8tDMSFo0, start: 40)
      videoPlayerContainer.innerHTML = `
        <iframe 
          src="https://www.youtube-nocookie.com/embed/LT-8tDMSFo0?start=40&autoplay=1&rel=0" 
          title="Erick's Autonomous Car in Action" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      `;
      videoModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeVideo() {
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
    // Unload iframe to stop audio/video
    setTimeout(() => {
      videoPlayerContainer.innerHTML = '';
    }, 250);
  }

  if (closeVideoBtn) closeVideoBtn.addEventListener('click', closeVideo);

  // Resume Modal Open
  openResumeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      resumeModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeResume() {
    resumeModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeResumeBtn) closeResumeBtn.addEventListener('click', closeResume);

  // Close modals on clicking backdrop
  modalOverlays.forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        if (videoModal.classList.contains('active')) closeVideo();
        if (resumeModal.classList.contains('active')) closeResume();
      }
    });
  });

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (videoModal.classList.contains('active')) closeVideo();
      if (resumeModal.classList.contains('active')) closeResume();
      const mobileDrawer = document.getElementById('mobile-drawer');
      if (mobileDrawer && mobileDrawer.classList.contains('open')) {
        mobileDrawer.classList.remove('open');
        document.getElementById('drawer-overlay').classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  });
}

/* ==========================================================================
   Clipboard Actions & Toast
   ========================================================================== */
function initClipboardActions() {
  const copyButtons = document.querySelectorAll('[data-copy]');
  const toast = document.getElementById('toast');

  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const textToCopy = btn.getAttribute('data-copy');
      const label = btn.getAttribute('data-copy-label') || 'Copied';

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`${label} copied to clipboard!`);
        }).catch(() => {
          fallbackCopy(textToCopy, label);
        });
      } else {
        fallbackCopy(textToCopy, label);
      }
    });
  });

  function fallbackCopy(text, label) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast(`${label} copied to clipboard!`);
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast.timeoutId);
    toast.timeoutId = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

/* ==========================================================================
   Reactive Background Controls
   ========================================================================== */
function initBackgroundControls() {
  const modeSelect = document.getElementById('bg-mode-select');
  const speedButtons = document.querySelectorAll('[data-bg-speed]');
  const togglePanelBtn = document.getElementById('bg-panel-toggle');
  const panel = document.getElementById('bg-controls-panel');

  if (togglePanelBtn && panel) {
    togglePanelBtn.addEventListener('click', () => {
      panel.classList.toggle('collapsed');
      const isExpanded = !panel.classList.contains('collapsed');
      togglePanelBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    });
  }

  if (modeSelect) {
    modeSelect.addEventListener('change', (e) => {
      if (window.bgCanvas) {
        window.bgCanvas.setMode(e.target.value);
      }
    });
  }

  speedButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      speedButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const speed = parseFloat(btn.getAttribute('data-bg-speed'));
      if (window.bgCanvas) {
        window.bgCanvas.setSpeed(speed);
      }
    });
  });
}

/* ==========================================================================
   Subtle 3D Tilt for Hero Cards & Project Showcase
   ========================================================================== */
function initTiltEffect() {
  const tiltElements = document.querySelectorAll('[data-tilt]');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* ==========================================================================
   Reading Quotes Tab / Interactive Switcher
   ========================================================================== */
function initReadingQuotes() {
  const quoteTabs = document.querySelectorAll('.quote-tab-btn');
  const quotePanes = document.querySelectorAll('.quote-pane');

  quoteTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');
      quoteTabs.forEach(t => t.classList.remove('active'));
      quotePanes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}
