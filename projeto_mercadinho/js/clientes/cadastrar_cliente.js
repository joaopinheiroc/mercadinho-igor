const form = document.getElementById("form-cliente");
const mensagem = document.getElementById("mensagem");
let temporizador;

form.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const dados = {
    nome: form.nome.value.trim().replace(/\s+/g, " "),
    telefone: somenteDigitos(form.telefone.value),
    endereco: form.endereco.value.trim(),
    cpf: somenteDigitos(form.cpf.value),
    limiteCentavos: textoParaCentavos(form.limite.value)
  };

  const erro = validarCliente(dados);
  if (erro) {
    mostrarMensagem(mensagem, erro, "erro");
    return;
  }

  const clientes = listarClientes();
  clientes.push({
    id: gerarId(),
    nome: dados.nome,
    telefone: dados.telefone,
    endereco: dados.endereco,
    cpf: dados.cpf,
    limiteCentavos: dados.limiteCentavos,
    criadoEm: new Date().toISOString()
  });
  salvarClientes(clientes);

  mostrarMensagem(mensagem, `Cliente "${dados.nome}" cadastrado com sucesso!`, "sucesso");
  mensagem.scrollIntoView({ behavior: "smooth", block: "nearest" });

  clearTimeout(temporizador);
  temporizador = setTimeout(function () {
    mostrarMensagem(mensagem, "", "");
  }, 5000);

  form.reset();
  form.nome.focus();
});