// ✅ login.js - Handles user login and redirect properly

(async function () {
  const form = document.getElementById("loginForm");
  const errEl = document.getElementById("loginError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Stop page reload
    errEl.classList.add("d-none"); // Hide error initially

    // Collect form data
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      // ✅ Send login request to backend
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // ✅ Important for session cookie
        body: JSON.stringify(payload)
      });

      // Expecting JSON response like { ok: true, redirect: "/index.html" }
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        errEl.textContent = data?.error || "Invalid email or password!";
        errEl.classList.remove("d-none");
        return;
      }

      // ✅ Redirect to home page if successful
      window.location.href = data.redirect || "/index.html";
      
    } catch (error) {
      console.error("Login Error:", error);
      errEl.textContent = "Network error. Please try again.";
      errEl.classList.remove("d-none");
    }
  });
})();
