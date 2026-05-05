'use strict';
import { testNotification } from './glass-app-methods.js';
import { 
  validateDob,
  validateEmail,
  validateMobile,
  validatePins,
  validateRequired,
  validateVerificationCode,
 } from './glass-app-validators.js' ;

// ============================================
// Theme Toggle
// ============================================
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  const iconSun = themeToggle.querySelector('.icon-sun');
  const iconMoon = themeToggle.querySelector('.icon-moon');
  
  function setTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      
      if (iconSun && iconMoon) {
          if (theme === 'light') {
              iconSun.style.display = 'none';
              iconMoon.style.display = 'block';
          } else {
              iconSun.style.display = 'block';
              iconMoon.style.display = 'none';
          }
      }
  }
  
  // Check for saved theme preference or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);
  
  themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });
}

// ============================================
// 3D Tilt Effect
// ============================================
function initTiltEffect() {
  document.querySelectorAll('.glass-card-3d').forEach(card => {
      card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const rotateX = (y - centerY) / 20;
          const rotateY = (centerX - x) / 20;
          
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      });
      
      card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
      });
  });
}

// ============================================
// Animated Counters
// ============================================
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const startTime = performance.now();
  
  function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * easeOut);
      
      if (element.dataset.prefix) {
          element.textContent = element.dataset.prefix + current.toLocaleString() + (element.dataset.suffix || '');
      } else {
          element.textContent = current.toLocaleString() + (element.dataset.suffix || '');
      }
      
      if (progress < 1) {
          requestAnimationFrame(update);
      }
  }
  
  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('.stat-value');
  counters.forEach(counter => {
      const text = counter.textContent;
      const value = parseInt(text.replace(/[^0-9]/g, ''));
      
      if (text.includes('$')) {
          counter.dataset.prefix = '$';
      }
      if (text.includes('%')) {
          counter.dataset.suffix = '%';
      }
      
      animateCounter(counter, value);
  });
}

// ============================================
// Mobile Menu Toggle
// ============================================
function initMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const sidebar = document.getElementById('sidebar');
  
  if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
          sidebar.classList.toggle('open');
      });

      // Close sidebar when clicking outside
      document.addEventListener('click', (e) => {
          if (sidebar.classList.contains('open') && 
              !sidebar.contains(e.target) && 
              !menuToggle.contains(e.target)) {
              sidebar.classList.remove('open');
          }
      });
  }
}

// ============================================
// Form Validation (for login/register)
// ============================================
function initFormSubmissions() {
  const forms = document.querySelectorAll('form[data-validate]');
  forms.forEach(form => {
    form.addEventListener('submit',async e => {
      e.preventDefault(); 
      let isValid = true;
      try {
        isValid = validateRequired(form);
        isValid = validateEmail(form);
        isValid = validateMobile(form);
        isValid = validateDob(form);
        isValid = validatePins(form);
        isValid = validateVerificationCode(form);
      }
      catch(e){console.error(e);}
      if(isValid){
        const current = document.location.href;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        switch(true){
          case /signup/.test(current):await glassAuth.signup(data);break;
          case /verify/.test(current):await glassAuth.verify(data);break;
          case /register/.test(current):await glassAuth.register(data);break;
          case /login/.test(current):await glassAuth.login(data);break;
          case /job/.test(current):await postJob(data);break;
          case /test/.test(current):await testNotification(data);break;
          default:break;
        }
      }
    });
  });
}

// ============================================
// Smooth Page Transitions
// ============================================
function initPageTransitions() {
  const links = document.querySelectorAll('a[href$="/glass"]');
  
  links.forEach(link => {
      link.addEventListener('click', (e) => {
          // Skip external links
          if (link.hostname !== window.location.hostname) return;
          
          e.preventDefault();
          const href = link.getAttribute('href');
          
          document.body.style.opacity = '0';
          document.body.style.transition = 'opacity 0.3s ease';
          
          setTimeout(() => {
              window.location.href = href;
          }, 300);
      });
  });

  // Fade in on page load
  window.addEventListener('load', () => {
      document.body.style.opacity = '1';
  });
}

// ============================================
// Settings Tab Navigation
// ============================================
function initSettingsTabs() {
  const tabLinks = document.querySelectorAll('.settings-nav-link[data-tab]');
  
  if (tabLinks.length === 0) return;

  tabLinks.forEach(link => {
      link.addEventListener('click', (e) => {
          e.preventDefault();
          
          // Get target tab
          const tabId = link.getAttribute('data-tab');
          
          // Remove active class from all nav links
          document.querySelectorAll('.settings-nav-link').forEach(navLink => {
              navLink.classList.remove('active');
          });
          
          // Add active class to clicked link
          link.classList.add('active');
          
          // Hide all tab contents
          document.querySelectorAll('.settings-tab-content').forEach(tab => {
              tab.classList.remove('active');
          });
          
          // Show target tab content
          const targetTab = document.getElementById('tab-' + tabId);
          if (targetTab) {
              targetTab.classList.add('active');
          }
      });
  });

  // Theme select sync with toggle
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
      const currentTheme = localStorage.getItem('theme') || 'dark';
      themeSelect.value = currentTheme;
      
      themeSelect.addEventListener('change', () => {
          const theme = themeSelect.value;
          if (theme === 'system') {
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
          } else {
              document.documentElement.setAttribute('data-theme', theme);
              localStorage.setItem('theme', theme);
          }
          
          // Update theme toggle icons
          const iconSun = document.querySelector('#theme-toggle .icon-sun');
          const iconMoon = document.querySelector('#theme-toggle .icon-moon');
          if (iconSun && iconMoon) {
              const effectiveTheme = document.documentElement.getAttribute('data-theme');
              if (effectiveTheme === 'light') {
                  iconSun.style.display = 'none';
                  iconMoon.style.display = 'block';
              } else {
                  iconSun.style.display = 'block';
                  iconMoon.style.display = 'none';
              }
          }
      });
  }
}

// ============================================
// Initialize All Functions
// ============================================
export function initAppUI() {
  initThemeToggle();
  initTiltEffect();
  initCounters();
  initMobileMenu();
  initFormSubmissions();
  initPageTransitions();
  initSettingsTabs();
}