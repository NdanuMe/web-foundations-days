let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

// Lower-case, trim and collapse repeated spaces
function normalize(text) {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

function searchNotes(word) {
  const term = word.toLowerCase();
  return notes.filter(function (note) {
    return note.text.toLowerCase().includes(term);
  });
}

function longestNote() {
  if (notes.length === 0) {
    return null;
  }
  let longest = notes[0];
  for (const note of notes) {
    if (note.text.length > longest.text.length) {
      longest = note;
    }
  }
  return longest;
}

function countByCategory() {
  const counts = { personal: 0, work: 0, study: 0 };
  for (const note of notes) {
    counts[note.category] = (counts[note.category] || 0) + 1;
  }
  return counts;
}

function getSummary() {
  const counts = countByCategory();
  const word = notes.length === 1 ? "note" : "notes";
  return `${notes.length} ${word}: ${counts.personal} personal, ${counts.work} work, ${counts.study} study.`;
}

function isDuplicate(text) {
  const target = normalize(text);
  return notes.some(function (note) {
    return normalize(note.text) === target;
  });
}

function addNote(text, category) {
  const cleaned = text.trim();
  const cat = category.trim().toLowerCase();

  if (cleaned.length < 1 || cleaned.length > 200) {
    console.log("Not added: text must be 1-200 characters.");
    return false;
  }
  if (isDuplicate(cleaned)) {
    console.log("Not added: duplicate note.");
    return false;
  }
  if (cat !== "personal" && cat !== "work" && cat !== "study") {
    console.log("Not added: category must be personal, work or study.");
    return false;
  }

  const nextId = notes.length === 0 ? 1 : Math.max(...notes.map(function (n) { return n.id; })) + 1;
  notes.push({ id: nextId, text: cleaned, category: cat });
  return true;
}

// ---------- TESTS ----------

// searchNotes
console.log(searchNotes("milk"));  // [ { id: 1, text: "Buy milk and bread", category: "personal" } ]
console.log(searchNotes("MILK"));  // same as above (case ignored)
console.log(searchNotes("zebra")); // [] (edge case: no results)

// longestNote
console.log(longestNote()); // { id: 3, text: "Email the project report to Grace", category: "work" }
const backup = notes;
notes = [];
console.log(longestNote()); // null (edge case: empty array)
notes = backup;

// countByCategory
console.log(countByCategory()); // { personal: 2, work: 1, study: 2 }
notes = [notes[0]];
console.log(countByCategory()); // { personal: 1, work: 0, study: 0 } (edge case: one note)
notes = backup;

// getSummary
console.log(getSummary()); // "5 notes: 2 personal, 1 work, 2 study."
notes = [notes[0]];
console.log(getSummary()); // "1 note: 1 personal, 0 work, 0 study." (edge case: exactly one note)
notes = backup;

// isDuplicate
console.log(isDuplicate("buy milk and bread"));      // true
console.log(isDuplicate("  BUY   milk and bread ")); // true (extra spaces and case ignored)
console.log(isDuplicate("Walk the dog"));            // false

// addNote (run last, because these change the notes array)
console.log(addNote("Walk the dog", "personal"));  // true
console.log(getSummary());                         // "6 notes: 3 personal, 1 work, 2 study."
console.log(addNote("Walk the dog", "personal"));  // logs duplicate reason, then false
console.log(addNote("", "work"));                  // logs length reason, then false
console.log(addNote("x".repeat(201), "work"));     // logs length reason, then false
console.log(addNote("Read a book", "hobby"));      // logs category reason, then false