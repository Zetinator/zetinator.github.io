/**
 * Reactive Canvas Background Engine
 * Generates interactive, physics-driven particle & field dynamics.
 * Supports multiple visual modes: Constellation Flow, Quantum Orbit, and Ambient Aurora.
 */

class ReactiveBackground {
  constructor(canvasId = 'bg-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    this.particles = [];
    this.maxParticles = 65;
    this.connectionDistance = 140;
    this.mouseRadius = 180;
    
    // Mouse state with smooth interpolated coordinates
    this.mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      vx: 0,
      vy: 0,
      lastX: -1000,
      lastY: -1000,
      isHovered: false,
    };
    
    // Shockwaves on click
    this.shockwaves = [];
    
    // Modes: 'constellation' (refined neural/stellar), 'quantum' (orbiting kinetic particles), 'aurora' (ambient luminous field)
    this.mode = 'constellation';
    this.speedMultiplier = 1.0;
    this.interactiveGlow = true;
    
    this.animationFrameId = null;
    this.lastTime = performance.now();
    this.isVisible = true;

    // Check reduced motion
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.reducedMotion) {
      this.speedMultiplier = 0.3;
    }

    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate(performance.now());
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(this.dpr, this.dpr);

    // Adjust particle count dynamically based on screen size
    if (this.width < 768) {
      this.maxParticles = 35;
      this.connectionDistance = 100;
      this.mouseRadius = 130;
    } else if (this.width < 1440) {
      this.maxParticles = 60;
      this.connectionDistance = 140;
      this.mouseRadius = 180;
    } else {
      this.maxParticles = 80;
      this.connectionDistance = 160;
      this.mouseRadius = 220;
    }

    this.createParticles();
  }

  createParticles() {
    this.particles = [];
    const colors = [
      { r: 56, g: 189, b: 248 },  // Sky / Cyan
      { r: 99, g: 102, b: 241 },  // Indigo
      { r: 52, g: 211, b: 153 },  // Emerald
      { r: 148, g: 163, b: 184 }, // Cool Slate
      { r: 244, g: 244, b: 245 }  // Pure Starlight
    ];

    for (let i = 0; i < this.maxParticles; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const baseRadius = Math.random() * 2.2 + 1.2;
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        originX: Math.random() * this.width,
        originY: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.7 * this.speedMultiplier,
        vy: (Math.random() - 0.5) * 0.7 * this.speedMultiplier,
        radius: baseRadius,
        baseRadius: baseRadius,
        color: color,
        alpha: Math.random() * 0.5 + 0.35,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseVal: Math.random() * Math.PI * 2,
        forceX: 0,
        forceY: 0
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
      this.mouse.isHovered = true;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.targetX = -1000;
      this.mouse.targetY = -1000;
      this.mouse.isHovered = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.targetX = e.touches[0].clientX;
        this.mouse.targetY = e.touches[0].clientY;
        this.mouse.isHovered = true;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.mouse.targetX = -1000;
      this.mouse.targetY = -1000;
      this.mouse.isHovered = false;
    });

    window.addEventListener('click', (e) => {
      if (e.target.closest('button, a, input, select, textarea, .modal, .no-shockwave')) {
        return;
      }
      this.triggerShockwave(e.clientX, e.clientY);
    });

    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      if (this.isVisible) {
        this.lastTime = performance.now();
        if (!this.animationFrameId) {
          this.animate(this.lastTime);
        }
      }
    });
  }

  triggerShockwave(x, y) {
    this.shockwaves.push({
      x: x,
      y: y,
      radius: 5,
      maxRadius: Math.min(this.width, this.height) * 0.4,
      strength: 12,
      life: 1.0,
      decay: 0.028
    });
  }

  setMode(newMode) {
    this.mode = newMode;
    this.createParticles();
  }

  setSpeed(speed) {
    this.speedMultiplier = speed;
    this.particles.forEach(p => {
      p.vx = (Math.random() - 0.5) * 0.8 * this.speedMultiplier;
      p.vy = (Math.random() - 0.5) * 0.8 * this.speedMultiplier;
    });
  }

  update(deltaTime) {
    const dt = Math.min(deltaTime / 16.666, 2.5);

    // Smooth mouse coordinates interpolation
    if (this.mouse.targetX !== -1000) {
      if (this.mouse.x === -1000) {
        this.mouse.x = this.mouse.targetX;
        this.mouse.y = this.mouse.targetY;
      } else {
        const dx = this.mouse.targetX - this.mouse.x;
        const dy = this.mouse.targetY - this.mouse.y;
        this.mouse.vx = dx * 0.15;
        this.mouse.vy = dy * 0.15;
        this.mouse.x += this.mouse.vx;
        this.mouse.y += this.mouse.vy;
      }
    } else {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
      this.mouse.vx = 0;
      this.mouse.vy = 0;
    }

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += 8 * dt;
      sw.life -= sw.decay * dt;
      if (sw.life <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Update particles
    const particleCount = this.particles.length;
    for (let i = 0; i < particleCount; i++) {
      const p = this.particles[i];

      // Pulsing glow
      p.pulseVal += p.pulseSpeed * dt;
      p.radius = p.baseRadius + Math.sin(p.pulseVal) * 0.6;

      // Base movement
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Screen wrap-around with smooth buffer
      const buffer = 40;
      if (p.x < -buffer) p.x = this.width + buffer;
      if (p.x > this.width + buffer) p.x = -buffer;
      if (p.y < -buffer) p.y = this.height + buffer;
      if (p.y > this.height + buffer) p.y = -buffer;

      // Mouse repulsion / attraction physics
      if (this.mouse.x !== -1000) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.mouseRadius && dist > 1) {
          const normalX = dx / dist;
          const normalY = dy / dist;
          const force = (1 - dist / this.mouseRadius);

          if (this.mode === 'quantum') {
            // Orbital swirl around cursor
            const tangentX = -normalY;
            const tangentY = normalX;
            p.x += (tangentX * 2.8 * force + normalX * 1.5 * force) * dt;
            p.y += (tangentY * 2.8 * force + normalY * 1.5 * force) * dt;
          } else {
            // Gentle organic repulsion
            const push = force * 4.5 * dt;
            p.x += normalX * push;
            p.y += normalY * push;
          }
        }
      }

      // Shockwave forces
      for (const sw of this.shockwaves) {
        const dx = p.x - sw.x;
        const dy = p.y - sw.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const waveDist = Math.abs(dist - sw.radius);

        if (waveDist < 50 && dist > 1) {
          const waveForce = (1 - waveDist / 50) * sw.life * sw.strength;
          p.x += (dx / dist) * waveForce * dt;
          p.y += (dy / dist) * waveForce * dt;
        }
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Interactive ambient cursor illumination
    if (this.interactiveGlow && this.mouse.x !== -1000) {
      const glowRadius = this.mouseRadius * 1.6;
      const glowGradient = this.ctx.createRadialGradient(
        this.mouse.x, this.mouse.y, 0,
        this.mouse.x, this.mouse.y, glowRadius
      );
      glowGradient.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
      glowGradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.03)');
      glowGradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
      
      this.ctx.save();
      this.ctx.fillStyle = glowGradient;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.restore();
    }

    // 2. Shockwave visual rings
    if (this.shockwaves.length > 0) {
      this.ctx.save();
      for (const sw of this.shockwaves) {
        this.ctx.beginPath();
        this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(56, 189, 248, ${sw.life * 0.35})`;
        this.ctx.lineWidth = 2 * sw.life;
        this.ctx.stroke();
      }
      this.ctx.restore();
    }

    // 3. Connective threads
    if (this.mode === 'constellation') {
      const count = this.particles.length;
      for (let i = 0; i < count; i++) {
        const p1 = this.particles[i];
        for (let j = i + 1; j < count; j++) {
          const p2 = this.particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;
          const maxDistSq = this.connectionDistance * this.connectionDistance;

          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            let alpha = (1 - dist / this.connectionDistance) * 0.22;

            if (this.mouse.x !== -1000) {
              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2;
              const mDx = midX - this.mouse.x;
              const mDy = midY - this.mouse.y;
              const mDist = Math.sqrt(mDx * mDx + mDy * mDy);
              if (mDist < this.mouseRadius) {
                alpha += (1 - mDist / this.mouseRadius) * 0.35;
              }
            }

            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
            this.ctx.lineWidth = 0.85;
            this.ctx.stroke();
          }
        }

        // Connect particle to mouse if nearby
        if (this.mouse.x !== -1000) {
          const mdx = p1.x - this.mouse.x;
          const mdy = p1.y - this.mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < this.connectionDistance) {
            const mouseAlpha = (1 - mdist / this.connectionDistance) * 0.45;
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(this.mouse.x, this.mouse.y);
            this.ctx.strokeStyle = `rgba(56, 189, 248, ${mouseAlpha})`;
            this.ctx.lineWidth = 1.1;
            this.ctx.stroke();
          }
        }
      }
    }

    // 4. Render particles
    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
      this.ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.8)`;
      this.ctx.shadowBlur = p.radius * 3.5;
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  animate(currentTime) {
    if (!this.isVisible) {
      this.animationFrameId = null;
      return;
    }

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.draw();

    this.animationFrameId = requestAnimationFrame((time) => this.animate(time));
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.bgCanvas = new ReactiveBackground('bg-canvas');
});
