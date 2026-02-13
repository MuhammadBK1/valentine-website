/* =============================================================
   Happy Valentine's Day – script.js
   Lightweight · Smooth · Mobile-optimised · No libraries
   ============================================================= */

(function () {
  'use strict';

  /* ─────────── Device Detection ─────────── */
  var isDesktop    = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

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
      '.gallery-item, .lightbox__close, .video-play-btn, a, button, [role="button"]'
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
     3.  FLOATING HEARTS  (lightweight background, max 20)
     ============================================================ */
  var MAX_HEARTS = 20;
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
    el.style.fontSize = (Math.random() * 12 + 14) + 'px';

    var dur   = (Math.random() * 4 + 5).toFixed(1);
    var delay = (Math.random() * 1).toFixed(2);
    var drift = ((Math.random() - 0.5) * 50).toFixed(0);

    el.style.setProperty('--dur',   dur + 's');
    el.style.setProperty('--delay', delay + 's');
    el.style.setProperty('--drift', drift + 'px');
    el.style.setProperty('--peak',  (Math.random() * 0.08 + 0.1).toFixed(2));

    container.appendChild(el);

    el.addEventListener('animationend', function () {
      if (el.parentNode) el.parentNode.removeChild(el);
      heartPool--;
    });
  }

  /* Spawn hearts gently at intervals */
  function initHearts() {
    /* Initial batch */
    for (var i = 0; i < 6; i++) {
      setTimeout(spawnHeart, i * 300);
    }
    /* Continuous gentle spawn */
    setInterval(spawnHeart, 2800);
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

})();
