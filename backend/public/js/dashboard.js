const adminPanelBtn = document.getElementById("adminPanelBtn");
const logoutBtn = document.getElementById("logoutBtn");
const activityContainer = document.getElementById("dashboardActivities");

const petList = document.getElementById("petDropdownList");
const addPetBtn = document.getElementById("addPetBtn");

const modal = new bootstrap.Modal(
  document.getElementById("addPetModal")
);

//LOAD USER AVATAR
async function loadUserAvatar() {
  try {
    const res = await fetch("/api/users/me", {
      credentials: "include",
    });

    if (!res.ok) return;

    const user = await res.json();

    const avatar = document.getElementById("userAvatar");

    if (user.profilePicture && user.profilePicture.length > 0) {
      avatar.src = user.profilePicture;
    } else {
      avatar.src =
        "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    }

    if (user.role === "admin") {
      adminPanelBtn?.classList.remove("d-none");
    }

  } catch {
    window.location.href = "/";
  }
}

//ACTIVITIES
async function loadDashboardActivities() {
  try {
    const res = await fetch("/api/activities", {
      credentials: "include",
    });

    if (!res.ok) {
      activityContainer.innerHTML =
        "<p class='text-muted'>Unable to load activities.</p>";
      return;
    }

    const activities = await res.json();

    if (!activities.length) {
      activityContainer.innerHTML =
        "<p class='text-muted'>No activities yet.</p>";
      return;
    }

    const upcoming = activities
      .filter(a => !a.completed)
      .slice(0, 5);

    activityContainer.innerHTML = "";

    upcoming.forEach((a) => {
      const div = document.createElement("div");
      div.className = "mb-3";

      div.innerHTML = `
        <strong>${a.title}</strong>
        <div class="small text-muted">
          ${new Date(a.date).toLocaleString()}
        </div>
      `;

      activityContainer.appendChild(div);
    });

  } catch {
    activityContainer.innerHTML =
      "<p class='text-muted'>Error loading activities.</p>";
  }
}

//PET DROPDOWN
async function loadPets() {
  try {
    const res = await fetch("/api/pets", {
      credentials: "include",
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
        credentials: "include",
      });

      loadPets();
    };
  });
}

//ADD PET
addPetBtn.addEventListener("click", () => modal.show());

document
  .getElementById("addPetForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      name: petName.value,
      species: petSpecies.value,
      breed: petBreed.value,
    };

    const res = await fetch("/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (res.ok) {
      modal.hide();
      e.target.reset();
      loadPets();
    }
  });

//  NAV BUTTONS 
adminPanelBtn?.addEventListener("click", () => {
  window.location.href = "/admin.html";
});

logoutBtn.addEventListener("click", async () => {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  window.location.href = "/";
});

//  INIT 
loadUserAvatar();
loadDashboardActivities();
loadPets();