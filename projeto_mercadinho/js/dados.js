/* ===== Armazenamento (localStorage) ===== */
const CHAVE_PRODUTOS = "mercadinho_produtos";
const CHAVE_CLIENTES = "mercadinho_clientes";
const CHAVE_MOVIMENTOS = "mercadinho_movimentos";
const CHAVE_VENDAS = "mercadinho_vendas";

function lerDados(chave) {
  try {
    return JSON.parse(localStorage.getItem(chave)) || [];
  } catch (erro) {
    return [];
  }
}

function salvarDados(chave, lista) {
  localStorage.setItem(chave, JSON.stringify(lista));
}

function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ===== Dinheiro (sempre em centavos) ===== */

// "4,50", "4.50", "R$ 4,50", "1.234,50" -> 450, 450, 450, 123450 (ou null se inválido)
function textoParaCentavos(texto) {
  let t = String(texto).replace(/R\$/gi, "").replace(/\s/g, "");
  if (t.includes(",")) {
    t = t.replace(/\./g, "").replace(",", ".");
  }
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;

  const partes = t.split(".");
  const inteiro = parseInt(partes[0], 10);
  const decimal = parseInt(((partes[1] || "") + "00").slice(0, 2), 10);
  return inteiro * 100 + decimal;
}

// 450 -> "R$ 4,50"
function formatarMoeda(centavos) {
  const sinal = centavos < 0 ? "-" : "";
  const c = Math.abs(centavos);
  return sinal + "R$ " + Math.floor(c / 100).toLocaleString("pt-BR") + "," + String(c % 100).padStart(2, "0");
}

// 450 -> "4,50" (para preencher campos de formulário)
function centavosParaCampo(centavos) {
  return Math.floor(centavos / 100) + "," + String(centavos % 100).padStart(2, "0");
}

/* ===== Textos e mensagens ===== */

// "Café" e "cafe" ficam iguais, e maiúsculas não importam
function normalizarTexto(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

// tipo: "erro" ou "sucesso" (texto vazio limpa a mensagem)
function mostrarMensagem(elemento, texto, tipo) {
  if (!elemento) return;
  elemento.className = tipo || "";
  elemento.textContent = texto;
}

/* ===== Produtos ===== */

function listarProdutos() {
  return lerDados(CHAVE_PRODUTOS);
}

function salvarProdutos(lista) {
  salvarDados(CHAVE_PRODUTOS, lista);
}

function buscarProduto(id) {
  return listarProdutos().find(function (p) { return p.id === id; });
}

// Devolve o texto do erro, ou null se estiver tudo certo
function validarProduto(dados, ignorarId) {
  if (dados.nome.length < 2) return "Digite o nome do produto.";
  if (!dados.categoria) return "Escolha uma categoria.";
  if (dados.precoCentavos === null || dados.precoCentavos <= 0) {
    return "Digite um preço válido, como 4,50.";
  }
  if (!Number.isInteger(dados.estoque) || dados.estoque < 0) {
    return "A quantidade em estoque deve ser 0 ou mais.";
  }
  if (!Number.isInteger(dados.minimo) || dados.minimo < 0) {
    return "O estoque mínimo deve ser 0 ou mais.";
  }
  const repetido = listarProdutos().some(function (p) {
    return p.id !== ignorarId && normalizarTexto(p.nome) === normalizarTexto(dados.nome);
  });
  if (repetido) return "Já existe um produto com esse nome.";
  return null;
}

/* ===== Telefone e CPF ===== */

function somenteDigitos(texto) {
  return String(texto).replace(/\D/g, "");
}

// "88999990001" -> "(88) 99999-0001"
function formatarTelefone(digitos) {
  if (digitos.length === 11) {
    return "(" + digitos.slice(0, 2) + ") " + digitos.slice(2, 7) + "-" + digitos.slice(7);
  }
  if (digitos.length === 10) {
    return "(" + digitos.slice(0, 2) + ") " + digitos.slice(2, 6) + "-" + digitos.slice(6);
  }
  return digitos;
}

// "52998224725" -> "529.982.247-25"
function formatarCpf(digitos) {
  if (digitos.length !== 11) return digitos;
  return digitos.slice(0, 3) + "." + digitos.slice(3, 6) + "." + digitos.slice(6, 9) + "-" + digitos.slice(9);
}

// Recebe só dígitos. Confere os dois dígitos verificadores.
function cpfValido(cpf) {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  for (let t = 9; t < 11; t++) {
    let soma = 0;
    for (let i = 0; i < t; i++) {
      soma += parseInt(cpf[i], 10) * (t + 1 - i);
    }
    const digito = ((soma * 10) % 11) % 10;
    if (digito !== parseInt(cpf[t], 10)) return false;
  }
  return true;
}

/* ===== Clientes (só quem compra no fiado) ===== */

function listarClientes() {
  return lerDados(CHAVE_CLIENTES);
}

function salvarClientes(lista) {
  salvarDados(CHAVE_CLIENTES, lista);
}

function buscarCliente(id) {
  return listarClientes().find(function (c) { return c.id === id; });
}

// Compras no fiado somam, pagamentos subtraem
function saldoDoCliente(clienteId) {
  return lerDados(CHAVE_MOVIMENTOS)
    .filter(function (m) { return m.clienteId === clienteId; })
    .reduce(function (total, m) {
      return m.tipo === "compra" ? total + m.valorCentavos : total - m.valorCentavos;
    }, 0);
}

// "dados" já vem com telefone e cpf só com dígitos
function validarCliente(dados, ignorarId) {
  if (dados.nome.length < 3) return "Digite o nome completo do cliente.";

  if (dados.telefone.length !== 10 && dados.telefone.length !== 11) {
    return "Digite um telefone com DDD, como (88) 99999-0000.";
  }

  if (dados.cpf && !cpfValido(dados.cpf)) {
    return "CPF inválido. Confira os números ou deixe em branco.";
  }

  if (dados.limiteCentavos === null || dados.limiteCentavos <= 0) {
    return "Digite o limite de fiado, como 150,00.";
  }

  const outros = listarClientes().filter(function (c) { return c.id !== ignorarId; });

  if (dados.cpf && outros.some(function (c) { return c.cpf === dados.cpf; })) {
    return "Já existe um cliente com esse CPF.";
  }

  const repetido = outros.some(function (c) {
    return normalizarTexto(c.nome) === normalizarTexto(dados.nome) && c.telefone === dados.telefone;
  });
  if (repetido) return "Esse cliente já está cadastrado.";

  return null;
}

/* ===== Datas ===== */

function formatarData(iso) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function formatarHora(iso) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatarDataHora(iso) {
  return formatarData(iso) + " às " + formatarHora(iso);
}

/* ===== Lançamentos da conta (compras no fiado e pagamentos) ===== */

function listarMovimentos() {
  return lerDados(CHAVE_MOVIMENTOS);
}

function salvarMovimentos(lista) {
  salvarDados(CHAVE_MOVIMENTOS, lista);
}

// Lançamentos do cliente, do mais antigo ao mais novo, cada um com
// o saldo antes e o saldo depois dele
function movimentosComSaldo(clienteId) {
  const doCliente = listarMovimentos()
    .filter(function (m) { return m.clienteId === clienteId; })
    .sort(function (a, b) { return new Date(a.data) - new Date(b.data); });

  let saldo = 0;
  return doCliente.map(function (m) {
    const antes = saldo;
    saldo += m.tipo === "compra" ? m.valorCentavos : -m.valorCentavos;
    return Object.assign({}, m, { saldoAntes: antes, saldoDepois: saldo });
  });
}

/* ===== Vendas ===== */

function listarVendas() {
  return lerDados(CHAVE_VENDAS);
}

function salvarVendas(lista) {
  salvarDados(CHAVE_VENDAS, lista);
}

function eHoje(iso) {
  return new Date(iso).toDateString() === new Date().toDateString();
}
