// ============================================
// Gallery Filter Functionality
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const toggleOptions = document.querySelectorAll('.toggle-option');
    const galleryItems = document.querySelectorAll('.gallery-item');
    let currentFilter = 'bw';

    // Filter gallery
    function filterGallery(filter) {
        currentFilter = filter;

        galleryItems.forEach(item => {
            if (item.dataset.type === filter) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });

        // Update active option
        toggleOptions.forEach(opt => {
            if (opt.dataset.filter === filter) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });
    }

    // Initialize filter from URL hash or default to 'bw'
    if (toggleOptions.length > 0) {
        const hash = window.location.hash.slice(1);
        filterGallery(hash === 'color' ? 'color' : 'bw');
        document.querySelector('.gallery-grid').classList.add('initialized');
    }

    // Toggle option click handlers
    toggleOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            const filter = opt.dataset.filter;
            window.location.hash = filter;
            filterGallery(filter);
        });
    });

    // ============================================
    // Lightbox Functionality
    // ============================================

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxLocation = document.getElementById('lightbox-location');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    let currentIndex = 0;

    // Get visible gallery items
    function getVisibleItems() {
        return Array.from(galleryItems).filter(item => !item.classList.contains('hidden'));
    }

    // Preload adjacent lightbox images
    function preloadAdjacent(index) {
        const visibleItems = getVisibleItems();
        [-1, 1].forEach(offset => {
            const i = (index + offset + visibleItems.length) % visibleItems.length;
            const adjImg = visibleItems[i].querySelector('img');
            const src = adjImg.dataset.full || adjImg.src;
            const preload = new Image();
            preload.src = src;
        });
    }

    // Open lightbox
    let isFirstOpen = true;

    function openLightbox(item) {
        const visibleItems = getVisibleItems();
        currentIndex = visibleItems.indexOf(item);

        const img = item.querySelector('img');
        const title = item.querySelector('.photo-title');
        const location = item.querySelector('.photo-location');

        // Use full-res image if available (data-full attribute), otherwise use src
        let imgSrc = img.dataset.full || img.src;
        // Handle picsum photos resolution upgrade
        if (imgSrc.includes('picsum.photos')) {
            imgSrc = imgSrc.replace(/\/(\d+)\/(\d+)/, '/1200/800');
        }

        // Show loading spinner while full-res loads
        lightbox.classList.add('loading');
        lightboxImg.onload = () => {
            lightbox.classList.remove('loading');
        };

        lightboxImg.src = imgSrc;
        lightboxImg.alt = img.alt;
        lightboxTitle.textContent = title ? title.textContent : '';
        lightboxLocation.textContent = location ? location.textContent : '';

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Show swipe hint on first open on touch devices
        if (isFirstOpen && 'ontouchstart' in window) {
            isFirstOpen = false;
            const hint = document.getElementById('swipe-hint');
            if (hint) {
                hint.classList.add('visible');
                setTimeout(() => hint.classList.remove('visible'), 2000);
            }
        }

        preloadAdjacent(currentIndex);
    }

    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Navigate to previous image
    function prevImage() {
        const visibleItems = getVisibleItems();
        currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
        openLightbox(visibleItems[currentIndex]);
    }

    // Navigate to next image
    function nextImage() {
        const visibleItems = getVisibleItems();
        currentIndex = (currentIndex + 1) % visibleItems.length;
        openLightbox(visibleItems[currentIndex]);
    }

    // Event listeners for gallery items
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            if (!item.classList.contains('hidden')) {
                openLightbox(item);
            }
        });
    });

    // Event listeners for lightbox controls
    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            prevImage();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            nextImage();
        });
    }

    // Close lightbox when clicking outside the image
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;

        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                prevImage();
                break;
            case 'ArrowRight':
                nextImage();
                break;
        }
    });

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    if (lightbox) {
        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextImage();
            } else {
                prevImage();
            }
        }
    }
});

// ============================================
// Smooth scroll for anchor links
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// Lazy loading enhancement
// ============================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// Header scroll behavior
// ============================================

let lastScroll = 0;
const header = document.querySelector('.site-header');

if (header) {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            header.style.transform = 'translateY(0)';
            return;
        }

        if (currentScroll > lastScroll && currentScroll > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
    }, { passive: true });
}

// ============================================
// Show page after fonts are loaded
// ============================================

function showPage() {
    document.body.classList.add('ready');
}

if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(showPage);
} else {
    showPage();
}

// Fallback: show page after 1s even if fonts haven't loaded
setTimeout(showPage, 1000);
