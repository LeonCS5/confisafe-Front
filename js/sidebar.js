// CONFISAFE - Preencher nome, cargo e foto do usuário na sidebar
document.addEventListener('DOMContentLoaded', () => {
  const nameEl = document.getElementById('userName');
  const roleEl = document.getElementById('userRole');
  const avatarEl = document.querySelector('.user-avatar');
  const defaultAvatar = '../assets/img/perfilimg.webp';

  // Se essa página não tiver essa estrutura, não faz nada
  if (!nameEl || !roleEl) return;

  const loggedEmail = sessionStorage.getItem('confisafe_logged_email');
  if (!loggedEmail) {
    // não tem usuário logado -> mantém o texto padrão do HTML
    if (avatarEl) avatarEl.src = defaultAvatar;
    return;
  }

  // Mesma fonte de dados usada em Configurações: /api/auth/perfil
  fetch('/api/auth/perfil?email=' + encodeURIComponent(loggedEmail))
    .then(res => {
      if (!res.ok) throw new Error('Perfil não encontrado');
      return res.json();
    })
    .then(userData => {
      // 🔹 Nome
      if (userData.nomeCompleto) {
        nameEl.textContent = userData.nomeCompleto;
      }

      // 🔹 Cargo / Departamento (prioriza cargo, senão mostra o departamento "bonitinho")
      let cargoOuDept = userData.cargo;

      if (!cargoOuDept && userData.departamento) {
        switch (userData.departamento) {
          case 'seguranca':
            cargoOuDept = 'Segurança do Trabalho';
            break;
          case 'producao':
            cargoOuDept = 'Produção';
            break;
          case 'manutencao':
            cargoOuDept = 'Manutenção';
            break;
          case 'administrativo':
            cargoOuDept = 'Administrativo';
            break;
          default:
            cargoOuDept = userData.departamento;
        }
      }

      if (cargoOuDept) {
        roleEl.textContent = cargoOuDept;
      }

      // 🔹 Foto de perfil
      if (avatarEl) {
        if (userData.fotoPerfil) {
          avatarEl.src = userData.fotoPerfil;   // Base64 vinda do banco
        } else {
          avatarEl.src = defaultAvatar;         // fallback
        }
      }
    })
    .catch(err => {
      console.warn('Não foi possível carregar perfil para o sidebar:', err);
      if (avatarEl) avatarEl.src = defaultAvatar;
    });
});
