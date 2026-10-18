const loadBtn = document.getElementById("load-users");
const filterInput = document.getElementById("filter-input");
const statusEl = document.getElementById("status");
const usersList = document.getElementById("users-list");

let users = [];

function renderUsers(list) {
  usersList.innerHTML = "";

  if (list.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No users match your filter.";
    usersList.appendChild(li);
    return;
  }

  list.forEach(function (user) {
    const li = document.createElement("li");

    const name = document.createElement("strong");
    name.textContent = user.name;

    const details = document.createElement("div");
    details.textContent =
      "Email: " + user.email +
      " | City: " + user.address.city +
      " | Company: " + user.company.name;

    li.appendChild(name);
    li.appendChild(details);
    usersList.appendChild(li);
  });
}

async function loadUsers() {
  statusEl.textContent = "Loading...";
  loadBtn.disabled = true;

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!response.ok) {
      throw new Error("Request failed with status " + response.status);
    }
    users = await response.json();
    renderUsers(users);
    statusEl.textContent = "Loaded " + users.length + " users.";
  } catch (error) {
    statusEl.textContent = "Error: could not load users. " + error.message;
  } finally {
    loadBtn.disabled = false;
  }
}

filterInput.addEventListener("input", function () {
  const term = filterInput.value.trim().toLowerCase();
  const filtered = users.filter(function (user) {
    return user.name.toLowerCase().includes(term);
  });
  renderUsers(filtered);
});

loadBtn.addEventListener("click", loadUsers);