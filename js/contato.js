// Seleciona o formulário
document.querySelector("form").addEventListener("submit", function(e) {
  e.preventDefault(); // Impede pagina de recarregar

  // Gurada os valores dos campos
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const motivo = document.getElementById("motivo").value;
  const mensagem = document.getElementById("mensagem").value.trim();

  // Validação 
  if (!nome || !email || !motivo || !mensagem) {
    alert("Por favor, preencha todos os campos antes de enviar.");
    return;
  }

  // Validação básica de e-mail
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(email)) {
    alert("Insira um e-mail válido.");
    return;
  }

  // Exibe mensagem de sucesso
  alert("Sua mensagem foi enviada com sucesso!\nA equipe ConfiSafe entrará em contato em breve.");

  // Limpa o formulário
  e.target.reset();
});