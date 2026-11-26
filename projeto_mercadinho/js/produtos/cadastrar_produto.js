const form = document.getElementById("form-produto");
const mensagem = document.getElementById("mensagem");
let temporizador;

form.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const dados = {
    nome: form.nome.value.trim(),
    categoria: form.categoria.value,
    precoCentavos: textoParaCentavos(form.preco.value),
    estoque: 0, // todo produto novo começa com 0 (RF02)
    minimo: parseInt(form.minimo.value, 10)
  };

  const erro = validarProduto(dados);
  if (erro) {
    mostrarMensagem(mensagem, erro, "erro");
    return;
  }

  const produtos = listarProdutos();
  produtos.push({
    id: gerarId(),
    nome: dados.nome,
    categoria: dados.categoria,
    precoCentavos: dados.precoCentavos,
    estoque: dados.estoque,
    minimo: dados.minimo
  });
  salvarProdutos(produtos);

  mostrarMensagem(mensagem, `Produto "${dados.nome}" cadastrado com sucesso!`, "sucesso");
  mensagem.scrollIntoView({ behavior: "smooth", block: "nearest" });

  clearTimeout(temporizador);
  temporizador = setTimeout(function () {
    mostrarMensagem(mensagem, "", "");
  }, 5000);

  form.reset();
  form.nome.focus();
});