const formEscolha = document.getElementById("form-escolha");
const formCliente = document.getElementById("form-cliente");
const seletor = document.getElementById("cliente");
const mensagem = document.getElementById("mensagem");
const ajudaLimite = document.getElementById("ajuda-limite");

const TEXTO_AJUDA = "Valor máximo que o cliente pode ficar devendo.";
let clienteAtual = null;
let temporizador;

function preencherSeletor(idSelecionado) {
  const clientes = listarClientes().sort(function (a, b) {
    return a.nome.localeCompare(b.nome, "pt-BR");
  });

  seletor.replaceChildren(new Option("Selecione um cliente", ""));
  clientes.forEach(function (c) {
    seletor.add(new Option(c.nome, c.id));
  });

  if (idSelecionado && buscarCliente(idSelecionado)) {
    seletor.value = idSelecionado;
  }
}

function carregarCliente(id) {
  const cliente = buscarCliente(id);

  if (!cliente) {
    clienteAtual = null;
    formCliente.reset();
    ajudaLimite.textContent = TEXTO_AJUDA;
    mostrarMensagem(mensagem, "Escolha um cliente para editar.", "erro");
    return;
  }

  clienteAtual = cliente;
  formCliente.nome.value = cliente.nome;
  formCliente.telefone.value = formatarTelefone(cliente.telefone);
  formCliente.endereco.value = cliente.endereco;
  formCliente.cpf.value = formatarCpf(cliente.cpf);
  formCliente.limite.value = centavosParaCampo(cliente.limiteCentavos);
  ajudaLimite.textContent = "Saldo devedor atual: " + formatarMoeda(saldoDoCliente(cliente.id)) + ". " + TEXTO_AJUDA;
  mostrarMensagem(mensagem, "", "");
}

formEscolha.addEventListener("submit", function (evento) {
  evento.preventDefault();
  carregarCliente(seletor.value);
});

formCliente.addEventListener("submit", function (evento) {
  evento.preventDefault();

  if (!clienteAtual) {
    mostrarMensagem(mensagem, "Escolha um cliente e clique em \"Carregar cliente\" antes de salvar.", "erro");
    return;
  }

  const dados = {
    nome: formCliente.nome.value.trim().replace(/\s+/g, " "),
    telefone: somenteDigitos(formCliente.telefone.value),
    endereco: formCliente.endereco.value.trim(),
    cpf: somenteDigitos(formCliente.cpf.value),
    limiteCentavos: textoParaCentavos(formCliente.limite.value)
  };

  const erro = validarCliente(dados, clienteAtual.id);

  if (erro) {
    mostrarMensagem(mensagem, erro, "erro");
    return;
  }

  const clientes = listarClientes();
  const cliente = clientes.find(function (c) { return c.id === clienteAtual.id; });
  Object.assign(cliente, dados);
  salvarClientes(clientes);

  clienteAtual = cliente;
  preencherSeletor(cliente.id);
  mostrarMensagem(mensagem, "Alterações salvas com sucesso!", "sucesso");
  mensagem.scrollIntoView({ behavior: "smooth", block: "nearest" });

  clearTimeout(temporizador);
  temporizador = setTimeout(function () {
    mostrarMensagem(mensagem, "", "");
  }, 5000);
});

// Se veio da lista (editar_cliente.html?id=...), já carrega o cliente
const idDaUrl = new URLSearchParams(window.location.search).get("id");
preencherSeletor(idDaUrl);
if (idDaUrl) {
  carregarCliente(idDaUrl);
}