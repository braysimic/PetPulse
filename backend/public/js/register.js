document.getElementById("registerForm").addEventListener("submit", async (e) => {
	e.preventDefault();
  
	const email = document.getElementById("email").value;
	const password = document.getElementById("password").value;
  
	const msg = document.getElementById("registerMessage");
	msg.innerHTML = "";
  
	try {
	  const res = await fetch("/api/auth/register", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	  });
  
	  const data = await res.json();
  
	  if (!res.ok) {
		msg.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
		return;
	  }
  
	  msg.innerHTML = `<div class="alert alert-success">${data.message} You can now log in.</div>`;
  
	  setTimeout(() => {
		window.location.href = "/";
	  }, 1200);
  
	} catch (err) {
	  msg.innerHTML = `<div class="alert alert-danger">Server error. Try again.</div>`;
	}
  });
  