let lista = [];
let resultado = { presencas: [], faltas: [] };
let statusMap = {}; // Rastreia status individual por index

document.getElementById('anoAtual').textContent = new Date().getFullYear();

// === Toast notification ===
function mostrarToast(msg) {
  const toastEl = document.getElementById('toastNotify');
  const toastMsg = document.getElementById('toastMsg');
  toastMsg.textContent = msg;
  const toast = new bootstrap.Toast(toastEl, { delay: 2500 });
  toast.show();
}

// === Salvar/Carregar nomes no localStorage ===
function salvarNomes() {
  const texto = document.getElementById("nomesInput").value.trim();
  if (!texto) {
    mostrarToast("⚠️ Nenhum nome para salvar.");
    return;
  }
  localStorage.setItem("enhacore_nomes", texto);
  const info = document.getElementById("salvamentoInfo");
  info.textContent = `✅ Lista salva em ${new Date().toLocaleTimeString("pt-BR")}`;
  mostrarToast("💾 Lista de nomes salva com sucesso!");
}

function carregarNomes() {
  const saved = localStorage.getItem("enhacore_nomes");
  if (saved) {
    document.getElementById("nomesInput").value = saved;
    mostrarToast("📋 Lista carregada!");
  } else {
    mostrarToast("⚠️ Nenhuma lista salva encontrada.");
  }
}

function limparNomes() {
  if (document.getElementById("nomesInput").value.trim() === "") return;
  if (confirm("Deseja realmente limpar os nomes?")) {
    document.getElementById("nomesInput").value = "";
    mostrarToast("🗑️ Nomes limpos.");
  }
}

// === Auto-carregar nomes salvos ao abrir ===
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("enhacore_nomes");
  if (saved) {
    document.getElementById("nomesInput").value = saved;
    document.getElementById("salvamentoInfo").textContent = "📂 Lista salva anteriormente foi carregada.";
  }
});

// === Iniciar chamada ===
function iniciarChamada() {
  const texto = document.getElementById("nomesInput").value;
  lista = texto.split("\n").map(n => n.trim()).filter(n => n.length > 0);

  if (lista.length === 0) {
    mostrarToast("⚠️ Insira pelo menos um nome!");
    return;
  }

  resultado = { presencas: [], faltas: [] };
  statusMap = {};

  const chamadaDiv = document.getElementById("chamada");
  chamadaDiv.innerHTML = "";

  lista.forEach((nome, index) => {
    const div = document.createElement("div");
    div.className = "nome-item d-flex justify-content-between align-items-center";
    div.dataset.index = index;
    div.style.animationDelay = `${index * 0.05}s`;

    div.innerHTML = `
      <div class="nome-text">
        <span class="nome-numero">${index + 1}</span>
        <span class="fw-semibold">${nome}</span>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-success btn-sm btn-presenca" onclick="marcar(${index}, 'presenca')">
          <i class="bi bi-check-lg"></i> Presente
        </button>
        <button class="btn btn-danger btn-sm btn-falta" onclick="marcar(${index}, 'falta')">
          <i class="bi bi-x-lg"></i> Falta
        </button>
      </div>
    `;
    chamadaDiv.appendChild(div);
  });

  chamadaDiv.classList.remove("d-none");
  document.getElementById("contadores").classList.remove("d-none");
  document.getElementById("searchContainer").classList.remove("d-none");
  document.getElementById("acoesRapidas").classList.remove("d-none");
  document.getElementById("resultado").innerHTML = "";
  document.getElementById("searchInput").value = "";

  atualizarContadores();
  mostrarToast(`📢 Chamada iniciada com ${lista.length} nome(s)!`);
}

// === Marcar presença/falta ===
function marcar(index, status) {
  const nome = lista[index];

  resultado.presencas = resultado.presencas.filter(n => n !== nome);
  resultado.faltas = resultado.faltas.filter(n => n !== nome);

  if (status === "presenca") resultado.presencas.push(nome);
  if (status === "falta") resultado.faltas.push(nome);

  statusMap[index] = status;

  const item = document.querySelector(`[data-index="${index}"]`);
  if (item) {
    const btnPresenca = item.querySelector(".btn-presenca");
    const btnFalta = item.querySelector(".btn-falta");

    btnPresenca.classList.remove("active");
    btnFalta.classList.remove("active");
    item.classList.remove("marcado-presenca", "marcado-falta");

    if (status === "presenca") {
      btnPresenca.classList.add("active");
      item.classList.add("marcado-presenca");
    }
    if (status === "falta") {
      btnFalta.classList.add("active");
      item.classList.add("marcado-falta");
    }
  }

  atualizarContadores();

  if (resultado.presencas.length + resultado.faltas.length === lista.length) {
    mostrarResultado();
  }
}

// === Atualizar contadores e barra de progresso ===
function atualizarContadores() {
  document.getElementById("totalCount").textContent = lista.length;
  document.getElementById("presencaCount").textContent = resultado.presencas.length;
  document.getElementById("faltaCount").textContent = resultado.faltas.length;

  const concluido = resultado.presencas.length + resultado.faltas.length;
  const pct = lista.length > 0 ? Math.round((concluido / lista.length) * 100) : 0;
  document.getElementById("progressBar").style.width = pct + "%";
  document.getElementById("progressText").textContent = `${pct}% concluído (${concluido}/${lista.length})`;
}

// === Filtrar nomes na busca ===
function filtrarNomes() {
  const termo = document.getElementById("searchInput").value.toLowerCase();
  document.querySelectorAll(".nome-item").forEach(item => {
    const nome = item.querySelector(".fw-semibold").textContent.toLowerCase();
    item.classList.toggle("hidden", !nome.includes(termo));
  });
}

// === Marcar todos ===
function marcarTodos(status) {
  const label = status === "presenca" ? "presentes" : "ausentes";
  if (!confirm(`Marcar todos como ${label}?`)) return;

  lista.forEach((_, index) => marcar(index, status));
  mostrarToast(`✅ Todos marcados como ${label}!`);
}

// === Resetar chamada ===
function resetarChamada() {
  if (!confirm("Deseja resetar todas as marcações?")) return;

  resultado = { presencas: [], faltas: [] };
  statusMap = {};

  document.querySelectorAll(".nome-item").forEach(item => {
    item.querySelector(".btn-presenca").classList.remove("active");
    item.querySelector(".btn-falta").classList.remove("active");
    item.classList.remove("marcado-presenca", "marcado-falta");
  });

  atualizarContadores();
  document.getElementById("resultado").innerHTML = "";
  mostrarToast("🔄 Chamada resetada!");
}

// === Mostrar resultado ===
function mostrarResultado() {
  const agora = new Date();
  const dataFormatada = agora.toLocaleDateString("pt-BR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
  const horaFormatada = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const total = lista.length;
  const pctPresenca = total > 0 ? Math.round((resultado.presencas.length / total) * 100) : 0;

  const resDiv = document.getElementById("resultado");
  resDiv.innerHTML = `
    <div class="card-glass mb-4 fade-in">
      <div class="card-header-custom">
        <i class="bi bi-clipboard-data-fill"></i> Resultado da Chamada
      </div>
      <div class="card-body-custom">
        <p class="text-muted mb-3">
          <i class="bi bi-calendar3"></i> ${dataFormatada} às ${horaFormatada}
        </p>

        <div class="row g-3 mb-3 text-center">
          <div class="col-6">
            <div class="stat-card stat-presenca">
              <div class="stat-number">${resultado.presencas.length}</div>
              <div class="stat-label">Presentes (${pctPresenca}%)</div>
            </div>
          </div>
          <div class="col-6">
            <div class="stat-card stat-falta">
              <div class="stat-number">${resultado.faltas.length}</div>
              <div class="stat-label">Ausentes (${100 - pctPresenca}%)</div>
            </div>
          </div>
        </div>

        <div class="resultado-lista mb-3">
          <h6 class="resultado-secao-titulo secao-presente"><i class="bi bi-check-circle-fill"></i> Presentes (${resultado.presencas.length})</h6>
          <div class="resultado-grupo">
            ${resultado.presencas.length > 0 ? resultado.presencas.map((n, i) => `
              <div class="resultado-item resultado-item-presente">
                <span class="resultado-numero">${i + 1}</span>
                <span class="resultado-nome">${n}</span>
                <span class="resultado-badge badge-presente">✅</span>
              </div>
            `).join("") : '<div class="resultado-vazio">Nenhum presente</div>'}
          </div>

          <h6 class="resultado-secao-titulo secao-falta mt-3"><i class="bi bi-x-circle-fill"></i> Ausentes (${resultado.faltas.length})</h6>
          <div class="resultado-grupo">
            ${resultado.faltas.length > 0 ? resultado.faltas.map((n, i) => `
              <div class="resultado-item resultado-item-falta">
                <span class="resultado-numero">${i + 1}</span>
                <span class="resultado-nome">${n}</span>
                <span class="resultado-badge badge-falta">❌</span>
              </div>
            `).join("") : '<div class="resultado-vazio">Nenhum ausente</div>'}
          </div>
        </div>

        <div class="result-actions">
          <button class="btn btn-outline-info btn-sm" onclick="copiarResultado()">
            <i class="bi bi-clipboard"></i> Copiar Resultado
          </button>
          <button class="btn btn-outline-success btn-sm" onclick="copiarResumo()">
            <i class="bi bi-chat-text"></i> Copiar Resumo
          </button>
          <button class="btn btn-primary btn-sm" onclick="novaChamada()">
            <i class="bi bi-arrow-repeat"></i> Nova Chamada
          </button>
        </div>
      </div>
    </div>
  `;

  resDiv.scrollIntoView({ behavior: "smooth" });
}

// === Copiar resultado completo ===
function copiarResultado() {
  const agora = new Date();
  const data = agora.toLocaleDateString("pt-BR");

  let texto = `📋 CHAMADA CRESCIMENTO - ${data}\n\n`;
  texto += `✅ PRESENTES (${resultado.presencas.length}):\n`;
  resultado.presencas.forEach((n, i) => texto += `  ${i + 1}. ${n}\n`);
  texto += `\n❌ AUSENTES (${resultado.faltas.length}):\n`;
  resultado.faltas.forEach((n, i) => texto += `  ${i + 1}. ${n}\n`);
  texto += `\n📊 Total: ${lista.length} | Presentes: ${resultado.presencas.length} | Faltas: ${resultado.faltas.length}`;

  navigator.clipboard.writeText(texto).then(() => {
    mostrarToast("📋 Resultado copiado para a área de transferência!");
  });
}

// === Copiar resumo curto ===
function copiarResumo() {
  const agora = new Date();
  const data = agora.toLocaleDateString("pt-BR");
  const texto = `Chamada ${data} — ✅ ${resultado.presencas.length} presentes | ❌ ${resultado.faltas.length} ausentes (Total: ${lista.length})`;

  navigator.clipboard.writeText(texto).then(() => {
    mostrarToast("📋 Resumo copiado!");
  });
}

// === Nova chamada ===
function novaChamada() {
  document.getElementById("chamada").classList.add("d-none");
  document.getElementById("chamada").innerHTML = "";
  document.getElementById("contadores").classList.add("d-none");
  document.getElementById("searchContainer").classList.add("d-none");
  document.getElementById("acoesRapidas").classList.add("d-none");
  document.getElementById("resultado").innerHTML = "";

  resultado = { presencas: [], faltas: [] };
  statusMap = {};
  lista = [];

  window.scrollTo({ top: 0, behavior: "smooth" });
  mostrarToast("🆕 Pronto para uma nova chamada!");
}
