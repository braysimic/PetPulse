const form = document.getElementById("profileForm");
const messageDiv = document.getElementById("profileMessage");
const bioField = document.getElementById("bio");
const bioCount = document.getElementById("bioCount");
const avatarPreview = document.getElementById("avatarPreview");
const avatarPlaceholder = document.getElementById("avatarPlaceholder");

// ===== Character Counter =====
bioField.addEventListener("input", () => {
  bioCount.textContent = bioField.value.length;
});

// ===== Load Profile =====
async function loadProfile() {
  try {
    const res = await fetch("/api/users/me", {
      credentials: "include",
    });

    if (res.status === 401) {
      window.location.href = "/";
      return;
    }

    const user = await res.json();

    document.getElementById("name").value = user.name || "";
    document.getElementById("email").value = user.email || "";
    bioField.value = user.bio || "";

    bioCount.textContent = bioField.value.length;

    if (user.profilePicture) {
      avatarPreview.src = user.profilePicture;
      avatarPreview.classList.remove("d-none");
      avatarPlaceholder.classList.add("d-none");
    }

  } catch (err) {
    messageDiv.innerHTML =
      '<div class="alert alert-danger">Failed to load profile.</div>';
  }
}

// ===== Save Profile =====
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  messageDiv.innerHTML = "";

  const formData = new FormData();
  formData.append("name", document.getElementById("name").value.trim());
  formData.append("email", document.getElementById("email").value.trim());
  formData.append("bio", bioField.value.trim());

  const fileInput = document.getElementById("profilePicture");
  if (fileInput.files[0]) {
    formData.append("profilePicture", fileInput.files[0]);
  }

  try {
    const res = await fetch("/api/users/me", {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      messageDiv.innerHTML = `
        <div class="alert alert-danger">${data.error}</div>
      `;
      return;
    }

    messageDiv.innerHTML = `
      <div class="alert alert-success">${data.message}</div>
    `;

    loadProfile();

  } catch (err) {
    messageDiv.innerHTML =
      '<div class="alert alert-danger">Server error.</div>';
  }
});

loadProfile();
