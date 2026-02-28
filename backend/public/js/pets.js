const petList = document.getElementById("petList");
const addPetBtn = document.getElementById("addPetBtn");
const addPetForm = document.getElementById("addPetForm");
const petMessage = document.getElementById("petMessage");

const modal = new bootstrap.Modal(
  document.getElementById("addPetModal")
);

// ============================
// LOAD PETS
// ============================
async function loadPets() {
  petList.innerHTML =
    `<li class="dropdown-item text-muted">Loading...</li>`;

  try {
    const res = await fetch("/api/pets", {
      credentials: "include"
    });

    const pets = await res.json();

    if (!pets.length) {
      petList.innerHTML =
        `<li class="dropdown-item text-muted">
          No pets yet
        </li>`;
      return;
    }

    petList.innerHTML = "";

    pets.forEach(pet => {
      const li = document.createElement("li");

      li.innerHTML = `
        <div class="dropdown-item d-flex justify-content-between align-items-center">
          <span>🐾 ${pet.name}</span>

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
      `<li class="dropdown-item text-danger">
        Failed to load pets
      </li>`;
  }
}

// ============================
// DELETE PET
// ============================
function attachDeleteHandlers() {
  document.querySelectorAll(".delete-pet").forEach(btn => {
    btn.addEventListener("click", async () => {

      if (!confirm("Delete this pet?")) return;

      await fetch(`/api/pets/${btn.dataset.id}`, {
        method: "DELETE",
        credentials: "include"
      });

      loadPets();
    });
  });
}

// ============================
// ADD PET
// ============================
addPetBtn.addEventListener("click", () => {
  modal.show();
});

addPetForm.addEventListener("submit", async (e) => {
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

  const data = await res.json();

  if (!res.ok) {
    petMessage.innerHTML =
      `<div class="alert alert-danger">${data.error}</div>`;
    return;
  }

  petMessage.innerHTML =
    `<div class="alert alert-success">Pet added!</div>`;

  addPetForm.reset();
  modal.hide();
  loadPets();
});

// ============================
// INIT
// ============================
loadPets();