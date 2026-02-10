(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Theme Toggle ---
    function toggleTheme() {
        var html = document.documentElement;
        var current = html.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    }

    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
        btn.addEventListener('click', toggleTheme);
    });

    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'light' : 'dark');
        }
    });

    // --- Navbar scroll effect ---
    var nav = document.getElementById('nav');

    function handleScroll() {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // --- Mobile menu toggle ---
    var navToggle = document.getElementById('nav-toggle');
    var mobileMenu = document.getElementById('mobile-menu');

    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', function () {
            var isActive = navToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        mobileMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                navToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
                navToggle.focus();
            }
        });
    }

    // --- Experience Tabs ---
    var tabButtons = document.querySelectorAll('.exp-tab');
    var tabPanels = document.querySelectorAll('.exp-panel');

    tabButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var target = btn.getAttribute('data-tab');

            tabButtons.forEach(function (b) {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            tabPanels.forEach(function (panel) {
                if (panel.id === 'panel-' + target) {
                    panel.classList.remove('hidden');
                } else {
                    panel.classList.add('hidden');
                }
            });
        });
    });

    // --- Scroll Reveal with IntersectionObserver ---
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        var fadeElements = document.querySelectorAll('.fade-up');

        fadeElements.forEach(function (el) {
            if (el.getBoundingClientRect().top > window.innerHeight) {
                el.style.animationPlayState = 'paused';
            }
        });

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        fadeElements.forEach(function (el) { observer.observe(el); });
    }

    // --- Smooth scroll for navigation links ---
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;

            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                var offset = nav.offsetHeight + 10;
                var targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });
            }
        });
    });

    // --- Active nav link highlighting ---
    function updateActiveLink() {
        var sections = document.querySelectorAll('section[id]');
        var navLinks = document.querySelectorAll('.nav-link');
        var scrollPos = window.scrollY + nav.offsetHeight + 50;

        sections.forEach(function (section) {
            var sectionTop = section.offsetTop;
            var sectionHeight = section.offsetHeight;
            var sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(function (link) {
                    link.style.color = '';
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.style.color = 'var(--accent)';
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });

    // --- Typing Effect ---
    function initTyping() {
        var element = document.getElementById('typing-text');
        if (!element) return;

        var phrases = [
            'I build AI that advances medicine.',
            'I develop tools for computational neuroscience.',
            'I create open-source clinical software.'
        ];

        if (prefersReducedMotion) {
            element.textContent = phrases[0];
            return;
        }

        var phraseIndex = 0;
        var charIndex = 0;
        var isDeleting = false;
        var typeSpeed = 50;
        var deleteSpeed = 30;
        var pauseEnd = 2000;
        var pauseStart = 500;

        function type() {
            var currentPhrase = phrases[phraseIndex];

            if (isDeleting) {
                charIndex--;
                element.textContent = currentPhrase.substring(0, charIndex);
            } else {
                charIndex++;
                element.textContent = currentPhrase.substring(0, charIndex);
            }

            var delay = isDeleting ? deleteSpeed : typeSpeed;

            if (!isDeleting && charIndex === currentPhrase.length) {
                delay = pauseEnd;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                delay = pauseStart;
            }

            setTimeout(type, delay);
        }

        setTimeout(type, 1000);
    }

    initTyping();

    // --- Animated Stat Counters ---
    function initCounters() {
        var counters = document.querySelectorAll('.stat-number');
        if (!counters.length) return;

        var animated = new Set();

        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !animated.has(entry.target)) {
                    animated.add(entry.target);
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(function (counter) {
            counterObserver.observe(counter);
        });
    }

    function animateCounter(el) {
        var target = parseFloat(el.getAttribute('data-target'));
        var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        var duration = 1500;
        var start = performance.now();

        function update(now) {
            var elapsed = now - start;
            var progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = eased * target;

            el.textContent = current.toFixed(decimals);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target.toFixed(decimals);
            }
        }

        requestAnimationFrame(update);
    }

    initCounters();

    // --- Particle Network (Hero Canvas) ---
    function initParticles() {
        var canvas = document.getElementById('hero-canvas');
        if (!canvas || prefersReducedMotion) return;

        var ctx = canvas.getContext('2d');
        if (!ctx) return;

        var particles = [];
        var mouse = { x: -1000, y: -1000 };
        var particleCount = window.innerWidth < 768 ? 25 : 55;
        var connectDistance = 140;
        var animId;

        function resize() {
            var hero = canvas.parentElement;
            canvas.width = hero.offsetWidth;
            canvas.height = hero.offsetHeight;
        }

        function createParticles() {
            particles = [];
            for (var i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    radius: Math.random() * 1.5 + 0.8
                });
            }
        }

        function getAccentColor() {
            return getComputedStyle(document.documentElement)
                .getPropertyValue('--accent').trim() || '#64ffda';
        }

        function hexToRgb(hex) {
            hex = hex.replace('#', '');
            if (hex.length === 3) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            var num = parseInt(hex, 16);
            return {
                r: (num >> 16) & 255,
                g: (num >> 8) & 255,
                b: num & 255
            };
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            var accent = getAccentColor();
            var rgb = hexToRgb(accent);

            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];

                // Mouse attraction (subtle)
                var dx = mouse.x - p.x;
                var dy = mouse.y - p.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200 && dist > 0) {
                    p.vx += dx * 0.00003;
                    p.vy += dy * 0.00003;
                }

                // Dampen velocity
                p.vx *= 0.999;
                p.vy *= 0.999;

                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) { p.x = 0; p.vx *= -1; }
                if (p.x > canvas.width) { p.x = canvas.width; p.vx *= -1; }
                if (p.y < 0) { p.y = 0; p.vy *= -1; }
                if (p.y > canvas.height) { p.y = canvas.height; p.vy *= -1; }

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.4)';
                ctx.fill();

                // Draw connections
                for (var j = i + 1; j < particles.length; j++) {
                    var p2 = particles[j];
                    var cdx = p.x - p2.x;
                    var cdy = p.y - p2.y;
                    var cdist = Math.sqrt(cdx * cdx + cdy * cdy);

                    if (cdist < connectDistance) {
                        var alpha = 0.12 * (1 - cdist / connectDistance);
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + alpha + ')';
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }

            animId = requestAnimationFrame(animate);
        }

        resize();
        createParticles();
        animate();

        var resizeTimeout;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function () {
                resize();
                createParticles();
            }, 200);
        });

        canvas.parentElement.addEventListener('mousemove', function (e) {
            var rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        canvas.parentElement.addEventListener('mouseleave', function () {
            mouse.x = -1000;
            mouse.y = -1000;
        });

        // Pause animation when hero is not visible
        var heroObserver = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) {
                if (!animId) animate();
            } else {
                if (animId) {
                    cancelAnimationFrame(animId);
                    animId = null;
                }
            }
        }, { threshold: 0 });

        heroObserver.observe(canvas.parentElement);
    }

    initParticles();

})();
