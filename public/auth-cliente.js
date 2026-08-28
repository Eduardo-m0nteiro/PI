/* =========================================================
   Invenire Delivery — login e cadastro
   Comunica com a API (/api/login, /api/cadastro) e trata
   erros de validação vindos do servidor.
========================================================= */
"use strict";

const CHAVE_TEMA = "invenire-tema";

const $ = (id) => document.getElementById(id);

const toasts = $("toasts");
const erroForm = $("erro-form");
const botaoTema = $("alternar-tema");

function notificar(texto, tipo = "sucesso") {
    if (!toasts) return;
    const toast = document.createElement("div");
    toast.className = `toast ${tipo}`;
    toast.textContent = texto;
    toasts.appendChild(toast);
    setTimeout(() => {
        toast.classList.add("saindo");
        toast.addEventListener("animationend", () => toast.remove());
    }, 3000);
}

function mostrarErro(mensagem) {
    if (!erroForm) return;
    erroForm.textContent = mensagem;
    erroForm.hidden = false;
}

function esconderErro() {
    if (!erroForm) return;
    erroForm.hidden = true;
}

function aplicarTema(escuro) {
    document.body.classList.toggle("tema-escuro", escuro);
    if (botaoTema) botaoTema.setAttribute("aria-pressed", String(escuro));
    localStorage.setItem(CHAVE_TEMA, escuro ? "escuro" : "claro");
}

if (botaoTema) {
    botaoTema.addEventListener("click", () => {
        aplicarTema(!document.body.classList.contains("tema-escuro"));
    });
}
aplicarTema(localStorage.getItem(CHAVE_TEMA) === "escuro");

function obterUrlRedirecionamento() {
    const parametros = new URLSearchParams(window.location.search);
    const destino = parametros.get("redirecionar");
    // Só aceitamos páginas locais do próprio site, nunca URLs externas.
    if (destino && /^[a-zA-Z0-9_-]+\.html$/.test(destino)) {
        return destino;
    }
    return "index.html";
}

async function enviarJson(url, dados) {
    const resposta = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
    });
    let corpo = {};
    try {
        corpo = await resposta.json();
    } catch {
        corpo = {};
    }
    return { ok: resposta.ok, status: resposta.status, corpo };
}

// ----- Formulário de login -----
const formLogin = $("form-login");
if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        esconderErro();

        const email = $("login-email").value.trim();
        const senha = $("login-senha").value;
        const botao = $("botao-login");

        botao.disabled = true;
        try {
            const { ok, corpo } = await enviarJson("/api/login", { email, senha });
            if (!ok) {
                mostrarErro(corpo.erro || "Não foi possível entrar. Tente novamente.");
                return;
            }
            notificar(`Bem-vindo, ${corpo.nome.split(" ")[0]}!`);
            setTimeout(() => {
                window.location.href = obterUrlRedirecionamento();
            }, 500);
        } catch {
            mostrarErro("Falha de conexão com o servidor. Verifique se ele está em execução.");
        } finally {
            botao.disabled = false;
        }
    });
}

// ----- Formulário de cadastro -----
const formCadastro = $("form-cadastro");
if (formCadastro) {
    formCadastro.addEventListener("submit", async (e) => {
        e.preventDefault();
        esconderErro();

        const nome = $("cad-nome").value.trim();
        const email = $("cad-email").value.trim();
        const senha = $("cad-senha").value;
        const confirmarSenha = $("cad-confirmar-senha").value;
        const botao = $("botao-cadastro");

        if (senha !== confirmarSenha) {
            mostrarErro("As senhas não coincidem.");
            return;
        }

        botao.disabled = true;
        try {
            const { ok, corpo } = await enviarJson("/api/cadastro", { nome, email, senha });
            if (!ok) {
                mostrarErro(corpo.erro || "Não foi possível concluir o cadastro.");
                return;
            }
            notificar(`Conta criada com sucesso, ${corpo.nome.split(" ")[0]}!`);
            setTimeout(() => {
                window.location.href = obterUrlRedirecionamento();
            }, 500);
        } catch {
            mostrarErro("Falha de conexão com o servidor. Verifique se ele está em execução.");
        } finally {
            botao.disabled = false;
        }
    });
}
