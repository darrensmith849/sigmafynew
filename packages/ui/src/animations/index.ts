/**
 * Sigmafy marketing-page animation primitives.
 *
 * Vanilla TS, no runtime deps. Marketing pages call `mountAnimations()`
 * once on mount; each helper is a no-op when its target attribute isn't
 * present. All animations respect `prefers-reduced-motion`.
 *
 * Implemented (V1):
 * - data-reveal           — fade + slide-up on scroll
 * - data-words            — cycle through phrases in a headline
 * - data-typewriter-cycle — pill text rotates through a list
 * - data-magnetic         — cursor pull on hover (buttons)
 *
 * Decorative (CSS-only, no JS):
 * - .float-a / .float-b / .float-c
 * - .pulse-soft
 * - .orb-drift-a / .orb-drift-b
 * - .marquee-scroll
 */

const PRM = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function mountReveal() {
  const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
  if (!els.length || PRM()) {
    els.forEach((el) => el.classList.add("reveal-done"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("reveal-done");
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
  );
  els.forEach((el) => io.observe(el));
}

function mountMagnetic() {
  if (PRM()) return;
  document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
    const strength = Number(el.dataset.magnetic ?? "5");
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const dx = ((e.clientX - (r.left + r.width / 2)) / r.width) * strength;
      const dy = ((e.clientY - (r.top + r.height / 2)) / r.height) * strength;
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    };
    const reset = () => {
      el.style.transform = "translate3d(0,0,0)";
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", reset);
  });
}

function mountWords() {
  if (PRM()) return;
  document.querySelectorAll<HTMLElement>("[data-words]").forEach((host) => {
    const phrases = (host.dataset.wordsList ?? "").split("|").map((s) => s.trim()).filter(Boolean);
    if (phrases.length === 0) return;
    const speed = Number(host.dataset.typeSpeed ?? "40");
    const hold = Number(host.dataset.hold ?? "1800");
    let phraseIdx = 0;
    let charIdx = 0;
    let typing = true;
    const tick = () => {
      const phrase = phrases[phraseIdx]!;
      if (typing) {
        charIdx += 1;
        host.textContent = phrase.slice(0, charIdx);
        if (charIdx === phrase.length) {
          typing = false;
          setTimeout(tick, hold);
          return;
        }
      } else {
        charIdx -= 1;
        host.textContent = phrase.slice(0, charIdx);
        if (charIdx === 0) {
          typing = true;
          phraseIdx = (phraseIdx + 1) % phrases.length;
        }
      }
      setTimeout(tick, typing ? speed : speed * 0.6);
    };
    setTimeout(tick, 600);
  });
}

function mountTypewriterCycle() {
  if (PRM()) return;
  document.querySelectorAll<HTMLElement>("[data-typewriter-cycle]").forEach((host) => {
    const phrases = (host.dataset.words ?? "").split("|").map((s) => s.trim()).filter(Boolean);
    if (phrases.length === 0) return;
    const typeSpeed = Number(host.dataset.typeSpeed ?? "36");
    const eraseSpeed = Number(host.dataset.eraseSpeed ?? "22");
    const hold = Number(host.dataset.hold ?? "2200");
    let phraseIdx = 0;
    let charIdx = phrases[0]!.length;
    host.textContent = phrases[0]!;
    let typing = false;
    const tick = () => {
      const phrase = phrases[phraseIdx]!;
      if (typing) {
        charIdx += 1;
        host.textContent = phrase.slice(0, charIdx);
        if (charIdx === phrase.length) {
          typing = false;
          setTimeout(tick, hold);
          return;
        }
        setTimeout(tick, typeSpeed);
      } else {
        charIdx -= 1;
        host.textContent = phrase.slice(0, charIdx);
        if (charIdx === 0) {
          typing = true;
          phraseIdx = (phraseIdx + 1) % phrases.length;
        }
        setTimeout(tick, eraseSpeed);
      }
    };
    setTimeout(tick, hold);
  });
}

export function mountAnimations() {
  if (typeof window === "undefined") return;
  mountReveal();
  mountMagnetic();
  mountWords();
  mountTypewriterCycle();
}
