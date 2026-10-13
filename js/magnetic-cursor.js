/**
 * Options Trading - High Performance Magnetic Cursor Engine (Effect #5)
 * 
 * Features:
 * 1. Smooth Attraction: Cursor and interactive elements attract towards each other.
 * 2. Subtle Glow Effect: Emerald Green (#10B981) glowing trail and active neon outline.
 * 3. Fluid Light Trail: GPU-optimized Canvas-based curved fluid trail behind cursor.
 * 4. Magnetic Pull & 3D Tilt: Applied to buttons, nav links, service & pricing cards.
 * 5. Ripple Ring: Expanding neon ripple around the cursor tip upon interaction.
 * 6. Responsive & Lightweight: Auto-disabled on touch/mobile and prefers-reduced-motion.
 */

(function () {
  'use strict';

  // Check device capabilities and user motion preferences
  const isTouchDevice = window.matchMedia('(hover: none) or (pointer: coarse)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isTouchDevice || prefersReducedMotion) {
    // Graceful fallback: Keep default system cursor, no canvas overhead
    document.documentElement.classList.add('no-custom-cursor');
    return;
  }

  document.documentElement.classList.add('has-custom-cursor');

  // Create DOM elements for custom cursor & trail canvas
  const cursorWrap = document.createElement('div');
  cursorWrap.className = 'custom-cursor-wrap';
  cursorWrap.innerHTML = `
    <div class="custom-cursor-arrow">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 3L19 12L12 14L9 21L4 3Z" fill="#FFFFFF" stroke="#10B981" stroke-width="1.8" stroke-linejoin="round"/>
      </svg>
      <div class="cursor-ripple"></div>
      <div class="cursor-tip-glow"></div>
    </div>
  `;
  document.body.appendChild(cursorWrap);

  const canvas = document.createElement('canvas');
  canvas.id = 'cursor-trail-canvas';
  canvas.className = 'cursor-trail-canvas';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  // Track window dimensions
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    updateElementBounds();
  });

  // Cursor coordinates
  let mouseX = width / 2;
  let mouseY = height / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let isMoving = false;
  let isWindowActive = true;
  let activeElement = null;

  // Trail history points
  const trailPoints = [];
  const maxTrailPoints = 14;

  // Track interactive magnetic targets
  let magneticElements = [];

  function updateElementBounds() {
    const targets = document.querySelectorAll(
      '.magnetic-btn, .magnetic-card, .nav-link, .btn, .service-card, .pricing-card, .faq-header, .testimonial-card'
    );
    magneticElements = Array.from(targets).map((el) => {
      const rect = el.getBoundingClientRect();
      const isCard = el.classList.contains('service-card') || el.classList.contains('pricing-card') || el.classList.contains('magnetic-card');
      const isBtn = el.classList.contains('btn') || el.classList.contains('magnetic-btn');
      return {
        el,
        rect,
        isCard,
        isBtn,
        currentX: 0,
        currentY: 0,
        targetX: 0,
        targetY: 0,
        tiltX: 0,
        tiltY: 0,
        threshold: isCard ? 130 : 75,
        magneticStrength: isCard ? 0.18 : 0.42
      };
    });
  }

  // Update bounds on scroll (debounced / RAF)
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (!scrollTimeout) {
      scrollTimeout = requestAnimationFrame(() => {
        updateElementBounds();
        scrollTimeout = null;
      });
    }
  }, { passive: true });

  // Initial bounds calculation
  setTimeout(updateElementBounds, 250);

  // Mouse event listeners
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMoving = true;
    isWindowActive = true;

    // Push coordinates to fluid trail
    trailPoints.push({
      x: mouseX,
      y: mouseY,
      age: 0,
      size: 4.5
    });

    if (trailPoints.length > maxTrailPoints) {
      trailPoints.shift();
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    isWindowActive = false;
    cursorWrap.style.opacity = '0';
    if (activeElement) {
      releaseElement(activeElement);
      activeElement = null;
    }
  });

  document.addEventListener('mouseenter', () => {
    isWindowActive = true;
    cursorWrap.style.opacity = '1';
  });

  document.addEventListener('mousedown', () => {
    cursorWrap.classList.add('cursor-clicked');
    triggerRipple();
  });

  document.addEventListener('mouseup', () => {
    cursorWrap.classList.remove('cursor-clicked');
  });

  function triggerRipple() {
    const ripple = cursorWrap.querySelector('.cursor-ripple');
    if (ripple) {
      ripple.classList.remove('animate-ripple');
      // Trigger DOM reflow
      void ripple.offsetWidth;
      ripple.classList.add('animate-ripple');
    }
  }

  function releaseElement(item) {
    item.targetX = 0;
    item.targetY = 0;
    item.tiltX = 0;
    item.tiltY = 0;
    item.el.classList.remove('is-magnetic-active');
  }

  // Linear interpolation utility
  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  // Main Animation Loop
  function render() {
    if (isWindowActive) {
      // Find nearest magnetic element
      let nearestItem = null;
      let minDistance = Infinity;

      for (let i = 0; i < magneticElements.length; i++) {
        const item = magneticElements[i];
        // Dynamic center based on current viewport
        const rect = item.el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        const dist = Math.hypot(dx, dy);

        if (dist < item.threshold && dist < minDistance) {
          minDistance = dist;
          nearestItem = item;
          nearestItem._dx = dx;
          nearestItem._dy = dy;
          nearestItem._centerX = centerX;
          nearestItem._centerY = centerY;
        }
      }

      // Handle magnetic attraction
      if (nearestItem) {
        if (activeElement && activeElement !== nearestItem) {
          releaseElement(activeElement);
        }
        activeElement = nearestItem;

        // Pull calculation
        const factor = Math.pow(1 - minDistance / nearestItem.threshold, 1.3);
        nearestItem.targetX = nearestItem._dx * nearestItem.magneticStrength * factor;
        nearestItem.targetY = nearestItem._dy * nearestItem.magneticStrength * factor;

        // Subtle 3D tilt
        nearestItem.tiltX = (-nearestItem._dy / 25) * factor;
        nearestItem.tiltY = (nearestItem._dx / 25) * factor;

        nearestItem.el.classList.add('is-magnetic-active');

        // Cursor smooth pull towards element border/center
        const pullFactor = 0.28 * factor;
        const targetCursorX = mouseX - nearestItem.targetX * pullFactor;
        const targetCursorY = mouseY - nearestItem.targetY * pullFactor;
        cursorX = lerp(cursorX, targetCursorX, 0.35);
        cursorY = lerp(cursorY, targetCursorY, 0.35);

        cursorWrap.classList.add('is-attracted');
      } else {
        if (activeElement) {
          releaseElement(activeElement);
          activeElement = null;
        }
        cursorX = lerp(cursorX, mouseX, 0.24);
        cursorY = lerp(cursorY, mouseY, 0.24);
        cursorWrap.classList.remove('is-attracted');
      }

      // Smoothly update transforms of all magnetic elements
      for (let i = 0; i < magneticElements.length; i++) {
        const item = magneticElements[i];
        item.currentX = lerp(item.currentX, item.targetX, 0.16);
        item.currentY = lerp(item.currentY, item.targetY, 0.16);

        if (Math.abs(item.currentX) > 0.05 || Math.abs(item.currentY) > 0.05) {
          const transform = `translate3d(${item.currentX.toFixed(2)}px, ${item.currentY.toFixed(2)}px, 0) rotateX(${item.tiltX.toFixed(2)}deg) rotateY(${item.tiltY.toFixed(2)}deg)`;
          item.el.style.transform = transform;
        } else if (item.currentX !== 0 || item.currentY !== 0) {
          item.currentX = 0;
          item.currentY = 0;
          item.el.style.transform = '';
        }
      }

      // Render custom cursor container
      cursorWrap.style.transform = `translate3d(${cursorX.toFixed(2)}px, ${cursorY.toFixed(2)}px, 0)`;

      // Render fluid Emerald Green glow trail on canvas
      ctx.clearRect(0, 0, width, height);

      if (trailPoints.length > 2) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 0; i < trailPoints.length - 1; i++) {
          const pt = trailPoints[i];
          const nextPt = trailPoints[i + 1];
          const progress = i / trailPoints.length; // 0 (tail) -> 1 (head)

          const opacity = progress * 0.65;
          const strokeWidth = 1.5 + progress * 4.5;

          // Subtle Emerald gradient/glow
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(nextPt.x, nextPt.y);
          ctx.strokeStyle = `rgba(16, 185, 129, ${opacity.toFixed(2)})`;
          ctx.lineWidth = strokeWidth;
          ctx.shadowColor = '#10B981';
          ctx.shadowBlur = 8 * progress;
          ctx.stroke();

          // Core bright white-green highlight for the leading edge
          if (progress > 0.7) {
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(nextPt.x, nextPt.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${(progress * 0.4).toFixed(2)})`;
            ctx.lineWidth = strokeWidth * 0.35;
            ctx.shadowBlur = 0;
            ctx.stroke();
          }
        }

        ctx.restore();
      }

      // Decay trail points gradually
      for (let i = trailPoints.length - 1; i >= 0; i--) {
        trailPoints[i].age += 1;
        if (trailPoints[i].age > 24) {
          trailPoints.splice(i, 1);
        }
      }
    }

    requestAnimationFrame(render);
  }

  // Initialize loop
  requestAnimationFrame(render);

  // Expose re-scan helper for dynamic content
  window.refreshMagneticElements = updateElementBounds;
})();
