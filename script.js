/* =============================================================
   Happy Valentine's Day – script.js
   Cinematic · Smooth · Premium · Mobile-optimised · No libraries
   ============================================================= */

(function () {
  'use strict';

  /* ─────────── Device Detection ─────────── */
  var isDesktop    = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  var isMobile     = window.innerWidth <= 480;

  /* ============================================================
     0.  CINEMATIC INTRO SCREEN
     ============================================================ */
  function initIntro() {
    var intro  = document.getElementById('introScreen');
    var toggle = document.getElementById('themeToggle');
    if (!intro) return;

    /* Intro overlay naturally prevents scrolling (z-index 50000) */

    setTimeout(function () {
      intro.classList.add('fade-out');

      setTimeout(function () {
        intro.classList.add('hidden');
        if (toggle) toggle.classList.add('show');
      }, 1000); /* match CSS transition duration */
    }, 3000); /* intro display time */
  }

  initIntro();

  /* ============================================================
     1.  SCROLL-REVEAL  (Intersection Observer)
     ============================================================ */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');

    /* Fallback: if IntersectionObserver unavailable, show all */
    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < items.length; i++) {
        items[i].classList.add('visible');
      }
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      for (var j = 0; j < entries.length; j++) {
        if (entries[j].isIntersecting) {
          entries[j].target.classList.add('visible');
          observer.unobserve(entries[j].target);
        }
      }
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    for (var k = 0; k < items.length; k++) {
      observer.observe(items[k]);
    }
  }

  initReveal();

  /* Safety fallback: ensure above-fold reveals become visible after intro */
  setTimeout(function () {
    var unrevealed = document.querySelectorAll('.reveal:not(.visible)');
    for (var i = 0; i < unrevealed.length; i++) {
      var rect = unrevealed[i].getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        unrevealed[i].classList.add('visible');
      }
    }
  }, 4500); /* runs after intro fully hides */

  /* ============================================================
     2.  CUSTOM CURSOR  (desktop & screen > 768px only)
     ============================================================ */
  function initCursor() {
    if (isTouchDevice || !isDesktop || window.innerWidth <= 768) return;

    var dot  = document.getElementById('cursorDot');
    var ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    document.body.classList.add('cursor-active');

    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var ringX  = mouseX;
    var ringY  = mouseY;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top  = mouseY + 'px';
    });

    (function followRing() {
      var ease = 0.13;
      ringX += (mouseX - ringX) * ease;
      ringY += (mouseY - ringY) * ease;
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      requestAnimationFrame(followRing);
    })();

    /* Hover growth on interactive items */
    var hoverTargets = document.querySelectorAll(
      '.gallery-item, .lightbox__close, .video-play-btn, .theme-toggle, .surprise__btn, .surprise-popup__close, a, button, [role="button"]'
    );
    for (var i = 0; i < hoverTargets.length; i++) {
      hoverTargets[i].addEventListener('mouseenter', function () {
        dot.classList.add('hover');
        ring.classList.add('hover');
      });
      hoverTargets[i].addEventListener('mouseleave', function () {
        dot.classList.remove('hover');
        ring.classList.remove('hover');
      });
    }

    /* Hide when leaving window */
    document.addEventListener('mouseleave', function () {
      dot.style.opacity  = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    });
  }

  initCursor();

  /* ============================================================
     3.  FLOATING HEARTS  (subtle, max 15, requestAnimationFrame)
     ============================================================ */
  var MAX_HEARTS = isMobile ? 8 : 15;
  var heartPool  = 0;
  var EMOJIS     = ['💕', '💗', '🩷', '❤️', '💖'];

  function spawnHeart() {
    if (heartPool >= MAX_HEARTS) return;
    heartPool++;

    var container = document.getElementById('heartsContainer');
    if (!container) return;

    var el = document.createElement('span');
    el.className = 'floating-heart';
    el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    el.style.left     = (Math.random() * 100) + 'vw';
    el.style.fontSize = (Math.random() * 10 + 12) + 'px';

    var dur   = (Math.random() * 4 + 6).toFixed(1);
    var delay = (Math.random() * 1).toFixed(2);
    var drift = ((Math.random() - 0.5) * 40).toFixed(0);

    el.style.setProperty('--dur',   dur + 's');
    el.style.setProperty('--delay', delay + 's');
    el.style.setProperty('--drift', drift + 'px');
    el.style.setProperty('--peak',  (Math.random() * 0.06 + 0.08).toFixed(2));

    container.appendChild(el);

    el.addEventListener('animationend', function () {
      if (el.parentNode) el.parentNode.removeChild(el);
      heartPool--;
    });
  }

  /* Spawn hearts gently at intervals */
  function initHearts() {
    /* Initial batch */
    for (var i = 0; i < (isMobile ? 3 : 5); i++) {
      setTimeout(spawnHeart, i * 400);
    }
    /* Continuous gentle spawn */
    setInterval(spawnHeart, isMobile ? 4000 : 3200);
  }

  initHearts();

  /* ============================================================
     4.  LIGHTBOX MODAL  (gallery image click)
     ============================================================ */
  function initLightbox() {
    var lightbox  = document.getElementById('lightbox');
    var lbImg     = document.getElementById('lightboxImg');
    var lbClose   = document.getElementById('lightboxClose');
    if (!lightbox || !lbImg || !lbClose) return;

    var items = document.querySelectorAll('.gallery-item img');

    /* Open */
    for (var i = 0; i < items.length; i++) {
      (function (img) {
        img.parentElement.addEventListener('click', function () {
          lbImg.src = img.src;
          lbImg.alt = img.alt;
          lightbox.classList.add('open');
          lightbox.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden'; /* lock scroll */
        });
      })(items[i]);
    }

    /* Close */
    function closeLightbox() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    lbClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) {
        closeLightbox();
      }
    });
  }

  initLightbox();

  /* ============================================================
     5.  VIDEO AUTOPLAY with FALLBACK
     ============================================================ */
  function initVideos() {
    var cards = document.querySelectorAll('.video-card');

    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        var video   = card.querySelector('.video-player');
        var playBtn = card.querySelector('.video-play-btn');
        var spinner = card.querySelector('.video-spinner');
        if (!video) return;

        /* Show spinner while loading */
        spinner.classList.add('show');

        video.addEventListener('canplay', function () {
          spinner.classList.remove('show');
        }, { once: true });

        /* Attempt autoplay */
        var playPromise = video.play();

        if (playPromise !== undefined) {
          playPromise.then(function () {
            /* Autoplay succeeded */
            spinner.classList.remove('show');
            playBtn.classList.remove('show');
          }).catch(function () {
            /* Autoplay blocked – show play button */
            spinner.classList.remove('show');
            playBtn.classList.add('show');
          });
        }

        /* Manual play button */
        playBtn.addEventListener('click', function () {
          video.play().then(function () {
            playBtn.classList.remove('show');
          }).catch(function () {
            /* Truly can't play – ignore gracefully */
          });
        });

      })(cards[i]);
    }
  }

  /* Run video init after a small delay to let DOM settle */
  setTimeout(initVideos, 400);

  /* ============================================================
     6.  DARK ROMANTIC MODE TOGGLE
     ============================================================ */
  function initThemeToggle() {
    var toggle = document.getElementById('themeToggle');
    var icon   = document.getElementById('themeIcon');
    if (!toggle || !icon) return;

    /* Restore saved preference */
    var saved = localStorage.getItem('valentine-theme');
    if (saved === 'dark') {
      document.body.classList.add('dark-mode');
      icon.textContent = '☀️';
    }

    toggle.addEventListener('click', function () {
      var isDark = document.body.classList.toggle('dark-mode');
      icon.textContent = isDark ? '☀️' : '🌙';
      localStorage.setItem('valentine-theme', isDark ? 'dark' : 'light');
    });
  }

  initThemeToggle();

  /* ============================================================
     7.  SURPRISE BUTTON — CONFETTI + HEART EXPLOSION + POPUP
     ============================================================ */
  function initSurprise() {
    var btn      = document.getElementById('surpriseBtn');
    var popup    = document.getElementById('surprisePopup');
    var closeBtn = document.getElementById('surpriseClose');
    var canvas   = document.getElementById('confettiCanvas');
    if (!btn || !popup || !closeBtn || !canvas) return;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var animId = null;

    function resizeCanvas() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    var PARTICLE_COUNT = isMobile ? 60 : 120;
    var COLORS = [
      '#ff6b81', '#ff4757', '#ff6348', '#ffa502',
      '#ff7f50', '#e84393', '#fd79a8', '#fab1a0',
      '#f5d5c8', '#ffffff', '#ffcccc', '#ff9ff3'
    ];
    var HEARTS = ['❤️', '💖', '💕', '💗', '🩷'];

    function createParticle(cx, cy, type) {
      var angle = Math.random() * Math.PI * 2;
      var speed = Math.random() * 6 + 2;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed * (0.5 + Math.random()),
        vy: Math.sin(angle) * speed * (0.5 + Math.random()) - 3,
        gravity: 0.08 + Math.random() * 0.04,
        size: Math.random() * 6 + 3,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 1,
        decay: 0.008 + Math.random() * 0.006,
        type: type, /* 'confetti' or 'heart' */
        heart: HEARTS[Math.floor(Math.random() * HEARTS.length)]
      };
    }

    function drawParticle(p) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);

      if (p.type === 'heart') {
        ctx.font = p.size * 2 + 'px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.heart, 0, 0);
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      }

      ctx.restore();
    }

    function animateConfetti() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        drawParticle(p);
      }

      if (particles.length > 0) {
        animId = requestAnimationFrame(animateConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animId = null;
      }
    }

    function triggerConfetti() {
      var cx = canvas.width / 2;
      var cy = canvas.height / 2;

      /* Confetti particles */
      var confettiCount = Math.floor(PARTICLE_COUNT * 0.75);
      for (var i = 0; i < confettiCount; i++) {
        particles.push(createParticle(cx, cy, 'confetti'));
      }

      /* Heart particles from center */
      var heartCount = PARTICLE_COUNT - confettiCount;
      for (var j = 0; j < heartCount; j++) {
        particles.push(createParticle(cx, cy, 'heart'));
      }

      if (!animId) {
        animId = requestAnimationFrame(animateConfetti);
      }
    }

    /* Open popup + confetti */
    btn.addEventListener('click', function () {
      triggerConfetti();
      setTimeout(function () {
        popup.classList.add('open');
        popup.setAttribute('aria-hidden', 'false');
      }, 300);
    });

    /* Close popup */
    function closePopup() {
      popup.classList.remove('open');
      popup.setAttribute('aria-hidden', 'true');
    }

    closeBtn.addEventListener('click', closePopup);

    popup.addEventListener('click', function (e) {
      if (e.target === popup) closePopup();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && popup.classList.contains('open')) {
        closePopup();
      }
    });
  }

  initSurprise();

  /* ============================================================
     8.  SECRET SURPRISE — "Click if you love me" CONFETTI + POPUP
     ============================================================ */
  function initSecretSurprise() {
    var btn      = document.getElementById('secretSurpriseBtn');
    var popup    = document.getElementById('secretPopup');
    var closeBtn = document.getElementById('secretPopupClose');
    var canvas   = document.getElementById('secretConfettiCanvas');
    if (!btn || !popup || !closeBtn || !canvas) return;

    var ctx = canvas.getContext('2d');
    var pieces = [];
    var rafId = null;

    function resizeCanvas() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    var PIECE_COUNT = isMobile ? 80 : 150;
    var CONFETTI_COLORS = [
      '#ff6b81', '#ff4757', '#ff6348', '#ffa502',
      '#ff7f50', '#e84393', '#fd79a8', '#fab1a0',
      '#ff9ff3', '#f368e0', '#ee5a24', '#ffcccc'
    ];
    var HEART_CHARS = ['❤️', '💖', '💕', '💗', '🩷', '💘', '😌'];

    function createFallingPiece(type) {
      var startX = Math.random() * canvas.width;
      return {
        x: startX,
        y: -(Math.random() * 200 + 20),
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3 + 2,
        gravity: 0.03 + Math.random() * 0.02,
        size: Math.random() * 7 + 3,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 6,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        alpha: 1,
        decay: 0.003 + Math.random() * 0.003,
        type: type,
        heart: HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)],
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.03 + Math.random() * 0.04
      };
    }

    function drawPiece(p) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);

      if (p.type === 'heart') {
        ctx.font = (p.size * 2.5) + 'px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.heart, 0, 0);
      } else {
        ctx.fillStyle = p.color;
        var shapes = ['rect', 'circle', 'strip'];
        var shape = shapes[Math.floor(p.size) % 3];
        if (shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else if (shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -1, p.size, 2.5);
        }
      }

      ctx.restore();
    }

    function animateSecretConfetti() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var i = pieces.length - 1; i >= 0; i--) {
        var p = pieces[i];
        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * 0.8;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y > canvas.height + 50) {
          pieces.splice(i, 1);
          continue;
        }

        drawPiece(p);
      }

      if (pieces.length > 0) {
        rafId = requestAnimationFrame(animateSecretConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rafId = null;
      }
    }

    function triggerSecretConfetti() {
      var confettiCount = Math.floor(PIECE_COUNT * 0.7);
      for (var i = 0; i < confettiCount; i++) {
        pieces.push(createFallingPiece('confetti'));
      }

      var heartCount = PIECE_COUNT - confettiCount;
      for (var j = 0; j < heartCount; j++) {
        pieces.push(createFallingPiece('heart'));
      }

      if (!rafId) {
        rafId = requestAnimationFrame(animateSecretConfetti);
      }
    }

    /* Open popup + confetti on click */
    btn.addEventListener('click', function () {
      triggerSecretConfetti();
      setTimeout(function () {
        popup.classList.add('open');
        popup.setAttribute('aria-hidden', 'false');
      }, 400);
    });

    /* Close popup */
    function closeSecretPopup() {
      popup.classList.remove('open');
      popup.setAttribute('aria-hidden', 'true');
    }

    closeBtn.addEventListener('click', closeSecretPopup);

    popup.addEventListener('click', function (e) {
      if (e.target === popup) closeSecretPopup();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && popup.classList.contains('open')) {
        closeSecretPopup();
      }
    });
  }

  initSecretSurprise();

})();
