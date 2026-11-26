const corpo = document.getElementById("lista-clientes");
const campoBusca = document.getElementById("busca");
const formBusca = document.getElementById("form-busca");

const TOTAL_COLUNAS = 6;

function criarCelula(texto) {
  const td = document.createElement("td");
  td.textContent = texto;
  return td;
}

function criarLink(texto, destino, rotulo) {
  const link = document.createElement("a");
  link.href = destino;
  link.className = "botao botao-sec";
  link.textContent = texto;
  link.setAttribute("aria-label", rotulo);
  return link;
}

function desenharLista() {
  const termo = normalizarTexto(campoBusca.value);

  const clientes = listarClientes()
    .filter(function (c) { return normalizarTexto(c.nome).includes(termo); })
    .sort(function (a, b) { return a.nome.localeCompare(b.nome, "pt-BR"); });

  corpo.replaceChildren();

  if (clientes.length === 0) {
    const tr = document.createElement("tr");
    const td = criarCelula(termo ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado ainda.");
    td.colSpan = TOTAL_COLUNAS;
    tr.append(td);
    corpo.append(tr);
    return;
  }

  clientes.forEach(function (c) {
    const saldo = saldoDoCliente(c.id);
    const tr = document.createElement("tr");

    tr.append(
      criarCelula(c.nome),
      criarCelula(formatarTelefone(c.telefone)),
      criarCelula(c.endereco || "-"),
      criarCelula(formatarMoeda(c.limiteCentavos))
    );

    // Saldo devedor + situação (sempre com texto, não só cor)
    const tdSaldo = criarCelula(formatarMoeda(saldo) + " ");
    const situacao = document.createElement("span");
    situacao.className = saldo > 0 ? "tag tag-devendo" : "tag tag-em-dia";
    situacao.textContent = saldo > 0 ? "Devendo" : "Em dia";
    tdSaldo.append(situacao);
    tr.append(tdSaldo);

    // Ações
    const acoes = document.createElement("div");
    acoes.className = "linha-form";
    acoes.append(
      criarLink("Editar", "editar_cliente.html?id=" + encodeURIComponent(c.id), "Editar " + c.nome),
      criarLink("Ver conta", "contas_clientes.html?id=" + encodeURIComponent(c.id), "Ver conta de " + c.nome)
    );
    const tdAcoes = document.createElement("td");
    tdAcoes.append(acoes);
    tr.append(tdAcoes);

    corpo.append(tr);
  });
}

campoBusca.addEventListener("input", desenharLista);
formBusca.addEventListener("submit", function (evento) {
  evento.preventDefault();
  desenharLista();
});

desenharLista();