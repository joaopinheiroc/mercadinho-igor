const formEscolha = document.getElementById("form-escolha");
const campoCliente = document.getElementById("cliente");
const listaClientes = document.getElementById("lista-clientes");
const msgConta = document.getElementById("msg-conta");
const areaConta = document.getElementById("area-conta");
const selectPeriodo = document.getElementById("periodo");
const formPeriodo = document.getElementById("form-periodo");
const divHistorico = document.getElementById("historico");
const formPagamento = document.getElementById("form-pagamento");
const msgPagamento = document.getElementById("msg-pagamento");

let clienteAtualId = null;
let rotuloPorNome = {};
let rotuloPorId = {};
let temporizador;

/* ---------- escolha do cliente ---------- */

// Se dois clientes têm o mesmo nome, o telefone aparece na lista para diferenciar
function preencherLista() {
  const clientes = listarClientes();
  const contagem = {};
  clientes.forEach(function (c) {
    const chave = normalizarTexto(c.nome);
    contagem[chave] = (contagem[chave] || 0) + 1;
  });

  listaClientes.replaceChildren();
  rotuloPorNome = {};
  rotuloPorId = {};

  clientes.forEach(function (c) {
    const repetido = contagem[normalizarTexto(c.nome)] > 1;
    const rotulo = repetido ? c.nome + " (" + formatarTelefone(c.telefone) + ")" : c.nome;
    rotuloPorNome[rotulo] = c.id;
    rotuloPorId[c.id] = rotulo;

    const opcao = document.createElement("option");
    opcao.value = rotulo;
    listaClientes.append(opcao);
  });
}

function encontrarCliente(texto) {
  const t = normalizarTexto(texto);
  if (!t) return { erro: "Digite ou escolha o nome do cliente." };

  const rotulos = Object.keys(rotuloPorNome);
  const exato = rotulos.find(function (r) { return normalizarTexto(r) === t; });
  if (exato) return { id: rotuloPorNome[exato] };

  const parecidos = rotulos.filter(function (r) { return normalizarTexto(r).includes(t); });
  if (parecidos.length === 1) return { id: rotuloPorNome[parecidos[0]] };
  if (parecidos.length === 0) return { erro: "Cliente não encontrado. Confira o nome ou cadastre o cliente." };
  return { erro: "Mais de um cliente encontrado. Escolha um da lista." };
}

/* ---------- períodos e somas ---------- */

function noMesAtual(movimento) {
  const d = new Date(movimento.data);
  const hoje = new Date();
  return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
}

function filtrarPeriodo(movimentos) {
  const periodo = selectPeriodo.value;
  if (periodo === "todo") return movimentos;
  if (periodo === "30dias") {
    const limite = new Date();
    limite.setDate(limite.getDate() - 30);
    return movimentos.filter(function (m) { return new Date(m.data) >= limite; });
  }
  return movimentos.filter(noMesAtual);
}

function somar(movimentos) {
  return movimentos.reduce(function (total, m) { return total + m.valorCentavos; }, 0);
}

/* ---------- histórico ---------- */

function criarItemDl(rotulo, valor) {
  const div = document.createElement("div");
  const dt = document.createElement("dt");
  const dd = document.createElement("dd");
  dt.textContent = rotulo;
  dd.textContent = valor;
  div.append(dt, dd);
  return div;
}

function criarTabelaItens(itens) {
  const container = document.createElement("div");
  container.className = "tabela-container";

  const tabela = document.createElement("table");
  const cabecalho = document.createElement("thead");
  const linhaCab = document.createElement("tr");
  ["Produto", "Qtd.", "Preço unitário", "Subtotal"].forEach(function (titulo) {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = titulo;
    linhaCab.append(th);
  });
  cabecalho.append(linhaCab);

  const corpo = document.createElement("tbody");
  itens.forEach(function (item) {
    const tr = document.createElement("tr");
    [
      item.nome,
      String(item.qtd),
      formatarMoeda(item.precoCentavos),
      formatarMoeda(item.qtd * item.precoCentavos)
    ].forEach(function (texto) {
      const td = document.createElement("td");
      td.textContent = texto;
      tr.append(td);
    });
    corpo.append(tr);
  });

  tabela.append(cabecalho, corpo);
  container.append(tabela);
  return container;
}

function criarDetalhes(m, aberto) {
  const detalhes = document.createElement("details");
  detalhes.className = "movimento";
  detalhes.open = aberto;

  const resumo = document.createElement("summary");
  const tipo = m.tipo === "compra" ? "Compra no fiado" : "Pagamento";
  resumo.textContent = formatarDataHora(m.data) + " | " + tipo + " | " + formatarMoeda(m.valorCentavos);
  detalhes.append(resumo);

  if (m.tipo === "compra") {
    detalhes.append(criarTabelaItens(m.itens || []));

    const total = document.createElement("p");
    total.className = "total";
    total.textContent = "Total da compra: " + formatarMoeda(m.valorCentavos);

    const saldos = document.createElement("p");
    saldos.className = "nota";
    saldos.textContent = "Saldo antes: " + formatarMoeda(m.saldoAntes) + ". Saldo depois: " + formatarMoeda(m.saldoDepois) + ".";

    detalhes.append(total, saldos);
  } else {
    const dl = document.createElement("dl");
    dl.className = "dados-cliente";
    dl.append(
      criarItemDl("Forma de pagamento", m.forma),
      criarItemDl("Valor pago", formatarMoeda(m.valorCentavos)),
      criarItemDl("Saldo antes", formatarMoeda(m.saldoAntes)),
      criarItemDl("Saldo depois", formatarMoeda(m.saldoDepois))
    );
    detalhes.append(dl);
  }

  return detalhes;
}

function desenharHistorico(movimentos) {
  divHistorico.replaceChildren();

  const doPeriodo = filtrarPeriodo(movimentos).slice().reverse(); // mais recentes primeiro

  if (doPeriodo.length === 0) {
    const aviso = document.createElement("p");
    aviso.textContent = "Nenhum lançamento neste período.";
    divHistorico.append(aviso);
    return;
  }

  doPeriodo.forEach(function (m, indice) {
    divHistorico.append(criarDetalhes(m, indice === 0));
  });
}

/* ---------- conta completa ---------- */

function desenharConta() {
  const cliente = buscarCliente(clienteAtualId);
  if (!cliente) return;

  const movimentos = movimentosComSaldo(cliente.id);
  const saldo = movimentos.length ? movimentos[movimentos.length - 1].saldoDepois : 0;
  const excesso = saldo - cliente.limiteCentavos;

  // Dados do cliente
  document.getElementById("titulo-dados").textContent = cliente.nome;
  document.getElementById("c-telefone").textContent = formatarTelefone(cliente.telefone);
  document.getElementById("c-bairro").textContent = cliente.endereco || "-";
  document.getElementById("c-desde").textContent = formatarData(cliente.criadoEm);
  document.getElementById("c-limite").textContent = formatarMoeda(cliente.limiteCentavos);
  document.getElementById("c-disponivel").textContent = excesso > 0
    ? "R$ 0,00 (excedido em " + formatarMoeda(excesso) + ")"
    : formatarMoeda(cliente.limiteCentavos - saldo);
  document.getElementById("link-editar").href = "editar_cliente.html?id=" + encodeURIComponent(cliente.id);

  const tag = document.createElement("span");
  tag.className = saldo > 0 ? "tag tag-devendo" : "tag tag-em-dia";
  tag.textContent = excesso > 0 ? "Acima do limite" : (saldo > 0 ? "Devendo" : "Em dia");
  document.getElementById("c-situacao").replaceChildren(tag);

  // Resumo
  const compras = movimentos.filter(function (m) { return m.tipo === "compra"; });
  const pagamentos = movimentos.filter(function (m) { return m.tipo === "pagamento"; });

  document.getElementById("r-saldo").textContent = formatarMoeda(saldo);
  document.getElementById("r-compras").textContent = formatarMoeda(somar(compras.filter(noMesAtual)));
  document.getElementById("r-pago").textContent = formatarMoeda(somar(pagamentos.filter(noMesAtual)));
  document.getElementById("r-ultimo").textContent = pagamentos.length
    ? formatarData(pagamentos[pagamentos.length - 1].data)
    : "-";

  desenharHistorico(movimentos);
}

function mostrarConta(id) {
  clienteAtualId = id;
  campoCliente.value = rotuloPorId[id] || "";
  areaConta.hidden = false;
  mostrarMensagem(msgPagamento, "", "");
  mostrarMensagem(msgConta, "", "");
  desenharConta();
}

/* ---------- eventos ---------- */

formEscolha.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const resultado = encontrarCliente(campoCliente.value);
  if (resultado.erro) {
    clienteAtualId = null;
    areaConta.hidden = true;
    mostrarMensagem(msgConta, resultado.erro, "erro");
    return;
  }
  mostrarConta(resultado.id);
});

formPeriodo.addEventListener("submit", function (evento) {
  evento.preventDefault();
  desenharConta();
});
selectPeriodo.addEventListener("change", desenharConta);

formPagamento.addEventListener("submit", function (evento) {
  evento.preventDefault();
  if (!clienteAtualId) return;

  const valor = textoParaCentavos(formPagamento.valor.value);
  const saldo = saldoDoCliente(clienteAtualId);

  let erro = null;
  if (valor === null || valor <= 0) {
    erro = "Digite um valor válido, como 20,00.";
  } else if (saldo <= 0) {
    erro = "Esta conta não tem saldo devedor.";
  } else if (valor > saldo) {
    erro = "O valor pago não pode ser maior que o saldo devedor (" + formatarMoeda(saldo) + ").";
  }

  if (erro) {
    mostrarMensagem(msgPagamento, erro, "erro");
    return;
  }

  const movimentos = listarMovimentos();
  movimentos.push({
    id: gerarId(),
    clienteId: clienteAtualId,
    tipo: "pagamento",
    valorCentavos: valor,
    forma: formPagamento.forma.value,
    data: new Date().toISOString()
  });
  salvarMovimentos(movimentos);

  desenharConta();
  formPagamento.reset();

  mostrarMensagem(
    msgPagamento,
    "Pagamento de " + formatarMoeda(valor) + " registrado. Novo saldo: " + formatarMoeda(saldo - valor) + ".",
    "sucesso"
  );

  clearTimeout(temporizador);
  temporizador = setTimeout(function () {
    mostrarMensagem(msgPagamento, "", "");
  }, 5000);
});

/* ---------- início ---------- */

preencherLista();

// Se veio da lista (contas_clientes.html?id=...), já abre a conta
const idDaUrl = new URLSearchParams(window.location.search).get("id");
if (idDaUrl && buscarCliente(idDaUrl)) {
  mostrarConta(idDaUrl);
}