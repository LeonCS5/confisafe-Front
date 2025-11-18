// Máscaras de Formatação
function aplicarMascaraCNPJ(valor) {
  valor = valor.replace(/\D/g, '');
  valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
  valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
  valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
  return valor;
}

function aplicarMascaraCPF(valor) {
  valor = valor.replace(/\D/g, '');
  valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
  valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
  valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return valor;
}

function aplicarMascaraTelefone(valor) {
  valor = valor.replace(/\D/g, '');
  valor = valor.replace(/(\d{2})(\d)/, '($1) $2');
  valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
  return valor;
}

// Aplicar máscaras nos campos
document.getElementById('cnpj').addEventListener('input', function(e) {
  e.target.value = aplicarMascaraCNPJ(e.target.value);
});

document.getElementById('cpf').addEventListener('input', function(e) {
  e.target.value = aplicarMascaraCPF(e.target.value);
});

document.getElementById('telefone').addEventListener('input', function(e) {
  e.target.value = aplicarMascaraTelefone(e.target.value);
});

// Validação do Formulário e Envio ao Backend
document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  // Obter valores do formulário
  const razaoSocial = document.getElementById('razaoSocial').value;
  const cnpj = document.getElementById('cnpj').value;
  const emailCorporativo = document.getElementById('emailCorporativo').value;
  const telefone = document.getElementById('telefone').value;
  const nomeResponsavel = document.getElementById('nomeResponsavel').value;
  const cpf = document.getElementById('cpf').value;
  const cargo = document.getElementById('cargo').value;
  const departamento = document.getElementById('departamento') ? document.getElementById('departamento').value : '';
  const ramal = document.getElementById('ramal') ? document.getElementById('ramal').value : '';
  const senha = document.getElementById('senha').value;
  const confirmarSenha = document.getElementById('confirmarSenha').value;

  // Validações no Frontend
  // Validar CNPJ
  const cnpjNumeros = cnpj.replace(/\D/g, '');
  if (cnpjNumeros.length !== 14) {
    exibirMensagem('CNPJ inválido! Digite os 14 dígitos.', 'erro');
    return;
  }

  // Validar CPF
  const cpfNumeros = cpf.replace(/\D/g, '');
  if (cpfNumeros.length !== 11) {
    exibirMensagem('CPF inválido! Digite os 11 dígitos.', 'erro');
    return;
  }

  // Validar senhas
  if (senha.length < 8) {
    exibirMensagem('A senha deve ter no mínimo 8 caracteres!', 'erro');
    return;
  }

  if (senha !== confirmarSenha) {
    exibirMensagem('As senhas não coincidem!', 'erro');
    return;
  }

  // Validar força da senha
  const temLetra = /[a-zA-Z]/.test(senha);
  const temNumero = /\d/.test(senha);

  if (!temLetra || !temNumero) {
    exibirMensagem('A senha deve conter letras e números!', 'erro');
    return;
  }

  // Verificar termos
  if (!document.getElementById('termos').checked) {
    exibirMensagem('Você precisa aceitar os Termos de Uso e Política de Privacidade.', 'erro');
    return;
  }

  // Preparar dados para envio
  const dados = {
    razaoSocial: razaoSocial,
    cnpj: cnpj,
    emailCorporativo: emailCorporativo,
    telefone: telefone,
    nomeResponsavel: nomeResponsavel,
    cpf: cpf,
    cargo: cargo,
    departamento: departamento,
    ramal: ramal,
    senha: senha,
    confirmarSenha: confirmarSenha
  };

  try {
    // Enviar dados ao Backend
    const resposta = await fetch('/api/cadastro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados)
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
      exibirMensagem('✅ Cadastro realizado com sucesso!\n\nEmpresa ID: ' + resultado.empresaId, 'sucesso');

      // 👉 salvar dados básicos do usuário logado
      try {
        const perfil = {
          nome: nomeResponsavel,
          cargo: cargo,
          email: emailCorporativo
        };
        sessionStorage.setItem('confisafe_user_profile', JSON.stringify(perfil));
      } catch (_) {}
      
      // Limpar formulário
      document.getElementById('registerForm').reset();

      // salvar email na sessão para facilitar login e carregar perfil
      try { sessionStorage.setItem('confisafe_logged_email', emailCorporativo); } catch (_) {}

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      // Erro retornado pelo backend
      exibirMensagem(resultado.mensagem || 'Erro ao realizar cadastro', 'erro');
    }
  } catch (erro) {
    console.error('Erro:', erro);
    exibirMensagem('Erro de conexão com o servidor. Verifique se o backend está rodando em http://localhost:8080', 'erro');
  }
});

// Função para exibir mensagens com estilo
function exibirMensagem(mensagem, tipo) {
  // Remover mensagem anterior se existir
  const mensagemAnterior = document.querySelector('.mensagem-feedback');
  if (mensagemAnterior) {
    mensagemAnterior.remove();
  }

  // Criar elemento de mensagem
  const divMensagem = document.createElement('div');
  divMensagem.className = `mensagem-feedback mensagem-${tipo}`;
  divMensagem.innerHTML = `<p>${mensagem}</p>`;

  // Adicionar estilo
  divMensagem.style.cssText = `
    padding: 15px;
    margin: 15px 0;
    border-radius: 8px;
    font-weight: 500;
    animation: slideDown 0.3s ease-out;
  `;

  if (tipo === 'sucesso') {
    divMensagem.style.backgroundColor = '#d4edda';
    divMensagem.style.color = '#155724';
    divMensagem.style.border = '1px solid #c3e6cb';
  } else if (tipo === 'erro') {
    divMensagem.style.backgroundColor = '#f8d7da';
    divMensagem.style.color = '#721c24';
    divMensagem.style.border = '1px solid #f5c6cb';
  }

  // Inserir após o header do card
  const cardHeader = document.querySelector('.card-header');
  cardHeader.insertAdjacentElement('afterend', divMensagem);

  // Remover mensagem após 5 segundos
  setTimeout(() => {
    divMensagem.style.opacity = '0';
    divMensagem.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => divMensagem.remove(), 300);
  }, 5000);
}