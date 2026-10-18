const note = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeBtn = document.getElementById("theme-toggle");

function updateCounts() {
  const text = note.value;
  const chars = text.length;
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  charCount.textContent = chars + " / 200 characters";
  wordCount.textContent = words + " words";

  charCount.classList.toggle("warning", chars > 180 && chars <= 200);
  charCount.classList.toggle("over", chars > 200);
}

function clearAll() {
  note.value = "";
  localStorage.removeItem("draft");
  updateCounts();
}

function applyTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  themeBtn.textContent = isDark ? "Light mode" : "Dark mode";
}

note.addEventListener("input", function () {
  updateCounts();
  localStorage.setItem("draft", note.value);
});

note.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    clearAll();
  }
});

clearBtn.addEventListener("click", clearAll);

themeBtn.addEventListener("click", function () {
  const isDark = !document.body.classList.contains("dark");
  applyTheme(isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// On page load: restore draft and theme
note.value = localStorage.getItem("draft") || "";
applyTheme(localStorage.getItem("theme") === "dark");
updateCounts();