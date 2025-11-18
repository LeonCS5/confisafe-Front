document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const msg  = document.getElementById("login-message");
  const btn  = document.getElementById("btn-login");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!email || !senha) {
      msg.textContent = "Por favor, preencha todos os campos!";
      msg.style.color = "crimson";
      return;
    }

    btn.disabled = true;
    btn.textContent = "Entrando...";

    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email, senha })
      });

      let data = {};
      try { data = await resp.json(); } catch (_) {}

      if (resp.ok && data.autenticado) {
        msg.textContent = data.mensagem || "Login realizado com sucesso!";
        msg.style.color = "green";

        // redireciona após pequeno delay
        // salva e-mail logado na sessão para uso em outras páginas
        try { sessionStorage.setItem('confisafe_logged_email', email); } catch (_) {}

        setTimeout(() => {
          window.location.href = "/pages/inicial.html"; // ajuste o caminho se precisar
        }, 600);
      } else {
        msg.textContent = (data && data.mensagem) || "E-mail ou senha inválidos.";
        msg.style.color = "crimson";
      }
    } catch (err) {
      console.error(err);
      msg.textContent = "Erro ao conectar com o servidor.";
      msg.style.color = "crimson";
    } finally {
      btn.disabled = false;
      btn.textContent = "Entrar";
    }
  });
});
