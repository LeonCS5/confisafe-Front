/**
 * CONFISAFE - Monitoramento de EPIs

 */

(function() {
  'use strict';

  // ===== ELEMENTOS DO DOM =====
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const logoutBtn = document.getElementById('logoutBtn');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // ===== MENU MOBILE =====
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', function() {
      sidebar.classList.toggle('open');
    });

    document.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      }
    });
  }

  // ===== LOGOUT =====
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (confirm('Deseja realmente sair do sistema?')) {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '../pages/login.html';
      }
    });
  }

  // ===== TABS =====
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetTab = this.dataset.tab;
      
      // Remove active de todos
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Adiciona active no clicado
      this.classList.add('active');
      
      // Mostra conteúdo correspondente
      const targetContent = document.getElementById(targetTab + '-tab');
      if (targetContent) {
        targetContent.classList.add('active');
      }

      // Se for a aba de câmeras, simular atualização
      if (targetTab === 'cameras') {
        console.log('📹 Aba de câmeras ativada');
        simulateCameraUpdate();
      }
    });
  });

  // ===== SIMULAÇÃO DE ATUALIZAÇÃO DE CÂMERAS =====
  function simulateCameraUpdate() {
    // Simula atualização periódica das estatísticas das câmeras
    const cameraStats = document.querySelectorAll('.camera-stats strong');
    
    setInterval(() => {
      cameraStats.forEach(stat => {
        // Pequena animação visual
        if (Math.random() > 0.9) {
          stat.style.transform = 'scale(1.1)';
          setTimeout(() => {
            stat.style.transform = 'scale(1)';
          }, 200);
        }
      });
    }, 5000);
  }

  // ===== INICIALIZAÇÃO =====
  console.log('✅ Monitoramento de EPIs com Câmeras carregado');

})();

// ===== FUNÇÕES GLOBAIS =====

function filterByArea(area) {
  console.log('Filtrando por área:', area);
  showNotification(`Filtro aplicado: ${getAreaName(area)}`, 'info');
  
  const rows = document.querySelectorAll('.monitoring-table tbody tr');
  
  if (area === 'all') {
    rows.forEach(row => row.style.display = '');
  } else {
    rows.forEach(row => {
      const rowArea = row.cells[1].textContent.toLowerCase();
      const shouldShow = rowArea.includes(area.toLowerCase());
      row.style.display = shouldShow ? '' : 'none';
    });
  }
}

function getAreaName(areaCode) {
  const areas = {
    'all': 'Todas as Áreas',
    'producao': 'Produção',
    'manutencao': 'Manutenção',
    'laboratorio': 'Laboratório',
    'administrativo': 'Administrativo'
  };
  return areas[areaCode] || areaCode;
}

function refreshData() {
  const btn = event.target.closest('button');
  const originalText = btn.innerHTML;
  
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg> Atualizando...';
  btn.disabled = true;
  
  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.disabled = false;
    showNotification('Dados atualizados com sucesso!', 'success');
  }, 1500);
}

function viewAlerts() {
  showNotification('Abrindo painel de alertas...', 'info');
  
  const alertsSection = document.querySelector('.alerts-section');
  if (alertsSection) {
    alertsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function viewDetails(employeeId) {
  const employees = {
    1: { nome: 'João Silva', funcao: 'Operador', area: 'Produção', status: 'Conforme' },
    2: { nome: 'Maria Santos', funcao: 'Técnica', area: 'Laboratório', status: 'Não Conforme - Óculos' },
    3: { nome: 'Carlos Oliveira', funcao: 'Manutenção', area: 'Manutenção', status: 'Crítico - Múltiplas falhas' },
    4: { nome: 'Ana Costa', funcao: 'Supervisora', area: 'Administrativo', status: 'Conforme' }
  };
  
  const employee = employees[employeeId];
  
  if (employee) {
    alert(`DETALHES DO FUNCIONÁRIO\n\n` +
          `Nome: ${employee.nome}\n` +
          `Função: ${employee.funcao}\n` +
          `Área: ${employee.area}\n` +
          `Status: ${employee.status}\n\n` +
          `Em produção, isso abriria um modal detalhado.`);
  }
}

function notifyEmployee(employeeId) {
  if (confirm('Enviar notificação para o funcionário sobre o uso incorreto de EPI?')) {
    showNotification('📢 Notificação enviada com sucesso!', 'success');
    console.log('Notificação enviada para funcionário ID:', employeeId);
  }
}

function blockAccess(employeeId) {
  if (confirm('ATENÇÃO: Isso irá bloquear o acesso do funcionário à área restrita.\n\nDeseja continuar?')) {
    showNotification('🚫 Acesso bloqueado! Funcionário notificado.', 'warning');
    console.log('Acesso bloqueado para funcionário ID:', employeeId);
    
    const row = document.querySelector(`.monitoring-table tbody tr:nth-child(${employeeId})`);
    if (row) {
      row.style.opacity = '0.5';
      row.style.pointerEvents = 'none';
    }
  }
}

function resolveAlert(alertId) {
  if (confirm('Marcar este alerta como resolvido?')) {
    const alerts = document.querySelectorAll('.alert');
    const alertElement = alerts[alertId - 1];
    
    if (alertElement) {
      alertElement.style.opacity = '0.5';
      alertElement.style.pointerEvents = 'none';
      
      const resolveBtn = alertElement.querySelector('.btn-resolve');
      if (resolveBtn) {
        resolveBtn.textContent = '✓ Resolvido';
        resolveBtn.disabled = true;
        resolveBtn.style.background = '#28a745';
      }
      
      showNotification('✅ Alerta marcado como resolvido!', 'success');
    }
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  const colors = {
    success: '#28a745',
    warning: '#ffc107',
    info: '#166cc7',
    danger: '#dc3545'
  };
  
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
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Animações CSS
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
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);