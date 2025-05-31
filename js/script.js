document.addEventListener('DOMContentLoaded', () => {
  // Menu elements (will be initialized in init())
  let menuToggle;
  let mobileMenu;

  // Reviews elements
  const reviewCards = document.querySelectorAll('.review-card');
  const reviewsTrack = document.querySelector('.reviews-track');
  const prevBtn = document.querySelector('.prev-slide');
  const nextBtn = document.querySelector('.next-slide');
  const indicatorsContainer = document.querySelector('.slider-indicators');
  let currentIndex = 0;
  let autoSlideInterval;
  const cardCount = reviewCards.length;
  let touchStartX = 0;
  let touchEndX = 0;

  // Initialize AOS
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    offset: 100
  });

  // Update card width and sliding behavior
  const updateCardWidth = () => {
    const isDesktop = window.innerWidth > 768;
    if (indicatorsContainer) {
      indicatorsContainer.style.display = 'flex';
    }
    if (reviewsTrack) {
      reviewsTrack.style.transition = 'transform 0.5s ease';
    }
    return isDesktop;
  };

  // Create indicators
  const createIndicators = () => {
    if (!indicatorsContainer) return;
    indicatorsContainer.innerHTML = '';
    for (let i = 0; i < cardCount; i++) {
      const indicator = document.createElement('div');
      indicator.classList.add('indicator');
      if (i === 0) indicator.classList.add('active');
      indicator.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      indicator.addEventListener('click', () => goToSlide(i));
      indicatorsContainer.appendChild(indicator);
    }
  };

  // Update active indicator
  const updateIndicators = () => {
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === currentIndex);
      indicator.setAttribute('aria-selected', index === currentIndex);
    });
  };

  // Go to specific slide
  const goToSlide = (index) => {
    if (cardCount === 0) return;
    currentIndex = Math.max(0, Math.min(index, cardCount - 1));
    const isDesktop = window.innerWidth > 768;
    const cardWidth = isDesktop
      ? reviewCards[0].offsetWidth + 30
      : reviewCards[0].offsetWidth + 10;
    if (reviewsTrack) {
      reviewsTrack.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    }
    updateIndicators();
  };

  // Slide to next
  const nextSlide = () => {
    currentIndex = (currentIndex + 1) % cardCount;
    goToSlide(currentIndex);
  };

  // Slide to previous
  const prevSlide = () => {
    currentIndex = (currentIndex - 1 + cardCount) % cardCount;
    goToSlide(currentIndex);
  };

  // Handle touch start
  const handleTouchStart = (event) => {
    touchStartX = event.touches[0].clientX;
    pauseAutoSlide();
  };

  // Handle touch move
  const handleTouchMove = (event) => {
    touchEndX = event.touches[0].clientX;
  };

  // Handle touch end
  const handleTouchEnd = () => {
    const swipeDistance = touchStartX - touchEndX;
    const minSwipeDistance = 50;
    if (swipeDistance > minSwipeDistance) {
      nextSlide();
    } else if (swipeDistance < -minSwipeDistance) {
      prevSlide();
    }
    startAutoSlide();
  };

  // Start auto-sliding
  const startAutoSlide = () => {
    if (cardCount <= 1) return;
    pauseAutoSlide();
    autoSlideInterval = setInterval(nextSlide, 5000);
  };

  // Pause auto-sliding
  const pauseAutoSlide = () => {
    clearInterval(autoSlideInterval);
  };

  // Toggle mobile menu - FIXED VERSION
  const toggleMenu = (event) => {
    if (!menuToggle || !mobileMenu) return;
    
    event.stopPropagation();
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    
    // Toggle menu visibility
    mobileMenu.classList.toggle('show', !isExpanded);
    menuToggle.classList.toggle('active', !isExpanded);
    menuToggle.setAttribute('aria-expanded', String(!isExpanded));
  };

  // Close menu on outside click
  const closeMenuOnClickOutside = (event) => {
    if (!menuToggle || !mobileMenu) return;
    const isClickInsideNavbar = event.target.closest('.navbar');
    if (!isClickInsideNavbar && mobileMenu.classList.contains('show')) {
      mobileMenu.classList.remove('show');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  };

  // Smooth scrolling
  const setupSmoothScrolling = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        if (anchor.hash) {
          e.preventDefault();
          const target = document.querySelector(anchor.hash);
          if (target) {
            const offset = window.innerWidth <= 480 ? 50 :
                          window.innerWidth <= 576 ? 60 :
                          window.innerWidth <= 768 ? 70 : 90;
            window.scrollTo({
              top: target.offsetTop - offset,
              behavior: 'smooth'
            });
            if (window.innerWidth <= 768 && mobileMenu?.classList.contains('show')) {
              toggleMenu(e);
            }
          }
        }
      });
    });
  };

  // Form validation and submission
  const handleFormSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('#email');
    const message = form.querySelector('#message');
    const emailError = form.querySelector('#email-error');
    const messageError = form.querySelector('#message-error');
    let isValid = true;

    // Reset error states
    if (emailError) emailError.style.display = 'none';
    if (messageError) messageError.style.display = 'none';
    email.classList.remove('error');
    message.classList.remove('error');

    // Validate email
    if (!email.value.trim()) {
      if (emailError) emailError.textContent = 'Email is required.';
      email.classList.add('error');
      if (emailError) emailError.style.display = 'block';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email.value)) {
      if (emailError) emailError.textContent = 'Please enter a valid email address.';
      email.classList.add('error');
      if (emailError) emailError.style.display = 'block';
      isValid = false;
    }

    // Validate message
    if (!message.value.trim()) {
      if (messageError) messageError.textContent = 'Message is required.';
      message.classList.add('error');
      if (messageError) messageError.style.display = 'block';
      isValid = false;
    }

    if (isValid) {
      const formData = new FormData(form);
      console.log('Form submitted:', Object.fromEntries(formData));
      alert('Thank you for your message! We will get back to you soon.');
      form.reset();
    }
  };

  // Keyboard navigation for slider
  const setupSliderKeyboardNav = () => {
    const slider = document.querySelector('.reviews-slider');
    if (slider) {
      slider.setAttribute('tabindex', '0');
      slider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          prevSlide();
          pauseAutoSlide();
          startAutoSlide();
        } else if (e.key === 'ArrowRight') {
          nextSlide();
          pauseAutoSlide();
          startAutoSlide();
        }
      });
    }
  };

  // Initialize
  const init = () => {
    // Get menu elements
    menuToggle = document.querySelector('.menu-toggle');
    mobileMenu = document.querySelector('.mobile-menu');

    // Mobile menu setup
    if (menuToggle && mobileMenu) {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.addEventListener('click', toggleMenu);
      document.addEventListener('click', closeMenuOnClickOutside);
    }

    // Smooth scrolling
    setupSmoothScrolling();

    // Form handling
    const contactForm = document.querySelector('.contact-section form');
    if (contactForm) {
      contactForm.addEventListener('submit', handleFormSubmit);
    }

    // Reviews slider
    if (cardCount > 0 && reviewsTrack) {
      createIndicators();
      setupSliderKeyboardNav();
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          prevSlide();
          pauseAutoSlide();
          startAutoSlide();
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          nextSlide();
          pauseAutoSlide();
          startAutoSlide();
        });
      }
      const slider = document.querySelector('.reviews-slider');
      if (slider) {
        slider.addEventListener('mouseenter', pauseAutoSlide);
        slider.addEventListener('mouseleave', startAutoSlide);
        slider.addEventListener('touchstart', handleTouchStart, { passive: true });
        slider.addEventListener('touchmove', handleTouchMove, { passive: true });
        slider.addEventListener('touchend', handleTouchEnd);
      }
      startAutoSlide();
    }

    // Resize handler
    window.addEventListener('resize', () => {
      updateCardWidth();
      createIndicators();
      goToSlide(currentIndex);
      if (window.innerWidth > 768 && mobileMenu && menuToggle) {
        mobileMenu.classList.remove('show');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Initial setup
    updateCardWidth();
    createIndicators();
    goToSlide(currentIndex);
  };

  init();
});