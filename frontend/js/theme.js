const toggle = document.getElementById("themeToggle");

/* LOAD SAVED THEME */
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  if(toggle) toggle.innerText = "☀";
}

/* TOGGLE */
if (toggle) {
  toggle.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
      toggle.innerText = "☀";
    } else {
      localStorage.setItem("theme", "light");
      toggle.innerText = "🌙";
    }
  });
}
