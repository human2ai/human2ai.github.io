/* Human2AI Labs — small interactive enhancements; no build tool required. */
(() => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation');
    }));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
  // Put the public email in the line below when ready; left blank intentionally.
  const contact = { email: '', github: 'https://github.com/human2ai' };
  const emailText = document.getElementById('lab-email-text');
  const emailLink = document.querySelector('.contact-email-link');
  if (emailText && emailLink && contact.email) {
    emailText.textContent = contact.email;
    emailLink.href = 'mailto:' + contact.email;
    emailLink.hidden = false;
  }
  const githubText = document.getElementById('lab-github-text');
  const githubLink = document.querySelector('.contact-github-link');
  if (githubText) githubText.textContent = contact.github.replace('https://','');
  if (githubLink) {
    githubLink.href = contact.github;
    githubLink.hidden = false;
  }
})();
