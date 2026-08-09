const translations = {
  ru: {
    "nav.about": "О себе",
    "nav.stack": "Стек",
    "nav.work": "Проекты",
    "nav.certs": "Сертификаты",
    "nav.contactCta": "Связаться",
    "nav.open": "Ищу работу",
    "nav.openHint": "backend · Laravel · Java",
    "hero.title": "Backend-разработчик",
    "hero.lead": "PHP, Java, PostgreSQL, Docker. 4 года опыта. Воронеж.",
    "hero.ctaTg": "Написать в Telegram",
    "hero.ctaMail": "Почта",
    "proof.years": "года опыта",
    "proof.laravel": "основной стек",
    "proof.java": "сервисы и лаунчеры",
    "proof.place": "удалённо / офис",
    "about.label": "О себе",
    "about.title": "Иван Воробьёв",
    "about.text": "Занимаюсь backend-разработкой: REST API, базы данных, деплой. Основной стек — PHP/Laravel и Java. Также работаю с PostgreSQL, Docker, Linux и JavaScript. Параллельно прохожу обучение по направлению «Информационные системы» в ВИВТ (2025–2028).",
    "stack.title": "Стек",
    "stack.text": "Технологии, с которыми работаю.",
    "work.title": "Проекты",
    "work.text": "Некоторые из реализованных проектов.",
    "work.p1.title": "CS:GO OpenCase",
    "work.p1.text": "Веб-сервис открытия кейсов: баланс, платежи, выдача предметов через API CSGO.TM, административная панель.",
    "work.p2.title": "Telegram Mini Apps",
    "work.p2.text": "Мини-приложения в Telegram с авторизацией через WebApp и серверной частью.",
    "work.p3.title": "Minecraft Launcher",
    "work.p3.text": "Десктопный лаунчер на Java: авторизация, обновления клиента, запуск игры.",
    "work.p4.title": "Telegram-боты",
    "work.p4.text": "Боты на Python и aiogram: меню, платежи, интеграции с API, админ-команды.",
    "certs.title": "Сертификаты",
    "certs.text": "Выданы Министерством цифрового развития России",
    "edu.label": "Обучение",
    "edu.title": "Воронежский институт высоких технологий",
    "edu.text": "Информационные системы, 2025–2028.",
    "contact.eyebrow": "Контакты",
    "contact.title": "Открыт к предложениям о работе",
    "contact.text": "Пишите в Telegram или на почту.",
    "footer.name": "Иван Воробьёв",
    "footer.place": "Россия, Воронеж",
    "meta.title": "humoridze — Иван Воробьёв | Backend-разработчик",
    "meta.description": "Иван Воробьёв (humoridze) — backend-разработчик из Воронежа. PHP, Laravel, Java, PostgreSQL, Docker, REST API. 4 года опыта. Открыт к предложениям о работе.",
  },
  en: {
    "nav.about": "About",
    "nav.stack": "Stack",
    "nav.work": "Projects",
    "nav.certs": "Certificates",
    "nav.contactCta": "Contact",
    "nav.open": "Looking for work",
    "nav.openHint": "backend · Laravel · Java",
    "hero.title": "Backend developer",
    "hero.lead": "PHP, Java, PostgreSQL, Docker. 4 years of experience. Voronezh.",
    "hero.ctaTg": "Message on Telegram",
    "hero.ctaMail": "Email",
    "proof.years": "years of experience",
    "proof.laravel": "main stack",
    "proof.java": "services and launchers",
    "proof.place": "remote / on-site",
    "about.label": "About",
    "about.title": "Ivan Vorobyov",
    "about.text": "I work on backend development: REST APIs, databases, deployment. Main stack — PHP/Laravel and Java. Also PostgreSQL, Docker, Linux, and JavaScript. Currently studying Information Systems at VIHT (2025–2028).",
    "stack.title": "Stack",
    "stack.text": "Technologies I work with.",
    "work.title": "Projects",
    "work.text": "Some of the projects I’ve built.",
    "work.p1.title": "CS:GO OpenCase",
    "work.p1.text": "Case-opening web service: balance, payments, item delivery via CSGO.TM API, admin panel.",
    "work.p2.title": "Telegram Mini Apps",
    "work.p2.text": "Telegram mini apps with WebApp auth and a server-side backend.",
    "work.p3.title": "Minecraft Launcher",
    "work.p3.text": "Desktop launcher in Java: auth, client updates, game launch.",
    "work.p4.title": "Telegram bots",
    "work.p4.text": "Bots on Python and aiogram: menus, payments, API integrations, admin commands.",
    "certs.title": "Certificates",
    "certs.text": "Issued by the Ministry of Digital Development of Russia",
    "edu.label": "Education",
    "edu.title": "Voronezh Institute of High Technologies",
    "edu.text": "Information Systems, 2025–2028.",
    "contact.eyebrow": "Contact",
    "contact.title": "Open to job offers",
    "contact.text": "Reach me on Telegram or by email.",
    "footer.name": "Ivan Vorobyov",
    "footer.place": "Russia, Voronezh",
    "meta.title": "humoridze — Ivan Vorobyov | Backend developer",
    "meta.description": "Ivan Vorobyov (humoridze) — backend developer from Voronezh. PHP, Laravel, Java, PostgreSQL, Docker, REST API. 4 years of experience. Open to work.",
  },
};

function setMeta(name, content, attr = "name") {
  let node = document.querySelector(`meta[${attr}="${name}"]`);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(attr, name);
    document.head.appendChild(node);
  }
  node.setAttribute("content", content);
}

function applyLanguage(lang) {
  const pack = translations[lang] || translations.ru;
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (pack[key]) {
      node.textContent = pack[key];
    }
  });

  document.querySelectorAll(".lang__btn").forEach((btn) => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", String(active));
  });

  if (pack["meta.title"]) {
    document.title = pack["meta.title"];
    setMeta("og:title", pack["meta.title"], "property");
    setMeta("twitter:title", pack["meta.title"]);
  }
  if (pack["meta.description"]) {
    setMeta("description", pack["meta.description"]);
    setMeta("og:description", pack["meta.description"], "property");
    setMeta("twitter:description", pack["meta.description"]);
  }
  setMeta("og:locale", lang === "en" ? "en_US" : "ru_RU", "property");

  localStorage.setItem("humoridze-lang", lang);
}

window.HumorI18n = { translations, applyLanguage };
