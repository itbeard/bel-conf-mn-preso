let current = 0;
const stage = document.getElementById("stage");
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const im = (i) => PHOTOS[i] || "";
const PLAY_ICON = `<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>`;
const SOUND_ICON = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" fill="currentColor"/></svg>`;
// Відэа-ролік: грузіцца загадзя на суседніх слайдах, запускаецца ў setupClips().
const clip = (src, poster, i) =>
  `<div class="clip-wrap paused"><video class="clip" src="${esc(src)}" poster="${esc(poster)}" preload="${Math.abs(i - current) <= 1 ? "auto" : "none"}" playsinline></video><div class="clip-state"><span>${PLAY_ICON}</span></div><button class="clip-sound" type="button" hidden>${SOUND_ICON}Уключыць гук</button></div>`;
function render() {
  stage.innerHTML = SLIDES.map((s, i) => {
    let bg =
      s.photo != null
        ? `<img class="bgphoto ${s.type === "hero" || s.type === "thanks" ? "strong" : ""}" src="${im(s.photo)}" alt=""><div class="veil"></div>`
        : "";
    let logo = `<img class="logo" src="${LOGO}" alt="Лагатып Мова Нанова Уроцлаў">`;
    const eyebrow = s.eyebrow ? `<div class="eyebrow">${esc(s.eyebrow)}</div>` : "";
    let base = `${bg}${logo}${eyebrow}<h1 class="title">${esc(s.title)}</h1>`;
    let body = "";
    if (s.type === "hero") {
      body = `<div class="sub">${esc(s.sub)}</div><div class="note">${esc(s.note)}</div>`;
    } else if (s.type === "statement" || s.type === "thanks") {
      body = `<div class="text">${esc(s.text)}</div>${s.accent ? `<div class="accent">${esc(s.accent)}</div>` : ""}`;
    } else if (
      s.type === "stats" ||
      s.type === "belarus" ||
      s.type === "paradox"
    ) {
      body = `<div class="statrow">${s.stats.map((a) => `<div class="stat"><strong>${esc(a[0])}</strong><span>${esc(a[1])}</span></div>`).join("")}</div>${s.steps ? `<div class="steps">${s.steps.map((a) => `<div class="step"><b>${esc(a[0])}</b><span>${esc(a[1])}</span></div>`).join("")}</div>` : ""}<div class="text">${esc(s.text)}</div>`;
    } else if (s.type === "four" || s.type === "functions") {
      const cards = `<div class="cards ${s.type === "functions" ? "five" : ""}">${s.items.map((a) => `<div class="card"><b>${s.type === "four" ? `<em>${esc(a[0])}</em>${esc(a[1])}` : esc(a[0])}</b><p>${esc(s.type === "four" ? a[2] : a[1])}</p></div>`).join("")}</div>`;
      if (s.clip) {
        base = `${bg}${logo}`;
        body = `<div class="split"><div class="split-main">${eyebrow}<h1 class="title">${esc(s.title)}</h1>${cards}</div>${clip(s.clip, s.poster, i)}</div>`;
      } else body = cards;
    } else if (s.type === "institutions") {
      body = `<div class="cards"><div class="card"><b>${esc(s.left[0])}</b><p>${esc(s.left[1])}</p></div><div class="card"><b>${esc(s.right[0])}</b><p>${esc(s.right[1])}</p></div></div>`;
    } else if (s.type === "fullphoto") {
      base = `<img class="blur-bg" src="${im(s.photo)}" alt="" aria-hidden="true"><img class="fullphoto-img" src="${im(s.photo)}" alt="">`;
      body = "";
    } else if (s.type === "video") {
      base = `<img class="blur-bg" src="${esc(s.poster)}" alt="" aria-hidden="true"><div class="clip-stage">${clip(s.src, s.poster, i)}</div>`;
      body = "";
    } else if (s.type === "format") {
      const pics = GALLERIES[s.format] || [];
      const n = pics.length;
      const caption =
        s.title || s.eyebrow
          ? `<div class="format-caption">${eyebrow}${s.title ? `<div class="format-title">${esc(s.title)}</div>` : ""}</div>`
          : "";
      if (s.fit && n) {
        // Адно фота цалкам (без абразання) карткай справа на размытым фоне.
        base = `<img class="blur-bg" src="${pics[0]}" alt="" aria-hidden="true"><img class="fit-photo" src="${pics[0]}" alt="${esc(s.title)}">${logo}${caption}`;
      } else {
        const layout = n > 7 ? "count-many" : "count-" + n;
        const gallery = n
          ? `<div class="format-gallery ${layout}">${pics.map((src, j) => `<img src="${src}" alt="${s.title ? esc(s.title) + " – " : ""}фота ${j + 1}">`).join("")}${n > 7 ? `<span class="more-count">+${n - 6} фота</span>` : ""}</div>${caption ? `<div class="format-shade"></div>` : ""}`
          : "";
        base = `${logo}${gallery}${caption}`;
      }
    }
    const cls = [
      "slide",
      s.type,
      s.clip && "has-clip",
      s.fit && "fit",
      s.type === "format" && !s.title && !s.eyebrow && "bare",
      i === current && "active",
    ]
      .filter(Boolean)
      .join(" ");
    return `<section class="${cls}" aria-hidden="${i !== current}" data-slide="${i}">${base}${body}<div class="foot">МОВА НАНОВА · БЕЛАРУСЬ / ПОЛЬШЧА</div><div class="index">${String(i + 1).padStart(2, "0")} / ${String(SLIDES.length).padStart(2, "0")}</div></section>`;
  }).join("");
  setupClips();
  document.getElementById("counter").textContent =
    `${current + 1} / ${SLIDES.length}`;
  document.getElementById("progress").style.width =
    `${((current + 1) / SLIDES.length) * 100}%`;
  document.getElementById("prev").disabled = current === 0;
  document.getElementById("next").disabled = current === SLIDES.length - 1;
}
// Ролік на актыўным слайдзе стартуе адразу; калі браўзер забараніў гук –
// стартуе без гуку і паказвае кнопку «Уключыць гук». Клік – паўза/працяг.
function setupClips() {
  stage.querySelectorAll(".clip-wrap").forEach((wrap) => {
    const v = wrap.querySelector("video");
    const sound = wrap.querySelector(".clip-sound");
    const play = () => v.play().catch(() => wrap.classList.add("paused"));
    v.addEventListener("loadedmetadata", () => {
      if (v.videoWidth && v.videoHeight)
        wrap.style.aspectRatio = `${v.videoWidth} / ${v.videoHeight}`;
    });
    v.addEventListener("play", () => wrap.classList.remove("paused"));
    v.addEventListener("pause", () => wrap.classList.add("paused"));
    wrap.addEventListener("click", (e) => {
      if (e.target.closest(".clip-sound")) {
        v.muted = false;
        sound.hidden = true;
        if (v.paused) play();
        return;
      }
      if (v.ended) v.currentTime = 0;
      v.paused ? play() : v.pause();
    });
    if (!wrap.closest(".slide.active")) return;
    v.muted = false;
    v.play().catch(() => {
      v.muted = true;
      v.play()
        .then(() => (sound.hidden = false))
        .catch(() => wrap.classList.add("paused"));
    });
  });
}
// Нумар слайда (1-based) захоўваецца ў hash URL, каб перазагрузка не збівала на пачатак.
const clampIndex = (n) => Math.max(0, Math.min(SLIDES.length - 1, n));
const fromHash = () => {
  const n = parseInt(location.hash.slice(1), 10);
  return Number.isFinite(n) ? clampIndex(n - 1) : 0;
};
function show(n) {
  current = clampIndex(n);
  const hash = `#${current + 1}`;
  if (location.hash !== hash) history.replaceState(null, "", hash);
  render();
}
window.addEventListener("hashchange", () => {
  const n = fromHash();
  if (n !== current) {
    current = n;
    render();
  }
});
document.getElementById("prev").onclick = () => show(current - 1);
document.getElementById("next").onclick = () => show(current + 1);
document.getElementById("full").onclick = () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else stage.requestFullscreen?.();
};
document.addEventListener("keydown", (e) => {
  if (["INPUT", "VIDEO"].includes(document.activeElement?.tagName)) return;
  if (["ArrowRight", "PageDown", " "].includes(e.key)) {
    e.preventDefault();
    show(current + 1);
  } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
    e.preventDefault();
    show(current - 1);
  } else if (e.key === "Home") show(0);
  else if (e.key === "End") show(SLIDES.length - 1);
  else if (e.key.toLowerCase() === "f") document.getElementById("full").click();
});
let touchX = 0;
stage.addEventListener(
  "touchstart",
  (e) => (touchX = e.changedTouches[0].clientX),
  { passive: true },
);
stage.addEventListener(
  "touchend",
  (e) => {
    let dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 60) show(current + (dx < 0 ? 1 : -1));
  },
  { passive: true },
);
current = fromHash();
render();
