const adminPanelBtn = document.getElementById("adminPanelBtn");
const logoutBtn = document.getElementById("logoutBtn");

const petList = document.getElementById("petDropdownList");
const addPetBtn = document.getElementById("addPetBtn");

const reminderContainer = document.getElementById("dashboardReminders");

const modal = new bootstrap.Modal(
  document.getElementById("addPetModal")
);


// LOAD USER AVATAR
async function loadUserAvatar() {

  try {

    const res = await fetch("/api/users/me", {
      credentials: "include"
    });

    if (!res.ok) return;

    const user = await res.json();

    const avatar = document.getElementById("userAvatar");

    avatar.src =
      user.profilePicture && user.profilePicture.length > 0
        ? user.profilePicture
        : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    if (user.role === "admin") {
      adminPanelBtn?.classList.remove("d-none");
    }

  } catch {

    window.location.href = "/";

  }

}


// LOAD REMINDERS
async function loadDashboardReminders() {

  try {

    const res = await fetch("/api/reminders", {
      credentials: "include"
    });

    if (!res.ok) {

      reminderContainer.innerHTML =
        "<p class='text-muted'>Unable to load reminders</p>";

      return;

    }

    const reminders = (await res.json())
      .filter(r => !r.completed)
      .sort((a,b) => new Date(a.date) - new Date(b.date));

    if (!reminders.length) {

      reminderContainer.innerHTML =
        "<p class='text-muted'>No upcoming reminders</p>";

      return;

    }

    reminderContainer.innerHTML = "";

    reminders.slice(0,5).forEach(reminder => {

      const div = document.createElement("div");

      div.className = "mb-3 border-bottom pb-2";

      div.innerHTML = `
        <strong>🐾 ${reminder.pet.name}</strong>

        <div>
          ${reminder.task}
        </div>

        <div class="small text-muted">
          ${new Date(reminder.date).toLocaleString()}
        </div>
      `;

      reminderContainer.appendChild(div);

    });

  } catch {

    reminderContainer.innerHTML =
      "<p class='text-muted'>Error loading reminders</p>";

  }

}


// PET DROPDOWN
async function loadPets() {

  try {

    const res = await fetch("/api/pets", {
      credentials: "include"
    });

    const pets = await res.json();

    petList.innerHTML = "";

    if (!pets.length) {

      petList.innerHTML =
        `<li class="dropdown-item text-muted">No pets yet</li>`;

      return;

    }

    pets.forEach(pet => {

      const li = document.createElement("li");

      li.innerHTML = `
        <div class="dropdown-item d-flex justify-content-between align-items-center">

          <a href="/pet.html?petId=${pet._id}"
             class="text-decoration-none flex-grow-1">
             🐾 ${pet.name}
          </a>

          <button class="btn btn-sm btn-outline-danger delete-pet"
                  data-id="${pet._id}">
            🗑
          </button>

        </div>
      `;

      petList.appendChild(li);

    });

    attachDeleteHandlers();

  } catch {

    petList.innerHTML =
      `<li class="dropdown-item text-danger">Failed to load pets</li>`;

  }

}


function attachDeleteHandlers() {

  document.querySelectorAll(".delete-pet").forEach(btn => {

    btn.onclick = async (e) => {

      e.stopPropagation();

      if (!confirm("Delete this pet?")) return;

      await fetch(`/api/pets/${btn.dataset.id}`, {
        method: "DELETE",
        credentials: "include"
      });

      loadPets();

    };

  });

}


// ADD PET
addPetBtn?.addEventListener("click", () => modal.show());

document
  .getElementById("addPetForm")
  ?.addEventListener("submit", async (e) => {

    e.preventDefault();

    const body = {
      name: petName.value,
      species: petSpecies.value,
      breed: petBreed.value
    };

    const res = await fetch("/api/pets", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      credentials: "include",

      body: JSON.stringify(body)

    });

    if (res.ok) {

      modal.hide();
      e.target.reset();
      loadPets();

    }

  });


// NAV BUTTONS
adminPanelBtn?.addEventListener("click", () => {
  window.location.href = "/admin.html";
});

logoutBtn?.addEventListener("click", async () => {

  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include"
  });

  window.location.href = "/";

});


// INIT
loadUserAvatar();
loadPets();
loadDashboardReminders();