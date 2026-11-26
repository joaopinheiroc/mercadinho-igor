const formItem = document.getElementById("form-item");
const selectProduto = document.getElementById("produto");
const campoQuantidade = document.getElementById("quantidade");
const msgItem = document.getElementById("msg-item");
const corpoVenda = document.getElementById("itens-venda");
const totalVenda = document.getElementById("total-venda");
const formPagamento = document.getElementById("form-pagamento");
const selectPagamento = document.getElementById("pagamento");
const campoCliente = document.getElementById("campo-cliente");
const selectCliente = document.getElementById("cliente");
const msgVenda = document.getElementById("msg-venda");
const corpoHoje = document.getElementById("vendas-hoje");
const avisoLimite = document.getElementById("aviso-limite");

let carrinho = [];
let temporizador;

function criarCelula(texto) {
  const td = document.createElement("td");
  td.textContent = texto;
  return td;
}

function totalDoCarrinho() {
  return carrinho.reduce(function (total, i) { return total + i.qtd * i.precoCentavos; }, 0);
}

function descreverItens(itens) {
  return itens.map(function (i) { return i.qtd + "x " + i.nome; }).join(", ");
}

/* ---------- listas de escolha ---------- */

function preencherProdutos() {
  const produtos = listarProdutos().sort(function (a, b) {
    return a.nome.localeCompare(b.nome, "pt-BR");
  });

  selectProduto.replaceChildren(new Option("Selecione o produto", ""));
  produtos.forEach(function (p) {
    const semEstoque = p.estoque <= 0;
    const texto = p.nome + ", " + formatarMoeda(p.precoCentavos) +
      (semEstoque ? " (sem estoque)" : " (estoque: " + p.estoque + ")");
    const opcao = new Option(texto, p.id);
    opcao.disabled = semEstoque;
    selectProduto.add(opcao);
  });
}

function preencherClientes() {
  const clientes = listarClientes().sort(function (a, b) {
    return a.nome.localeCompare(b.nome, "pt-BR");
  });

  selectCliente.replaceChildren(new Option("Selecione o cliente", ""));
  clientes.forEach(function (c) {
    const saldo = saldoDoCliente(c.id);
    const situacao = saldo > c.limiteCentavos
      ? "acima do limite"
      : "disponível " + formatarMoeda(c.limiteCentavos - saldo);
    const texto = c.nome + " - " + formatarTelefone(c.telefone) + " (" + situacao + ")";
    selectCliente.add(new Option(texto, c.id));
  });
}

/* ---------- venda atual (carrinho) ---------- */

function desenharCarrinho() {
  corpoVenda.replaceChildren();

  if (carrinho.length === 0) {
    const tr = document.createElement("tr");
    const td = criarCelula("Nenhum item adicionado ainda.");
    td.colSpan = 5;
    tr.append(td);
    corpoVenda.append(tr);
  }

  carrinho.forEach(function (item) {
    const tr = document.createElement("tr");
    tr.append(
      criarCelula(item.nome),
      criarCelula(formatarMoeda(item.precoCentavos)),
      criarCelula(String(item.qtd)),
      criarCelula(formatarMoeda(item.qtd * item.precoCentavos))
    );

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "botao botao-sec";
    botao.textContent = "Remover";
    botao.setAttribute("aria-label", "Remover " + item.nome);
    botao.addEventListener("click", function () {
      carrinho = carrinho.filter(function (i) { return i.produtoId !== item.produtoId; });
      desenharCarrinho();
    });

    const tdAcao = document.createElement("td");
    tdAcao.append(botao);
    tr.append(tdAcao);

    corpoVenda.append(tr);
  });

  totalVenda.textContent = formatarMoeda(totalDoCarrinho());
  atualizarAvisoLimite();
}

formItem.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const produto = buscarProduto(selectProduto.value);
  const qtd = parseInt(campoQuantidade.value, 10);

  if (!produto) {
    mostrarMensagem(msgItem, "Escolha um produto.", "erro");
    return;
  }
  if (!Number.isInteger(qtd) || qtd < 1) {
    mostrarMensagem(msgItem, "A quantidade deve ser 1 ou mais.", "erro");
    return;
  }

  const existente = carrinho.find(function (i) { return i.produtoId === produto.id; });
  const jaNaVenda = existente ? existente.qtd : 0;

  if (jaNaVenda + qtd > produto.estoque) {
    let texto = "Estoque insuficiente de " + produto.nome + ". Disponível: " + produto.estoque;
    texto += jaNaVenda ? " (já há " + jaNaVenda + " nesta venda)." : ".";
    mostrarMensagem(msgItem, texto, "erro");
    return;
  }

  if (existente) {
    existente.qtd += qtd;
  } else {
    // o preço é copiado agora: se mudar depois, esta venda não muda
    carrinho.push({
      produtoId: produto.id,
      nome: produto.nome,
      precoCentavos: produto.precoCentavos,
      qtd: qtd
    });
  }

  mostrarMensagem(msgItem, "", "");
  desenharCarrinho();
  formItem.reset();
  selectProduto.focus();
});

/* ---------- forma de pagamento ---------- */

function atualizarCampoCliente() {
  const fiado = selectPagamento.value === "Fiado";
  campoCliente.hidden = !fiado;
  selectCliente.required = fiado;
  atualizarAvisoLimite();
}

// Aviso ANTES de finalizar: mostra se esta venda vai passar do limite
function atualizarAvisoLimite() {
  const cliente = selectPagamento.value === "Fiado" ? buscarCliente(selectCliente.value) : null;

  if (!cliente || carrinho.length === 0) {
    mostrarMensagem(avisoLimite, "", "");
    return;
  }

  const novoSaldo = saldoDoCliente(cliente.id) + totalDoCarrinho();
  if (novoSaldo > cliente.limiteCentavos) {
    mostrarMensagem(
      avisoLimite,
      "Atenção: com esta venda, " + cliente.nome + " ficará devendo " + formatarMoeda(novoSaldo) +
      ", acima do limite de " + formatarMoeda(cliente.limiteCentavos) + ". A venda ainda pode ser finalizada.",
      "aviso"
    );
  } else {
    mostrarMensagem(avisoLimite, "", "");
  }
}

selectPagamento.addEventListener("change", atualizarCampoCliente);
selectCliente.addEventListener("change", atualizarAvisoLimite);

function falhar(texto) {
  mostrarMensagem(msgVenda, texto, "erro");
}

formPagamento.addEventListener("submit", function (evento) {
  evento.preventDefault();

  if (carrinho.length === 0) {
    falhar("Adicione pelo menos um item à venda.");
    return;
  }

  const forma = selectPagamento.value;
  const total = totalDoCarrinho();

  // Confere de novo o estoque (pode ter mudado em outra aba)
  const produtos = listarProdutos();
  for (const item of carrinho) {
    const produto = produtos.find(function (p) { return p.id === item.produtoId; });
    if (!produto) {
      falhar('O produto "' + item.nome + '" não existe mais. Remova-o da venda.');
      return;
    }
    if (produto.estoque < item.qtd) {
      falhar("Estoque insuficiente de " + item.nome + ". Disponível: " + produto.estoque + ".");
      return;
    }
  }

  // Fiado: precisa de cliente e de limite
  let cliente = null;
  if (forma === "Fiado") {
    if (listarClientes().length === 0) {
      falhar("Nenhum cliente cadastrado. Cadastre o cliente antes de vender no fiado.");
      return;
    }
    cliente = buscarCliente(selectCliente.value);
    if (!cliente) {
      falhar("Escolha o cliente da venda no fiado.");
      return;
    }
  }

  // Tudo certo: grava a venda
  const agora = new Date().toISOString();
  const novoSaldo = cliente ? saldoDoCliente(cliente.id) + total : 0;
  const itensVenda = carrinho.map(function (i) {
    return { produtoId: i.produtoId, nome: i.nome, qtd: i.qtd, precoCentavos: i.precoCentavos };
  });

  carrinho.forEach(function (item) {
    const produto = produtos.find(function (p) { return p.id === item.produtoId; });
    produto.estoque -= item.qtd;
  });
  salvarProdutos(produtos);

  const vendaId = gerarId();
  const vendas = listarVendas();
  vendas.push({
    id: vendaId,
    data: agora,
    itens: itensVenda,
    totalCentavos: total,
    pagamento: forma,
    clienteId: cliente ? cliente.id : null,
    clienteNome: cliente ? cliente.nome : null
  });
  salvarVendas(vendas);

  if (cliente) {
    const movimentos = listarMovimentos();
    movimentos.push({
      id: gerarId(),
      clienteId: cliente.id,
      tipo: "compra",
      valorCentavos: total,
      data: agora,
      itens: itensVenda,
      vendaId: vendaId
    });
    salvarMovimentos(movimentos);
  }

  // Limpa a tela e atualiza as listas
  carrinho = [];
  formPagamento.reset();
  atualizarCampoCliente();
  desenharCarrinho();
  preencherProdutos();
  preencherClientes();
  desenharVendasHoje();

  let texto = "Venda finalizada: " + formatarMoeda(total) + " (" + forma + ").";
  let tipo = "sucesso";

  if (cliente && novoSaldo > cliente.limiteCentavos) {
    texto += " Atenção: " + cliente.nome + " agora deve " + formatarMoeda(novoSaldo) +
      ", acima do limite de " + formatarMoeda(cliente.limiteCentavos) +
      " (excesso de " + formatarMoeda(novoSaldo - cliente.limiteCentavos) + ").";
    tipo = "aviso";
  }

  mostrarMensagem(msgVenda, texto, tipo);
  msgVenda.scrollIntoView({ behavior: "smooth", block: "nearest" });

  clearTimeout(temporizador);
  temporizador = setTimeout(function () {
    mostrarMensagem(msgVenda, "", "");
  }, tipo === "aviso" ? 10000 : 5000); // o aviso fica mais tempo
});

/* ---------- vendas de hoje ---------- */

function desenharVendasHoje() {
  const vendas = listarVendas()
    .filter(function (v) { return eHoje(v.data); })
    .sort(function (a, b) { return new Date(b.data) - new Date(a.data); });

  corpoHoje.replaceChildren();

  if (vendas.length === 0) {
    const tr = document.createElement("tr");
    const td = criarCelula("Nenhuma venda registrada hoje.");
    td.colSpan = 4;
    tr.append(td);
    corpoHoje.append(tr);
    return;
  }

  vendas.forEach(function (v) {
    const pagamento = v.pagamento === "Fiado" && v.clienteNome
      ? "Fiado (" + v.clienteNome + ")"
      : v.pagamento;

    const tr = document.createElement("tr");
    tr.append(
      criarCelula(formatarHora(v.data)),
      criarCelula(descreverItens(v.itens)),
      criarCelula(pagamento),
      criarCelula(formatarMoeda(v.totalCentavos))
    );
    corpoHoje.append(tr);
  });
}

/* ---------- início ---------- */

preencherProdutos();
preencherClientes();
atualizarCampoCliente();
desenharCarrinho();
desenharVendasHoje();