let lista = [];
let resultado = { presencas: [], faltas: [] };

document.getElementById('anoAtual').textContent = new Date().getFullYear();

function iniciarChamada() {
  const texto = document.getElementById("nomesInput").value;
  lista = texto.split("\n").map(n => n.trim()).filter(n => n.length > 0);
  resultado = { presencas: [], faltas: [] };

  const chamadaDiv = document.getElementById("chamada");
  chamadaDiv.innerHTML = "";

  lista.forEach((nome, index) => {
    const div = document.createElement("div");
    div.className = "nome-item d-flex justify-content-between align-items-center";
    div.dataset.index = index;

    div.innerHTML = `
      <span class="fw-semibold">${nome}</span>
      <div>
        <button class="btn btn-success btn-sm me-2 btn-presenca" onclick="marcar(${index}, 'presenca')">Presença</button>
        <button class="btn btn-danger btn-sm btn-falta" onclick="marcar(${index}, 'falta')">Falta</button>
      </div>
    `;
    chamadaDiv.appendChild(div);
  });

  chamadaDiv.classList.remove("d-none");
  document.getElementById("resultado").innerHTML = "";
}

function marcar(index, status) {
  const nome = lista[index];

  resultado.presencas = resultado.presencas.filter(n => n !== nome);
  resultado.faltas = resultado.faltas.filter(n => n !== nome);

  if (status === "presenca") resultado.presencas.push(nome);
  if (status === "falta") resultado.faltas.push(nome);

  const item = document.querySelector(`[data-index="${index}"]`);
  if (item) {
    const btnPresenca = item.querySelector(".btn-presenca");
    const btnFalta = item.querySelector(".btn-falta");

    btnPresenca.classList.remove("active");
    btnFalta.classList.remove("active");

    if (status === "presenca") btnPresenca.classList.add("active");
    if (status === "falta") btnFalta.classList.add("active");
  }

  if (resultado.presencas.length + resultado.faltas.length === lista.length) {
    mostrarResultado();
  }
}

function mostrarResultado() {
  const resDiv = document.getElementById("resultado");
  resDiv.innerHTML = `
    <h2 class="mb-3">Resultado</h2>
    <div class="table-responsive">
      <table class="table table-bordered text-center">
        <thead class="table-light">
          <tr><th>Status</th><th>Nome</th></tr>
        </thead>
        <tbody>
          ${resultado.presencas.map(n => `
            <tr class="presente"><td>✅</td><td>${n}</td></tr>
          `).join("")}
          ${resultado.faltas.map(n => `
            <tr class="falta"><td>❌</td><td>${n}</td></tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    <pre>${JSON.stringify(resultado, null, 2)}</pre>
  `;
}
