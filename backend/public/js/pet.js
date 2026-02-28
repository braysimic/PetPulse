const params = new URLSearchParams(window.location.search);
const petId = params.get("petId");

async function loadPet() {
  try {
    const res = await fetch(`/api/pets/${petId}`, {
      credentials: "include",
    });

    if (!res.ok) {
      window.location.href = "/dashboard.html";
      return;
    }

    const pet = await res.json();

    document.getElementById("petName").innerText = pet.name;
    document.getElementById("petSpecies").innerText = pet.species;
    document.getElementById("petBreed").innerText = pet.breed;

  } catch {
    window.location.href = "/dashboard.html";
  }
}

loadPet();