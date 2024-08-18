import { emojiBlast } from "https://cdn.jsdelivr.net/npm/emoji-blast@0.10.1/+esm";

const isSseSupported = typeof EventSource !== "undefined";

if (isSseSupported) {
  const sse = new EventSource("/api/sse", { withCredentials: true });
  sse.addEventListener("message", (event) => {
    const { Country, City, Url, FlagEmoji } = JSON.parse(event.data);
    const imageItem = document.querySelector(
      `li:has(a[href="${Url.slice(1)}"])`
    );
    if (Toastify) {
      const text = (() => {
        if (City && Country && FlagEmoji) {
          return `Someone from ${City}, ${Country} ${FlagEmoji} just downloaded a wallpaper 🎉`;
        }
        return `Someone just downloaded a wallpaper 🎉`;
      })();
      Toastify({
        text,
        duration: 3000,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        offset: {
          x: 16, // horizontal axis - can be a number or a string indicating unity. eg: '2em'
          y: 16, // vertical axis - can be a number or a string indicating unity. eg: '2em'
        },
        onClick() {
          imageItem.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
          imageItem.animate(
            [
              {
                filter: "saturate(1)",
                outlineColor: "transparent",
                outlineOffset: "2px",
              },
              {
                filter: "saturate(4)",
                outlineColor: "white",
                outlineOffset: "6px",
              },
              {
                filter: "saturate(1)",
                outlineColor: "transparent",
                outlineOffset: "2px",
              },
            ],
            {
              duration: 3000,
              easing: "ease-in-out",
            }
          );
        },
        // stopOnFocus: true, // Prevents dismissing of toast on hover
      }).showToast();
    }
    const y =
      imageItem.getBoundingClientRect().top +
      imageItem.getBoundingClientRect().height / 2 +
      Math.random() * 100;
    const x =
      imageItem.getBoundingClientRect().left +
      imageItem.getBoundingClientRect().width / 2 +
      Math.random() * 100;
    emojiBlast({
      position: {
        x,
        y,
      },
      emojiCount: () => Math.random() * 5 + 5,
      className: "text-2xl",
      emojis: ["➕", "+1", "🎉", "🔥", "🚀", "🌟"],
      process(element) {
        element.style = "font-size: 30px";
      },
    });
  });
}

function ambientLighting() {
  document.querySelectorAll("[data-subcategory]").forEach((el) => {
    const color = el.getAttribute("data-section-color");
    const firstChild = el.querySelector("&>li");
    const lastChild = el.querySelector("&>li:last-of-type");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 1) {
            document.body.style.setProperty("--background", color);
          }
        });
      },
      { threshold: [0.2, 0.4, 0.6, 0.8, 1], rootMargin: "0px" }
    );

    observer.observe(firstChild);
    observer.observe(lastChild);
  });
}

ambientLighting();
