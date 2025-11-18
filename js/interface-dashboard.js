// /* ============================================================
//    INTERFACE DO DASHBOARD
//    ============================================================ */
// function initializeDashboardUI() {
//   const menuLinks = document.querySelectorAll(".sidebar-menu a");
//   const logoutBtn = document.getElementById("logoutBtn");

//   // === Gerenciar menu ativo ===
//   menuLinks.forEach((link) => {
//     link.addEventListener("click", () => {
//       menuLinks.forEach((l) => l.classList.remove("active"));
//       link.classList.add("active");
//     });
//   });

//   // === Botão de sair ===
//   if (logoutBtn) {
//     logoutBtn.addEventListener("click", (e) => {
//       e.preventDefault();
//       alert("Você saiu do sistema."); // Substituir por lógica real
//       window.location.href = "../pages/login.html";
//     });
//   }
// }