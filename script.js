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
                        
                        // Clean up will-change after animation completes
                        setTimeout(() => {
                            entry.target.classList.add('animation-complete');
                        }, 600);
                    }
                    
                    // Start number counter animations for data-count elements
                    const numberElements = entry.target.querySelectorAll('[data-count]');
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

        // Observe sections and individual count elements
        document.querySelectorAll('.section, .hero, [data-count]').forEach(element => {
            animationObserver.observe(element);
        });
    }

    // Optimized number counter animation
    function animateNumber(element) {
        const target = parseFloat(element.getAttribute('data-count'));
        const duration = prefersReducedMotion ? 100 : 1500; // Faster for reduced motion
        const originalText = element.textContent;
        
        // Skip if element already animated or has no valid target
        if (isNaN(target) || element.hasAttribute('data-animated')) {
            return;
        }
        
        element.setAttribute('data-animated', 'true');
        
        const startTime = performance.now();
        let current = 0;
        
        function updateNumber(timestamp) {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Use easing function for smooth animation
            const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
            current = target * easedProgress;
            
            // Format number based on target value and original content
            let displayValue;
            if (target === 3.7) {
                displayValue = '$' + current.toFixed(1) + 'B';
            } else if (target >= 10000) {
                displayValue = Math.floor(current).toLocaleString();
            } else if (originalText.includes('+') && originalText.includes('%')) {
                displayValue = '+' + Math.floor(current) + '%';
            } else if (originalText.includes('–') || originalText.includes('-')) {
                displayValue = Math.floor(current) + '–' + (Math.floor(current) + 1) + 'x';
            } else if (originalText.includes('x')) {
                displayValue = Math.floor(current) + 'x';
            } else if (originalText.includes('%')) {
                displayValue = Math.floor(current) + '%';
            } else if (target >= 1000) {
                displayValue = Math.floor(current).toLocaleString();
            } else {
                displayValue = Math.floor(current);
            }
            
            element.textContent = displayValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                // Final cleanup and ensure exact target value
                if (target === 3.7) {
                    element.textContent = '$3.7B';
                } else if (originalText.includes('5–6x') || originalText.includes('5-6x')) {
                    element.textContent = '5–6x';
                }
                element.removeAttribute('aria-live');
            }
        }
        
        // Start animation with screen reader announcement
        element.setAttribute('aria-live', 'polite');
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

    // Enhanced Performance monitoring (Core Web Vitals)
    function initializePerformanceMonitoring() {
        if (!('PerformanceObserver' in window)) return;
        
        const vitals = {};
        
        try {
            // Measure Largest Contentful Paint (LCP) - target ≤ 2.5s
            const lcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                vitals.lcp = lastEntry.startTime;
                
                if (window.console && window.console.log) {
                    console.log('🎯 LCP:', Math.round(vitals.lcp), 'ms', vitals.lcp <= 2500 ? '✅' : '⚠️');
                }
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            
            // Measure Cumulative Layout Shift (CLS) - target ≤ 0.1  
            const clsObserver = new PerformanceObserver((entryList) => {
                let clsValue = 0;
                for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                vitals.cls = (vitals.cls || 0) + clsValue;
                
                if (window.console && window.console.log) {
                    console.log('🎯 CLS:', vitals.cls.toFixed(3), vitals.cls <= 0.1 ? '✅' : '⚠️');
                }
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
            
            // Measure First Input Delay (FID) / Interaction to Next Paint (INP) - target ≤ 200ms
            const fidObserver = new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    vitals.fid = entry.processingStart - entry.startTime;
                    if (window.console && window.console.log) {
                        console.log('🎯 FID:', Math.round(vitals.fid), 'ms', vitals.fid <= 100 ? '✅' : '⚠️');
                    }
                }
            });
            fidObserver.observe({ entryTypes: ['first-input'] });
            
        } catch (e) {
            // Silently handle browsers that don't support these features
        }
        
        // Report vitals after page fully loaded
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (window.console && window.console.log && Object.keys(vitals).length > 0) {
                    console.log('📊 Core Web Vitals Summary:', vitals);
                }
            }, 0);
        });
    }

    // Enhanced error handling and operational monitoring
    function initializeErrorHandling() {
        const errors = [];
        
        window.addEventListener('error', function(e) {
            const errorInfo = {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            errors.push(errorInfo);
            
            // Log error for debugging
            if (window.console && window.console.error) {
                console.error('🚨 JavaScript Error:', errorInfo);
            }
            
            // In production, you could send this to a monitoring service
            // sendErrorToMonitoring(errorInfo);
        });

        window.addEventListener('unhandledrejection', function(e) {
            const errorInfo = {
                type: 'unhandledrejection',
                reason: e.reason?.toString() || 'Unknown promise rejection',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            errors.push(errorInfo);
            
            if (window.console && window.console.error) {
                console.error('🚨 Unhandled Promise Rejection:', errorInfo);
            }
            
            // Prevent the default handling
            e.preventDefault();
        });
        
        // Periodic health check and error reporting
        setInterval(() => {
            if (errors.length > 0) {
                console.log('📊 Error Summary:', {
                    totalErrors: errors.length,
                    recentErrors: errors.slice(-5),
                    timestamp: new Date().toISOString()
                });
            }
        }, 60000); // Every minute
        
        // Expose error monitoring for external tools
        window.GinoSite.monitoring = {
            getErrors: () => errors,
            getErrorCount: () => errors.length,
            clearErrors: () => { errors.length = 0; }
        };
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

    // Enhanced keyboard navigation and accessibility
    function initializeKeyboardNavigation() {
        // Handle escape key and other keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Handle escape key for closing modals
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    activeModal.classList.remove('active');
                    activeModal.setAttribute('aria-hidden', 'true');
                }
            }
            
            // Skip links navigation (H key)
            if (e.key === 'h' && e.altKey) {
                e.preventDefault();
                const skipLink = document.querySelector('.skip-link');
                if (skipLink) {
                    skipLink.focus();
                }
            }
            
            // Main navigation (M key)
            if (e.key === 'm' && e.altKey) {
                e.preventDefault();
                const mainContent = document.querySelector('main');
                if (mainContent) {
                    mainContent.focus();
                    mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
        
        // Enhance section navigation for screen readers
        document.querySelectorAll('section[aria-labelledby]').forEach((section, index) => {
            section.setAttribute('tabindex', '-1');
            
            // Add keyboard shortcut hints for screen readers
            const heading = section.querySelector('h2');
            if (heading && index < 9) {
                const shortcutHint = document.createElement('span');
                shortcutHint.className = 'sr-only';
                shortcutHint.textContent = ` (Alt+${index + 1} to jump to this section)`;
                heading.appendChild(shortcutHint);
                
                // Add keyboard shortcut listener
                document.addEventListener('keydown', function(e) {
                    if (e.altKey && e.key === String(index + 1)) {
                        e.preventDefault();
                        section.focus();
                        section.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
                    }
                });
            }
        });
    }

    // Announce page loaded for screen readers
    function announcePageLoaded() {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = 'Gino Winnefeld portfolio page loaded successfully. Use Alt+H for navigation help, Alt+M for main content, or Alt+1-9 for sections.';
        
        document.body.appendChild(announcement);
        
        // Remove announcement after it's read
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 5000);
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
            initializeKeyboardNavigation();
            initializePerformanceMonitoring();
            announcePageLoaded();
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