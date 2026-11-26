const corpo = document.getElementById("lista-produtos");
const campoBusca = document.getElementById("busca");
const formBusca = document.getElementById("form-busca");

const TOTAL_COLUNAS = 6;

function criarCelula(texto) {
  const td = document.createElement("td");
  td.textContent = texto;
  return td;
}

function desenharLista() {
  const termo = normalizarTexto(campoBusca.value);

  const produtos = listarProdutos()
    .filter(function (p) { return normalizarTexto(p.nome).includes(termo); })
    .sort(function (a, b) { return a.nome.localeCompare(b.nome, "pt-BR"); });

  corpo.replaceChildren();

  if (produtos.length === 0) {
    const tr = document.createElement("tr");
    const td = criarCelula(termo ? "Nenhum produto encontrado." : "Nenhum produto cadastrado ainda.");
    td.colSpan = TOTAL_COLUNAS;
    tr.append(td);
    corpo.append(tr);
    return;
  }

  produtos.forEach(function (p) {
    const tr = document.createElement("tr");
    tr.append(
      criarCelula(p.nome),
      criarCelula(p.categoria),
      criarCelula(formatarMoeda(p.precoCentavos))
    );

    // Quantidade (com aviso quando está no mínimo ou abaixo)
    const tdQtd = criarCelula(String(p.estoque));
    if (p.minimo > 0 && p.estoque <= p.minimo) {
      const aviso = document.createElement("span");
      aviso.className = "tag tag-devendo";
      aviso.textContent = "Estoque baixo";
      tdQtd.append(" ", aviso);
    }
    tr.append(tdQtd);

    // Estoque mínimo
    tr.append(criarCelula(String(p.minimo)));

    // Ações
    const link = document.createElement("a");
    link.href = "editar_produto.html?id=" + encodeURIComponent(p.id);
    link.className = "botao botao-sec";
    link.textContent = "Editar";
    link.setAttribute("aria-label", "Editar " + p.nome);
    const tdAcoes = document.createElement("td");
    tdAcoes.append(link);
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