/**
 * Nobodies Collective Association
 */

(function() {
    'use strict';

    // Mobile Navigation
    function initMobileNav() {
        const toggle = document.querySelector('.nav-toggle');
        const links = document.querySelector('.nav-links');
        if (!toggle || !links) return;

        toggle.addEventListener('click', () => {
            links.classList.toggle('active');
        });

        // Close on link click
        links.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                links.classList.remove('active');
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!toggle.contains(e.target) && !links.contains(e.target)) {
                links.classList.remove('active');
            }
        });
    }

    // Smooth scroll
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const id = this.getAttribute('href');
                if (id === '#') return;

                const target = document.querySelector(id);
                if (target) {
                    e.preventDefault();
                    const header = document.querySelector('.header');
                    const offset = header ? header.offsetHeight : 0;

                    window.scrollTo({
                        top: target.offsetTop - offset,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Header scroll effect
    function initHeaderScroll() {
        var header = document.querySelector('.header');
        if (!header) return;

        function checkScroll() {
            if (window.scrollY > 80) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        window.addEventListener('scroll', checkScroll, { passive: true });
        checkScroll();
    }

    // Hero Slideshow
    function initSlideshow() {
        var slides = document.querySelectorAll('.hero-slide');
        if (slides.length < 2) return;

        var current = 0;
        var total = slides.length;

        setInterval(function() {
            slides[current].classList.remove('active');
            current = (current + 1) % total;
            slides[current].classList.add('active');
        }, 5000);
    }

    // Init
    function init() {
        initMobileNav();
        initSmoothScroll();
        initSlideshow();
        initHeaderScroll();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
