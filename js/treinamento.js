/**
 * CONFISAFE - Treinamentos NR-33
 * Versão Empresarial
 */

(function() {
  'use strict';

  // ===== FUNÇÃO PARA BUSCAR NO BANCO DE DADOS =====
  async function carregarTreinamentosDoBackend() {
  try {
    const response = await fetch("/api/treinamentos");
    const dados = await response.json();

    // Converter o formato do banco para o formato da tabela
    trainings = dados.map(t => ({
      id: t.id,
      employeeName: t.nomeFuncionario,
      employeeFunction: t.cargo,
      course: t.curso,
      completionDate: formatDateBackend(t.dataConclusao),
      expiryDate: formatDateBackend(t.validade),
      status: traduzirStatus(t.status)
    }));

    updateTable();
    } catch (error) {
      console.error("Erro ao carregar treinamentos:", error);
    }
  }

  function formatDateBackend(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  }

  function traduzirStatus(status) {
    switch (status) {
      case "VALIDO": return "Válido";
      case "VENCE_EM_BREVE": return "Vencendo";
      case "VENCIDO": return "Vencido";
      default: return status;
    }
  }

  // ===== ELEMENTOS DO DOM =====
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const logoutBtn = document.getElementById('logoutBtn');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const trainingModal = document.getElementById('trainingModal');
  const trainingForm = document.getElementById('trainingForm');
  const trainingsTableBody = document.getElementById('trainingsTableBody');

  // ===== DADOS DE TREINAMENTOS (simulando banco de dados) =====
  let trainings = [
    // {
    //   id: 1,
    //   employeeId: 1,
    //   employeeName: 'João Silva',
    //   employeeFunction: 'Operador de Máquinas',
    //   course: 'NR-33 Trabalhador Autorizado',
    //   completionDate: '15/08/2024',
    //   expiryDate: '14/08/2025',
    //   instructor: 'Eng. Roberto Silva',
    //   certificateNumber: 'NR33-2024-001',
    //   status: 'Válido'
    // },
    // {
    //   id: 2,
    //   employeeId: 2,
    //   employeeName: 'Maria Santos',
    //   employeeFunction: 'Técnica de Laboratório',
    //   course: 'NR-33 Vigias',
    //   completionDate: '10/11/2023',
    //   expiryDate: '09/11/2024',
    //   instructor: 'Téc. Ana Paula',
    //   certificateNumber: 'NR33-2023-042',
    //   status: 'Vencendo'
    // },
    // {
    //   id: 3,
    //   employeeId: 3,
    //   employeeName: 'Carlos Oliveira',
    //   employeeFunction: 'Auxiliar de Manutenção',
    //   course: 'NR-33 Supervisor de Entrada',
    //   completionDate: '20/09/2023',
    //   expiryDate: '19/09/2024',
    //   instructor: 'Eng. Carlos Mendes',
    //   certificateNumber: 'NR33-2023-028',
    //   status: 'Vencido'
    // },
    // {
    //   id: 4,
    //   employeeId: 4,
    //   employeeName: 'Ana Costa',
    //   employeeFunction: 'Supervisora',
    //   course: 'NR-33 Supervisor de Entrada',
    //   completionDate: '05/06/2024',
    //   expiryDate: '04/06/2025',
    //   instructor: 'Eng. Carlos Mendes',
    //   certificateNumber: 'NR33-2024-015',
    //   status: 'Válido'
    // }
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
    });
  });

  // ===== FORMULÁRIO =====
  if (trainingForm) {
    trainingForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveTraining();
    });
  }

  // ===== ATUALIZAR TABELA =====
  function updateTable() {
    if (!trainingsTableBody) return;

    trainingsTableBody.innerHTML = '';

    trainings.forEach(training => {
      const initials = training.employeeName.split(' ').map(n => n[0]).join('').substring(0, 2);
      const isExpired = training.status === 'Vencido';
      const isExpiring = training.status === 'Vencendo';

      const rowClass = isExpired ? 'row-expired' : isExpiring ? 'row-warning' : 'row-valid';
      const badgeClass = isExpired ? 'badge-danger' : isExpiring ? 'badge-warning' : 'badge-success';
      const statusText = isExpired ? 'Vencido' : isExpiring ? 'Vence em 7 dias' : 'Válido';

      const row = document.createElement('tr');
      row.dataset.id = training.id;
      row.classList.add(rowClass);

      row.innerHTML = `
        <td>
          <div class="employee-cell">
            <div class="avatar ${isExpired ? 'avatar-red' : isExpiring ? 'avatar-orange' : 'avatar-blue'}">${initials}</div>
            <div>
              <strong>${training.employeeName}</strong>
              <span>${training.employeeFunction}</span>
            </div>
          </div>
        </td>
        <td>${training.course}</td>
        <td>${training.completionDate}</td>
        <td>${training.expiryDate}</td>
        <td><span class="badge ${badgeClass}">${statusText}</span></td>
        <td>
        <div class="action-btns">
            <button class="btn-icon btn-icon-danger" title="Excluir" onclick="deleteTraining(${training.id})">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6l-1 14H6L5 6"></path>
                <path d="M10 11v6"></path>
                <path d="M14 11v6"></path>
                <path d="M9 6V4h6v2"></path>
              </svg>
            </button>
            <button class="btn-icon" title="Ver certificado" onclick="viewCertificate(${training.id})">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </button>
            ${isExpired ? `
              <button class="btn-icon btn-icon-danger" title="Renovar URGENTE" onclick="scheduleRecycling(${training.id})">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
              </button>
              <button class="btn-icon btn-icon-danger" title="Bloquear acesso" onclick="blockAccess(${training.id})">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
              </svg>
              </button>
            ` : `
            <button class="btn-icon btn-icon-warning" title="Agendar reciclagem" onclick="scheduleRecycling(${training.id})">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                </button>
                `}
                </div>
        </td>
      `;

      trainingsTableBody.appendChild(row);
    });

    // Atualizar contadores
    updateCounters();
  }

  // ===== ATUALIZAR CONTADORES =====
  function updateCounters() {
    const validCount = trainings.filter(t => t.status === 'Válido').length;
    const expiringCount = trainings.filter(t => t.status === 'Vencendo').length;
    
    const counters = document.querySelectorAll('.summary-value');
    if (counters[0]) counters[0].textContent = trainings.length;
    if (counters[1]) counters[1].textContent = validCount;
    if (counters[2]) counters[2].textContent = expiringCount;
  }

  // ===== INICIALIZAÇÃO =====
  // updateTable();
  // console.log('✅ Treinamentos NR-33 carregado');
  carregarTreinamentosDoBackend();
  console.log('✅ Treinamentos carregados do backend');


  // ===== EXPORTAR FUNÇÕES PARA GLOBAL =====
  window.trainings = trainings;
  window.updateTable = updateTable;
  window.nextId = nextId;
  window.editingId = editingId;

})();

// ===== FUNÇÕES GLOBAIS =====
function deleteTraining(id) {
  const training = window.trainings.find(t => t.id === id);
  if (!training) return;

  if (confirm(`Tem certeza que deseja excluir o treinamento de:\n\n${training.employeeName}\nCurso: ${training.course}\n\nEsta ação não pode ser desfeita.`)) {

    // Remove do array
    window.trainings = window.trainings.filter(t => t.id !== id);

    // Atualiza tabela
    window.updateTable();

    // Notificação
    showNotification('🗑️ Treinamento excluído com sucesso!', 'success');
  }
}
function openAddTrainingModal() {
  const modal = document.getElementById('trainingModal');
  const form = document.getElementById('trainingForm');
  const modalTitle = document.getElementById('modalTitle');
  
  // Resetar formulário
  form.reset();
  window.editingId = null;
  
  modalTitle.textContent = 'Registrar Novo Treinamento';
  modal.classList.add('show');
}

function closeTrainingModal() {
  const modal = document.getElementById('trainingModal');
  modal.classList.remove('show');
  window.editingId = null;
}

function saveTraining() {
  const employeeId = document.getElementById('employeeSelect').value;
  const course = document.getElementById('courseSelect').value;
  const completionDate = document.getElementById('completionDate').value;
  const instructor = document.getElementById('instructor').value.trim();
  const certificateNumber = document.getElementById('certificateNumber').value.trim();

  if (!employeeId || !course || !completionDate || !instructor || !certificateNumber) {
    showNotification('Preencha todos os campos obrigatórios!', 'warning');
    return;
  }

  // Calcular data de validade (1 ano após conclusão)
  const completion = new Date(completionDate);
  const expiry = new Date(completion);
  expiry.setFullYear(expiry.getFullYear() + 1);

  // Determinar status
  const now = new Date();
  const daysUntilExpiry = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
  let status = 'Válido';
  if (daysUntilExpiry < 0) status = 'Vencido';
  else if (daysUntilExpiry <= 30) status = 'Vencendo';

  // Mapear dados do funcionário
  const employees = {
    '1': { name: 'João Silva', function: 'Operador de Máquinas' },
    '2': { name: 'Maria Santos', function: 'Técnica de Laboratório' },
    '3': { name: 'Carlos Oliveira', function: 'Auxiliar de Manutenção' },
    '4': { name: 'Ana Costa', function: 'Supervisora' }
  };

  const courses = {
    'trabalhador': 'NR-33 Trabalhador Autorizado',
    'vigia': 'NR-33 Vigias',
    'supervisor': 'NR-33 Supervisor de Entrada'
  };

  const newTraining = {
    id: window.nextId || 5,
    employeeId: parseInt(employeeId),
    employeeName: employees[employeeId].name,
    employeeFunction: employees[employeeId].function,
    course: courses[course],
    completionDate: formatDate(completionDate),
    expiryDate: formatDate(expiry.toISOString().split('T')[0]),
    instructor: instructor,
    certificateNumber: certificateNumber,
    status: status
  };

  window.trainings.push(newTraining);
  window.nextId = (window.nextId || 5) + 1;
  
  window.updateTable();
  closeTrainingModal();
  showNotification('Treinamento registrado com sucesso!', 'success');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function viewCertificate(id) {
  const training = window.trainings.find(t => t.id === id);
  if (!training) return;

  showNotification(`📄 Abrindo certificado ${training.certificateNumber}...`, 'info');
  
  setTimeout(() => {
    alert(`CERTIFICADO NR-33\n\n` +
          `Certificado: ${training.certificateNumber}\n` +
          `Funcionário: ${training.employeeName}\n` +
          `Curso: ${training.course}\n` +
          `Conclusão: ${training.completionDate}\n` +
          `Validade: ${training.expiryDate}\n` +
          `Instrutor: ${training.instructor}\n` +
          `Status: ${training.status}\n\n` +
          `Em produção, isso abriria o PDF do certificado.`);
  }, 500);
}

function scheduleRecycling(id) {
  const training = window.trainings.find(t => t.id === id);
  if (!training) return;

  const message = training.status === 'Vencido' 
    ? `URGENTE: Agendar reciclagem para:\n\n${training.employeeName}\nCurso: ${training.course}\n\nCertificado VENCIDO desde ${training.expiryDate}\n\nDeseja prosseguir?`
    : `Agendar reciclagem para:\n\n${training.employeeName}\nCurso: ${training.course}\nValidade: ${training.expiryDate}\n\nDeseja prosseguir?`;

  if (confirm(message)) {
    showNotification('📅 Reciclagem agendada! E-mail de confirmação enviado.', 'success');
    console.log('Reciclagem agendada para treinamento ID:', id);
  }
}

function blockAccess(id) {
  const training = window.trainings.find(t => t.id === id);
  if (!training) return;

  if (confirm(`BLOQUEAR ACESSO de ${training.employeeName}?\n\nEsta ação bloqueará o acesso do funcionário às áreas restritas devido ao treinamento vencido.\n\nDeseja continuar?`)) {
    showNotification(`🚫 Acesso de ${training.employeeName} bloqueado!`, 'warning');
    console.log('Acesso bloqueado para treinamento ID:', id);
  }
}

function filterByStatus(status) {
  const rows = document.querySelectorAll('#trainingsTableBody tr');
  
  rows.forEach(row => {
    if (status === 'all') {
      row.style.display = '';
    } else if (status === 'valido') {
      row.style.display = row.classList.contains('row-valid') ? '' : 'none';
    } else if (status === 'vencendo') {
      row.style.display = row.classList.contains('row-warning') ? '' : 'none';
    } else if (status === 'vencido') {
      row.style.display = row.classList.contains('row-expired') ? '' : 'none';
    }
  });

  showNotification(`Filtro aplicado: ${getStatusName(status)}`, 'info');
}

function getStatusName(status) {
  const names = {
    'all': 'Todos os Status',
    'valido': 'Válidos',
    'vencendo': 'Vencendo em 30 dias',
    'vencido': 'Vencidos'
  };
  return names[status] || status;
}

function viewExpiringTrainings() {
  showNotification('Abrindo lista de treinamentos vencendo...', 'info');
  
  // Scroll para seção de alertas
  const alertsSection = document.querySelector('.alerts-section');
  if (alertsSection) {
    alertsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function viewScheduleDetails(scheduleId) {
  const schedules = {
    1: {
      title: 'NR-33 Trabalhador Autorizado - Turma 11/2024',
      date: '08/11/2024',
      instructor: 'Eng. Roberto Silva',
      location: 'Sala de Treinamento - Bloco A',
      time: '08:00 às 17:00',
      enrolled: ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Lima', 'Carlos Pereira']
    },
    2: {
      title: 'NR-33 Vigias - Reciclagem',
      date: '15/11/2024',
      instructor: 'Téc. Ana Paula',
      location: 'Auditório Principal',
      time: '13:00 às 17:00',
      enrolled: ['Fernando Souza', 'Juliana Alves', 'Ricardo Martins']
    },
    3: {
      title: 'NR-33 Supervisor de Entrada',
      date: '22/11/2024',
      instructor: 'Eng. Carlos Mendes',
      location: 'Centro de Capacitação',
      time: '08:00 às 17:00 (5 dias)',
      enrolled: ['Ana Costa', 'Roberto Lima', 'Fernanda Silva']
    }
  };

  const schedule = schedules[scheduleId];
  if (!schedule) return;

  alert(`DETALHES DO TREINAMENTO\n\n` +
        `Curso: ${schedule.title}\n` +
        `Data: ${schedule.date}\n` +
        `Instrutor: ${schedule.instructor}\n` +
        `Local: ${schedule.location}\n` +
        `Horário: ${schedule.time}\n\n` +
        `INSCRITOS (${schedule.enrolled.length}):\n` +
        schedule.enrolled.map((name, i) => `${i + 1}. ${name}`).join('\n') +
        `\n\nEm produção, isso abriria um modal detalhado.`);
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
      
      showNotification('✅ Alerta resolvido com sucesso!', 'success');
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

// Fechar modal ao clicar fora
window.addEventListener('click', function(e) {
  const trainingModal = document.getElementById('trainingModal');
  
  if (e.target === trainingModal) {
    closeTrainingModal();
  }
});

// Fechar modal com ESC
window.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeTrainingModal();
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

// FNÇÃO DELETAR
function deleteTraining(id) {
  if (!confirm("Deseja realmente excluir este treinamento?")) return;

  fetch(`http://localhost:8080/treinamentos/${id}`, {
    method: 'DELETE'
  })
  .then(response => {
    if (response.ok) {
      alert("Treinamento excluído com sucesso!");

      // Remove a linha correspondente
      const row = document.querySelector(`#trainingsTableBody button[onclick='deleteTraining(${id})']`).closest('tr');
      if (row) row.remove();
    } else {
      alert("Erro ao excluir. Verifique o console.");
      console.error("Status:", response.status);
    }
  })
  .catch(error => console.error("Erro na requisição:", error));
}