const isSseSupported = typeof EventSource !== "undefined";

if (isSseSupported) {
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      console.log("ratio", entry.intersectionRatio, entry.target);

      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        document.body.style.setProperty(
          "--background",
          entry.target.getAttribute("data-section-color")
        );
      }
    });
  },
  { threshold: [0.2, 0.4, 0.6, 0.8, 1], rootMargin: "200px" }
);
document
  .querySelectorAll("[data-section-color]")
  .forEach((el) => observer.observe(el));
