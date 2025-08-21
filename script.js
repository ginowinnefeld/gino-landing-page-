// Production-ready JavaScript with performance optimizations and accessibility
(function() {
    'use strict';

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Performance optimization: Use requestIdleCallback when available
    const scheduleWork = window.requestIdleCallback || window.setTimeout;
    
    // Intersection Observer for animations (performance optimized)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    let animationObserver;
    let numberCounters = new Set();

    function initializeIntersectionObserver() {
        if (!window.IntersectionObserver) return;
        
        animationObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add fade-in animation (respects prefers-reduced-motion)
                    if (!prefersReducedMotion) {
                        entry.target.classList.add('fade-in');
                    }
                    
                    // Start number counter animations
                    const numberElements = entry.target.querySelectorAll('[data-target]');
                    numberElements.forEach(element => {
                        if (!numberCounters.has(element)) {
                            scheduleWork(() => animateNumber(element));
                            numberCounters.add(element);
                        }
                    });
                    
                    // Stop observing once animated
                    animationObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe sections
        document.querySelectorAll('.section, .hero').forEach(section => {
            animationObserver.observe(section);
        });
    }

    // Optimized number counter animation
    function animateNumber(element) {
        const target = parseFloat(element.getAttribute('data-target'));
        const duration = prefersReducedMotion ? 100 : 1500; // Faster for reduced motion
        const frameRate = 1000 / 60; // 60 FPS
        const increment = target / (duration / frameRate);
        let current = 0;
        
        const startTime = performance.now();
        
        function updateNumber(timestamp) {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Use easing function for smooth animation
            const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
            current = target * easedProgress;
            
            // Format number based on target value
            let displayValue;
            if (target === 3.7) {
                displayValue = '$' + current.toFixed(1);
            } else if (target >= 1000) {
                displayValue = Math.floor(current).toLocaleString();
            } else if (element.textContent.includes('+')) {
                displayValue = '+' + Math.floor(current) + '%';
            } else {
                displayValue = Math.floor(current);
            }
            
            element.textContent = displayValue;
            element.setAttribute('aria-live', 'polite'); // Announce changes to screen readers
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                element.removeAttribute('aria-live');
            }
        }
        
        requestAnimationFrame(updateNumber);
    }

    // Smooth scrolling for anchor links with accessibility considerations
    function initializeSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Focus management for accessibility
                    const originalTabIndex = targetElement.tabIndex;
                    targetElement.tabIndex = -1;
                    targetElement.focus({ preventScroll: true });
                    
                    targetElement.scrollIntoView({
                        behavior: prefersReducedMotion ? 'auto' : 'smooth',
                        block: 'start'
                    });
                    
                    // Restore original tab index after animation
                    setTimeout(() => {
                        if (originalTabIndex >= 0) {
                            targetElement.tabIndex = originalTabIndex;
                        } else {
                            targetElement.removeAttribute('tabindex');
                        }
                    }, prefersReducedMotion ? 0 : 1000);
                }
            });
        });
    }

    // Enhanced button interactions with accessibility
    function initializeButtonInteractions() {
        document.querySelectorAll('.btn').forEach(button => {
            // Mouse interactions
            button.addEventListener('mouseenter', function() {
                if (!prefersReducedMotion) {
                    this.style.transform = 'scale(1.02)';
                }
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });

            // Keyboard interactions
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!prefersReducedMotion) {
                        this.style.transform = 'scale(0.98)';
                    }
                }
            });

            button.addEventListener('keyup', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    this.style.transform = 'scale(1)';
                    if (e.key === 'Enter') {
                        this.click();
                    }
                }
            });

            // Touch interactions for mobile
            button.addEventListener('touchstart', function() {
                if (!prefersReducedMotion) {
                    this.style.transform = 'scale(0.98)';
                }
            }, { passive: true });

            button.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            }, { passive: true });
        });
    }

    // Scroll progress indicator (performance optimized)
    function createScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.setAttribute('role', 'progressbar');
        progressBar.setAttribute('aria-label', 'Page scroll progress');
        progressBar.setAttribute('aria-valuemin', '0');
        progressBar.setAttribute('aria-valuemax', '100');
        
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: #007AFF;
            z-index: 1000;
            transition: width 0.1s ease;
            pointer-events: none;
        `;
        document.body.appendChild(progressBar);

        let ticking = false;
        
        function updateProgress() {
            const scrollTop = window.pageYOffset;
            const documentHeight = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / documentHeight) * 100);
            
            progressBar.style.width = scrollPercent + '%';
            progressBar.setAttribute('aria-valuenow', scrollPercent);
            
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateProgress);
                ticking = true;
            }
        }, { passive: true });
    }

    // Performance monitoring (Core Web Vitals)
    function initializePerformanceMonitoring() {
        // Measure Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            try {
                const po = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    
                    // Log LCP for debugging (remove in production)
                    if (window.console && window.console.log) {
                        console.log('LCP:', lastEntry.startTime);
                    }
                });
                
                po.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                // Silently handle browsers that don't support this
            }
        }
    }

    // Error handling and recovery
    function initializeErrorHandling() {
        window.addEventListener('error', function(e) {
            // Log error for debugging but don't break the experience
            if (window.console && window.console.error) {
                console.error('JavaScript Error:', e.error);
            }
        });

        window.addEventListener('unhandledrejection', function(e) {
            // Handle promise rejections gracefully
            if (window.console && window.console.error) {
                console.error('Unhandled Promise Rejection:', e.reason);
            }
        });
    }

    // Lazy loading for better performance
    function initializeLazyLoading() {
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[data-src]');
            
            if (lazyImages.length > 0) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    });
                });

                lazyImages.forEach(img => imageObserver.observe(img));
            }
        }
    }

    // Keyboard trap management for modal dialogs (if any)
    function initializeKeyboardTraps() {
        document.addEventListener('keydown', function(e) {
            // Handle escape key for closing modals
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    activeModal.classList.remove('active');
                    activeModal.setAttribute('aria-hidden', 'true');
                }
            }
        });
    }

    // Initialize everything when DOM is ready
    function initialize() {
        // Core functionality
        initializeIntersectionObserver();
        initializeSmoothScrolling();
        initializeButtonInteractions();
        
        // Progressive enhancements
        scheduleWork(() => {
            createScrollProgress();
            initializeLazyLoading();
            initializeKeyboardTraps();
            initializePerformanceMonitoring();
        });

        // Error handling
        initializeErrorHandling();

        // Log successful initialization
        if (window.console && window.console.log) {
            console.log('🍎 Apple-quality website initialized successfully!');
        }
    }

    // Wait for DOM content to be loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM is already loaded
        initialize();
    }

    // Handle reduced motion preference changes
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionMediaQuery.addEventListener('change', function(e) {
        if (e.matches) {
            // User now prefers reduced motion
            document.body.classList.add('reduced-motion');
        } else {
            // User no longer prefers reduced motion
            document.body.classList.remove('reduced-motion');
        }
    });

    // Expose minimal API for potential external use
    window.GinoSite = {
        version: '1.0.0',
        initialized: true
    };
})();

// Service Worker registration for PWA capabilities (if service worker exists)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            if (window.console && window.console.log) {
                console.log('SW registered: ', registration);
            }
        }).catch(function(registrationError) {
            if (window.console && window.console.log) {
                console.log('SW registration failed: ', registrationError);
            }
        });
    });
}