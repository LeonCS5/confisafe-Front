(function () {
  'use strict';

  // ===== ELEMENTOS =====
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const logoutBtn = document.getElementById('logoutBtn');

  const btnAddFuncionario = document.getElementById('btnAddFuncionario');
  const modal = document.getElementById('funcionarioModal');
  const closeModalBtn = document.getElementById('closeFuncionarioModal');
  const cancelBtn = document.getElementById('cancelFuncionarioBtn');
  const form = document.getElementById('funcionarioForm');
  const tbody = document.getElementById('funcionariosTableBody');

  const loadingSpinner = document.getElementById('loadingSpinner');
  const funcTelefoneInput = document.getElementById('funcTelefone');

  let funcionarios = [];
  let editingId = null;

  // ===== MENU MOBILE =====
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
    });

    document.addEventListener('click', function (e) {
      if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      }
    });
  }

  // ===== LOGOUT =====
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
      e.preventDefault();

      if (confirm('Deseja realmente sair do sistema?')) {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '../pages/login.html';
      }
    });
  }

  // ===== LOADING =====
  function setLoading(isLoading) {
    if (!loadingSpinner) return;
    loadingSpinner.style.display = isLoading ? 'flex' : 'none';
  }

  // ===== CARREGAR FUNCIONÁRIOS DO BACKEND =====
  async function carregarFuncionarios() {
    try {
      setLoading(true);
      const resp = await fetch('/api/funcionarios');
      if (!resp.ok) {
        throw new Error('Erro ao buscar funcionários: ' + resp.status);
      }
      const data = await resp.json();
      funcionarios = data;
      atualizarResumo();
      renderTable();
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar funcionários. Veja o console para detalhes.');
    } finally {
      setLoading(false);
    }
  }

  // ===== TABELA =====
  function renderTable() {
    if (!tbody) return;
    tbody.innerHTML = '';

    funcionarios.forEach(f => {
      const tr = document.createElement('tr');
      const initials = getInitials(f.nomeCompleto || '');

      const statusLabel = f.ativo ? 'Ativo' : 'Inativo';
      const statusClass = f.ativo ? 'badge badge--success' : 'badge badge--warning';

      tr.innerHTML = `
        <td>
          <div class="employee-cell">
            <div class="avatar avatar-blue">${initials}</div>
            <div>
              <strong>${f.nomeCompleto || '-'}</strong>
              <span>${f.cargo || ''}</span>
            </div>
          </div>
        </td>
        <td>${f.cargo || '-'}</td>
        <td>${f.departamento || '-'}</td>
        <td>${f.email || '-'}</td>
        <td>${f.telefone || '-'}</td>
        <td><span class="${statusClass}">${statusLabel}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn-icon" title="Editar" data-id="${f.id}" data-action="edit">
              ✏️
            </button>
            <button class="btn-icon btn-icon-danger" title="Excluir" data-id="${f.id}" data-action="delete">
              🗑️
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  // ===== RESUMO (cards de cima) =====
  function atualizarResumo() {
    const totalEl = document.getElementById('totalFuncionarios');
    const ativosEl = document.getElementById('funcionariosAtivos');
    const inativosEl = document.getElementById('funcionariosInativos');

    const total = funcionarios.length;
    const ativos = funcionarios.filter(f => f.ativo).length;
    const inativos = total - ativos;

    if (totalEl) totalEl.textContent = total;
    if (ativosEl) ativosEl.textContent = ativos;
    if (inativosEl) inativosEl.textContent = inativos;
  }

  // ===== MODAL =====
  function abrirModal(funcionario) {
    if (!modal) return;
    modal.classList.add('show');

    if (funcionario) {
      // edição
      editingId = funcionario.id;
      document.getElementById('modalFuncionarioTitle').textContent = 'Editar Funcionário';

      document.getElementById('funcNome').value = funcionario.nomeCompleto || '';
      document.getElementById('funcCargo').value = funcionario.cargo || '';
      document.getElementById('funcDepartamento').value = funcionario.departamento || '';
      document.getElementById('funcEmail').value = funcionario.email || '';
      document.getElementById('funcTelefone').value = funcionario.telefone || '';
      document.getElementById('funcAtivo').value = funcionario.ativo ? 'true' : 'false';
    } else {
      // novo
      editingId = null;
      document.getElementById('modalFuncionarioTitle').textContent = 'Novo Funcionário';
      form.reset();
      document.getElementById('funcAtivo').value = 'true';
    }
  }

  function fecharModal() {
    if (!modal) return;
    modal.classList.remove('show');
    editingId = null;
  }

   // ===== MÁSCARA DE TELEFONE (BR) =====
  if (funcTelefoneInput) {
    funcTelefoneInput.addEventListener('input', function (e) {
      let value = e.target.value;

      // remove tudo que não for número
      value = value.replace(/\D/g, '');

      // limita a 11 dígitos (DDD + 9 números)
      if (value.length > 11) {
        value = value.slice(0, 11);
      }

      // aplica máscara
      if (value.length > 6) {
        // (11) 99999-9999
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
      } else if (value.length > 2) {
        // (11) 9999...
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      } else if (value.length > 0) {
        // começa a digitar o DDD: "(1" / "(11"
        value = `(${value}`;
      }

      e.target.value = value;
    });
  }

  if (btnAddFuncionario) {
    btnAddFuncionario.addEventListener('click', () => abrirModal(null));
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', fecharModal);
  if (cancelBtn) cancelBtn.addEventListener('click', fecharModal);

  // Fechar modal clicando fora
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      fecharModal();
    }
  });

  // ESC fecha modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      fecharModal();
    }
  });

  // ===== SUBMIT DO FORMULÁRIO =====
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const payload = {
        nomeCompleto: document.getElementById('funcNome').value.trim(),
        cargo: document.getElementById('funcCargo').value.trim(),
        departamento: document.getElementById('funcDepartamento').value.trim(),
        email: document.getElementById('funcEmail').value.trim(),
        telefone: document.getElementById('funcTelefone').value.trim(),
        ativo: document.getElementById('funcAtivo').value === 'true'
      };

      if (!payload.nomeCompleto || !payload.cargo || !payload.email) {
        alert('Preencha pelo menos Nome, Cargo e E-mail.');
        return;
      }

      try {
        setLoading(true);
        let url = '/api/funcionarios';
        let method = 'POST';

        if (editingId !== null) {
          url = `/api/funcionarios/${editingId}`;
          method = 'PUT';
        }

        const resp = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!resp.ok) {
          throw new Error('Erro ao salvar funcionário: ' + resp.status);
        }

        await carregarFuncionarios();
        fecharModal();
      } catch (err) {
        console.error(err);
        alert('Erro ao salvar funcionário. Veja o console para detalhes.');
      } finally {
        setLoading(false);
      }
    });
  }

  // ===== AÇÕES NA TABELA (editar / excluir) =====
  if (tbody) {
    tbody.addEventListener('click', async function (e) {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');

      const funcionario = funcionarios.find(f => String(f.id) === String(id));
      if (!funcionario) return;

      if (action === 'edit') {
        abrirModal(funcionario);
      }

      if (action === 'delete') {
        const ok = confirm(`Deseja realmente excluir o funcionário:\n\n${funcionario.nomeCompleto}?`);
        if (!ok) return;

        try {
          setLoading(true);
          const resp = await fetch(`/api/funcionarios/${id}`, { method: 'DELETE' });
          if (!resp.ok && resp.status !== 204) {
            throw new Error('Erro ao excluir: ' + resp.status);
          }
          await carregarFuncionarios();
        } catch (err) {
          console.error(err);
          alert('Erro ao excluir funcionário.');
        } finally {
          setLoading(false);
        }
      }
    });
  }

  // ===== INICIALIZAÇÃO =====
  carregarFuncionarios();
  console.log('✅ Página de Funcionários inicializada');
})();
