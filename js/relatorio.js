/**
 * CONFISAFE - Relatórios
 * Versão Empresarial
 */

(function() {
  'use strict';

  // ===== ELEMENTOS DO DOM =====
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const logoutBtn = document.getElementById('logoutBtn');
  const reportModal = document.getElementById('reportModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalNotes = document.getElementById('modalNotes');

  // ===== DADOS DOS RELATÓRIOS =====
  const reportData = {
    epi: {
      title: 'Conformidade com EPI',
      metrics: {
        'Taxa de Conformidade': '92%',
        'Funcionários em Conformidade': '46/50',
        'EPI Mais Utilizado': 'Capacete de Segurança',
        'EPI Menos Utilizado': 'Protetor Auditivo',
        'Última Auditoria': '20/10/2024'
      }
    },
    excecoes: {
      title: 'Relatório de Exceções',
      metrics: {
        'Total de Exceções': '5',
        'Exceções Críticas': '2',
        'Exceções Resolvidas': '3',
        'Equipamentos com Falhas': 'Capacete, Luvas',
        'Tempo Médio de Resolução': '2 dias'
      }
    },
    atividade: {
      title: 'Atividade do Usuário',
      metrics: {
        'Usuários Ativos Hoje': '18',
        'Total de Acessos no Mês': '245',
        'Horário de Pico': '14:00 - 16:00',
        'Usuários com Acesso Expirado': '2',
        'Tentativas Bloqueadas': '1'
      }
    },
    incidentes: {
      title: 'Relatório de Incidentes',
      metrics: {
        'Incidentes Registrados': '3',
        'Incidentes Graves': '1',
        'Incidentes Resolvidos': '2',
        'Tempo Médio de Resposta': '45 min',
        'Área com Mais Incidentes': 'Setor de Produção'
      }
    }
  };

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

  // ===== GRÁFICOS =====
  function initCharts() {
    // Gráfico de Conformidade Semanal
    const weeklyCtx = document.getElementById('weeklyChart');
    if (weeklyCtx) {
      new Chart(weeklyCtx, {
        type: 'line',
        data: {
          labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
          datasets: [{
            label: 'Conformidade (%)',
            data: [88, 90, 92, 91, 94, 93, 92],
            borderColor: '#166cc7',
            backgroundColor: 'rgba(22, 108, 199, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              min: 80,
              max: 100,
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              }
            }
          }
        }
      });
    }

    // Gráfico de Distribuição por Área
    const areaCtx = document.getElementById('areaChart');
    if (areaCtx) {
      new Chart(areaCtx, {
        type: 'bar',
        data: {
          labels: ['Produção', 'Laboratório', 'Manutenção', 'Almoxarifado'],
          datasets: [
            {
              label: 'Conforme',
              data: [45, 32, 28, 38],
              backgroundColor: '#28a745'
            },
            {
              label: 'Não Conforme',
              data: [5, 3, 7, 2],
              backgroundColor: '#ffc107'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              stacked: true
            },
            y: {
              stacked: true,
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  // ===== INICIALIZAÇÃO =====
  document.addEventListener('DOMContentLoaded', function() {
    initCharts();
    loadSavedNotes();
    console.log('✅ Relatórios carregado');
  });

  // ===== SALVAR NOTAS =====
  function loadSavedNotes() {
    const saved = localStorage.getItem('confisafe_notes');
    if (saved) {
      try {
        window.savedNotes = JSON.parse(saved);
      } catch (e) {
        window.savedNotes = {};
      }
    } else {
      window.savedNotes = {};
    }
  }

})();

// ===== FUNÇÕES GLOBAIS =====

function openModal(reportType) {
  const modal = document.getElementById('reportModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalNotes = document.getElementById('modalNotes');
  
  const reportData = {
    epi: {
      title: 'Conformidade com EPI',
      metrics: { 
        'Taxa de Conformidade': '92%',
        'Funcionários em Conformidade': '46/50',
        'EPI Mais Utilizado': 'Capacete de Segurança',
        'EPI Menos Utilizado': 'Protetor Auditivo',
        'Última Auditoria': '20/10/2024'
      }
    },
    excecoes: {
      title: 'Relatório de Exceções',
      metrics: {
        'Total de Exceções': '5',
        'Exceções Críticas': '2',
        'Exceções Resolvidas': '3',
        'Equipamentos com Falhas': 'Capacete, Luvas',
        'Tempo Médio de Resolução': '2 dias'
      }
    },
    atividade: {
      title: 'Atividade do Usuário',
      metrics: {
        'Usuários Ativos Hoje': '18',
        'Total de Acessos no Mês': '245',
        'Horário de Pico': '14:00 - 16:00',
        'Usuários com Acesso Expirado': '2',
        'Tentativas Bloqueadas': '1'
      }
    },
    incidentes: {
      title: 'Relatório de Incidentes',
      metrics: {
        'Incidentes Registrados': '3',
        'Incidentes Graves': '1',
        'Incidentes Resolvidos': '2',
        'Tempo Médio de Resposta': '45 min',
        'Área com Mais Incidentes': 'Setor de Produção'
      }
    }
  };
  
  const data = reportData[reportType];
  
  if (data) {
    modalTitle.textContent = data.title;
    
    // Renderizar métricas
    let metricsHTML = '<div style="display: grid; gap: 1rem; margin-bottom: 1.5rem;">';
    for (const [key, value] of Object.entries(data.metrics)) {
      metricsHTML += `
        <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #f8f9fa; border-radius: 6px;">
          <strong style="color: #333;">${key}:</strong>
          <span style="color: #166cc7; font-weight: 600;">${value}</span>
        </div>
      `;
    }
    metricsHTML += '</div>';
    
    modalBody.innerHTML = metricsHTML;
    
    // Carregar nota salva
    modalNotes.value = window.savedNotes?.[reportType] || '';
    modal.setAttribute('data-report-type', reportType);
    
    modal.classList.add('show');
  }
}

function closeModal() {
  const modal = document.getElementById('reportModal');
  modal.classList.remove('show');
}

function saveNotes() {
  const modal = document.getElementById('reportModal');
  const reportType = modal.getAttribute('data-report-type');
  const notes = document.getElementById('modalNotes').value.trim();
  
  if (!window.savedNotes) {
    window.savedNotes = {};
  }
  
  window.savedNotes[reportType] = notes;
  localStorage.setItem('confisafe_notes', JSON.stringify(window.savedNotes));
  
  showNotification('Observações salvas com sucesso!', 'success');
  
  setTimeout(() => {
    closeModal();
  }, 1000);
}

function exportReport() {
  showNotification('Gerando relatório em PDF...', 'info');
  
  setTimeout(() => {
    showNotification('Relatório exportado com sucesso!', 'success');
    console.log('Em produção, isso geraria um PDF real');
  }, 2000);
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#166cc7'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Fechar modal ao clicar fora
window.addEventListener('click', function(e) {
  const modal = document.getElementById('reportModal');
  if (e.target === modal) {
    closeModal();
  }
});

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
`;
document.head.appendChild(style);