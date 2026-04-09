const params = new URLSearchParams(window.location.search);
const petId = params.get("petId");

const form = document.getElementById("petForm");
const message = document.getElementById("petMessage");
const deleteBtn = document.getElementById("deletePetBtn");

const reminderForm = document.getElementById("reminderForm");
const reminderList = document.getElementById("reminderList");

const petImage = document.getElementById("petImage");
const petPicture = document.getElementById("petPicture");

// ===== VIEW MODE =====
const petView = document.getElementById("petView");
const editBtn = document.getElementById("editBtn");
const cancelEdit = document.getElementById("cancelEdit");

const viewName = document.getElementById("viewName");
const viewSpecies = document.getElementById("viewSpecies");
const viewBreed = document.getElementById("viewBreed");


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

    // EDIT FORM
    petName.value = pet.name;
    petSpecies.value = pet.species;
    petBreed.value = pet.breed;

    // VIEW MODE
    viewName.innerText = pet.name;
    viewSpecies.innerText = pet.species;
    viewBreed.innerText = pet.breed;

    // IMAGE
    petImage.src = pet.image && pet.image.length > 0
      ? pet.image
      : "https://cdn-icons-png.flaticon.com/512/616/616408.png";

  } catch {
    window.location.href = "/dashboard.html";
  }
}


// ================= IMAGE UPLOAD =================
petPicture?.addEventListener("change", async () => {

  if (!petPicture.files.length) return;

  const formData = new FormData();
  formData.append("image", petPicture.files[0]);

  const res = await fetch(`/api/pets/${petId}/image`, {
    method: "POST",
    credentials: "include",
    body: formData
  });

  const data = await res.json();

  if (res.ok) {
    petImage.src = data.image;
  } else {
    alert("Upload failed");
  }
});


// ================= TOGGLE EDIT =================
editBtn?.addEventListener("click", () => {
  petView.classList.add("d-none");
  form.classList.remove("d-none");
});

cancelEdit?.addEventListener("click", () => {
  form.classList.add("d-none");
  petView.classList.remove("d-none");
});


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
    headers: { "Content-Type": "application/json" },
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

  viewName.innerText = petName.value;
  viewSpecies.innerText = petSpecies.value;
  viewBreed.innerText = petBreed.value;

  form.classList.add("d-none");
  petView.classList.remove("d-none");
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