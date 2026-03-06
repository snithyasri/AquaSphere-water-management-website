document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Logic
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');

      // Also toggle dashboard sidebar if it exists
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        sidebar.classList.toggle('active');
      }

      const isExpanded = navLinks.classList.contains('active');
      menuToggle.setAttribute('aria-expanded', isExpanded);
    });
  }

  // Auth Tabs Logic
  const tabs = document.querySelectorAll('.auth-tab');
  const forms = document.querySelectorAll('.auth-form');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all
      tabs.forEach(t => t.classList.remove('active'));
      forms.forEach(f => f.classList.remove('active'));

      // Add active class to clicked
      tab.classList.add('active');

      // Show corresponding form
      const targetId = tab.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // Scroll Spy Logic for Index Page
  const sections = document.querySelectorAll('section[id]');
  const mainNavLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  if (sections.length > 0 && mainNavLinks.length > 0) {
    // Options to create a "trigger line" around the middle-top of the viewport
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px', // Active when element is in the top part of screen
      threshold: 0
    };

    // Counter Animation
    const speed = 200; // The lower the slower

    const animateCounters = (container = document) => {
      const counters = container.querySelectorAll('.counter-value');
      counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        let count = 0;

        const updateCount = () => {
          const inc = target / speed;
          if (count < target) {
            count += inc;
            counter.innerText = Math.ceil(count).toLocaleString();
            setTimeout(updateCount, 10);
          } else {
            counter.innerText = target.toLocaleString() + (counter.getAttribute('data-suffix') || '');
          }
        };
        updateCount();
      });
    };

    // Intersection Observer for Counters (Initial load)
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    document.querySelectorAll('.dashboard-section, .stats-section').forEach(section => {
      counterObserver.observe(section);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          mainNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
  }

  // Scroll Animations
  const scrollElements = document.querySelectorAll('.animate-on-scroll');

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, {
    threshold: 0.1
  });

  scrollElements.forEach(el => scrollObserver.observe(el));


  // =====================================================
  // LOCALSTORAGE AUTH LOGIC (Frontend Only)
  // =====================================================

  // Dashboard redirects per role
  const DASHBOARD_MAP = {
    citizen: 'citizen-dashboard.html',
    volunteer: 'volunteer-dashboard.html',
    admin: 'admin-dashboard.html',
  };

  // Helper to get/set data
  const getLocal = (key) => JSON.parse(localStorage.getItem(key) || '[]');
  const setLocal = (key, data) => localStorage.setItem(key, JSON.stringify(data));

  const authForms = document.querySelectorAll('.auth-form[data-action]');
  authForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const role = form.getAttribute('data-role');     // citizen | volunteer | admin
      const action = form.getAttribute('data-action'); // login | register

      // Determine error div
      const prefix = role + '-' + action;
      const errorDiv = document.getElementById(prefix + '-error');
      if (errorDiv) { errorDiv.style.display = 'none'; errorDiv.textContent = ''; }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="ph ph-spinner"></i> Processing...';
      submitBtn.disabled = true;

      // Small delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 600));

      if (action === 'register') {
        const nameEl = document.getElementById(`${role}-register-name`)?.value;
        const emailEl = document.getElementById(`${role}-register-email`)?.value;
        const passEl = document.getElementById(`${role}-register-password`)?.value;

        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: nameEl, email: emailEl, password: passEl, role })
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Registration failed');

          localStorage.setItem('currentUser', data.user.name);
          localStorage.setItem('currentUserRole', data.user.role);
          localStorage.setItem('currentUserId', data.user.id);
          localStorage.setItem('token', data.token);

          submitBtn.innerHTML = '<i class="ph ph-check"></i> Registered!';

          setTimeout(() => {
            window.location.href = DASHBOARD_MAP[role] || 'index.html';
          }, 800);
        } catch (error) {
          if (errorDiv) {
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
          }
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          return;
        }
      } else {
        // login
        // Instead of hardcoded element IDs by role, let's just grab the inputs inside the current form
        // because auth-volunteer uses IDs `volunteer-login-email` and citizen uses `citizen-login-email`.
        // We know the form is the 'e.target' or 'form' variable from closure.
        let loginId = '';
        let passEl = '';

        const emailInput = form.querySelector('input[type="text"], input[type="email"]');
        const passInput = form.querySelector('input[type="password"]');

        if (emailInput) loginId = emailInput.value;
        if (passInput) passEl = passInput.value;

        // Fallback if inputs not found for some reason (shouldn't happen with proper HTML)
        if (!loginId && document.getElementById(`${role}-login-email`)) {
          loginId = document.getElementById(`${role}-login-email`).value;
        }
        if (!passEl && document.getElementById(`${role}-login-password`)) {
          passEl = document.getElementById(`${role}-login-password`).value;
        }

        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: loginId, password: passEl })
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Login failed');

          localStorage.setItem('currentUser', data.user.name);
          localStorage.setItem('currentUserRole', data.user.role);
          localStorage.setItem('currentUserId', data.user.id);
          localStorage.setItem('token', data.token);

          submitBtn.innerHTML = '<i class="ph ph-check"></i> Success!';

          setTimeout(() => {
            window.location.href = DASHBOARD_MAP[role] || 'index.html';
          }, 800);
        } catch (error) {
          if (errorDiv) {
            errorDiv.textContent = 'Invalid email/username or password.';
            errorDiv.style.display = 'block';
          }
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          return;
        }
      }
    });
  });

  // Display Name on Dashboard
  const welcomeMsg = document.querySelector('#welcome-message');
  if (welcomeMsg) {
    const storedName = localStorage.getItem('currentUser');
    if (storedName) {
      welcomeMsg.textContent = `Welcome, ${storedName}!`;
    }
  }

  // Modal Logic for "New Report"
  const openModalBtns = document.querySelectorAll('[data-open-modal]');
  const closeModalBtn = document.querySelector('[data-close-modal]');
  const modalOverlay = document.querySelector('.modal-overlay');
  const reportForm = document.getElementById('newReportForm');

  if (openModalBtns.length > 0 && modalOverlay) {
    openModalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });
    });
  }

  if (closeModalBtn && modalOverlay) {
    closeModalBtn.addEventListener('click', () => {
      modalOverlay.style.display = 'none';
      document.body.style.overflow = '';
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  }

  if (reportForm) {
    reportForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = reportForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      const currentUserId = localStorage.getItem('currentUserId');
      const currentUserName = localStorage.getItem('currentUser');

      if (!currentUserId) {
        alert('Please log in first to submit a report.');
        return;
      }

      submitBtn.innerHTML = '<i class="ph ph-spinner"></i> Submitting...';
      submitBtn.disabled = true;

      const formData = new FormData(reportForm);
      const newReport = {
        location: formData.get('location'),
        issue: formData.get('issue'),
        description: formData.get('description')
      };

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newReport)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to submit report');
        }

        submitBtn.innerHTML = '<i class="ph ph-check"></i> Submitted!';
        submitBtn.style.background = '#059669';

        setTimeout(() => {
          modalOverlay.style.display = 'none';
          document.body.style.overflow = '';
          reportForm.reset();
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
          alert('✅ Your report has been submitted to the authorities!');
        }, 1000);
      } catch (err) {
        console.error('Error submitting report:', err);
        alert('❌ Error submitting report: ' + err.message);
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Dashboard Sidebar Tab Switching
  const sidebarLinks = document.querySelectorAll('.sidebar-link[data-tab]');
  const dashboardSections = document.querySelectorAll('.dashboard-section');

  if (sidebarLinks.length > 0 && dashboardSections.length > 0) {
    sidebarLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = link.getAttribute('data-tab');

        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        dashboardSections.forEach(section => {
          if (section.id === targetTab) {
            section.classList.add('active');
            // Re-trigger counters for this section
            if (typeof animateCounters === 'function') animateCounters(section);
          } else {
            section.classList.remove('active');
          }
        });

        // Close mobile sidebar
        const navLinks = document.querySelector('.nav-links');
        const sidebar = document.querySelector('.sidebar');
        if (navLinks && navLinks.classList.contains('active')) {
          navLinks.classList.remove('active');
          if (sidebar) sidebar.classList.remove('active');
        }
      });
    });
  }

  // Initialize Maps with multiple markers and priority colors
  const activeMaps = {};
  const initMap = (id, coords, zoom = 13, markers = []) => {
    const container = document.getElementById(id);
    if (container && typeof L !== 'undefined') {
      const map = L.map(id).setView(coords, zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Priority Marker Icons (DivIcon for easy coloring)
      const createMarker = (m) => {
        const priority = m.priority || 'low';
        const colorClass = `marker-priority-${priority}`;
        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: currentColor;" class="${colorClass} mark-dot"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });

        // Add CSS for mark-dot if not present
        if (!document.getElementById('map-dot-style')) {
          const s = document.createElement('style');
          s.id = 'map-dot-style';
          s.innerHTML = `
            .mark-dot { width: 15px; height: 15px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.4); }
            .marker-priority-high { color: #ef4444 !important; }
            .marker-priority-medium { color: #f59e0b !important; }
            .marker-priority-low { color: #0ea5e9 !important; }
          `;
          document.head.appendChild(s);
        }

        const mCoords = m.coords || coords;
        const msg = m.msg || "Issue Location";
        L.marker(mCoords, { icon: icon }).addTo(map).bindPopup(msg);
      };

      markers.forEach(createMarker);

      activeMaps[id] = map;
      return map;
    }
    return null;
  };

  // Sample data for maps with priorities
  const citizenMarkers = [
    { coords: [40.7128, -74.0060], msg: "High Priority: Water Leakage", priority: 'high' },
    { coords: [40.7150, -74.0100], msg: "Medium Priority: Discoloration", priority: 'medium' }
  ];

  const adminMarkers = [
    { coords: [40.7128, -74.0060], msg: "Active Report #1", priority: 'low' },
    { coords: [40.7200, -74.0000], msg: "Sytem Alert: High Pressure", priority: 'high' },
    { coords: [40.7050, -74.0200], msg: "Maintenance Pending", priority: 'medium' }
  ];

  // Initialize
  initMap('reportsMap', [40.7128, -74.0060], 13, citizenMarkers);
  initMap('adminMap', [40.7128, -74.0060], 12, adminMarkers);
  initMap('volunteerMap', [40.7128, -74.0060], 14, [
    { coords: [40.7128, -74.0060], priority: 'high', msg: 'Verify immediately' },
    { coords: [40.7180, -74.0080], priority: 'low', msg: 'Scheduled check' }
  ]);

  // Fix Leaflet map sizing issue on tab switch
  document.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
    link.addEventListener('click', () => {
      setTimeout(() => {
        Object.values(activeMaps).forEach(map => {
          map.invalidateSize();
        });
        window.dispatchEvent(new Event('resize'));
      }, 150);
    });
  });

  // =====================================================
  // SETTINGS & PROFILE LOGIC
  // =====================================================

  // Save Settings
  const saveBtn = document.getElementById('save-settings-btn');
  const toggles = document.querySelectorAll('.setting-toggle');

  // Load saved settings
  toggles.forEach(toggle => {
    const key = toggle.getAttribute('data-setting');
    const saved = localStorage.getItem(`setting-${key}`);
    const dot = toggle.querySelector('.toggle-dot');
    if (saved === 'true') {
      toggle.style.background = 'var(--primary-color)';
      dot.style.right = '3px';
      dot.style.left = 'auto';
    } else {
      toggle.style.background = '#cbd5e1';
      dot.style.left = '3px';
      dot.style.right = 'auto';
    }

    toggle.onclick = () => {
      const isActive = toggle.style.background.includes('rgb(14, 165, 233)') || toggle.style.background === 'var(--primary-color)';
      if (isActive) {
        toggle.style.background = '#cbd5e1';
        dot.style.left = '3px';
        dot.style.right = 'auto';
      } else {
        toggle.style.background = 'var(--primary-color)';
        dot.style.right = '3px';
        dot.style.left = 'auto';
      }
    };
  });

  if (saveBtn) {
    saveBtn.onclick = () => {
      toggles.forEach(t => {
        const key = t.getAttribute('data-setting');
        const active = t.style.background.includes('rgb(14, 165, 233)') || t.style.background === 'var(--primary-color)';
        localStorage.setItem(`setting-${key}`, active);
      });
      alert('✅ Preferences saved successfully!');
    };
  }

  // Profile Management
  const profileTrigger = document.getElementById('profile-pic-trigger');
  const fileInput = document.getElementById('profile-upload');
  const displayUserName = document.getElementById('display-user-name');
  const displayUserEmail = document.getElementById('display-user-email');

  // Load User Data
  if (displayUserName) {
    displayUserName.textContent = localStorage.getItem('currentUser') || 'Citizen User';
  }
  if (displayUserEmail) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentId = localStorage.getItem('currentUserId');
    const user = users.find(u => u.id === currentId);
    if (user) displayUserEmail.textContent = user.email;
  }

  // Load Profile Pic
  const savedPic = localStorage.getItem('profilePic');
  if (savedPic && profileTrigger) {
    profileTrigger.innerHTML = `<img src="${savedPic}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
  }

  if (profileTrigger && fileInput) {
    profileTrigger.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          localStorage.setItem('profilePic', base64);
          profileTrigger.innerHTML = `<img src="${base64}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
        };
        reader.readAsDataURL(file);
      }
    };
  }

  // Global Interactivity for Buttons
  const globalButtons = document.querySelectorAll('button:not(.theme-toggle):not(.menu-toggle):not([data-open-modal]):not([data-close-modal]):not(.auth-tab):not([type="submit"]), .btn:not(.btn-primary[href^="#"]):not([type="submit"]), .sidebar-link:not([data-tab])');

  const showFeatureNotice = (title, description) => {
    const notice = document.createElement('div');
    notice.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--white);
            color: var(--text-dark);
            padding: 1.5rem;
            border-radius: var(--radius-sm);
            box-shadow: var(--shadow-lg);
            border-left: 5px solid var(--secondary-color);
            z-index: 10001;
            max-width: 350px;
            animation: slideIn 0.3s ease-out;
        `;

    notice.innerHTML = `
            <div style="display: flex; gap: 1rem; align-items: flex-start;">
                <i class="ph-fill ph-info" style="font-size: 1.5rem; color: var(--secondary-color);"></i>
                <div>
                    <h4 style="margin: 0 0 0.5rem 0;">${title}</h4>
                    <p style="margin: 0; font-size: 0.9rem; opacity: 0.8;">${description}</p>
                </div>
                <button class="close-notice" style="background: none; border: none; cursor: pointer; color: var(--text-light);"><i class="ph ph-x"></i></button>
            </div>
        `;

    document.body.appendChild(notice);

    const closeBtn = notice.querySelector('.close-notice');
    closeBtn.onclick = () => notice.remove();

    setTimeout(() => {
      if (notice.parentElement) notice.remove();
    }, 5000);
  };

  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
  document.head.appendChild(styleSheet);

  globalButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // If it's a link to a section or page, let it handle itself
      if (btn.tagName === 'A' && (btn.getAttribute('href')?.startsWith('#') || btn.getAttribute('href')?.endsWith('.html'))) {
        return;
      }

      e.preventDefault();
      const text = btn.innerText.trim();
      let title = "Feature Information";
      let desc = `You clicked on "${text}". This feature is currently being processed and will be fully operational shortly.`;

      if (text.includes('View More') || text.includes('Read More')) {
        title = text;
        desc = "Expanding content for more details. Our data is being synchronized for the latest updates.";
      } else if (text.includes('Connect') || text.includes('Contact')) {
        title = "Contact Support";
        desc = "Initializing secure connection to our support team...";
      } else if (text.includes('Logout') || text.includes('Sign Out')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
        return;
      }

      showFeatureNotice(title, desc);
    });
  });

  const initGlobalBubbles = () => {
    const container = document.createElement('div');
    container.className = 'bubble-container';
    document.body.appendChild(container);

    const bubbleCount = 20;
    for (let i = 0; i < bubbleCount; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';

      const size = Math.random() * 30 + 15 + 'px';
      bubble.style.width = size;
      bubble.style.height = size;
      bubble.style.left = Math.random() * 100 + '%';
      bubble.style.animationDelay = Math.random() * 10 + 's';
      bubble.style.animationDuration = Math.random() * 10 + 10 + 's';
      bubble.style.opacity = Math.random() * 0.4 + 0.2;

      container.appendChild(bubble);
    }
  };

  const initGlobalBubbleDrops = () => {
    const container = document.createElement('div');
    container.className = 'bubble-drop-container';
    document.body.appendChild(container);

    const dropCount = 20;
    for (let i = 0; i < dropCount; i++) {
      const drop = document.createElement('div');
      drop.className = 'bubble-drop';

      const size = Math.random() * 15 + 10 + 'px';
      drop.style.width = size;
      drop.style.height = size;
      drop.style.left = Math.random() * 100 + '%';
      drop.style.animationDelay = Math.random() * 5 + 's';
      drop.style.animationDuration = Math.random() * 5 + 5 + 's';
      drop.style.opacity = Math.random() * 0.4 + 0.3;

      container.appendChild(drop);
    }
  };

  // Only initialize bubble effects on Home and Login pages
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage === 'index.html' || currentPage === 'login.html' || currentPage === '') {
    initGlobalBubbles();
    initGlobalBubbleDrops();
  }
});


// Password Visibility Toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggleButtons = document.querySelectorAll('.password-toggle');
  toggleButtons.forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      const input = this.previousElementSibling;
      const icon = this.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('ph-eye');
        icon.classList.add('ph-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('ph-eye-slash');
        icon.classList.add('ph-eye');
      }
    });
  });
});

