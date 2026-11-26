const formEscolha = document.getElementById("form-escolha");
const formProduto = document.getElementById("form-produto");
const seletor = document.getElementById("produto");
const mensagem = document.getElementById("mensagem");

let produtoAtual = null;

function preencherSeletor(idSelecionado) {
  const produtos = listarProdutos().sort(function (a, b) {
    return a.nome.localeCompare(b.nome, "pt-BR");
  });

  seletor.replaceChildren(new Option("Selecione o produto", ""));
  produtos.forEach(function (p) {
    seletor.add(new Option(p.nome, p.id));
  });

  if (idSelecionado && buscarProduto(idSelecionado)) {
    seletor.value = idSelecionado;
  }
}

function carregarProduto(id) {
  const produto = buscarProduto(id);

  if (!produto) {
    produtoAtual = null;
    formProduto.reset();
    mostrarMensagem(mensagem, "Escolha um produto para editar.", "erro");
    return;
  }

  produtoAtual = produto;
  formProduto.nome.value = produto.nome;
  formProduto.categoria.value = produto.categoria;
  formProduto.preco.value = centavosParaCampo(produto.precoCentavos);
  formProduto.quantidade.value = produto.estoque;
  formProduto.minimo.value = produto.minimo;
  mostrarMensagem(mensagem, "", "");
}

formEscolha.addEventListener("submit", function (evento) {
  evento.preventDefault();
  carregarProduto(seletor.value);
});

formProduto.addEventListener("submit", function (evento) {
  evento.preventDefault();

  if (!produtoAtual) {
    mostrarMensagem(mensagem, "Escolha um produto e clique em \"Carregar produto\" antes de salvar.", "erro");
    return;
  }

  const dados = {
    nome: formProduto.nome.value.trim(),
    categoria: formProduto.categoria.value,
    precoCentavos: textoParaCentavos(formProduto.preco.value),
    estoque: parseInt(formProduto.quantidade.value, 10),
    minimo: parseInt(formProduto.minimo.value, 10)
  };

  const erro = validarProduto(dados, produtoAtual.id);
  if (erro) {
    mostrarMensagem(mensagem, erro, "erro");
    return;
  }

  const produtos = listarProdutos();
  const produto = produtos.find(function (p) { return p.id === produtoAtual.id; });

  produto.nome = dados.nome;
  produto.categoria = dados.categoria;
  produto.precoCentavos = dados.precoCentavos;
  produto.estoque = dados.estoque;
  produto.minimo = dados.minimo;

  salvarProdutos(produtos);
  produtoAtual = produto;
  preencherSeletor(produto.id);
  mostrarMensagem(mensagem, "Alterações salvas com sucesso!", "sucesso");
});

// Se veio da lista (editar_produto.html?id=...), já carrega o produto
const idDaUrl = new URLSearchParams(window.location.search).get("id");
preencherSeletor(idDaUrl);
if (idDaUrl) {
  carregarProduto(idDaUrl);
}