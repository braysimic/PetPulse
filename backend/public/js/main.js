document.getElementById("loginForm").addEventListener("submit", async (e) => {
	e.preventDefault();
  
	const email = document.getElementById("email").value;
	const password = document.getElementById("password").value;
  
	const msg = document.getElementById("loginMessage");
	msg.innerHTML = "";
  
	try {
	  const res = await fetch("/api/auth/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	  });
  
	  const data = await res.json();
  
	  if (!res.ok) {
		msg.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
		return;
	  }
  
	  msg.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
  
	  // Temporary redirect (later will go to dashboard)
	  setTimeout(() => {
		window.location.href = "/dashboard.html";
	  }, 900);
  
	} catch (err) {
	  msg.innerHTML = `<div class="alert alert-danger">Server error. Try again.</div>`;
	}
  });
  