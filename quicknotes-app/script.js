const form = document.getElementById("note-form");
const noteInput = document.getElementById("note-input");
const categorySelect = document.getElementById("category-select");
const errorMessage = document.getElementById("error-message");
const searchInput = document.getElementById("search-input");
const noteCount = document.getElementById("note-count");
const notesList = document.getElementById("notes-list");

let notes = JSON.parse(localStorage.getItem("notes")) || [];

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function updateCount() {
  if (notes.length === 0) {
    noteCount.textContent = "You have no notes yet.";
  } else if (notes.length === 1) {
    noteCount.textContent = "You have 1 note.";
  } else {
    noteCount.textContent = "You have " + notes.length + " notes.";
  }
}

function render() {
  const term = searchInput.value.trim().toLowerCase();
  const visible = notes.filter(function (n) {
    return n.text.toLowerCase().includes(term);
  });

  notesList.innerHTML = "";

  if (notes.length > 0 && visible.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No notes match your search.";
    notesList.appendChild(li);
  }

  visible.forEach(function (n) {
    const li = document.createElement("li");
    li.className = "note-card category-" + n.category.toLowerCase();

    const text = document.createElement("p");
    text.textContent = n.text;

    const meta = document.createElement("p");
    meta.className = "note-meta";
    meta.textContent = n.category + " · " + n.createdAt;

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete-btn";
    del.textContent = "Delete";
    del.addEventListener("click", function () {
      notes = notes.filter(function (x) { return x.id !== n.id; });
      saveNotes();
      render();
    });

    li.appendChild(text);
    li.appendChild(meta);
    li.appendChild(del);
    notesList.appendChild(li);
  });

  updateCount();
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const text = noteInput.value.trim();

  if (text === "") {
    errorMessage.textContent = "Please type a note first.";
    return;
  }
  if (text.length > 200) {
    errorMessage.textContent = "Notes must be 200 characters or fewer.";
    return;
  }

  errorMessage.textContent = "";
  notes.push({
    id: Date.now(),
    text: text,
    category: categorySelect.value,
    createdAt: new Date().toLocaleString()
  });
  noteInput.value = "";
  saveNotes();
  render();
});

searchInput.addEventListener("input", render);

render();
document.getElementById("clear-all").addEventListener("click", function () {
  if (confirm("Delete all notes?")) {
    notes = [];
    saveNotes();
    render();
  }
});