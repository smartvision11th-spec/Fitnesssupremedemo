/* =========================================================
   FITNESS SUPREME GYM — SCRIPT
   Handles: loading screen, sticky navbar, mobile menu,
   smooth scroll, scroll reveal, counters, particles,
   pricing autofill, BMI calculator, gallery lightbox,
   review slider (CSS-driven, JS just pauses it), booking
   form validation + WhatsApp integration, back-to-top,
   active nav highlighting.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* -----------------------------------------------------
     1. LOADING SCREEN
     ----------------------------------------------------- */
  const loadingScreen = document.getElementById('loading-screen');
  const loaderBarFill = document.getElementById('loaderBarFill');

  let progress = 0;
  const loaderInterval = setInterval(() => {
    progress += Math.random() * 18 + 8;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loaderInterval);
      setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        document.body.style.overflow = '';
      }, 250);
    }
    loaderBarFill.style.width = progress + '%';
  }, 180);

  // Safety net: never trap the user behind the loader
  window.addEventListener('load', () => {
    setTimeout(() => {
      loadingScreen.classList.add('fade-out');
    }, 1800);
  });

  /* -----------------------------------------------------
     2. STICKY NAVBAR (background change on scroll)
     ----------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  function handleNavbarScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  /* -----------------------------------------------------
     3. MOBILE MENU (HAMBURGER)
     ----------------------------------------------------- */
  const hamburger = document.getElementById('hamburger');
  const navLinksEl = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const isOpen = navLinksEl.classList.toggle('open');
    hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu when a link is tapped
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinksEl.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* -----------------------------------------------------
     4. SMOOTH SCROLL (native CSS handles most; this is a
        fallback/enhancement for older browsers + offset)
     ----------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* -----------------------------------------------------
     5. ACTIVE NAV LINK HIGHLIGHTING (Intersection Observer)
     ----------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinkMap = {};
  document.querySelectorAll('.nav-link').forEach(link => {
    const id = link.getAttribute('href').replace('#', '');
    navLinkMap[id] = link;
  });

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        Object.values(navLinkMap).forEach(l => l.classList.remove('active-link'));
        if (navLinkMap[id]) {
          navLinkMap[id].classList.add('active-link');
        }
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

  sections.forEach(section => navObserver.observe(section));

  /* -----------------------------------------------------
     6. SCROLL REVEAL ANIMATIONS (Intersection Observer)
     ----------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => revealObserver.observe(el));

  /* -----------------------------------------------------
     7. COUNTER ANIMATION (stats section)
     ----------------------------------------------------- */
  const statNumbers = document.querySelectorAll('.stat-number');

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const duration = 1600;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progressRatio, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progressRatio < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toLocaleString() + '+';
      }
    }
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(stat => counterObserver.observe(stat));

  /* -----------------------------------------------------
     8. PARTICLE BACKGROUND (canvas, lightweight, GPU-friendly)
     ----------------------------------------------------- */
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = window.innerWidth < 768 ? 28 : 55;
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.4,
      speedY: Math.random() * 0.35 + 0.08,
      speedX: (Math.random() - 0.5) * 0.15,
      opacity: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.5 ? '212,175,55' : '214,40,40'
    }));
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
      ctx.fill();

      p.y -= p.speedY;
      p.x += p.speedX;

      if (p.y < -10) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
      }
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
    });
    requestAnimationFrame(drawParticles);
  }

  if (canvas && ctx && !prefersReducedMotion) {
    resizeCanvas();
    createParticles();
    drawParticles();
    window.addEventListener('resize', () => {
      resizeCanvas();
      createParticles();
    });
  } else if (canvas) {
    canvas.style.display = 'none';
  }

  /* -----------------------------------------------------
     9. PRICING PLAN SELECTION -> AUTOFILL BOOKING FORM
     ----------------------------------------------------- */
  const pricingPlanSelect = document.getElementById('pricingPlan');

  document.querySelectorAll('.price-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = btn.getAttribute('data-plan');

      if (pricingPlanSelect) {
        pricingPlanSelect.value = plan;
        pricingPlanSelect.classList.add('has-value');
        pricingPlanSelect.dispatchEvent(new Event('change'));
      }

      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* Floating label support for <select> elements (since
     :placeholder-shown doesn't apply to selects) */
  document.querySelectorAll('.form-group.select-group select').forEach(select => {
    function syncLabel() {
      if (select.value) {
        select.classList.add('has-value');
      } else {
        select.classList.remove('has-value');
      }
    }
    select.addEventListener('change', syncLabel);
    syncLabel();
  });

  /* -----------------------------------------------------
     10. BMI CALCULATOR
     ----------------------------------------------------- */
  const calcBmiBtn = document.getElementById('calcBmiBtn');
  const bmiHeightInput = document.getElementById('bmiHeight');
  const bmiWeightInput = document.getElementById('bmiWeight');
  const bmiValueEl = document.getElementById('bmiValue');
  const bmiCategoryEl = document.getElementById('bmiCategory');
  const bmiSuggestionEl = document.getElementById('bmiSuggestion');

  const bmiMessages = {
    underweight: 'Join FITNESS SUPREME GYM muscle gain programs.',
    normal: 'Maintain your physique and aesthetic goals.',
    overweight: 'Join FITNESS SUPREME GYM fat loss programs.'
  };

  calcBmiBtn.addEventListener('click', () => {
    const heightCm = parseFloat(bmiHeightInput.value);
    const weightKg = parseFloat(bmiWeightInput.value);

    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
      bmiValueEl.textContent = '--';
      bmiCategoryEl.textContent = 'Please enter valid height and weight';
      bmiCategoryEl.style.color = 'var(--color-accent-red)';
      bmiSuggestionEl.textContent = '';
      return;
    }

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    const bmiRounded = bmi.toFixed(1);

    let category, suggestion, color;

    if (bmi < 18.5) {
      category = 'Underweight';
      suggestion = bmiMessages.underweight;
      color = 'var(--color-accent-gold)';
    } else if (bmi < 25) {
      category = 'Normal';
      suggestion = bmiMessages.normal;
      color = '#4CAF50';
    } else {
      category = 'Overweight';
      suggestion = bmiMessages.overweight;
      color = 'var(--color-accent-red)';
    }

    bmiValueEl.textContent = bmiRounded;
    bmiCategoryEl.textContent = category;
    bmiCategoryEl.style.color = color;
    bmiSuggestionEl.textContent = suggestion;
  });

  /* -----------------------------------------------------
     11. GALLERY LIGHTBOX
     ----------------------------------------------------- */
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const imgSrc = item.getAttribute('data-img');
      lightboxImg.setAttribute('src', imgSrc);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightboxImg.setAttribute('src', '');
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  /* -----------------------------------------------------
     12. BOOKING FORM VALIDATION + WHATSAPP INTEGRATION
     ----------------------------------------------------- */
  const bookingForm = document.getElementById('bookingForm');

  function showError(fieldId, message) {
    const errEl = document.getElementById('err-' + fieldId);
    const fieldEl = document.getElementById(fieldId);
    if (errEl) errEl.textContent = message;
    if (fieldEl) fieldEl.classList.add('invalid');
  }

  function clearError(fieldId) {
    const errEl = document.getElementById('err-' + fieldId);
    const fieldEl = document.getElementById(fieldId);
    if (errEl) errEl.textContent = '';
    if (fieldEl) fieldEl.classList.remove('invalid');
  }

  function validateForm(data) {
    let isValid = true;

    if (!data.fullName.trim()) {
      showError('fullName', 'Please enter your full name.');
      isValid = false;
    } else {
      clearError('fullName');
    }

    if (!/^[0-9]{10}$/.test(data.mobileNumber.trim())) {
      showError('mobileNumber', 'Enter a valid 10-digit mobile number.');
      isValid = false;
    } else {
      clearError('mobileNumber');
    }

    if (!data.gender) {
      showError('gender', 'Please select your gender.');
      isValid = false;
    } else {
      clearError('gender');
    }

    if (!data.age || data.age < 10 || data.age > 100) {
      showError('age', 'Enter a valid age (10-100).');
      isValid = false;
    } else {
      clearError('age');
    }

    if (!data.fitnessGoal) {
      showError('fitnessGoal', 'Please select your fitness goal.');
      isValid = false;
    } else {
      clearError('fitnessGoal');
    }

    if (!data.services) {
      showError('services', 'Please select a service.');
      isValid = false;
    } else {
      clearError('services');
    }

    if (!data.pricingPlan) {
      showError('pricingPlan', 'Please select a pricing plan.');
      isValid = false;
    } else {
      clearError('pricingPlan');
    }

    if (!data.joiningDate) {
      showError('joiningDate', 'Please choose a date of joining.');
      isValid = false;
    } else {
      clearError('joiningDate');
    }

    if (!data.address.trim()) {
      showError('address', 'Please enter your address.');
      isValid = false;
    } else {
      clearError('address');
    }

    return isValid;
  }

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = {
      fullName: document.getElementById('fullName').value,
      mobileNumber: document.getElementById('mobileNumber').value,
      gender: document.getElementById('gender').value,
      age: document.getElementById('age').value,
      fitnessGoal: document.getElementById('fitnessGoal').value,
      services: document.getElementById('services').value,
      pricingPlan: document.getElementById('pricingPlan').value,
      joiningDate: document.getElementById('joiningDate').value,
      address: document.getElementById('address').value,
      message: document.getElementById('message').value
    };

    if (!validateForm(data)) {
      return;
    }

    // Build a pre-filled WhatsApp message with the form data
    const waNumber = '919897417774';
    const waText = [
      `Hi, I'd like to join FITNESS SUPREME GYM!`,
      ``,
      `Name: ${data.fullName}`,
      `Mobile: ${data.mobileNumber}`,
      `Gender: ${data.gender}`,
      `Age: ${data.age}`,
      `Fitness Goal: ${data.fitnessGoal}`,
      `Service: ${data.services}`,
      `Pricing Plan: ${data.pricingPlan}`,
      `Date of Joining: ${data.joiningDate}`,
      `Address: ${data.address}`,
      data.message ? `Message: ${data.message}` : ''
    ].filter(Boolean).join('\n');

    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, '_blank', 'noopener');

    bookingForm.reset();
    document.querySelectorAll('.form-group.select-group select').forEach(s => s.classList.remove('has-value'));
  });

  /* -----------------------------------------------------
     13. BACK TO TOP BUTTON
     ----------------------------------------------------- */
  const backToTopBtn = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* -----------------------------------------------------
     14. FOOTER CURRENT YEAR
     ----------------------------------------------------- */
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

});
