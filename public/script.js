/* ============================================================
   RUGS DE INDISKA — interactions
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ----------------------------------------------------------
     0 · Page loader
     ---------------------------------------------------------- */
  var loader = $('#loader');

  if (loader) {
    // proves the script is alive, which cancels the CSS failsafe in styles.css
    loader.classList.add('is-ready');

    var loaderShownAt = Date.now();
    var LOADER_MIN    = 550;   // don't let it flash on a warm cache

    var hideLoader = function () {
      var wait = Math.max(0, LOADER_MIN - (Date.now() - loaderShownAt));
      window.setTimeout(function () {
        loader.classList.add('is-done');
        document.documentElement.classList.add('loaded');
      }, wait);
    };

    if (document.readyState === 'complete') hideLoader();
    else window.addEventListener('load', hideLoader);

    // Restored from the back/forward cache: the overlay must not still be up.
    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      loader.classList.remove('is-leaving');
      loader.classList.add('is-done');
      document.documentElement.classList.add('loaded');
    });
  }

  /* ----------------------------------------------------------
     1 · Header — shrink on scroll, hide on scroll-down
     ---------------------------------------------------------- */
  /* ----------------------------------------------------------
     2 · Mobile navigation
     ---------------------------------------------------------- */
  /* ----------------------------------------------------------
     3 · Scroll reveals
     ---------------------------------------------------------- */
  var revealables = $$('.reveal, .reveal-img');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------
     4 · Heritage timeline — rail fills as it scrolls past
     ---------------------------------------------------------- */
  /* Same treatment on the craftsmanship page's stage rail, so both are driven
     by one pass: [track element, fill element]. */
  var rails = [
    [$('#timeline'), $('#timelineFill')],
    [$('.stages'),   $('#stageFill')]
  ].filter(function (pair) { return pair[0] && pair[1]; });

  function updateTimeline() {
    rails.forEach(function (pair) {
      var r    = pair[0].getBoundingClientRect();
      var mark = window.innerHeight * 0.62;         // fill line sits just below centre
      var p    = (mark - r.top) / r.height;
      pair[1].style.height = Math.max(0, Math.min(1, p)) * 100 + '%';
    });
  }

  /* ----------------------------------------------------------
     5 · Parallax — hero + closing band
     ---------------------------------------------------------- */
  var heroMedia = $('.hero__media');
  var heroInner = $('.hero__inner');
  var hero      = $('#hero');
  var ctaImg    = $('#ctaImg');
  var cta       = $('#cta');

  /* Generic drift: any [data-parallax="0.22"] element shifts by that fraction
     of its travel through the viewport. Used by the collections banner. */
  var drifters = $$('[data-parallax]').map(function (el) {
    return { el: el, rate: parseFloat(el.getAttribute('data-parallax')) || 0.2 };
  });

  function updateDrifters() {
    drifters.forEach(function (d) {
      var box = d.el.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      var prog = (window.innerHeight - box.top) / (window.innerHeight + box.height);
      d.el.style.transform =
        'translate3d(0,' + ((prog - 0.5) * box.height * d.rate).toFixed(2) + 'px,0)';
    });
  }

  function updateParallax(y) {
    if (reduceMotion) return;

    updateDrifters();

    if (hero && heroMedia) {
      var h = hero.offsetHeight;
      if (y < h) {
        var t = y / h;
        heroMedia.style.transform = 'translate3d(0,' + (y * 0.28).toFixed(2) + 'px,0)';
        if (heroInner) {
          heroInner.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(2) + 'px,0)';
          heroInner.style.opacity   = String(Math.max(0, 1 - t * 1.5));
        }
      }
    }

    if (cta && ctaImg) {
      var c = cta.getBoundingClientRect();
      if (c.top < window.innerHeight && c.bottom > 0) {
        var prog = (window.innerHeight - c.top) / (window.innerHeight + c.height); // 0 → 1
        ctaImg.style.transform = 'translate3d(0,' + ((prog - 0.5) * 70).toFixed(2) + 'px,0)';
      }
    }
  }

  /* ----------------------------------------------------------
     6 · One rAF-throttled scroll loop
     ---------------------------------------------------------- */
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;
      updateTimeline();
      updateParallax(y);
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ----------------------------------------------------------
     7 · Newsletter
     ---------------------------------------------------------- */
  /* Bound per-form rather than by id: the collections page carries both the
     footer form and the Inner Circle form. */
  $$('form.news-form').forEach(function (form) {
    var input = form.querySelector('input[type="email"]');
    var msg   = form.querySelector('.news__msg');
    if (!input || !msg) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = input.value.trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

      msg.textContent = valid
        ? 'Thank you — a letter is on its way.'
        : 'Please enter a valid email address.';
      msg.style.color = valid ? '' : '#d9a3a3';
      msg.classList.add('is-on');

      if (valid) {
        form.reset();
        window.setTimeout(function () { msg.classList.remove('is-on'); }, 5000);
      }
    });

    input.addEventListener('input', function () { msg.classList.remove('is-on'); });
  });

  /* ----------------------------------------------------------
     7b · Contact enquiry form
     ---------------------------------------------------------- */
  var enquiry = $("#enquiryForm");

  if (enquiry) {
    var eMsg = $("#formMsg");
    enquiry.addEventListener("submit", function (e) {
      e.preventDefault();
      var name  = enquiry.querySelector("#fName");
      var email = enquiry.querySelector("#fEmail");
      var okName  = name.value.trim().length > 1;
      var okEmail = /^[^s@]+@[^s@]+.[^s@]{2,}$/.test(email.value.trim());
      var target  = !okName ? name : (!okEmail ? email : null);

      if (target) {
        eMsg.textContent = !okName
          ? "Please enter your name."
          : "Please enter a valid email address.";
        eMsg.style.color = "#c07a7a";
        eMsg.classList.add("is-on");
        target.focus();
        return;
      }

      eMsg.textContent = "Thank you — we will be in touch shortly.";
      eMsg.style.color = "";
      eMsg.classList.add("is-on");
      enquiry.reset();
      window.setTimeout(function () { eMsg.classList.remove("is-on"); }, 6000);
    });

    enquiry.addEventListener("input", function () { eMsg.classList.remove("is-on"); });
  }

  /* ----------------------------------------------------------
     7c · Collection access modal
     ---------------------------------------------------------- */
  var API_BASE = (window.RUGS_API_BASE || 'https://rugs-backend.heyprachar.com/api').replace(/\/+$/, '');
  var COLLECTION_USER_KEY = 'rdiCollectionUser';
  var COLLECTION_TOKEN_KEY = 'rdiCollectionToken';

  function getCollectionModal() {
    return $('#collectionAuthModal');
  }

  function isCollectionSignedIn() {
    return Boolean(getCollectionToken());
  }

  function getCollectionToken() {
    try {
      return window.localStorage.getItem(COLLECTION_TOKEN_KEY) || '';
    } catch (err) {
      return '';
    }
  }

  function getSignedInUser() {
    try {
      return JSON.parse(window.localStorage.getItem(COLLECTION_USER_KEY) || 'null');
    } catch (err) {
      return null;
    }
  }

  function setApiSession(payload) {
    try {
      window.localStorage.setItem(COLLECTION_TOKEN_KEY, payload.token);
      window.localStorage.setItem(COLLECTION_USER_KEY, JSON.stringify(payload.user));
    } catch (err) {}
  }

  function clearApiSession() {
    try {
      window.localStorage.removeItem(COLLECTION_TOKEN_KEY);
      window.localStorage.removeItem(COLLECTION_USER_KEY);
    } catch (err) {}
  }

  function apiHeaders() {
    var headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    var token = getCollectionToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    return headers;
  }

  function apiRequest(path, options) {
    return window.fetch(API_BASE + path, Object.assign({
      headers: apiHeaders()
    }, options || {})).then(function (response) {
      return response.text().then(function (text) {
        var data = text ? JSON.parse(text) : {};
        if (!response.ok) {
          var error = new Error(data.message || 'Request failed.');
          error.response = data;
          throw error;
        }
        return data;
      });
    });
  }

  function getApiErrorMessage(error, fallback) {
    var errors = error && error.response && error.response.errors;
    if (errors) {
      var firstKey = Object.keys(errors)[0];
      if (firstKey && errors[firstKey] && errors[firstKey][0]) return errors[firstKey][0];
    }
    return (error && error.message) || fallback;
  }

  function setCollectionMessage(form, message, success) {
    var msg = form && form.querySelector('[role="status"]');
    if (!msg) return;
    msg.textContent = message || '';
    msg.classList.toggle('is-success', Boolean(success));
  }

  function setFieldInvalid(field, invalid) {
    if (!field) return;
    field.classList.toggle('is-invalid', Boolean(invalid));
    field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
  }

  function validCollectionEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function validCollectionPhone(value) {
    var trimmed = value.trim();
    var digits = trimmed.replace(/\D/g, '');
    return trimmed.length > 0 && digits.length >= 10 && digits.length <= 15 && /^\+?[0-9 ()\-.]+$/.test(trimmed);
  }

  function closeCollectionSelects(scope) {
    $$('[data-auth-select]', scope || document).forEach(function (select) {
      select.classList.remove('is-open');
      var toggle = $('[data-auth-select-toggle]', select);
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  function setCollectionSelectValue(value) {
    var modal = getCollectionModal();
    var select = modal && $('[data-auth-select]', modal);
    var input = modal && $('[data-collection-register] input[name="collection"]', modal);
    var label = select && $('[data-auth-select-value]', select);
    if (!select || !input || !label || !value) return;

    input.value = value;
    label.textContent = value;
    $$('[data-auth-select-option]', select).forEach(function (option) {
      option.setAttribute('aria-selected', String(option.getAttribute('data-value') === value));
    });
  }

  function setCollectionAuthMode(mode) {
    var modal = getCollectionModal();
    if (!modal) return;

    var registerForm = $('[data-collection-register]', modal);
    var loginForm = $('[data-collection-login]', modal);

    $$('[data-auth-mode]', modal).forEach(function (tab) {
      var active = tab.getAttribute('data-auth-mode') === mode;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });

    if (registerForm) registerForm.classList.toggle('is-hidden', mode !== 'register');
    if (loginForm) loginForm.classList.toggle('is-hidden', mode !== 'login');

    var panel = $('.collection-modal__panel', modal);
    if (panel) panel.scrollTop = 0;

    [registerForm, loginForm].forEach(function (form) {
      if (!form) return;
      setCollectionMessage(form, '');
      $$('input, select, textarea', form).forEach(function (field) { setFieldInvalid(field, false); });
    });
  }

  function showCollectionAccess(unlocked) {
    var modal = getCollectionModal();
    if (!modal) return;

    var authPanel = $('[data-collection-auth-panel]', modal);
    var collectionView = $('[data-collection-view]', modal);

    if (authPanel) authPanel.classList.toggle('is-hidden', Boolean(unlocked));
    if (collectionView) collectionView.classList.toggle('is-hidden', !unlocked);
  }

  function openCollectionModal(title) {
    var modal = getCollectionModal();
    if (!modal) return;

    var heading = $('#collectionAccessTitle', modal);
    var select = $('[data-collection-register] input[name="collection"]', modal);
    var image = $('.collection-modal__media img', modal);

    if (heading && title) heading.textContent = 'Explore ' + title;
    if (select && title) setCollectionSelectValue(title);
    if (image && title === 'Jaipur') {
      image.src = '/images/craft_street.webp';
    } else if (image) {
      image.src = '/images/Master%20Weaver%20Portrait.webp';
    }

    showCollectionAccess(isCollectionSignedIn());
    if (!isCollectionSignedIn()) setCollectionAuthMode('register');

    var panel = $('.collection-modal__panel', modal);
    if (panel) panel.scrollTop = 0;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('collection-modal-open');

    window.setTimeout(function () {
      var focusTarget = isCollectionSignedIn()
        ? $('.collection-access__actions a, .collection-access__actions button', modal)
        : $('input, select, textarea, button', modal);
      if (focusTarget) focusTarget.focus();
    }, 80);
  }

  function closeCollectionModal() {
    var modal = getCollectionModal();
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('collection-modal-open');
  }

  function unlockCollection(payload) {
    if (payload && payload.token && payload.user) setApiSession(payload);

    showCollectionAccess(true);
    var modal = getCollectionModal();
    var viewAction = modal && $('.collection-access__actions a', modal);
    if (viewAction) viewAction.focus();
    window.setTimeout(function () {
      window.location.href = '/collections/portal';
    }, 250);
  }

  document.addEventListener('click', function (e) {
    var openButton = e.target.closest && e.target.closest('[data-collection-auth-open]');
    if (openButton) {
      e.preventDefault();
      if (isCollectionSignedIn()) {
        window.location.href = '/collections/portal';
        return;
      }
      openCollectionModal(openButton.getAttribute('data-collection-title') || 'Collection');
      return;
    }

    var modeButton = e.target.closest && e.target.closest('[data-auth-mode]');
    if (modeButton) {
      e.preventDefault();
      setCollectionAuthMode(modeButton.getAttribute('data-auth-mode'));
      return;
    }

    var selectToggle = e.target.closest && e.target.closest('[data-auth-select-toggle]');
    if (selectToggle) {
      e.preventDefault();
      var authSelect = selectToggle.closest('[data-auth-select]');
      var isOpen = authSelect && authSelect.classList.contains('is-open');
      closeCollectionSelects();
      if (authSelect && !isOpen) {
        authSelect.classList.add('is-open');
        selectToggle.setAttribute('aria-expanded', 'true');
      }
      return;
    }

    var selectOption = e.target.closest && e.target.closest('[data-auth-select-option]');
    if (selectOption) {
      e.preventDefault();
      setCollectionSelectValue(selectOption.getAttribute('data-value') || selectOption.textContent.trim());
      closeCollectionSelects();
      var parentSelect = selectOption.closest('[data-auth-select]');
      var parentToggle = parentSelect && $('[data-auth-select-toggle]', parentSelect);
      if (parentToggle) parentToggle.focus();
      return;
    }

    var logoutButton = e.target.closest && e.target.closest('[data-collection-logout]');
    if (logoutButton) {
      e.preventDefault();
      apiRequest('/logout', { method: 'POST' }).catch(function () {});
      clearApiSession();
      showCollectionAccess(false);
      setCollectionAuthMode('login');
      return;
    }

    var refreshButton = e.target.closest && e.target.closest('[data-admin-refresh]');
    if (refreshButton) {
      e.preventDefault();
      loadAdminUsers();
      return;
    }

    var adminLogoutButton = e.target.closest && e.target.closest('[data-admin-logout]');
    if (adminLogoutButton) {
      e.preventDefault();
      apiRequest('/logout', { method: 'POST' }).catch(function () {});
      clearApiSession();
      syncAdminAuthState();
      renderAdminUsers([]);
      setAdminMessage('Signed out.', true);
      return;
    }

    var closeButton = e.target.closest && e.target.closest('[data-collection-auth-close]');
    if (closeButton) closeCollectionModal();

    if (!e.target.closest || !e.target.closest('[data-auth-select]')) closeCollectionSelects();
  });

  document.addEventListener('submit', function (e) {
    var registerForm = e.target.closest && e.target.closest('[data-collection-register]');
    var loginForm = e.target.closest && e.target.closest('[data-collection-login]');
    var adminLoginForm = e.target.closest && e.target.closest('[data-admin-login]');

    if (registerForm) {
      e.preventDefault();

      var name = registerForm.elements.name;
      var email = registerForm.elements.email;
      var phone = registerForm.elements.phone;
      var password = registerForm.elements.password;
      var collection = registerForm.elements.collection;
      var notes = registerForm.elements.notes;

      var nameOk = name.value.trim().length > 1;
      var emailOk = validCollectionEmail(email.value.trim());
      var phoneOk = validCollectionPhone(phone.value.trim());
      var passwordOk = password.value.length >= 8;

      setFieldInvalid(name, !nameOk);
      setFieldInvalid(email, !emailOk);
      setFieldInvalid(phone, !phoneOk);
      setFieldInvalid(password, !passwordOk);

      if (!nameOk) {
        setCollectionMessage(registerForm, 'Please enter your name.');
        name.focus();
        return;
      }
      if (!emailOk) {
        setCollectionMessage(registerForm, 'Please enter a valid email address.');
        email.focus();
        return;
      }
      if (!phoneOk) {
        setCollectionMessage(registerForm, 'Please enter a valid phone number.');
        phone.focus();
        return;
      }
      if (!passwordOk) {
        setCollectionMessage(registerForm, 'Password must be at least 8 characters.');
        password.focus();
        return;
      }

      setCollectionMessage(registerForm, 'Creating account...');
      apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify({
          name: name.value.trim(),
          email: email.value.trim().toLowerCase(),
          phone: phone.value.trim(),
          password: password.value,
          preferred_collection: collection ? collection.value : '',
          project_notes: notes ? notes.value.trim() : ''
        })
      }).then(function (payload) {
        unlockCollection(payload);
        setCollectionMessage(registerForm, 'Access unlocked.', true);
        registerForm.reset();
      }).catch(function (error) {
        setCollectionMessage(registerForm, getApiErrorMessage(error, 'Unable to create account.'));
      });
      return;
    }

    if (loginForm) {
      e.preventDefault();

      var loginEmail = loginForm.elements.email;
      var loginPassword = loginForm.elements.password;
      var loginEmailOk = validCollectionEmail(loginEmail.value.trim());
      var loginPasswordOk = loginPassword.value.length > 0;

      setFieldInvalid(loginEmail, !loginEmailOk);
      setFieldInvalid(loginPassword, !loginPasswordOk);

      if (!loginEmailOk) {
        setCollectionMessage(loginForm, 'Please enter a valid email address.');
        loginEmail.focus();
        return;
      }
      if (!loginPasswordOk) {
        setCollectionMessage(loginForm, 'Please enter your password.');
        loginPassword.focus();
        return;
      }

      setCollectionMessage(loginForm, 'Signing in...');
      apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({
          email: loginEmail.value.trim().toLowerCase(),
          password: loginPassword.value
        })
      }).then(function (payload) {
        unlockCollection(payload);
        setCollectionMessage(loginForm, 'Access unlocked.', true);
        loginForm.reset();
      }).catch(function (error) {
        setCollectionMessage(loginForm, getApiErrorMessage(error, 'Email or password does not match.'));
      });
      return;
    }

    if (adminLoginForm) {
      e.preventDefault();

      var adminEmail = adminLoginForm.elements.email;
      var adminPassword = adminLoginForm.elements.password;

      if (!validCollectionEmail(adminEmail.value.trim())) {
        setAdminMessage('Please enter a valid email address.');
        adminEmail.focus();
        return;
      }

      if (!adminPassword.value) {
        setAdminMessage('Please enter your password.');
        adminPassword.focus();
        return;
      }

      setAdminMessage('Signing in...');
      apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({
          email: adminEmail.value.trim().toLowerCase(),
          password: adminPassword.value
        })
      }).then(function (payload) {
        setApiSession(payload);
        adminLoginForm.reset();
        syncAdminAuthState();
        return loadAdminUsers();
      }).catch(function (error) {
        setAdminMessage(getApiErrorMessage(error, 'Unable to sign in.'));
      });
    }
  });

  document.addEventListener('input', function (e) {
    if (!e.target.closest || !e.target.closest('.collection-auth__form')) return;
    setFieldInvalid(e.target, false);
    setCollectionMessage(e.target.closest('form'), '');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeCollectionSelects();
    var modal = getCollectionModal();
    if (modal && modal.classList.contains('is-open')) closeCollectionModal();
  });

  function getAdminPanel() {
    return $('[data-admin-panel]');
  }

  function setAdminMessage(message, success) {
    var panel = getAdminPanel();
    var msg = panel && $('[data-admin-msg]', panel);
    if (!msg) return;
    msg.textContent = message || '';
    msg.classList.toggle('is-success', Boolean(success));
  }

  function syncAdminAuthState() {
    var panel = getAdminPanel();
    if (!panel) return;

    var login = $('[data-admin-login]', panel);
    var logout = $('[data-admin-logout]', panel);
    var session = $('[data-admin-session]', panel);
    var user = getSignedInUser();
    var signedIn = Boolean(getCollectionToken());

    if (login) login.classList.toggle('is-hidden', signedIn);
    if (logout) logout.hidden = !signedIn;
    if (session) session.textContent = signedIn && user ? 'Signed in as ' + user.name : 'Not signed in';
  }

  function renderAdminUsers(users) {
    var panel = getAdminPanel();
    if (!panel) return;

    var tbody = $('[data-admin-users]', panel);
    if (!tbody) return;

    $('[data-admin-total]', panel).textContent = String(users.length);
    $('[data-admin-heritage]', panel).textContent = String(users.filter(function (user) {
      return user.preferred_collection === 'Heritage Revived';
    }).length);
    $('[data-admin-jaipur]', panel).textContent = String(users.filter(function (user) {
      return user.preferred_collection === 'Jaipur';
    }).length);

    if (!users.length) {
      tbody.innerHTML = '<tr><td colspan="6">No users found.</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(function (user) {
      var joined = user.created_at ? new Date(user.created_at).toLocaleDateString() : '-';
      return '<tr>' +
        '<td>' + escapeHtml(user.name || '-') + '</td>' +
        '<td>' + escapeHtml(user.email || '-') + '</td>' +
        '<td>' + escapeHtml(user.phone || '-') + '</td>' +
        '<td>' + escapeHtml(user.preferred_collection || '-') + '</td>' +
        '<td>' + escapeHtml(user.project_notes || '-') + '</td>' +
        '<td>' + escapeHtml(joined) + '</td>' +
      '</tr>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function loadAdminUsers() {
    var panel = getAdminPanel();
    if (!panel) return Promise.resolve();

    syncAdminAuthState();

    if (!getCollectionToken()) {
      renderAdminUsers([]);
      setAdminMessage('Login to load registered users.');
      return Promise.resolve();
    }

    setAdminMessage('Loading users...');
    return apiRequest('/users')
      .then(function (payload) {
        renderAdminUsers(payload.users || []);
        setAdminMessage('Users loaded.', true);
      })
      .catch(function (error) {
        if (error && error.message === 'Unauthenticated.') clearApiSession();
        syncAdminAuthState();
        renderAdminUsers([]);
        setAdminMessage(getApiErrorMessage(error, 'Unable to load users.'));
      });
  }

  syncAdminAuthState();
  loadAdminUsers();

  /* ----------------------------------------------------------
     8 · Mark the page ready (kills any first-paint flash)
     ---------------------------------------------------------- */
  window.addEventListener('load', function () {
    document.body.classList.add('is-loaded');
    onScroll();
  });

})();
