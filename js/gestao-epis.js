/**
 * CONFISAFE - Gestão de EPIs
 * Sistema de Controle de Empréstimos e Devoluções
 */

(function() {
  'use strict';

  // ===== ELEMENTOS DO DOM =====
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const logoutBtn = document.getElementById('logoutBtn');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const loanModal = document.getElementById('loanModal');
  const returnModal = document.getElementById('returnModal');
  const loanForm = document.getElementById('loanForm');
  const returnForm = document.getElementById('returnForm');
  const loansTableBody = document.getElementById('loansTableBody');

  // ===== DADOS DE EMPRÉSTIMOS (simulando banco de dados) =====
  let loans = [
    {
      id: 1,
      employeeId: 1,
      employeeName: 'João Silva',
      employeeFunction: 'Operador',
      epiType: 'capacete',
      epiName: 'Capacete de Segurança',
      patrimony: '#CAP-2024-042',
      loanDate: '28/10/2024',
      returnDate: '04/11/2024',
      status: 'no-prazo',
      returned: false
    },
    {
      id: 2,
      employeeId: 2,
      employeeName: 'Maria Santos',
      employeeFunction: 'Técnica',
      epiType: 'luvas',
      epiName: 'Luvas de Proteção',
      patrimony: '#LUV-2024-018',
      loanDate: '20/10/2024',
      returnDate: '27/10/2024',
      status: 'atrasado',
      daysLate: 8,
      returned: false
    },
    {
      id: 3,
      employeeId: 3,
      employeeName: 'Carlos Oliveira',
      employeeFunction: 'Manutenção',
      epiType: 'mascara',
      epiName: 'Máscara Respiratória',
      patrimony: '#MAS-2024-007',
      loanDate: '05/10/2024',
      returnDate: '12/10/2024',
      status: 'perdido',
      daysLate: 23,
      value: 185.00,
      returned: false
    },
    {
      id: 4,
      employeeId: 4,
      employeeName: 'Ana Costa',
      employeeFunction: 'Supervisora',
      epiType: 'colete',
      epiName: 'Colete Refletivo',
      patrimony: '#COL-2024-033',
      loanDate: '01/11/2024',
      returnDate: '08/11/2024',
      status: 'no-prazo',
      returned: false
    }
  ];

  let nextId = 5;
  let currentLoanId = null;

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
      
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      this.classList.add('active');
      
      const targetContent = document.getElementById(targetTab + '-tab');
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  // ===== FORMULÁRIOS =====
  if (loanForm) {
    loanForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveLoan();
    });
  }

  if (returnForm) {
    returnForm.addEventListener('submit', function(e) {
      e.preventDefault();
      processReturn();
    });
  }

  // ===== ATUALIZAR TABELA =====
  function updateTable() {
    if (!loansTableBody) return;

    loansTableBody.innerHTML = '';

    const activeLoans = loans.filter(loan => !loan.returned);

    activeLoans.forEach(loan => {
      const initials = loan.employeeName.split(' ').map(n => n[0]).join('').substring(0, 2);
      
      let rowClass = 'row-on-time';
      let avatarClass = 'avatar-blue';
      let badgeClass = 'badge-success';
      let statusText = 'No prazo';
      
      if (loan.status === 'atrasado') {
        rowClass = 'row-late';
        avatarClass = 'avatar-orange';
        badgeClass = 'badge-warning';
        statusText = `Atrasado ${loan.daysLate} dias`;
      } else if (loan.status === 'perdido') {
        rowClass = 'row-lost';
        avatarClass = 'avatar-red';
        badgeClass = 'badge-danger';
        statusText = `Não devolvido ${loan.daysLate} dias`;
      }

      const row = document.createElement('tr');
      row.dataset.id = loan.id;
      row.classList.add(rowClass);

      const epiImages = {
        'capacete': '../assets/Epis/capaceteEpi.png',
        'luvas': '../assets/Epis/luvasEpi.png',
        'mascara': '../assets/Epis/mascaraRespiratoriaEpi.png',
        'colete': '../assets/Epis/coleteReflexivoEpi.png'
      };

      row.innerHTML = `
        <td>
          <div class="employee-cell">
            <div class="avatar ${avatarClass}">${initials}</div>
            <div>
              <strong>${loan.employeeName}</strong>
              <span>${loan.employeeFunction}</span>
            </div>
          </div>
        </td>
        <td>
          <div class="epi-cell">
            <img src="${epiImages[loan.epiType]}" alt="${loan.epiName}" width="30" height="30">
            <span>${loan.epiName}</span>
          </div>
        </td>
        <td><span class="patrimony">${loan.patrimony}</span></td>
        <td>${loan.loanDate}</td>
        <td>${loan.returnDate}</td>
        <td><span class="badge ${badgeClass}">${statusText}</span></td>
        <td>
          <div class="action-btns">
            ${loan.status === 'perdido' ? `
              <button class="btn-icon btn-icon-danger" onclick="reportLost(${loan.id})" title="Marcar como perdido">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </button>
              <button class="btn-icon btn-icon-warning" onclick="sendReminder(${loan.id})" title="Enviar cobrança">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </button>
            ` : `
              <button class="btn-icon btn-icon-success" onclick="returnEPI(${loan.id})" title="Registrar devolução">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
              ${loan.status === 'atrasado' ? `
              <button class="btn-icon btn-icon-warning" onclick="sendReminder(${loan.id})" title="Enviar lembrete">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </button>
              ` : ''}
            `}
            <button class="btn-icon" onclick="viewLoanDetails(${loan.id})" title="Ver detalhes">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </td>
      `;

      loansTableBody.appendChild(row);
    });

    updateCounters();
  }

  // ===== ATUALIZAR CONTADORES =====
  function updateCounters() {
    const activeLoans = loans.filter(l => !l.returned);
    const lateLoans = activeLoans.filter(l => l.status === 'atrasado' || l.status === 'perdido');
    const lostLoans = activeLoans.filter(l => l.status === 'perdido');
    const onTimeReturns = loans.filter(l => l.returned && l.status === 'no-prazo');

    const counters = document.querySelectorAll('.summary-value');
    if (counters[1]) counters[1].textContent = activeLoans.length;
    if (counters[2]) counters[2].textContent = lostLoans.length;
    if (counters[3]) counters[3].textContent = onTimeReturns.length;
  }

  // ===== INICIALIZAÇÃO =====
  updateTable();
  console.log('✅ Gestão de EPIs carregado');

  // ===== EXPORTAR PARA GLOBAL =====
  window.loans = loans;
  window.updateTable = updateTable;
  window.nextId = nextId;
  window.currentLoanId = currentLoanId;

})();

// ===== FUNÇÕES GLOBAIS =====

function openLoanModal() {
  const modal = document.getElementById('loanModal');
  const form = document.getElementById('loanForm');
  
  form.reset();
  
  // Definir data atual como padrão
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('loanDate').value = today;
  
  // Definir data de devolução padrão (7 dias após)
  const returnDate = new Date();
  returnDate.setDate(returnDate.getDate() + 7);
  document.getElementById('returnDate').value = returnDate.toISOString().split('T')[0];
  
  modal.classList.add('show');
}

function closeLoanModal() {
  const modal = document.getElementById('loanModal');
  modal.classList.remove('show');
}

function saveLoan() {
  const employeeId = document.getElementById('employeeSelect').value;
  const epiType = document.getElementById('epiSelect').value;
  const patrimony = document.getElementById('patrimonyNumber').value.trim();
  const loanDate = document.getElementById('loanDate').value;
  const returnDate = document.getElementById('returnDate').value;

  if (!employeeId || !epiType || !patrimony || !loanDate || !returnDate) {
    showNotification('Preencha todos os campos obrigatórios!', 'warning');
    return;
  }

  const employees = {
    '1': { name: 'João Silva', function: 'Operador' },
    '2': { name: 'Maria Santos', function: 'Técnica' },
    '3': { name: 'Carlos Oliveira', function: 'Manutenção' },
    '4': { name: 'Ana Costa', function: 'Supervisora' }
  };

  const epis = {
    'capacete': 'Capacete de Segurança',
    'luvas': 'Luvas de Proteção',
    'mascara': 'Máscara Respiratória',
    'colete': 'Colete Refletivo'
  };

  const newLoan = {
    id: window.nextId || 5,
    employeeId: parseInt(employeeId),
    employeeName: employees[employeeId].name,
    employeeFunction: employees[employeeId].function,
    epiType: epiType,
    epiName: epis[epiType],
    patrimony: patrimony,
    loanDate: formatDate(loanDate),
    returnDate: formatDate(returnDate),
    status: 'no-prazo',
    returned: false
  };

  window.loans.push(newLoan);
  window.nextId = (window.nextId || 5) + 1;
  
  window.updateTable();
  closeLoanModal();
  showNotification('✅ Empréstimo registrado com sucesso!', 'success');
}

function returnEPI(loanId) {
  const loan = window.loans.find(l => l.id === loanId);
  if (!loan) return;

  window.currentLoanId = loanId;

  // Preencher informações no modal
  document.getElementById('returnEmployee').textContent = loan.employeeName;
  document.getElementById('returnEPI').textContent = loan.epiName;
  document.getElementById('returnPatrimony').textContent = loan.patrimony;
  document.getElementById('returnLoanDate').textContent = loan.loanDate;
  document.getElementById('returnExpected').textContent = loan.returnDate;

  // Data atual como padrão
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('returnDateInput').value = today;

  const modal = document.getElementById('returnModal');
  modal.classList.add('show');
}

function closeReturnModal() {
  const modal = document.getElementById('returnModal');
  modal.classList.remove('show');
  window.currentLoanId = null;
}

function processReturn() {
  const loanId = window.currentLoanId;
  const loan = window.loans.find(l => l.id === loanId);
  
  if (!loan) return;

  const returnDate = document.getElementById('returnDateInput').value;
  const condition = document.getElementById('condition').value;

  if (!returnDate || !condition) {
    showNotification('Preencha todos os campos obrigatórios!', 'warning');
    return;
  }

  loan.returned = true;
  loan.actualReturnDate = formatDate(returnDate);
  loan.condition = condition;

  window.updateTable();
  closeReturnModal();
  showNotification(`✅ Devolução de ${loan.epiName} registrada com sucesso!`, 'success');
}

function viewLoanDetails(loanId) {
  const loan = window.loans.find(l => l.id === loanId);
  if (!loan) return;

  alert(`DETALHES DO EMPRÉSTIMO\n\n` +
        `Funcionário: ${loan.employeeName}\n` +
        `Função: ${loan.employeeFunction}\n` +
        `EPI: ${loan.epiName}\n` +
        `Patrimônio: ${loan.patrimony}\n` +
        `Data Empréstimo: ${loan.loanDate}\n` +
        `Previsão Devolução: ${loan.returnDate}\n` +
        `Status: ${loan.status}\n` +
        (loan.daysLate ? `Dias de atraso: ${loan.daysLate}\n` : '') +
        (loan.value ? `Valor: R$ ${loan.value.toFixed(2)}\n` : '') +
        `\nEm produção, isso abriria um modal detalhado.`);
}

function sendReminder(loanId) {
  const loan = window.loans.find(l => l.id === loanId);
  if (!loan) return;

  const message = loan.status === 'perdido'
    ? `Enviar COBRANÇA para ${loan.employeeName}?\n\nEPI: ${loan.epiName}\nPatrimônio: ${loan.patrimony}\nAtraso: ${loan.daysLate} dias\n\nUm e-mail formal será enviado ao funcionário e ao seu supervisor direto solicitando a devolução imediata ou justificativa formal.`
    : `Enviar lembrete para ${loan.employeeName}?\n\nEPI: ${loan.epiName}\nPatrimônio: ${loan.patrimony}\nAtraso: ${loan.daysLate} dias\n\nE-mail de lembrete será enviado.`;

  if (confirm(message)) {
    showNotification(`📧 ${loan.status === 'perdido' ? 'Cobrança formal' : 'Lembrete'} enviado para ${loan.employeeName}`, 'success');
    console.log('Lembrete enviado para empréstimo ID:', loanId);
  }
}

function reportLost(loanId) {
  const loan = window.loans.find(l => l.id === loanId);
  if (!loan) return;

  if (confirm(`MARCAR COMO PERDIDO?\n\n` +
              `Funcionário: ${loan.employeeName}\n` +
              `EPI: ${loan.epiName}\n` +
              `Patrimônio: ${loan.patrimony}\n` +
              `Dias de atraso: ${loan.daysLate}\n\n` +
              `Esta ação irá:\n` +
              `• Registrar perda no sistema\n` +
              `• Notificar RH e Segurança\n` +
              `• Atualizar inventário\n` +
              `• Gerar documento de responsabilidade\n\n` +
              `Deseja continuar?`)) {
    
    loan.status = 'perdido-confirmado';
    loan.lossDate = new Date().toLocaleDateString('pt-BR');
    
    showNotification(`❌ EPI marcado como perdido. Documento de responsabilidade gerado.`, 'warning');
    window.updateTable();
  }
}

function filterByStatus(status) {
  const rows = document.querySelectorAll('#loansTableBody tr');
  
  rows.forEach(row => {
    if (status === 'all') {
      row.style.display = '';
    } else if (status === 'emprestado') {
      row.style.display = row.classList.contains('row-on-time') ? '' : 'none';
    } else if (status === 'atrasado') {
      row.style.display = row.classList.contains('row-late') ? '' : 'none';
    } else if (status === 'perdido') {
      row.style.display = row.classList.contains('row-lost') ? '' : 'none';
    }
  });

  showNotification(`Filtro aplicado: ${getStatusName(status)}`, 'info');
}

function getStatusName(status) {
  const names = {
    'all': 'Todos os Status',
    'emprestado': 'Emprestados',
    'atrasado': 'Atrasados',
    'perdido': 'Perdidos/Não Devolvidos',
    'estoque': 'Em Estoque'
  };
  return names[status] || status;
}

function viewLostItems() {
  showNotification('Abrindo aba de itens não devolvidos...', 'info');
  
  // Ativar aba "Não Devolvidos/Perdidos"
  const lostTab = document.querySelector('[data-tab="lost"]');
  if (lostTab) {
    lostTab.click();
  }
}

function addStock(epiType) {
  const epiNames = {
    'capacete': 'Capacetes de Segurança',
    'luvas': 'Luvas de Proteção',
    'mascara': 'Máscaras Respiratórias',
    'colete': 'Coletes Refletivos'
  };

  const quantity = prompt(`Quantos ${epiNames[epiType]} deseja adicionar ao estoque?`, '10');
  
  if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
    showNotification(`✅ ${quantity} ${epiNames[epiType]} adicionados ao estoque!`, 'success');
    console.log(`Adicionado ${quantity} unidades de ${epiType}`);
  }
}

function viewReport() {
  showNotification('Redirecionando para página de relatórios...', 'info');
  setTimeout(() => {
    window.location.href = '../pages/relatorio.html';
  }, 1000);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function showNotification(message, type = 'info') {
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());

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
    font-weight: 500;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

// Fechar modais ao clicar fora
window.addEventListener('click', function(e) {
  const loanModal = document.getElementById('loanModal');
  const returnModal = document.getElementById('returnModal');
  
  if (e.target === loanModal) {
    closeLoanModal();
  }
  if (e.target === returnModal) {
    closeReturnModal();
  }
});

// Fechar modais com ESC
window.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeLoanModal();
    closeReturnModal();
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