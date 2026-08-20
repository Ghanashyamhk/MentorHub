// Apply entry animation
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-enter");
});

// Intercept navigation clicks
document.addEventListener("click", (e) => {
  const link = e.target.closest("a");

  if (!link || !link.href) return;

  // Only same-site navigation
  if (link.target === "_blank") return;

  e.preventDefault();

  document.body.classList.remove("page-enter");
  document.body.classList.add("page-exit");

  setTimeout(() => {
    window.location.href = link.href;
  }, 300);
});
