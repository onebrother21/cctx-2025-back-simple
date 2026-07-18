import { 
  validateDob,
  validateEmail,
  validateMobile,
  validatePins,
  validateRequired,
  validateVerificationCode,
} from  './glass-app-validators.js' ;

export class GlassAppUI {
  static initThemeToggle = () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const setTheme = (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      gs.set('ui_theme', theme);
      const iconSun = themeToggle.querySelector('.icon-sun');
      const iconMoon = themeToggle.querySelector('.icon-moon');
      if (iconSun && iconMoon) {
        if (theme === 'light') {
          iconSun.style.display = 'none';
          iconMoon.style.display = 'block';
        } else {
          iconSun.style.display = 'block';
          iconMoon.style.display = 'none';
        }
      }
    };
    const savedTheme = gs.get('ui_theme') || 'dark';
    setTheme(savedTheme);
    
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
  };
  static initTiltEffect = () => {
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
  };
  static animateCounter = (element,target,duration = 2000) => {
    const start = 0;
    const startTime = performance.now();
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * easeOut);
      if(element.dataset.prefix) {
        element.textContent = element.dataset.prefix + current.toLocaleString() + (element.dataset.suffix || '');
      }
      else {
        element.textContent = current.toLocaleString() + (element.dataset.suffix || '');
      }
      if(progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  };
  static initCounters = () => {
    const counters = document.querySelectorAll('.stat-value');
    counters.forEach(counter => {
      const text = counter.textContent;
      const value = parseInt(text.replace(/[^0-9]/g, ''));
      if (text.includes('$')) counter.dataset.prefix = '$';
      if (text.includes('%')) counter.dataset.suffix = '%';
      this.animateCounter(counter,value);
    });
  };
  static initMobileMenu = () => {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarMenu = document.getElementById('sidebarMenu');
    if(sidebarMenu){
      const menu = gs.get("ui_sidebarMenu");
      const current = gs.get("nav_currentPage");
      menu.forEach(link => {
        const li = document.createElement("li");
        li.classList.add("nav-item");

        const a = document.createElement("a");
        a.classList.add("nav-link");
        a.setAttribute("href",link.url);
        a.innerHTML = `<%- include("components/icons/${link.icon}.html") %> `+
        link.label + (link.text?` <span class="nav-badge">${link.text}</span>`:"");
        a.addEventListener("click",() => {
          const otherLinks = document.querySelectorAll(".nav-link");
          otherLinks.forEach(o => o.classList.remove("active"));
          a.classList.add("active");
        });
        console.log(link);
        
        li.appendChild(a);
        sidebarMenu.appendChild(li);
      });
    }
    if(menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        gs.set("ui_sidebarOpen",!gs.get("ui_sidebarOpen"));
      });
      document.addEventListener('click', (e) => {
        const outsideClick = !sidebar.contains(e.target) && !menuToggle.contains(e.target);
        if(gs.get("ui_sidebarOpen") && outsideClick){
          sidebar.classList.remove('open');
          gs.set("ui_sidebarOpen",false);
        }
      });
    }
  };
  static initFormSubmissions = (f) => {
    const forms = document.querySelectorAll('form[data-validate]');
    forms.forEach(form => form.addEventListener('submit',async e => {
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
        await f(current,data);
      }
      else console.warn("form is invalid");
    }));
  };
  static initPageTransitions = () => {
    const links = document.querySelectorAll('a[href$="/glass"]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        if(link.hostname !== window.location.hostname) return;
        e.preventDefault();
        const href = link.getAttribute('href');
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.3s ease';
        setTimeout(() => window.location.href = href,300);
      });
    });
    window.addEventListener('load', () => document.body.style.opacity = '1');
  };
  static initFooterAction = ()=> {
    const footerAction = document.querySelector('.footer-action');
    if(footerAction) footerAction.addEventListener('click', (e) => {
      e.preventDefault();
      gs.clear();
    });
  };
  static initLogoutListener = () => {
    const logoutBtn = document.querySelector('.logout');
    if(logoutBtn) footerAction.addEventListener('click', (e) => {
      e.preventDefault();
      glassAuth.logout();
    });
  };
  static initSettingsTabs = () => {
    const syncSettingsThemeToggler = () => {
      const themeSelect = document.getElementById('theme-select');
      if (themeSelect) {
        const currentTheme = gs.get('ui_theme') || 'dark';
        themeSelect.value = currentTheme;
        themeSelect.addEventListener('change', () => {
          const theme = themeSelect.value;
          if(theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
          }
          else {
            document.documentElement.setAttribute('data-theme', theme);
            gs.set('ui_theme', theme);
          }
          const iconSun = document.querySelector('#theme-toggle .icon-sun');
          const iconMoon = document.querySelector('#theme-toggle .icon-moon');
          if (iconSun && iconMoon) {
            const effectiveTheme = document.documentElement.getAttribute('data-theme');
            if (effectiveTheme === 'light') {
              iconSun.style.display = 'none';
              iconMoon.style.display = 'block';
            }
            else {
              iconSun.style.display = 'block';
              iconMoon.style.display = 'none';
            }
          }
        });
      }
    };
    const tabLinks = document.querySelectorAll('.settings-nav-link[data-tab]');
    if(tabLinks.length === 0) return;

    tabLinks.forEach(link => link.addEventListener('click', (e) => {
      e.preventDefault();

      const tabId = link.getAttribute('data-tab');
      document.querySelectorAll('.settings-nav-link').forEach(n =>  n.classList.remove('active'));
      link.classList.add('active');
      
      document.querySelectorAll('.settings-tab-content').forEach(tab => tab.classList.remove('active'));
      const targetTab = document.getElementById('tab-' + tabId);
      if(targetTab) targetTab.classList.add('active');
    }));
    syncSettingsThemeToggler();
  };
  static init = f => {
    this.initThemeToggle();
    this.initTiltEffect();
    this.initCounters();
    this.initMobileMenu();
    this.initFormSubmissions(f);
    this.initPageTransitions();
    this.initSettingsTabs();
    this.initFooterAction();
  };
}