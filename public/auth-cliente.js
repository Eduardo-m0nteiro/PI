/* =========================================================
   Invenire Delivery — tela de autenticação (Entrar / Cadastrar)
   Comunica com a API (/api/login, /api/cadastro), alterna
   entre abas, mostra/oculta senha e valida a força da senha
   em tempo real.
========================================================= */
"use strict";

const $ = (id) => document.getElementById(id);

const toasts = $("toasts");
const tituloAuth = $("titulo-auth");
const subtituloAuth = $("subtitulo-auth");
const abaEntrar = $("aba-entrar");
const abaCadastrar = $("aba-cadastrar");
const formLogin = $("form-login");
const formCadastro = $("form-cadastro");
const erroFormLogin = $("erro-form-login");
const erroFormCadastro = $("erro-form-cadastro");
const botaoGoogle = $("botao-google");
const linkEsqueci = $("link-esqueci-senha");

const TEXTOS = {
    entrar: {
        titulo: "Bem-vindo de volta",
        subtitulo: "Entre para acompanhar pedidos e finalizar sua compra.",
    },
    cadastrar: {
        titulo: "Crie sua conta",
        subtitulo: "Cadastre-se para guardar seus dados de entrega e acompanhar pedidos.",
    },
};

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

function mostrarErro(elemento, mensagem) {
    if (!elemento) return;
    elemento.textContent = mensagem;
    elemento.hidden = false;
}

function esconderErro(elemento) {
    if (!elemento) return;
    elemento.hidden = true;
}

// ----- Abas Entrar / Cadastrar -----
function irParaAba(aba) {
    const ehEntrar = aba === "entrar";
    abaEntrar.classList.toggle("ativa", ehEntrar);
    abaEntrar.setAttribute("aria-selected", String(ehEntrar));
    abaCadastrar.classList.toggle("ativa", !ehEntrar);
    abaCadastrar.setAttribute("aria-selected", String(!ehEntrar));
    formLogin.hidden = !ehEntrar;
    formCadastro.hidden = ehEntrar;
    tituloAuth.textContent = TEXTOS[aba].titulo;
    subtituloAuth.textContent = TEXTOS[aba].subtitulo;
    esconderErro(erroFormLogin);
    esconderErro(erroFormCadastro);
}

abaEntrar.addEventListener("click", () => irParaAba("entrar"));
abaCadastrar.addEventListener("click", () => irParaAba("cadastrar"));

const parametrosUrl = new URLSearchParams(window.location.search);
irParaAba(parametrosUrl.get("aba") === "cadastrar" ? "cadastrar" : "entrar");

// ----- Mostrar/ocultar senha -----
document.querySelectorAll(".botao-icone-direita[data-alvo]").forEach((botao) => {
    botao.addEventListener("click", () => {
        const campo = $(botao.dataset.alvo);
        if (!campo) return;
        const oculto = campo.type === "password";
        campo.type = oculto ? "text" : "password";
        botao.textContent = oculto ? "🙈" : "👁";
        botao.setAttribute("aria-label", oculto ? "Ocultar senha" : "Mostrar senha");
    });
});

// ----- Checklist de força da senha -----
const REGRAS_SENHA = {
    tamanho: (s) => s.length >= 8,
    maiuscula: (s) => /[A-Z]/.test(s),
    numero: (s) => /[0-9]/.test(s),
    especial: (s) => /[^A-Za-z0-9]/.test(s),
};

function senhaAtendeTodasRegras(senha) {
    return Object.values(REGRAS_SENHA).every((teste) => teste(senha));
}

const campoSenhaCadastro = $("cad-senha");
if (campoSenhaCadastro) {
    campoSenhaCadastro.addEventListener("input", () => {
        const senha = campoSenhaCadastro.value;
        Object.entries(REGRAS_SENHA).forEach(([regra, teste]) => {
            const item = document.querySelector(`.item-regra[data-regra="${regra}"]`);
            if (!item) return;
            const ok = teste(senha);
            item.classList.toggle("ok", ok);
            item.querySelector(".icone").textContent = ok ? "✓" : "○";
        });
    });
}

// ----- Link "esqueceu sua senha" (sem backend de recuperação ainda) -----
if (linkEsqueci) {
    linkEsqueci.addEventListener("click", (e) => {
        e.preventDefault();
        notificar("Recuperação de senha em breve. Fale com o suporte por enquanto.", "info");
    });
}

// ----- Botão "Entrar com Google" (visual, sem integração ainda) -----
if (botaoGoogle) {
    botaoGoogle.addEventListener("click", () => {
        notificar("Login com Google em breve.", "info");
    });
}

// ----- Redirecionamento pós-login -----
function obterUrlRedirecionamento() {
    const destino = parametrosUrl.get("redirecionar");
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
if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        esconderErro(erroFormLogin);

        const email = $("login-email").value.trim();
        const senha = $("login-senha").value;
        const botao = $("botao-login");

        botao.disabled = true;
        try {
            const { ok, corpo } = await enviarJson("/api/login", { email, senha });
            if (!ok) {
                mostrarErro(erroFormLogin, corpo.erro || "Não foi possível entrar. Tente novamente.");
                return;
            }
            notificar(`Bem-vindo, ${corpo.nome.split(" ")[0]}!`);
            setTimeout(() => {
                window.location.href = obterUrlRedirecionamento();
            }, 500);
        } catch {
            mostrarErro(erroFormLogin, "Falha de conexão com o servidor. Verifique se ele está em execução.");
        } finally {
            botao.disabled = false;
        }
    });
}

// ----- Formulário de cadastro -----
if (formCadastro) {
    formCadastro.addEventListener("submit", async (e) => {
        e.preventDefault();
        esconderErro(erroFormCadastro);

        const nome = $("cad-nome").value.trim();
        const email = $("cad-email").value.trim();
        const senha = $("cad-senha").value;
        const confirmarSenha = $("cad-confirmar-senha").value;
        const botao = $("botao-cadastro");

        if (!senhaAtendeTodasRegras(senha)) {
            mostrarErro(erroFormCadastro, "A senha precisa atender a todos os requisitos listados.");
            return;
        }
        if (senha !== confirmarSenha) {
            mostrarErro(erroFormCadastro, "As senhas não coincidem.");
            return;
        }

        botao.disabled = true;
        try {
            const { ok, corpo } = await enviarJson("/api/cadastro", { nome, email, senha });
            if (!ok) {
                mostrarErro(erroFormCadastro, corpo.erro || "Não foi possível concluir o cadastro.");
                return;
            }
            notificar(`Conta criada com sucesso, ${corpo.nome.split(" ")[0]}!`);
            setTimeout(() => {
                window.location.href = obterUrlRedirecionamento();
            }, 500);
        } catch {
            mostrarErro(erroFormCadastro, "Falha de conexão com o servidor. Verifique se ele está em execução.");
        } finally {
            botao.disabled = false;
        }
    });
}
