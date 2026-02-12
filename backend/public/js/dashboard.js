async function checkAdminButton() {
	try {
	  const res = await fetch("/api/auth/me", {
		credentials: "include",
	  });
  
	  if (!res.ok) return;
  
	  const data = await res.json();
  
	  if (data.role === "admin") {
		document.getElementById("backToAdminBtn").classList.remove("d-none");
	  }
	} catch (err) {
	  // ignore
	}
  }
  
  document.getElementById("backToAdminBtn").addEventListener("click", () => {
	window.location.href = "/admin.html";
  });
  
  checkAdminButton();
  
  