document.addEventListener('DOMContentLoaded', () => {

  const header = document.getElementById('header');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  const burger = document.getElementById('burger');
  const nav    = document.getElementById('nav');
  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('active');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => revealObserver.observe(el));

  const tabs  = document.querySelectorAll('.gallery__tab');
  const items = document.querySelectorAll('.gallery__item');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      items.forEach(item => {
        const cat = item.dataset.category;
        if (filter === 'all' || cat === filter) {
          item.classList.remove('hidden');
          item.style.animation = 'fadeIn .4s ease forwards';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  if (typeof Swiper !== 'undefined') {
    new Swiper('.reviews-swiper', {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      autoplay: { delay: 5000, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { prevEl: '.swiper-button-prev', nextEl: '.swiper-button-next' },
      breakpoints: {
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
      }
    });
  }

  if (typeof GLightbox !== 'undefined') {
    GLightbox({
      selector: '[data-glightbox]',
      touchNavigation: true,
      loop: true,
      autoplayVideos: false,
    });
  }

  const modal       = document.getElementById('privacyModal');
  const overlay     = document.getElementById('modalOverlay');
  const closeBtn    = document.getElementById('closeModal');
  const closeBtn2   = document.getElementById('closeModal2');
  const openLinks   = document.querySelectorAll('#openPrivacy, #openPrivacy2, .privacy-link');

  const openModal  = (e) => { e.preventDefault(); modal.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const closeModal = () => { modal.classList.remove('open'); document.body.style.overflow = ''; };

  openLinks.forEach(el => el.addEventListener('click', openModal));
  overlay.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  closeBtn2.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  const form    = document.getElementById('contactForm');
  const msgBox  = document.getElementById('formMessage');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      btn.querySelector('span').textContent = 'Отправка…';

      const data = new FormData(form);

      try {
        const resp = await fetch(form.action, { method: 'POST', body: data });
        const json = await resp.json();

        if (json.ok) {
          msgBox.className = 'form-message success';
          msgBox.textContent = '✓ Заявка отправлена! Я свяжусь с вами в течение часа.';
          form.reset();
        } else {
          throw new Error(json.error || 'Ошибка отправки');
        }
      } catch (err) {
        msgBox.className = 'form-message error';
        msgBox.textContent = '✕ Не удалось отправить заявку. Напишите мне напрямую в Telegram.';
      } finally {
        btn.disabled = false;
        btn.querySelector('span').textContent = 'Отправить заявку';
        msgBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.startsWith('8')) val = '7' + val.slice(1);
      if (!val.startsWith('7')) val = '7' + val;
      val = val.slice(0, 11);
      let formatted = '+7';
      if (val.length > 1) formatted += ' (' + val.slice(1, 4);
      if (val.length > 4) formatted += ') ' + val.slice(4, 7);
      if (val.length > 7) formatted += '-' + val.slice(7, 9);
      if (val.length > 9) formatted += '-' + val.slice(9, 11);
      e.target.value = formatted;
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const id = this.getAttribute('href');
      if (id === '#' || id === '#privacy-modal') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const offset = header.offsetHeight + 16;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      }
    });
  });

});
