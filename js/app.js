const yearNode = document.getElementById("year");
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

const savedLang = localStorage.getItem("humoridze-lang");
const startLang = savedLang === "en" || savedLang === "ru" ? savedLang : "ru";
window.HumorI18n.applyLanguage(startLang);

document.querySelectorAll(".lang__btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    window.HumorI18n.applyLanguage(btn.dataset.lang);
  });
});

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReduced && window.gsap) {
  gsap.registerPlugin(ScrollTrigger);

  const heroImage = document.querySelector(".hero__media img");
  if (heroImage) {
    gsap.to(heroImage, {
      scale: 1,
      duration: 1.6,
      ease: "power2.out",
    });
  }

  gsap.to("[data-reveal]", {
    opacity: 1,
    y: 0,
    duration: 0.75,
    stagger: 0.12,
    delay: 0.15,
    ease: "power3.out",
  });

  gsap.utils.toArray(".work__item").forEach((row) => {
    gsap.from(row, {
      scrollTrigger: {
        trigger: row,
        start: "top 88%",
      },
      opacity: 0,
      y: 28,
      duration: 0.7,
      ease: "power2.out",
    });
  });

  gsap.from(".stack__list li", {
    scrollTrigger: {
      trigger: ".stack__list",
      start: "top 85%",
    },
    opacity: 0,
    y: 20,
    duration: 0.55,
    stagger: 0.06,
    ease: "power2.out",
  });

  gsap.from(".proof__item", {
    scrollTrigger: {
      trigger: ".proof",
      start: "top 90%",
    },
    opacity: 0,
    y: 24,
    duration: 0.55,
    stagger: 0.08,
    ease: "power2.out",
  });
} else {
  document.querySelectorAll("[data-reveal]").forEach((node) => {
    node.style.opacity = "1";
    node.style.transform = "none";
  });
}
