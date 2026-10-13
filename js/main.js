/**
 * Options Trading - Main Website Logic
 * Features:
 * - Mobile Menu & Drawer with Backdrop Overlay
 * - Header Scroll Effect & Active Page Highlighting
 * - Real-Time Live Market Chart & Ticker Simulator (Nifty 50, Bank Nifty, LTP)
 * - Professional Scroll Reveal Animations
 * - Testimonials Carousel Slider
 * - Accordion FAQs
 * - Contact Form with Immediate WhatsApp Redirection
 * - Dynamic Current Year
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. Mobile Menu Drawer & Backdrop Toggle
  // =========================================================================
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const navMenu = document.querySelector('.nav-menu');
  let menuBackdrop = document.querySelector('.menu-backdrop');

  // Create backdrop if not present
  if (!menuBackdrop) {
    menuBackdrop = document.createElement('div');
    menuBackdrop.className = 'menu-backdrop';
    document.body.appendChild(menuBackdrop);
  }

  function closeMenu() {
    if (hamburgerBtn && navMenu) {
      hamburgerBtn.classList.remove('is-active');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('is-active');
      menuBackdrop.classList.remove('is-active');
      document.body.classList.remove('menu-open');
    }
  }

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
      hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
      hamburgerBtn.classList.toggle('is-active');
      navMenu.classList.toggle('is-active');
      menuBackdrop.classList.toggle('is-active');
      document.body.classList.toggle('menu-open');
    });

    // Close when clicking nav links
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          closeMenu();
        } else {
          setTimeout(closeMenu, 150);
        }
      });
    });

    // Close when clicking backdrop
    menuBackdrop.addEventListener('click', closeMenu);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-active')) {
        closeMenu();
      }
    });
  }

  // =========================================================================
  // 2. Header Scroll Effect
  // =========================================================================
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 25) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // =========================================================================
  // 3. Highlight Current Page in Navigation
  // =========================================================================
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const allNavLinks = document.querySelectorAll('.nav-link');
  allNavLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // =========================================================================
  // 4. Professional Scroll Reveal Animations
  // =========================================================================
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    });

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: make elements immediately visible
    revealElements.forEach((el) => el.classList.add('is-revealed'));
  }

  // =========================================================================
  // 5. Live Market Chart & Dynamic Real-Time Ticker Simulator
  // =========================================================================
  const niftyPriceEl = document.getElementById('niftyPrice');
  const niftyChangeEl = document.getElementById('niftyChange');
  const bankNiftyPriceEl = document.getElementById('bankNiftyPrice');
  const bankNiftyChangeEl = document.getElementById('bankNiftyChange');
  const alertLtpEl = document.getElementById('alertLtp');
  const canvas = document.getElementById('liveMarketChart');

  if (niftyPriceEl && canvas) {
    // Initial Market State
    let niftyPrice = 24842.60;
    const niftyOpen = 24700.30;
    let bankNiftyPrice = 52190.45;
    const bankNiftyOpen = 51805.35;
    let alertLtp = 324.50;

    let activeSymbol = 'NIFTY'; // 'NIFTY' or 'BANKNIFTY'
    const niftyPoints = [];
    const bankNiftyPoints = [];
    const maxPoints = 42;

    // Seed realistic starting intraday series
    let seedNifty = 24790;
    let seedBank = 52020;
    for (let i = 0; i < maxPoints; i++) {
      seedNifty += (Math.random() - 0.47) * 4.5;
      seedBank += (Math.random() - 0.47) * 12.0;
      niftyPoints.push(seedNifty);
      bankNiftyPoints.push(seedBank);
    }
    niftyPoints[niftyPoints.length - 1] = niftyPrice;
    bankNiftyPoints[bankNiftyPoints.length - 1] = bankNiftyPrice;

    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
      const container = canvas.parentElement;
      if (!container) return;
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight || 155;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
      renderChart();
    }

    function renderChart() {
      const container = canvas.parentElement;
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight || 155;

      ctx.clearRect(0, 0, width, height);

      const points = activeSymbol === 'NIFTY' ? niftyPoints : bankNiftyPoints;
      if (points.length < 2) return;

      const minVal = Math.min(...points) - 4;
      const maxVal = Math.max(...points) + 4;
      const range = maxVal - minVal || 1;

      // Coordinate mapping
      const paddingLeft = 12;
      const paddingRight = 44;
      const paddingTop = 16;
      const paddingBottom = 26;
      const chartW = width - paddingLeft - paddingRight;
      const chartH = height - paddingTop - paddingBottom;

      const getX = (idx) => paddingLeft + (idx / (points.length - 1)) * chartW;
      const getY = (val) => paddingTop + chartH - ((val - minVal) / range) * chartH;

      // 1. Draw subtle horizontal grid lines & price tags
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.fillStyle = '#7D8899';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'left';

      for (let g = 0; g <= 3; g++) {
        const gridVal = minVal + (range * g) / 3;
        const y = getY(gridVal);
        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(width - paddingRight, y);
        ctx.stroke();

        ctx.fillText(gridVal.toFixed(0), width - paddingRight + 6, y + 3);
      }
      ctx.restore();

      // 2. Draw Subtle Volume Bars at bottom
      ctx.save();
      const barW = Math.max(2, (chartW / points.length) * 0.65);
      for (let i = 0; i < points.length; i++) {
        const isUp = i === 0 || points[i] >= points[i - 1];
        ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)';
        const barH = 6 + (Math.sin(i * 1.3) + 1.2) * 8;
        const x = getX(i) - barW / 2;
        const y = height - paddingBottom - barH;
        ctx.fillRect(x, y, barW, barH);
      }
      ctx.restore();

      // 3. Draw Gradient Area Fill below curve
      ctx.save();
      const areaGrad = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
      areaGrad.addColorStop(0, 'rgba(16, 185, 129, 0.32)');
      areaGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.06)');
      areaGrad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      ctx.beginPath();
      ctx.moveTo(getX(0), getY(points[0]));
      for (let i = 1; i < points.length; i++) {
        const prevX = getX(i - 1);
        const prevY = getY(points[i - 1]);
        const currX = getX(i);
        const currY = getY(points[i]);
        const midX = (prevX + currX) / 2;
        ctx.bezierCurveTo(midX, prevY, midX, currY, currX, currY);
      }
      ctx.lineTo(getX(points.length - 1), height - paddingBottom);
      ctx.lineTo(getX(0), height - paddingBottom);
      ctx.closePath();
      ctx.fillStyle = areaGrad;
      ctx.fill();
      ctx.restore();

      // 4. Draw Glowing Green Trend Curve
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(getX(0), getY(points[0]));
      for (let i = 1; i < points.length; i++) {
        const prevX = getX(i - 1);
        const prevY = getY(points[i - 1]);
        const currX = getX(i);
        const currY = getY(points[i]);
        const midX = (prevX + currX) / 2;
        ctx.bezierCurveTo(midX, prevY, midX, currY, currX, currY);
      }
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2.4;
      ctx.shadowColor = 'rgba(16, 185, 129, 0.7)';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();

      // 5. Draw Live Beacon at rightmost point
      const lastX = getX(points.length - 1);
      const lastY = getY(points[points.length - 1]);

      ctx.save();
      // Outer ripple
      ctx.beginPath();
      ctx.arc(lastX, lastY, 7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.fill();

      // Solid emerald dot
      ctx.beginPath();
      ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#10B981';
      ctx.fill();

      // White center
      ctx.beginPath();
      ctx.arc(lastX, lastY, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.restore();
    }

    // Window resize handler
    window.addEventListener('resize', resizeCanvas, { passive: true });
    setTimeout(resizeCanvas, 50);

    // Dynamic Micro-Tick Simulator
    function triggerTick() {
      // 1. Nifty 50 Tick
      const niftyDelta = (Math.random() - 0.46) * 3.8;
      niftyPrice = Math.round((niftyPrice + niftyDelta) * 100) / 100;
      const niftyPtsChange = niftyPrice - niftyOpen;
      const niftyPctChange = (niftyPtsChange / niftyOpen) * 100;

      if (niftyPriceEl) {
        niftyPriceEl.textContent = niftyPrice.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        niftyPriceEl.classList.remove('price-flash-up', 'price-flash-down');
        void niftyPriceEl.offsetWidth; // trigger reflow
        niftyPriceEl.classList.add(niftyDelta >= 0 ? 'price-flash-up' : 'price-flash-down');
      }

      if (niftyChangeEl) {
        const sign = niftyPtsChange >= 0 ? '+' : '';
        const arrow = niftyPtsChange >= 0 ? '▲' : '▼';
        niftyChangeEl.innerHTML = `${arrow} ${sign}${niftyPtsChange.toFixed(2)} (${sign}${niftyPctChange.toFixed(2)}%)`;
        niftyChangeEl.className = `index-change ${niftyPtsChange >= 0 ? '' : 'change-negative'}`;
      }

      niftyPoints.push(niftyPrice);
      if (niftyPoints.length > maxPoints) niftyPoints.shift();

      // 2. Bank Nifty Tick
      const bankDelta = (Math.random() - 0.46) * 9.5;
      bankNiftyPrice = Math.round((bankNiftyPrice + bankDelta) * 100) / 100;
      const bankPtsChange = bankNiftyPrice - bankNiftyOpen;
      const bankPctChange = (bankPtsChange / bankNiftyOpen) * 100;

      if (bankNiftyPriceEl) {
        bankNiftyPriceEl.textContent = bankNiftyPrice.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        bankNiftyPriceEl.classList.remove('price-flash-up', 'price-flash-down');
        void bankNiftyPriceEl.offsetWidth;
        bankNiftyPriceEl.classList.add(bankDelta >= 0 ? 'price-flash-up' : 'price-flash-down');
      }

      if (bankNiftyChangeEl) {
        const sign = bankPtsChange >= 0 ? '+' : '';
        const arrow = bankPtsChange >= 0 ? '▲' : '▼';
        bankNiftyChangeEl.innerHTML = `${arrow} ${sign}${bankPtsChange.toFixed(2)} (${sign}${bankPctChange.toFixed(2)}%)`;
        bankNiftyChangeEl.className = `index-change ${bankPtsChange >= 0 ? '' : 'change-negative'}`;
      }

      bankNiftyPoints.push(bankNiftyPrice);
      if (bankNiftyPoints.length > maxPoints) bankNiftyPoints.shift();

      // 3. Alert LTP Tick
      const ltpDelta = (Math.random() - 0.45) * 1.4;
      alertLtp = Math.max(305, Math.min(360, Math.round((alertLtp + ltpDelta) * 10) / 10));
      if (alertLtpEl) {
        alertLtpEl.textContent = alertLtp.toFixed(2);
        alertLtpEl.classList.remove('price-flash-up', 'price-flash-down');
        void alertLtpEl.offsetWidth;
        alertLtpEl.classList.add(ltpDelta >= 0 ? 'price-flash-up' : 'price-flash-down');
      }

      renderChart();
    }

    // Run dynamic ticks every 1.8 seconds
    setInterval(triggerTick, 1800);

    // Interactive Index Switching
    const indexBoxes = document.querySelectorAll('.index-box');
    const chartSymbolBadge = document.getElementById('chartSymbolBadge');

    indexBoxes.forEach((box) => {
      box.addEventListener('click', () => {
        indexBoxes.forEach((b) => b.classList.remove('is-active'));
        box.classList.add('is-active');
        const symbol = box.getAttribute('data-symbol');
        if (symbol) {
          activeSymbol = symbol;
          if (chartSymbolBadge) {
            chartSymbolBadge.textContent = symbol === 'NIFTY' ? 'NIFTY 50 INTRADAY' : 'BANK NIFTY INTRADAY';
          }
          renderChart();
        }
      });
    });

    // Interactive Timeframe Switcher
    const tfBtns = document.querySelectorAll('.tf-btn');
    tfBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        tfBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        renderChart();
      });
    });
  }

  // =========================================================================
  // 6. Testimonials Carousel / Slider
  // =========================================================================
  const testimonialsTrack = document.querySelector('.testimonials-track');
  const slides = document.querySelectorAll('.testimonial-slide');
  const prevBtn = document.querySelector('.slider-prev');
  const nextBtn = document.querySelector('.slider-next');
  const dotsContainer = document.querySelector('.slider-dots');

  if (testimonialsTrack && slides.length > 0) {
    let currentSlide = 0;
    const totalSlides = slides.length;
    let autoSlideInterval;

    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.className = `slider-dot ${i === 0 ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to testimonial slide ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      }
    }

    const dots = document.querySelectorAll('.slider-dot');

    function updateSlide() {
      testimonialsTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
      dots.forEach((d, idx) => {
        d.classList.toggle('active', idx === currentSlide);
      });
    }

    function goToSlide(index) {
      currentSlide = (index + totalSlides) % totalSlides;
      updateSlide();
      resetAutoPlay();
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    }

    function startAutoPlay() {
      autoSlideInterval = setInterval(() => {
        goToSlide(currentSlide + 1);
      }, 6000);
    }

    function resetAutoPlay() {
      clearInterval(autoSlideInterval);
      startAutoPlay();
    }

    startAutoPlay();

    testimonialsTrack.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
    testimonialsTrack.addEventListener('mouseleave', () => startAutoPlay());
  }

  // =========================================================================
  // 7. Accordion FAQs
  // =========================================================================
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const headerBtn = item.querySelector('.faq-header');
    const body = item.querySelector('.faq-body');

    if (headerBtn && body) {
      headerBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        faqItems.forEach((other) => {
          if (other !== item && other.classList.contains('is-open')) {
            other.classList.remove('is-open');
            const otherBody = other.querySelector('.faq-body');
            const otherBtn = other.querySelector('.faq-header');
            if (otherBody) otherBody.style.maxHeight = null;
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        if (isOpen) {
          item.classList.remove('is-open');
          body.style.maxHeight = null;
          headerBtn.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('is-open');
          body.style.maxHeight = body.scrollHeight + 'px';
          headerBtn.setAttribute('aria-expanded', 'true');
        }

        if (typeof window.refreshMagneticElements === 'function') {
          setTimeout(window.refreshMagneticElements, 300);
        }
      });
    }
  });

  // =========================================================================
  // 8. Contact Form with Instant WhatsApp Redirection & Option Card
  // =========================================================================
  const contactForm = document.getElementById('contactForm');
  const contactSuccess = document.getElementById('contactSuccess');
  const whatsappChatBtn = document.getElementById('whatsappChatBtn');

  if (contactForm && contactSuccess) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('userName');
      const phoneInput = document.getElementById('userPhone');
      const stateInput = document.getElementById('userState');
      const messageInput = document.getElementById('userMessage');

      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const state = stateInput ? stateInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      if (!name || !phone) {
        alert('Please provide at least your Name and Phone Number to continue.');
        if (!name && nameInput) nameInput.focus();
        else if (phoneInput) phoneInput.focus();
        return;
      }

      // Generate formatted message for WhatsApp
      const msgLines = [
        `*New Inquiry - Options Trading*`,
        `*Name:* ${name}`,
        `*Phone:* ${phone}`,
        state ? `*State:* ${state}` : null,
        message ? `*Message:* ${message}` : null
      ].filter(Boolean);

      const encodedMsg = encodeURIComponent(msgLines.join('\n'));
      const whatsappUrl = `https://wa.me/911234567890?text=${encodedMsg}`;

      if (whatsappChatBtn) {
        whatsappChatBtn.setAttribute('href', whatsappUrl);
      }

      // Hide form smoothly and display success + WhatsApp direct connect box
      contactForm.style.display = 'none';
      contactSuccess.style.display = 'block';

      // Automatically open WhatsApp in new tab
      try {
        window.open(whatsappUrl, '_blank');
      } catch (err) {
        console.warn('Popup blocked, WhatsApp direct button is available below.');
      }

      // Scroll smoothly to success box
      contactSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // =========================================================================
  // 9. Dynamic Current Year in Footer
  // =========================================================================
  const yearSpan = document.getElementById('currentYear');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});
