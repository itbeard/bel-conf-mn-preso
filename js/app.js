let current = 0;
let videoUrl = null;
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
function render() {
  stage.innerHTML = SLIDES.map((s, i) => {
    let bg =
      s.photo != null
        ? `<img class="bgphoto ${s.type === "hero" || s.type === "thanks" ? "strong" : ""}" src="${im(s.photo)}" alt=""><div class="veil"></div>`
        : "";
    let logo = `<img class="logo" src="${LOGO}" alt="Лагатып Мова Нанова Уроцлаў"><div class="brand">УРОЦЛАЎ</div>`;
    let base = `${bg}${logo}<div class="eyebrow">${esc(s.eyebrow)}</div><h1 class="title">${esc(s.title)}</h1>`;
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
      body = `<div class="cards ${s.type === "functions" ? "five" : ""}">${s.items.map((a) => `<div class="card"><b>${s.type === "four" ? `<em>${esc(a[0])}</em>${esc(a[1])}` : esc(a[0])}</b><p>${esc(s.type === "four" ? a[2] : a[1])}</p></div>`).join("")}</div>${s.video ? `<div class="video-box" id="videoBox" role="button" tabindex="0">▶ Націсніце, каб дадаць відэа для гэтага слайда</div>` : ""}`;
    } else if (s.type === "institutions") {
      body = `<div class="cards"><div class="card"><b>${esc(s.left[0])}</b><p>${esc(s.left[1])}</p></div><div class="card"><b>${esc(s.right[0])}</b><p>${esc(s.right[1])}</p></div></div>`;
    } else if (s.type === "fullphoto") {
      base = `<img class="fullphoto-img" src="${im(s.photo)}" alt="">`;
      body = "";
    } else if (s.type === "format") {
      const pics = chosen[s.format] || [];
      const n = pics.length;
      const layout = n > 4 ? "count-many" : "count-" + n;
      const gallery = n
        ? `<div class="format-gallery ${layout}">${pics.map((src, j) => `<img src="${src}" alt="${esc(s.title)} — фота ${j + 1}">`).join("")}${n > 6 ? `<span class="more-count">+${n - 6} фота</span>` : ""}</div><div class="format-shade"></div>`
        : `<div class="empty" data-upload="${s.format}" role="button" tabindex="0">＋ Дадаць некалькі фотаздымкаў</div>`;
      base = `${logo}<div class="eyebrow">${esc(s.eyebrow)}</div>${gallery}<div class="format-title">${esc(s.title)}</div><div class="format-tools"><button data-upload="${s.format}">＋ ${n ? "Дадаць яшчэ фота" : "Дадаць фота"}</button>${n ? `<button class="secondary" data-clear="${s.format}">Ачысціць галерэю</button><span class="photo-total">${n} фота</span>` : ""}</div>`;
    }
    return `<section class="slide ${s.type} ${i === current ? "active" : ""}" aria-hidden="${i !== current}" data-slide="${i}">${base}${body}<div class="foot">МОВА НАНОВА · БЕЛАРУСЬ / ПОЛЬШЧА</div><div class="index">${String(i + 1).padStart(2, "0")} / ${String(SLIDES.length).padStart(2, "0")}</div></section>`;
  }).join("");
  document.querySelectorAll("[data-upload]").forEach((el) =>
    el.addEventListener("click", () => {
      uploadFor = +el.dataset.upload;
      document.getElementById("photoInput").click();
    }),
  );
  document.querySelectorAll("[data-clear]").forEach((el) =>
    el.addEventListener("click", () => {
      const k = +el.dataset.clear;
      (chosen[k] || []).forEach((url) => URL.revokeObjectURL(url));
      chosen[k] = [];
      render();
    }),
  );
  const vb = document.getElementById("videoBox");
  if (vb) {
    vb.addEventListener("click", () =>
      document.getElementById("videoInput").click(),
    );
    if (videoUrl)
      vb.innerHTML = `<video src="${videoUrl}" controls onclick="event.stopPropagation()"></video><span>Націсніце, каб замяніць відэа</span>`;
  }
  document.getElementById("counter").textContent =
    `${current + 1} / ${SLIDES.length}`;
  document.getElementById("progress").style.width =
    `${((current + 1) / SLIDES.length) * 100}%`;
  document.getElementById("prev").disabled = current === 0;
  document.getElementById("next").disabled = current === SLIDES.length - 1;
}
let uploadFor = 0;
document.getElementById("photoInput").addEventListener("change", (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length) {
    chosen[uploadFor] ??= [];
    chosen[uploadFor].push(
      ...files
        .filter((f) => f.type.startsWith("image/"))
        .map((f) => URL.createObjectURL(f)),
    );
    render();
  }
  e.target.value = "";
});
document.getElementById("videoInput").addEventListener("change", (e) => {
  const f = e.target.files?.[0];
  if (f) {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    videoUrl = URL.createObjectURL(f);
    render();
  }
  e.target.value = "";
});
function show(n) {
  current = Math.max(0, Math.min(SLIDES.length - 1, n));
  render();
}
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
render();
