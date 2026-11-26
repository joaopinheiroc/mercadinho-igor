/* ===== Armazenamento (localStorage) ===== */
const CHAVE_PRODUTOS = "mercadinho_produtos";

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