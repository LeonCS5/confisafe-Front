/**
 * CONFISAFE - Controle de Acesso
 * Com Gerenciamento de Funcionários (CRUD)
 */

(function() {
  'use strict';

  // ===== ELEMENTOS DO DOM =====
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const logoutBtn = document.getElementById('logoutBtn');
  const searchInput = document.getElementById('searchInput');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const employeeModal = document.getElementById('employeeModal');
  const employeeForm = document.getElementById('employeeForm');
  const employeesTableBody = document.getElementById('employeesTableBody');
  const detailsModal = document.getElementById('detailsModal');

  // ===== DADOS DE FUNCIONÁRIOS (simulando banco de dados) =====
  let employees = [
    {
      id: 1,
      name: 'Neymar Junior',
      function: 'Operador de Máquinas',
      area: 'Produção',
      level: 2,
      status: 'Ativo',
      date: '15/01/2024'
    },
    {
      id: 2,
      name: 'C.Ronaldo',
      function: 'Técnica de Laboratório',
      area: 'Laboratório',
      level: 3,
      status: 'Ativo',
      date: '20/02/2024'
    },
    {
      id: 3,
      name: 'Leonel Messi',
      function: 'Auxiliar de Manutenção',
      area: 'Manutenção',
      level: 1,
      status: 'Bloqueado',
      date: '10/03/2024'
    },
    {
      id: 4,
      name: 'Gustavo Lima',
      function: 'Supervisora',
      area: 'Administrativo',
      level: 4,
      status: 'Ativo',
      date: '05/01/2024'
    }
  ];

  let nextId = 5;
  let editingId = null;

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

  // ===== BUSCA =====
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase();
      const rows = employeesTableBody.querySelectorAll('tr');
      
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
      });
    });
  }

  // ===== FILTROS =====
  filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      filterButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      const filter = this.dataset.filter;
      const rows = employeesTableBody.querySelectorAll('tr');
      
      rows.forEach(row => {
        if (filter === 'all') {
          row.style.display = '';
        } else if (filter === 'denied') {
          row.style.display = row.classList.contains('row-denied') ? '' : 'none';
        } else if (filter === 'allowed') {
          row.style.display = !row.classList.contains('row-denied') ? '' : 'none';
        }
      });
    });
  });

  // ===== FORMULÁRIO =====
  if (employeeForm) {
    employeeForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveEmployee();
    });
  }

  // ===== ATUALIZAR TABELA =====
  function updateTable() {
    if (!employeesTableBody) return;

    employeesTableBody.innerHTML = '';

    employees.forEach(emp => {
      const initials = emp.name.split(' ').map(n => n[0]).join('').substring(0, 2);
      const isBlocked = emp.status === 'Bloqueado';

      const row = document.createElement('tr');
      row.dataset.id = emp.id;
      if (isBlocked) row.classList.add('row-denied');

      row.innerHTML = `
        <td>
          <div class="employee-cell">
            <div class="avatar">${initials}</div>
            <div>
              <strong>${emp.name}</strong>
              <span>${emp.function}</span>
            </div>
          </div>
        </td>
        <td>${emp.area}</td>
        <td>${emp.date}</td>
        <td><span class="badge ${isBlocked ? 'badge-exit' : 'badge-entry'}">Nível ${emp.level}</span></td>
        <td><span class="status ${isBlocked ? 'status-denied' : 'status-success'}">${emp.status}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn-icon" title="Ver detalhes" onclick="viewDetails(${emp.id})">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            ${isBlocked ? `
              <button class="btn-icon btn-icon-success" title="Liberar" onclick="allowAccess(${emp.id})">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
            ` : `
              <button class="btn-icon btn-icon-warning" title="Editar" onclick="editEmployee(${emp.id})">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            `}
            <button class="btn-icon btn-icon-danger" title="Deletar" onclick="deleteEmployee(${emp.id})">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      `;

      employeesTableBody.appendChild(row);
    });

    // Atualizar contador
    const totalUsersElement = document.getElementById('totalUsers');
    if (totalUsersElement) {
      totalUsersElement.textContent = employees.length;
    }
  }

  // ===== INICIALIZAÇÃO =====
  updateTable();
  console.log('✅ Controle de Acesso carregado');

  // ===== EXPORTAR FUNÇÕES PARA GLOBAL =====
  window.employees = employees;
  window.updateTable = updateTable;
  window.nextId = nextId;
  window.editingId = editingId;

})();

// ===== FUNÇÕES GLOBAIS =====

function openAddEmployeeModal() {
  const modal = document.getElementById('employeeModal');
  const form = document.getElementById('employeeForm');
  const modalTitle = document.getElementById('modalTitle');
  
  // Resetar formulário
  form.reset();
  window.editingId = null;
  
  modalTitle.textContent = 'Adicionar Funcionário';
  modal.classList.add('show');
}

function closeEmployeeModal() {
  const modal = document.getElementById('employeeModal');
  modal.classList.remove('show');
  window.editingId = null;
}

function editEmployee(id) {
  const employee = window.employees.find(e => e.id === id);
  if (!employee) return;

  const modal = document.getElementById('employeeModal');
  const modalTitle = document.getElementById('modalTitle');
  
  modalTitle.textContent = 'Editar Funcionário';
  window.editingId = id;
  
  // Preencher formulário
  document.getElementById('empName').value = employee.name;
  document.getElementById('empFunction').value = employee.function;
  document.getElementById('empArea').value = employee.area;
  document.getElementById('empLevel').value = employee.level;
  document.getElementById('empStatus').value = employee.status;
  
  modal.classList.add('show');
}

function saveEmployee() {
  const name = document.getElementById('empName').value.trim();
  const func = document.getElementById('empFunction').value.trim();
  const area = document.getElementById('empArea').value;
  const level = document.getElementById('empLevel').value;
  const status = document.getElementById('empStatus').value;

  if (!name || !func || !area || !level || !status) {
    showNotification('Preencha todos os campos obrigatórios!', 'warning');
    return;
  }

  if (window.editingId) {
    // Editar funcionário existente
    const employee = window.employees.find(e => e.id === window.editingId);
    if (employee) {
      employee.name = name;
      employee.function = func;
      employee.area = area;
      employee.level = parseInt(level);
      employee.status = status;
      
      showNotification('Funcionário atualizado com sucesso!', 'success');
    }
  } else {
    // Adicionar novo funcionário
    const newEmployee = {
      id: window.nextId || 5,
      name: name,
      function: func,
      area: area,
      level: parseInt(level),
      status: status,
      date: new Date().toLocaleDateString('pt-BR')
    };

    window.employees.push(newEmployee);
    window.nextId = (window.nextId || 5) + 1;
    
    showNotification('Funcionário adicionado com sucesso!', 'success');
  }

  window.updateTable();
  closeEmployeeModal();
}

function deleteEmployee(id) {
  const employee = window.employees.find(e => e.id === id);
  if (!employee) return;

  if (confirm(`Deseja realmente deletar o funcionário:\n\n${employee.name}\n${employee.function}\n\nEsta ação não pode ser desfeita!`)) {
    window.employees = window.employees.filter(e => e.id !== id);
    window.updateTable();
    showNotification('Funcionário deletado com sucesso!', 'success');
  }
}

function viewDetails(id) {
  const employee = window.employees.find(e => e.id === id);
  if (!employee) return;

  const modal = document.getElementById('detailsModal');
  const modalBody = document.getElementById('modalBody');

  modalBody.innerHTML = `
    <div style="display: grid; gap: 1rem;">
      <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #f8f9fa; border-radius: 6px;">
        <strong style="color: #333;">Nome Completo:</strong>
        <span style="color: #166cc7; font-weight: 600;">${employee.name}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #f8f9fa; border-radius: 6px;">
        <strong style="color: #333;">Função:</strong>
        <span style="color: #166cc7; font-weight: 600;">${employee.function}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #f8f9fa; border-radius: 6px;">
        <strong style="color: #333;">Área:</strong>
        <span style="color: #166cc7; font-weight: 600;">${employee.area}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #f8f9fa; border-radius: 6px;">
        <strong style="color: #333;">Nível de Acesso:</strong>
        <span style="color: #166cc7; font-weight: 600;">Nível ${employee.level}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #f8f9fa; border-radius: 6px;">
        <strong style="color: #333;">Status:</strong>
        <span style="color: ${employee.status === 'Ativo' ? '#28a745' : '#dc3545'}; font-weight: 600;">${employee.status}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #f8f9fa; border-radius: 6px;">
        <strong style="color: #333;">Data de Cadastro:</strong>
        <span style="color: #166cc7; font-weight: 600;">${employee.date}</span>
      </div>
    </div>
  `;

  modal.classList.add('show');
}

function closeModal() {
  const modal = document.getElementById('detailsModal');
  modal.classList.remove('show');
}

function allowAccess(id) {
  const employee = window.employees.find(e => e.id === id);
  if (!employee) return;

  if (confirm(`Liberar acesso para:\n\n${employee.name}\n${employee.function}?`)) {
    employee.status = 'Ativo';
    window.updateTable();
    showNotification('Acesso liberado com sucesso!', 'success');
  }
}

function blockAccess(id) {
  const employee = window.employees.find(e => e.id === id);
  if (!employee) return;

  if (confirm(`Tem certeza que deseja bloquear o acesso de:\n\n${employee.name}\n${employee.function}?`)) {
    employee.status = 'Bloqueado';
    window.updateTable();
    showNotification('Acesso bloqueado com sucesso!', 'warning');
  }
}

function exportData() {
  showNotification('Exportando dados de funcionários...', 'info');
  
  setTimeout(() => {
    // Simulação de exportação
    const csv = 'Nome,Função,Área,Nível,Status,Data\n' + 
                 window.employees.map(e => 
                   `"${e.name}","${e.function}","${e.area}",${e.level},"${e.status}","${e.date}"`
                 ).join('\n');
    
    console.log('CSV gerado:', csv);
    showNotification('Dados exportados com sucesso!', 'success');
  }, 1500);
}

function refreshData() {
  const btn = event.target.closest('button');
  const originalText = btn.innerHTML;
  
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg> Atualizando...';
  btn.disabled = true;
  
  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.disabled = false;
    window.updateTable();
    showNotification('Dados atualizados com sucesso!', 'success');
  }, 1500);
}

function resolveAlert(id) {
  if (confirm('Marcar este alerta como resolvido?')) {
    const alerts = document.querySelectorAll('.alert');
    const alertElement = alerts[id - 1];
    
    if (alertElement) {
      alertElement.style.opacity = '0.5';
      alertElement.style.pointerEvents = 'none';
      showNotification('Alerta resolvido com sucesso!', 'success');
    }
  }
}

function showNotification(message, type = 'info') {
  // Remover notificações existentes
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
  const employeeModal = document.getElementById('employeeModal');
  const detailsModal = document.getElementById('detailsModal');
  
  if (e.target === employeeModal) {
    closeEmployeeModal();
  }
  if (e.target === detailsModal) {
    closeModal();
  }
});

// Fechar modais com ESC
window.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeEmployeeModal();
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
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    align-items: center;
    justify-content: center;
  }

  .modal.show {
    display: flex;
  }

  .modal-content {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    animation: modalFadeIn 0.3s ease;
  }

  @keyframes modalFadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .form-group input,
  .form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .modal-footer {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }
`;
document.head.appendChild(style);