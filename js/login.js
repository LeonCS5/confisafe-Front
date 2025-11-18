document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const msg  = document.getElementById("login-message");
  const btn  = document.getElementById("btn-login");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    // Validação básica: campos obrigatórios
    if (!email || !senha) {
      msg.textContent = "Por favor, preencha todos os campos!";
      msg.style.color = "crimson";
      return;
    }

    // Aqui NÃO chama mais backend, é só um mock para página estática
    btn.disabled = true;
    btn.textContent = "Entrando...";

    // Mensagem "fake" de sucesso
    msg.textContent = "Login realizado com sucesso! (modo estático)";
    msg.style.color = "green";

    // Guarda o e-mail na sessão (opcional, mas mantive igual ao seu)
    try {
      sessionStorage.setItem("confisafe_logged_email", email);
    } catch (_) {}

    // Redireciona depois de um pequeno delay
    setTimeout(() => {
      window.location.href = "/pages/inicial.html"; // ajuste o caminho se precisar
    }, 600);
  });
});