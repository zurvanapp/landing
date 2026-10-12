(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08 });
    document.documentElement.classList.add('js-motion');
    document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
  }

  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  function closeMenu() {
    mobileNav.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'باز کردن منو');
  }
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');
    mobileNav.hidden = !open;
  });
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileNav.hidden) {
      closeMenu();
      menuToggle.focus();
    }
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });

  const demo = document.getElementById('demo');
  const themeButtons = document.querySelectorAll('[data-theme]');
  themeButtons.forEach(button => button.addEventListener('click', () => {
    demo.dataset.mode = button.dataset.theme;
    themeButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }));

  // This is an illustrative preview; the date and clock use the visitor's local time.
  const persianNumber = new Intl.NumberFormat('fa-IR', { useGrouping: false });
  const dayFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric' });
  const monthFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'long', year: 'numeric' });
  const weekdayFormatter = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' });
  const numericDate = new Intl.DateTimeFormat('en-US-u-ca-persian', { day: 'numeric', month: 'numeric', year: 'numeric' });
  const calendar = document.getElementById('calendar-days');
  let lastDate = '';
  function updatePreview() {
    const now = new Date();
    const seconds = now.getSeconds();
    demo.querySelector('.hand.hour').style.transform = `rotate(${(now.getHours() % 12) * 30 + now.getMinutes() / 2}deg)`;
    demo.querySelector('.hand.minute').style.transform = `rotate(${now.getMinutes() * 6 + seconds / 10}deg)`;
    const secondHand = demo.querySelector('.hand.second');
    secondHand.style.animation = 'none';
    secondHand.style.transform = `rotate(${seconds * 6}deg)`;
    const currentDate = now.toDateString();
    if (currentDate === lastDate) return;
    lastDate = currentDate;
    document.getElementById('demo-weekday').textContent = weekdayFormatter.format(now);
    document.getElementById('demo-day').textContent = dayFormatter.format(now);
    document.getElementById('demo-month').textContent = monthFormatter.format(now);
    document.getElementById('calendar-month').textContent = monthFormatter.format(now);
    const parts = Object.fromEntries(numericDate.formatToParts(now).map(part => [part.type, part.value]));
    const day = Number(parts.day);
    const month = Number(parts.month);
    const firstDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1, 12);
    const nextMonth = new Date(firstDay);
    let daysInMonth = 29;
    // Derive the actual Persian month length from Intl, including leap years.
    for (let offset = 29; offset <= 31; offset++) {
      nextMonth.setDate(firstDay.getDate() + offset);
      const nextParts = numericDate.formatToParts(nextMonth);
      if (Number(nextParts.find(part => part.type === 'month').value) !== month) {
        daysInMonth = offset;
        break;
      }
    }
    const leadingDays = (firstDay.getDay() + 1) % 7;
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < leadingDays + daysInMonth; index++) {
      const cell = document.createElement('span');
      const date = index - leadingDays + 1;
      if (date > 0) {
        cell.textContent = persianNumber.format(date);
        if (index % 7 === 6) cell.classList.add('friday');
        if (date === day) {
          cell.classList.add('today');
          cell.setAttribute('aria-label', `امروز، ${persianNumber.format(date)}`);
        }
      } else cell.setAttribute('aria-hidden', 'true');
      fragment.appendChild(cell);
    }
    calendar.replaceChildren(fragment);
  }
  updatePreview();
  let clockTimer;
  function manageClock() {
    window.clearInterval(clockTimer);
    if (!document.hidden) {
      updatePreview();
      clockTimer = window.setInterval(updatePreview, reducedMotion.matches ? 60000 : 1000);
    }
  }
  manageClock();
  document.addEventListener('visibilitychange', manageClock);
  reducedMotion.addEventListener('change', manageClock);

  if ('IntersectionObserver' in window) {
    const navLinks = document.querySelectorAll('.desktop-nav a');
    const sectionObserver = new IntersectionObserver(entries => {
      const active = entries.find(entry => entry.isIntersecting);
      if (!active) return;
      navLinks.forEach(link => {
        if (link.hash === `#${active.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
    navLinks.forEach(link => {
      const section = document.querySelector(link.hash);
      if (section) sectionObserver.observe(section);
    });
  }
})();
