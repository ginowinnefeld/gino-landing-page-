// Apple-style smooth animations and interactions
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                
                // Start number counter animation if element has data-target
                const numberElements = entry.target.querySelectorAll('[data-target]');
                numberElements.forEach(animateNumber);
            }
        });
    }, observerOptions);

    // Observe all sections for fade-in animations
    const sections = document.querySelectorAll('.section, .hero');
    sections.forEach(section => observer.observe(section));

    // Number counter animation function
    function animateNumber(element) {
        if (element.classList.contains('animated')) return; // Prevent re-animation
        
        const target = parseFloat(element.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        element.classList.add('animated');
        
        const timer = setInterval(() => {
            current += increment;
            
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Format number based on target value
            let displayValue;
            if (target === 3.7) {
                displayValue = '$' + current.toFixed(1);
            } else if (target >= 1000) {
                displayValue = Math.floor(current).toLocaleString();
            } else if (element.textContent.includes('+')) {
                displayValue = '+' + Math.floor(current);
            } else {
                displayValue = Math.floor(current);
            }
            
            element.textContent = displayValue;
        }, 16);
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll progress indicator
    function createScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.id = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: #007AFF;
            z-index: 1000;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const documentHeight = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / documentHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
        });
    }

    createScrollProgress();

    // Button hover effects with Apple-style animations
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });

        // Add ripple effect on click
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Add ripple animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .btn {
            position: relative;
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);

    // Parallax effect for competitive circles
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.competitor-circle');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.1 + (index * 0.05);
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });

    // Animate chart bars on scroll
    const chartBars = document.querySelectorAll('.bar');
    const chartObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bars = entry.target.querySelectorAll('.bar');
                bars.forEach((bar, index) => {
                    setTimeout(() => {
                        bar.style.transform = 'scaleY(1)';
                        bar.style.transformOrigin = 'bottom';
                    }, index * 200);
                });
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.chart-bars').forEach(chart => {
        chart.querySelectorAll('.bar').forEach(bar => {
            bar.style.transform = 'scaleY(0)';
            bar.style.transformOrigin = 'bottom';
            bar.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        });
        chartObserver.observe(chart);
    });

    // Enhanced hover effects for cards
    const cards = document.querySelectorAll('.narrative-card, .principle, .result-metric');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '';
        });
    });

    // Staggered animation for grids
    const animateGrid = (gridSelector, delay = 100) => {
        const gridObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const items = entry.target.children;
                    Array.from(items).forEach((item, index) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, index * delay);
                    });
                }
            });
        }, { threshold: 0.2 });

        document.querySelectorAll(gridSelector).forEach(grid => {
            Array.from(grid.children).forEach(item => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(30px)';
                item.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            });
            gridObserver.observe(grid);
        });
    };

    // Apply staggered animations to various grids
    animateGrid('.features-grid', 150);
    animateGrid('.execution-grid', 150);
    animateGrid('.principles-grid', 150);
    animateGrid('.results-grid', 100);

    // Apple-style loading animation
    function createLoadingAnimation() {
        const loader = document.createElement('div');
        loader.id = 'apple-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <p>Loading experience...</p>
            </div>
        `;
        
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 1;
            transition: opacity 0.5s ease;
        `;

        const loaderStyle = document.createElement('style');
        loaderStyle.textContent = `
            .loader-content {
                text-align: center;
            }
            
            .loader-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #007AFF;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            
            .loader-content p {
                color: #4D4D4D;
                font-size: 16px;
                font-weight: 500;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        
        document.head.appendChild(loaderStyle);
        document.body.appendChild(loader);

        // Hide loader after page loads
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.remove(), 500);
            }, 800);
        });
    }

    createLoadingAnimation();

    // Smooth reveal animation for hero metrics
    setTimeout(() => {
        const heroMetrics = document.querySelectorAll('.hero .metric');
        heroMetrics.forEach((metric, index) => {
            setTimeout(() => {
                metric.style.opacity = '1';
                metric.style.transform = 'translateY(0)';
            }, 500 + (index * 200));
        });
    }, 1000);

    // Initialize hero metrics as hidden
    document.querySelectorAll('.hero .metric').forEach(metric => {
        metric.style.opacity = '0';
        metric.style.transform = 'translateY(30px)';
        metric.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });

    // Enhanced scroll-based animations
    let ticking = false;
    
    function updateAnimations() {
        const scrollTop = window.pageYOffset;
        
        // Parallax for hero background
        const hero = document.querySelector('.hero');
        if (hero) {
            const heroOffset = scrollTop * 0.3;
            hero.style.transform = `translateY(${heroOffset}px)`;
        }
        
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateAnimations);
            ticking = true;
        }
    });

    // Dynamic favicon based on scroll
    function createDynamicFavicon() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 32;
        canvas.height = 32;
        
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.min(window.pageYOffset / (document.body.scrollHeight - window.innerHeight), 1);
            
            // Clear canvas
            ctx.clearRect(0, 0, 32, 32);
            
            // Draw progress circle
            ctx.beginPath();
            ctx.arc(16, 16, 12, 0, 2 * Math.PI * scrollPercent);
            ctx.strokeStyle = '#007AFF';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Update favicon
            const link = document.querySelector('link[rel="icon"]') || document.createElement('link');
            link.rel = 'icon';
            link.href = canvas.toDataURL();
            if (!document.querySelector('link[rel="icon"]')) {
                document.head.appendChild(link);
            }
        });
    }
    
    createDynamicFavicon();

    console.log('🍎 Apple-style website loaded successfully!');
});

// Additional utility functions for enhanced interactivity
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance optimization for scroll events
const optimizedScrollHandler = debounce(() => {
    // Additional scroll-based animations can be added here
}, 10);