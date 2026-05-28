/**
 * Thangapandi Aditya Portfolio Interactive Core
 * Features:
 * - Dynamic Canvas Particle Network (Software & Hardware nodes)
 * - Lerp-smoothed Custom Glowing Cursor & State Switching
 * - 3D Tilt physics on featured cards
 * - Intersection Observer for active scroll-anchors
 * - Dynamic Skill Chip Description Tooltips
 * - Minimalist contact form submission & popup acknowledgement
 * - Printable Digital Resume overlay trigger
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. STICKY HEADER & NAV SCROLL TRACKING
     ========================================================================== */
  const header = document.querySelector('.sticky-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Track active navigation links based on current scroll position
  const navObserverOptions = {
    root: null,
    rootMargin: '-30% 0px -60% 0px', // Trigger active when section occupies middle viewport
    threshold: 0
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, navObserverOptions);

  sections.forEach(section => navObserver.observe(section));

  /* ==========================================================================
     2. MOBILE MENU NAVIGATION TOGGLE
     ========================================================================== */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navItems = document.querySelectorAll('.nav-link');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking link
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  /* ==========================================================================
     3. SMOOTH LERP-BASED GLOWING CUSTOM CURSOR
     ========================================================================== */
  const cursorOuter = document.getElementById('custom-cursor');
  const cursorDot = document.getElementById('custom-cursor-dot');

  let mouseX = 0, mouseY = 0; // Mouse coords
  let cursorX = 0, cursorY = 0; // Smooth outer cursor coords

  // Track raw mouse coordinate
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Position the micro dot immediately to guarantee lagless response
    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }
  });

  // Linear Interpolation (lerp) loop for the outer glow trail
  function animateCursor() {
    // 0.15 interpolation value provides smooth organic trail elasticity
    const ease = 0.15;
    cursorX += (mouseX - cursorX) * ease;
    cursorY += (mouseY - cursorY) * ease;

    if (cursorOuter) {
      cursorOuter.style.left = `${cursorX}px`;
      cursorOuter.style.top = `${cursorY}px`;
    }

    requestAnimationFrame(animateCursor);
  }
  
  // Initiate loop if element is active
  if (cursorOuter) {
    animateCursor();
  }

  // Monitor hovered elements to morph cursor color accents
  const glowTriggers = document.querySelectorAll('[data-glow]');
  glowTriggers.forEach(trigger => {
    trigger.addEventListener('mouseenter', () => {
      const type = trigger.getAttribute('data-glow');
      if (type === 'software') {
        document.body.classList.add('hover-software');
      } else if (type === 'hardware') {
        document.body.classList.add('hover-hardware');
      } else if (type === 'both') {
        document.body.classList.add('hover-software', 'hover-hardware');
      }
    });

    trigger.addEventListener('mouseleave', () => {
      document.body.classList.remove('hover-software', 'hover-hardware');
    });
  });

  /* ==========================================================================
     4. INTERACTIVE NODE CANVAS PARTICLE BACKGROUND (Software & Hardware Network)
     ========================================================================== */
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 140 };

    // Update coordinates and adjust canvas sizing dynamically
    function resizeCanvas() {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
      initParticles();
    }

    window.addEventListener('resize', resizeCanvas);
    
    // Bind mouseover tracking directly inside canvas bounds
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    // Particle Object blueprint
    class Particle {
      constructor(type) {
        this.type = type; // 'software' (Cyan) or 'hardware' (Amber)
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 2 + 1.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        
        // Match color variables
        this.color = type === 'software' ? 'rgba(0, 242, 254, 0.45)' : 'rgba(255, 159, 10, 0.45)';
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce on boundaries
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        // Mouse hover repelling interaction
        if (mouse.x !== null && mouse.y !== null) {
          let dx = this.x - mouse.x;
          let dy = this.y - mouse.y;
          let distance = Math.hypot(dx, dy);
          
          if (distance < mouse.radius) {
            // Push particle outwards gently
            let force = (mouse.radius - distance) / mouse.radius;
            let angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force * 1.5;
            this.y += Math.sin(angle) * force * 1.5;
          }
        }
      }

      draw() {
        ctx.beginPath();
        if (this.type === 'hardware') {
          // Render hardware nodes as diamonds to create subtle visual tech distinction
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = this.color;
          ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
          ctx.restore();
        } else {
          // Render software nodes as standard glowing circles
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
        }
      }
    }

    // Populate particles base array
    function initParticles() {
      particles = [];
      // Dynamic density based on canvas area
      const area = canvas.width * canvas.height;
      const density = Math.floor(area / 14000);
      const limit = Math.min(density, 120); // Cap on particles count for optimized computation
      
      for (let i = 0; i < limit; i++) {
        // Equal distribution of hardware and software nodes
        const type = i % 2 === 0 ? 'software' : 'hardware';
        particles.push(new Particle(type));
      }
    }

    // Network lines connecting nodes
    function connectParticles() {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.hypot(dx, dy);

          if (distance < 110) {
            // Link transparency drops as nodes drift apart
            let opacity = (1 - (distance / 110)) * 0.12;
            
            // Choose line gradients/colors based on node interaction types
            if (particles[a].type !== particles[b].type) {
              // Mixed interaction line (Hardware <-> Software)
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
            } else {
              // Direct type connection
              const rgb = particles[a].type === 'software' ? '0, 242, 254' : '255, 159, 10';
              ctx.strokeStyle = `rgba(${rgb}, ${opacity})`;
            }
            
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }

        // Draw connections to mouse coordinate
        if (mouse.x !== null && mouse.y !== null) {
          const dx = particles[a].x - mouse.x;
          const dy = particles[a].y - mouse.y;
          const distance = Math.hypot(dx, dy);
          
          if (distance < mouse.radius) {
            let opacity = (1 - (distance / mouse.radius)) * 0.15;
            const rgb = particles[a].type === 'software' ? '0, 242, 254' : '255, 159, 10';
            ctx.strokeStyle = `rgba(${rgb}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
    }

    // Canvas animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      connectParticles();
      requestAnimationFrame(animate);
    }

    // Boot canvas setup
    resizeCanvas();
    animate();
  }

  /* ==========================================================================
     5. SKILLS GRID FLOATING INTERACTIVE TOOLTIP
     ========================================================================== */
  const skillChips = document.querySelectorAll('.skill-chip');
  const tooltip = document.getElementById('skill-tooltip');

  if (tooltip) {
    skillChips.forEach(chip => {
      chip.addEventListener('mouseenter', (e) => {
        const desc = chip.getAttribute('data-desc');
        const parentCard = chip.closest('.skills-card');
        const isHardware = parentCard && parentCard.getAttribute('data-glow') === 'hardware';
        
        tooltip.innerHTML = desc;
        tooltip.classList.add('visible');
        
        if (isHardware) {
          tooltip.classList.add('hardware');
        } else {
          tooltip.classList.remove('hardware');
        }
      });

      chip.addEventListener('mousemove', (e) => {
        // Offset tooltip by 15px vertically and horizontally to prevent obscuring chip
        tooltip.style.left = `${e.clientX + 15}px`;
        tooltip.style.top = `${e.clientY - tooltip.offsetHeight - 15}px`;
      });

      chip.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
      });
    });
  }

  /* ==========================================================================
     6. DYNAMIC 3D CARD TILT PHYSICS (Project Cards)
     ========================================================================== */
  const tiltCards = document.querySelectorAll('[data-tilt]');

  // Only bind 3D tilt metrics on standard screen monitors to protect rendering speed
  if (window.innerWidth > 768) {
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const cardRect = card.getBoundingClientRect();
        
        // Calculate mouse relative positions on card box axis (-0.5 to 0.5 range)
        const mouseX = e.clientX - cardRect.left;
        const mouseY = e.clientY - cardRect.top;
        
        const percentX = mouseX / cardRect.width - 0.5;
        const percentY = mouseY / cardRect.height - 0.5;
        
        // Set maximum tilt deflection angle of 8 degrees
        const maxTilt = 8;
        const tiltX = percentY * maxTilt * -1;
        const tiltY = percentX * maxTilt;
        
        card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
        
        // Dynamic shifting background glow following cursor
        const glowElement = card.querySelector('.project-glow');
        if (glowElement) {
          glowElement.style.background = `radial-gradient(circle 240px at ${mouseX}px ${mouseY}px, 
            ${card.getAttribute('data-glow') === 'hardware' ? 'rgba(255, 159, 10, 0.12)' : 
              card.getAttribute('data-glow') === 'both' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 242, 254, 0.12)'}, 
            transparent 80%)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        // Fluidly reset rotational transformation metrics
        card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
        
        const glowElement = card.querySelector('.project-glow');
        if (glowElement) {
          // Revert glow coordinate defaults
          glowElement.style.background = `radial-gradient(circle 200px at 0px 0px, 
            ${card.getAttribute('data-glow') === 'hardware' ? 'rgba(255, 159, 10, 0.08)' : 
              card.getAttribute('data-glow') === 'both' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 242, 254, 0.08)'}, 
            transparent 80%)`;
        }
      });
    });
  }

  /* ==========================================================================
     7. CONTACT FORM VALIDATION & POPUP CONFIRMATION
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');
  const successModal = document.getElementById('success-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  if (contactForm && successModal) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Simple custom visual feedback instead of actual server transport
      successModal.classList.add('visible');
      
      // Flush form inputs
      contactForm.reset();
    });

    const closeModal = () => {
      successModal.classList.remove('visible');
    };

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking external overlay bounds
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        closeModal();
      }
    });
  }

  /* ==========================================================================
     8. PRINTABLE DIGITAL RESUME OVERLAY MODAL
     ========================================================================== */
  const downloadResumeBtn = document.getElementById('download-resume-btn');
  const resumeModal = document.getElementById('resume-modal');
  const resumeCloseBtn = document.getElementById('resume-close-btn');
  const resumePrintBtn = document.getElementById('resume-print-btn');

  if (resumeModal) {
    // Open resume modal on CTA click
    if (downloadResumeBtn) {
      downloadResumeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        resumeModal.classList.add('visible');
        // Prevent body scrolling behind overlay
        document.body.style.overflow = 'hidden';
      });
    }

    // Close resume modal
    const closeResumeModal = () => {
      resumeModal.classList.remove('visible');
      document.body.style.overflow = '';
    };

    if (resumeCloseBtn) {
      resumeCloseBtn.addEventListener('click', closeResumeModal);
    }

    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) {
        closeResumeModal();
      }
    });

    // Trigger local printer layout rendering
    if (resumePrintBtn) {
      resumePrintBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

});
