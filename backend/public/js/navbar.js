async function loadNavbar() {
  const container = document.getElementById("navbarContainer");
  if (!container) return;

  const res = await fetch("/navbar.html");
  const html = await res.text();

  container.innerHTML = html;

  initNavbar(); // run logic AFTER navbar is inserted
}


// ================= NAVBAR LOGIC =================

function initNavbar() {

  const adminPanelBtn = document.getElementById("adminPanelBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const petList = document.getElementById("petDropdownList");
  const addPetBtn = document.getElementById("addPetBtn");

  const notificationContainer = document.getElementById("notificationList");

  const modalEl = document.getElementById("addPetModal");
  const modal = modalEl ? new bootstrap.Modal(modalEl) : null;


  // LOAD USER AVATAR
  async function loadUserAvatar() {
    try {
      const res = await fetch("/api/users/me", {
        credentials: "include"
      });

      if (!res.ok) return;

      const user = await res.json();

      const avatar = document.getElementById("userAvatar");

      if (avatar) {
        avatar.src =
          user.profilePicture && user.profilePicture.length > 0
            ? user.profilePicture
            : "https://cdn-icons-png.flaticon.com/512/149/149071.png";
      }

      if (user.role === "admin") {
        adminPanelBtn?.classList.remove("d-none");
      }

    } catch {
      window.location.href = "/";
    }
  }


  // 🔔 LOAD NOTIFICATIONS
  async function loadNotifications() {
    if (!notificationContainer) return;

    try {
      const res = await fetch("/api/reminders", {
        credentials: "include"
      });

      if (!res.ok) {
        notificationContainer.innerHTML =
          "<li class='dropdown-item text-danger'>Failed to load reminders</li>";
          return;
      }

      const reminders = await res.json();

      const now = new Date();
      const oneHour = new Date(now.getTime() + 60 * 60 * 1000);

      const upcoming = reminders.filter(r => {
        if (r.completed) return false;
        const time = new Date(r.date);
        return time >= now && time <= oneHour;
      });

      notificationContainer.innerHTML = "";

      if (!upcoming.length) {
        notificationContainer.innerHTML =
          "<li class='dropdown-item text-muted'>No reminders soon</li>";
        return;
      }

      upcoming.forEach(reminder => {
        const li = document.createElement("li");
        li.className = "dropdown-item small";

        li.innerHTML = `
          <strong>${reminder.pet.name}</strong><br>
          ${reminder.task}<br>
          <span class="text-muted">
            ${new Date(reminder.date).toLocaleTimeString()}
          </span>
        `;

        notificationContainer.appendChild(li);
      });

    } catch {
      notificationContainer.innerHTML =
        "<li class='dropdown-item text-danger'>Error loading reminders</li>";
    }
  }


  // LOAD PETS
  async function loadPets() {
    if (!petList) return;

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
            <a href="/pet.html?petId=${pet._id}" class="text-decoration-none flex-grow-1">
              🐾 ${pet.name}
            </a>
            <button class="btn btn-sm btn-outline-danger delete-pet" data-id="${pet._id}">
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
  addPetBtn?.addEventListener("click", () => modal?.show());

  document.getElementById("addPetForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      name: petName.value,
      species: petSpecies.value,
      breed: petBreed.value
    };

    const res = await fetch("/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    });

    if (res.ok) {
      modal?.hide();
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


  // INIT CALLS
  loadUserAvatar();
  loadPets();
  loadNotifications();
}


// RUN EVERYTHING
loadNavbar();