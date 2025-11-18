/**
 * CONFISAFE - Painel Inicial
 * Versão Empresarial Simplificada
 */

(function() {
  'use strict';

  // ===== ELEMENTOS DO DOM =====
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const logoutBtn = document.getElementById('logoutBtn');
  const navLinks = document.querySelectorAll('.nav-link');

  // ===== MENU MOBILE =====
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', function() {
      sidebar.classList.toggle('open');
    });

    // Fechar ao clicar fora (mobile)
    document.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      }
    });
  }

  // ===== MARCA LINK ATIVO =====
  function setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'inicial.html';
    
    navLinks.forEach(link => {
      const linkPage = link.getAttribute('href').split('/').pop();
      
      if (linkPage === currentPage) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // ===== LOGOUT =====
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (confirm('Deseja realmente sair do sistema?')) {
        // Limpar sessão
        sessionStorage.clear();
        localStorage.clear();
        
        // Redirecionar
        window.location.href = '../pages/login.html';
      }
    });
  }

  // ===== INICIALIZAÇÃO =====
  document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ ConfiSafe carregado');
    setActiveLink();
  });

})();