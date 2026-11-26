const USUARIO_ADMIN = "admin";
const SENHA_ADMIN = "1234";
const CHAVE_SESSAO = "mercadinho_logado";

function fazerLogin(usuario, senha) {
  if (usuario === USUARIO_ADMIN && senha === SENHA_ADMIN) {
    sessionStorage.setItem(CHAVE_SESSAO, "sim");
    return true;
  }
  return false;
}

function estaLogado() {
  return sessionStorage.getItem(CHAVE_SESSAO) === "sim";
}

function sair() {
  sessionStorage.removeItem(CHAVE_SESSAO);
}

function exigirLogin() {
  if (!estaLogado()) {
    window.location.replace("../menu.html");
  }
}