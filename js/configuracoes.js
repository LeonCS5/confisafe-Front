/**
 * CONFISAFE - Configurações
 
 */

(function() {
  'use strict'; // Impede o uso de variáveis não declaradas, ajudando na segurança e boas práticas.

  // ===== ELEMENTOS DO DOMm paRA BUSCAR DO HTML =====
  // Aqui FICARAM  obtidos os elementos DO HTMLL usados pelo script.
  const menuToggle = document.getElementById('menuToggle'); // Botão que abre/fecha o menu lateral.
  const sidebar = document.getElementById('sidebar'); // Menu lateral.
  const logoutBtn = document.getElementById('logoutBtn'); // Botão de logout.
  const tabButtons = document.querySelectorAll('.tab-btn'); // Botões das abas.
  const tabContents = document.querySelectorAll('.tab-content'); // Conteúdo das abas.
  const profileForm = document.getElementById('profileForm'); // Formulário de perfil do usuário.
  const passwordForm = document.getElementById('passwordForm'); // Formulário de alteração de senha.
  const fotoPerfilInput = document.getElementById('fotoPerfil'); // 🔹 hidden da foto

  // ===== MENU PARA CELULAR =====
  // Abre e fecha o menu lateral no modo mobile.
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', function() {
      sidebar.classList.toggle('open'); // Alterna a classe "open".
    });

    // Fecha o menu se o usuário clicar fora dele (em telas pequenas).
    document.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      }
    });
  }

  // ===== LOGOUT PARA LIMPAR OS DADOS LOCAIS  =====
  // Realiza logout e limpa os dados locais.
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (confirm('Deseja realmente sair do sistema?')) {
        sessionStorage.clear(); // Limpa sessão atual.
        localStorage.clear(); // Limpa dados salvos localmente.
        window.location.href = '../pages/login.html'; // Redireciona para login.
      }
    });
  }

  // ===== TABS =====
  // Alterna entre abas (ex: perfil, segurança, notificações, etc.).
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetTab = this.dataset.tab;
      
      // Remove a classe "active" de todos os botões e conteúdos.
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Ativa a aba clicada.
      this.classList.add('active');
      
      const targetContent = document.getElementById(targetTab + '-tab');
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  // ===== FORMULÁRIO DE PERFIL =====
  // Salva os dados do perfil do usuário.
  if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Captura os valores dos campos.
      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('email').value.trim();
      const department = document.getElementById('department').value;
      const phone = document.getElementById('phone').value.trim();
      const ramal = document.getElementById('ramal').value.trim();
      const fotoPerfil = fotoPerfilInput ? (fotoPerfilInput.value || null) : null;
      

      // Verifica se os campos obrigatórios estão preenchidos.
      if (!fullName || !email) {
        showNotification('Preencha todos os campos obrigatórios!', 'warning');
        return;
      }

      // Validação simples de e-mail.
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNotification('Digite um e-mail válido!', 'warning');
        return;
      }

      // envia para o backend para atualizar o perfil
      const originalEmail = sessionStorage.getItem('confisafe_logged_email') || email;

      const payload = {
        originalEmail: originalEmail,
        email: email,
        nomeCompleto: fullName,
        departamento: department,
        telefone: phone,
        ramal: ramal,
        fotoPerfil: fotoPerfil // 🔹 vai bater com UpdateProfileRequest.fotoPerfil
      };

      fetch('/api/auth/atualizar-perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.autenticado) {

          // se o e-mail foi alterado, atualiza a sessão local
          try {
            sessionStorage.setItem('confisafe_logged_email', email);
          } catch (_) {}

          // 🔹 Atualiza o sidebar se ele existir nessa tela
          const nameEl = document.getElementById('userName');
          const roleEl = document.getElementById('userRole');
          if (nameEl) nameEl.textContent = fullName;
          if (roleEl) roleEl.textContent = department || 'Segurança';

          showNotification('✅ Perfil atualizado com sucesso!', 'success');
        } else {
          showNotification('❌ Erro: ' + (data.mensagem || 'Não foi possível atualizar o perfil'), 'danger');
        }
      })
      .catch(err => {
        console.error('Erro ao atualizar perfil:', err);
        showNotification('❌ Erro ao atualizar perfil. Tente novamente.', 'danger');
      });
    });
  }

  // ===== FORMULÁRIO DE SENHA =====
  // Valida e envia a troca de senha para o servidor.
  if (passwordForm) {
    passwordForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      // Verifica campos obrigatórios.
      if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Preencha todos os campos!', 'warning');
        return;
      }

      // Valida comprimento mínimo.
      if (newPassword.length < 8) {
        showNotification('A nova senha deve ter no mínimo 8 caracteres!', 'warning');
        return;
      }

      // Verifica se as senhas coincidem.
      if (newPassword !== confirmPassword) {
        showNotification('As senhas não coincidem!', 'warning');
        return;
      }

      // Verifica se contém letras e números.
      const hasLetter = /[a-zA-Z]/.test(newPassword);
      const hasNumber = /\d/.test(newPassword);
      
      if (!hasLetter || !hasNumber) {
        showNotification('A senha deve conter letras e números!', 'warning');
        return;
      }

      // Obter o email do usuário (você pode ajustar conforme necessário)
      const email = document.getElementById('email').value;

      // Envia a requisição para alterar a senha
      alterarSenha(email, currentPassword, newPassword);
    });
  }

  // ===== INICIALIZAÇÃO =====
  console.log('✅ Configurações carregadas');
  loadUserData(); // Carrega dados do usuário ao abrir a página.

  // ===== CARREGAR DADOS DO USUÁRIO =====
  function loadUserData() {
    // tenta carregar do servidor se o usuário estiver logado
    const loggedEmail = sessionStorage.getItem('confisafe_logged_email');
    if (loggedEmail) {
      fetch('/api/auth/perfil?email=' + encodeURIComponent(loggedEmail))
        .then(res => {
          if (!res.ok) throw new Error('Perfil não encontrado');
          return res.json();
        })
        .then(userData => {
          if (document.getElementById('fullName')) {
            document.getElementById('fullName').value = userData.nomeCompleto || '';
          }
          if (document.getElementById('email')) {
            document.getElementById('email').value = userData.email || '';
          }
          if (document.getElementById('department')) {
            document.getElementById('department').value = userData.departamento || 'seguranca';
          }
          if (document.getElementById('phone')) {
            document.getElementById('phone').value = userData.telefone || '';
          }
          if (document.getElementById('ramal')) {
            document.getElementById('ramal').value = userData.ramal || '';
          }

          // 🔹 Foto de perfil
          const preview = document.getElementById('avatarPreview');
          const sidebarAvatar = document.querySelector('.user-avatar');
          const defaultAvatar = '../assets/img/perfilimg.webp';

          if (userData.fotoPerfil) {
            if (preview) preview.src = userData.fotoPerfil;
            if (sidebarAvatar) sidebarAvatar.src = userData.fotoPerfil;
            if (fotoPerfilInput) fotoPerfilInput.value = userData.fotoPerfil;
          } else {
            if (preview) preview.src = defaultAvatar;
            if (sidebarAvatar) sidebarAvatar.src = defaultAvatar;
            if (fotoPerfilInput) fotoPerfilInput.value = '';
          }
        })
        .catch(err => {
          console.warn('Não foi possível carregar perfil do servidor, usando localStorage como fallback', err);
          const savedData = localStorage.getItem('confisafe_user_profile');
          if (savedData) {
            try {
              const userData = JSON.parse(savedData);
              if (document.getElementById('fullName')) document.getElementById('fullName').value = userData.fullName || '';
              if (document.getElementById('email')) document.getElementById('email').value = userData.email || '';
              if (document.getElementById('department')) document.getElementById('department').value = userData.department || 'seguranca';
              if (document.getElementById('phone')) document.getElementById('phone').value = userData.phone || '';
              if (document.getElementById('ramal')) document.getElementById('ramal').value = userData.ramal || '';
            } catch (e) { console.error('Erro ao carregar fallback local:', e); }
          }
        });
      return;
    }

    // fallback: carregar do localStorage se não estiver logado
    const savedData = localStorage.getItem('confisafe_user_profile');
    if (savedData) {
      try {
        const userData = JSON.parse(savedData);
        if (document.getElementById('fullName')) document.getElementById('fullName').value = userData.fullName || '';
        if (document.getElementById('email')) document.getElementById('email').value = userData.email || '';
        if (document.getElementById('department')) document.getElementById('department').value = userData.department || 'seguranca';
        if (document.getElementById('phone')) document.getElementById('phone').value = userData.phone || '';
        if (document.getElementById('ramal')) document.getElementById('ramal').value = userData.ramal || '';
      } catch (e) {
        console.error('Erro ao carregar dados do usuário:', e);
      }
    }
  }

  // ===== ALTERAR SENHA =====
  // Envia a requisição de alteração de senha para o backend
  function alterarSenha(email, senhaAtual, novaSenha) {
    const payload = {
      email: email,
      senhaAtual: senhaAtual,
      novaSenha: novaSenha
    };

    fetch('/api/auth/alterar-senha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      if (data && data.autenticado) {
        showNotification('✅ Senha alterada com sucesso! Faça login novamente.', 'success');
        // Limpa o formulário
        document.getElementById('passwordForm').reset();
        // Redireciona para login após 2 segundos
        setTimeout(() => {
          sessionStorage.clear();
          localStorage.clear();
          window.location.href = '../pages/login.html';
        }, 2000);
      } else {
        showNotification('❌ Erro: ' + (data && data.mensagem ? data.mensagem : 'Não foi possível alterar a senha'), 'danger');
      }
    })
    .catch(error => {
      console.error('Erro na requisição:', error);
      showNotification('❌ Erro ao alterar senha. Tente novamente.', 'danger');
    });
  }

})();

// ===== FUNÇÕES GLOBAIS =====

// Abre a aba de segurança para alterar senha
function abrirAlteracaoSenha() {
  // Simula clique no botão da aba de segurança
  const segurancaBtn = document.querySelector('[data-tab="seguranca"]');
  if (segurancaBtn) {
    segurancaBtn.click();
    
    // Foca no campo de senha atual
    setTimeout(() => {
      const currentPasswordField = document.getElementById('currentPassword');
      if (currentPasswordField) {
        currentPasswordField.focus();
      }
    }, 300);
  }
}

// Reseta o formulário de perfil.
function resetForm() {
  if (confirm('Descartar alterações?')) {
    document.getElementById('profileForm').reset();
    showNotification('Alterações descartadas.', 'info');
  }
}

// Mostra a prévia da imagem de perfil.
function previewAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Valida tamanho máximo (2MB).
  if (file.size > 2 * 1024 * 1024) {
    showNotification('❌ A imagem deve ter no máximo 2MB!', 'warning');
    event.target.value = '';
    return;
  }

  // Valida tipo do arquivo (apenas imagens).
  if (!file.type.startsWith('image/')) {
    showNotification('❌ Por favor, selecione uma imagem válida!', 'warning');
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result; // data:image/png;base64,...

    const preview = document.getElementById('avatarPreview');
    const sidebarAvatar = document.querySelector('.user-avatar');
    const fotoPerfilInput = document.getElementById('fotoPerfil'); // hidden

    // Atualiza prévia na página de configurações
    if (preview) {preview.src = dataUrl;}
    // Atualiza foto do sidebar (se existir nessa tela)
    if (sidebarAvatar) {sidebarAvatar.src = dataUrl;}
    // Guarda Base64 no input hidden para enviar ao backend no salvar perfil
    if (fotoPerfilInput) {fotoPerfilInput.value = dataUrl;}

    showNotification('✅ Foto de perfil atualizada! Não esqueça de salvar o perfil.', 'success');
  };
  reader.readAsDataURL(file);
}

// Remove a foto de perfil e restaura a padrão.
function removeAvatar() {
  if (confirm('Deseja realmente remover sua foto de perfil?')) {
    const preview = document.getElementById('avatarPreview');
    const sidebarAvatar = document.querySelector('.user-avatar');
    const fotoPerfilInput = document.getElementById('fotoPerfil'); // hidden
    const defaultAvatar = '../assets/img/perfilimg.webp';

    // Volta imagem padrão na tela de configurações
    if (preview) {preview.src = defaultAvatar;}

    // Volta imagem padrão no sidebar (se existir)
    if (sidebarAvatar) {sidebarAvatar.src = defaultAvatar;}

    // Limpa o file input
    const input = document.getElementById('avatarInput');
    if (input) {
      input.value = '';
    }

    // Zera o valor que será enviado ao backend
    if (fotoPerfilInput) {
      fotoPerfilInput.value = '';
    }

    showNotification('Foto de perfil removida. Salve o perfil para confirmar.', 'info');
  }
}

// Salva preferências de notificação.
function saveNotifications() {
  const notifications = {
    emailAlertas: document.getElementById('emailAlertas').checked,
    emailRelatorios: document.getElementById('emailRelatorios').checked,
    emailTreinamentos: document.getElementById('emailTreinamentos').checked,
    pushNotifications: document.getElementById('pushNotifications').checked,
    soundAlerts: document.getElementById('soundAlerts').checked,
    lastUpdate: new Date().toISOString()
  };

  localStorage.setItem('confisafe_notifications', JSON.stringify(notifications));
  showNotification('✅ Preferências de notificação salvas!', 'success');
}

// Simula encerramento de sessão ativa.
function revokeSession(sessionId) {
  if (confirm('Deseja realmente encerrar esta sessão?')) {
    showNotification('✅ Sessão encerrada com sucesso!', 'success');
    console.log('Sessão encerrada:', sessionId);
  }
}

// Exibe instruções para ativar autenticação de dois fatores.
function enable2FA() {
  showNotification('🔐 Abrindo configuração de 2FA...', 'info');
  
  setTimeout(() => {
    alert('CONFIGURAÇÃO DE 2FA\n\n' +
          '1. Baixe o app Google Authenticator\n' +
          '2. Escaneie o QR Code\n' +
          '3. Digite o código gerado\n\n' +
          'Em produção, isso abriria um modal com o processo completo.');
  }, 500);
}

// Salva preferências do sistema (tema, idioma, fuso horário).
function saveSystemPreferences() {
  const preferences = {
    theme: document.getElementById('themeSelect').value,
    language: document.getElementById('languageSelect').value,
    timezone: document.getElementById('timezoneSelect').value,
    lastUpdate: new Date().toISOString()
  };

  localStorage.setItem('confisafe_system_preferences', JSON.stringify(preferences));
  showNotification('✅ Preferências do sistema salvas!', 'success');
  
  // Alerta sobre o tema escuro (ainda não implementado).
  if (preferences.theme === 'dark') {
    showNotification('💡 Tema escuro será implementado em breve!', 'info');
  }
}

// Exporta todos os dados do usuário em um arquivo JSON.
function exportData() {
  showNotification('📦 Preparando exportação de dados...', 'info');
  
  setTimeout(() => {
    const userData = {
      profile: JSON.parse(localStorage.getItem('confisafe_user_profile') || '{}'),
      notifications: JSON.parse(localStorage.getItem('confisafe_notifications') || '{}'),
      preferences: JSON.parse(localStorage.getItem('confisafe_system_preferences') || '{}'),
      exportDate: new Date().toISOString()
    };

    // Cria e baixa o arquivo JSON com os dados.
    const dataStr = JSON.stringify(userData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'confisafe-dados-' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('✅ Dados exportados com sucesso!', 'success');
  }, 1500);
}

// Desativa a conta do usuário (mantendo dados salvos).
function deactivateAccount() {
  const confirmation = prompt('Digite "DESATIVAR" para confirmar a desativação da conta:');
  
  if (confirmation === 'DESATIVAR') {
    showNotification('⚠️ Conta desativada. Entre em contato com o suporte para reativar.', 'warning');
    
    setTimeout(() => {
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = '../pages/login.html';
    }, 2000);
  } else if (confirmation !== null) {
    showNotification('Confirmação incorreta. Conta não foi desativada.', 'info');
  }
}

// Exclui permanentemente a conta (apaga tudo).
function deleteAccount() {
  const confirmation1 = prompt('⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\nTodos os seus dados serão permanentemente excluídos.\n\nDigite "EXCLUIR PERMANENTEMENTE" para confirmar:');
  
  if (confirmation1 === 'EXCLUIR PERMANENTEMENTE') {
    const confirmation2 = confirm('Tem ABSOLUTA CERTEZA?\n\nTodos os dados serão perdidos para sempre!');
    
    if (confirmation2) {
      showNotification('❌ Conta excluída permanentemente.', 'danger');
      
      setTimeout(() => {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '../index.html';
      }, 2000);
    }
  } else if (confirmation1 !== null) {
    showNotification('Confirmação incorreta. Conta não foi excluída.', 'info');
  }
}

// Função para exibir notificações personalizadas na tela.
function showNotification(message, type = 'info') {
  // Remove notificações anteriores.
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  // Define cores conforme o tipo.
  const colors = {
    success: '#28a745',
    warning: '#ffc107',
    info: '#166cc7',
    danger: '#dc3545'
  };
  
  // Define estilo visual.
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    animation: slideIn 0.3s ease;
    max-width: 400px;
    font-weight: 500;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove a notificação após 4 segundos.
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 4000);
}

// ===== ANIMAÇÕES CSS =====
// Cria animações para as notificações.
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);
