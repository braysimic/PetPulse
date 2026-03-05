const params = new URLSearchParams(window.location.search);
const petId = params.get("petId");

const form = document.getElementById("petForm");
const message = document.getElementById("petMessage");
const deleteBtn = document.getElementById("deletePetBtn");

// ================= LOAD PET =================
async function loadPet() {

  try {

    const res = await fetch(`/api/pets/${petId}`, {
      credentials: "include"
    });

    if (!res.ok) {
      window.location.href = "/dashboard.html";
      return;
    }

    const pet = await res.json();

    petName.value = pet.name;
    petSpecies.value = pet.species;
    petBreed.value = pet.breed;

  } catch {
    window.location.href = "/dashboard.html";
  }

}

// ================= UPDATE PET =================
form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const body = {
    name: petName.value,
    species: petSpecies.value,
    breed: petBreed.value
  };

  const res = await fetch(`/api/pets/${petId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    message.innerHTML =
      `<div class="alert alert-danger">${data.error}</div>`;
    return;
  }

  message.innerHTML =
    `<div class="alert alert-success">Pet updated successfully</div>`;

});

// ================= DELETE PET =================
deleteBtn.addEventListener("click", async () => {

  if (!confirm("Delete this pet permanently?")) return;

  const res = await fetch(`/api/pets/${petId}`, {
    method: "DELETE",
    credentials: "include"
  });

  if (res.ok) {
    window.location.href = "/dashboard.html";
  }

});

// ================= INIT =================
loadPet();