const form = document.getElementById("form-login");
const erro = document.getElementById("erro-login");

// Se já está logado, pula direto para o painel
if (estaLogado()) {
  window.location.replace("admin/admin.html");
}

form.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const usuario = form.usuario.value.trim();
  const senha = form.senha.value;

  if (fazerLogin(usuario, senha)) {
    window.location.href = "admin/admin.html";
  } else {
    erro.textContent = "Usuário ou senha incorretos.";
    form.senha.value = "";
    form.senha.focus();
  }
});