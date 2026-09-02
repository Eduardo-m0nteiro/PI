/* =========================================================
   Invenire Delivery — lógica do app
   Navegação por views (Início / Busca / Pedidos / Perfil),
   carrinho com quantidades, frete, cupons, checkout em tela
   cheia e autenticação por sessão.
========================================================= */
"use strict";

// ----- Configurações -----
const CONFIG = {
    freteBase: 9.9,
    freteGratisAcima: 120,
    chaveCarrinho: "invenire-carrinho",
    chaveTema: "invenire-tema",
    chaveCupom: "invenire-cupom",
};

const CUPONS = {
    BEMVINDO10: { tipo: "percentual", valor: 0.1, descricao: "10% de desconto" },
    ECONOMIA15: { tipo: "percentual", valor: 0.15, descricao: "15% de desconto" },
    FRETEGRATIS: { tipo: "frete", valor: 0, descricao: "frete grátis" },
};

// ----- Catálogo -----
const PRODUTOS = [
    { nome: "Arroz Tipo 1 - 5kg", categoria: "mercearia", preco: 24.90, imagem: "assets/arroz.jpg", descricao: "Marca Prime, pacote econômico.", destaque: true },
    { nome: "Leite Integral - 1L", categoria: "bebidas", preco: 5.49, imagem: "assets/leite.jpg", descricao: "Caixa longa vida, super fresco.", destaque: true },
    { nome: "Detergente Neutro", categoria: "limpeza", preco: 2.99, imagem: "assets/detergente.jpg", descricao: "500ml, limpeza eficiente." },
    { nome: "Banana Prata - 1kg", categoria: "hortifruti", preco: 7.99, imagem: "assets/banana.jpg", descricao: "Fruta fresca selecionada.", destaque: true },
    { nome: "Pão Francês - 500g", categoria: "padaria", preco: 8.50, imagem: "assets/pao.jpg", descricao: "Forno do dia, crocante e macio.", destaque: true },
    { nome: "Feijão Carioca - 1kg", categoria: "mercearia", preco: 9.90, imagem: "assets/feijao.jpg", descricao: "Grãos selecionados para o dia a dia." },
    { nome: "Suco de Laranja - 1L", categoria: "bebidas", preco: 11.90, imagem: "assets/suco-laranja.jpg", descricao: "Suco integral, sem adição de açúcar." },
    { nome: "Macarrão Espaguete - 500g", categoria: "mercearia", preco: 6.79, imagem: "assets/macarrao.jpg", descricao: "Massa tradicional para o dia a dia." },
    { nome: "Maçã Gala - 1kg", categoria: "hortifruti", preco: 12.49, imagem: "assets/maca.jpg", descricao: "Fruta fresca, doce e selecionada." },
    { nome: "Água Sanitária - 2L", categoria: "limpeza", preco: 7.59, imagem: "assets/agua-sanitaria.jpg", descricao: "Ideal para limpeza pesada e desinfecção." },
    { nome: "Café Torrado e Moído - 500g", categoria: "mercearia", preco: 18.90, imagem: "assets/cafe.jpg", descricao: "Blend encorpado com aroma intenso.", destaque: true },
    { nome: "Bolo de Chocolate - 400g", categoria: "padaria", preco: 16.50, imagem: "assets/bolo-chocolate.jpg", descricao: "Macio e pronto para servir." },
    { nome: "Água Mineral sem Gás - 1,5L", categoria: "bebidas", preco: 3.29, imagem: "assets/agua-mineral.jpg", descricao: "Leve para hidratar o dia todo." },
    { nome: "Sabão em Pó - 1kg", categoria: "limpeza", preco: 14.20, imagem: "assets/sabao-po.jpg", descricao: "Roupas limpas e perfumadas por mais tempo." },
];

// ----- Elementos -----
const $ = (id) => document.getElementById(id);

const listaCarrinho = $("itens-carrinho");
const carrinhoVazio = $("carrinho-vazio");
const subtotalEl = $("subtotal-carrinho");
const descontoEl = $("desconto-carrinho");
const linhaDesconto = $("linha-desconto");
const freteEl = $("frete-carrinho");
const totalCarrinho = $("total-carrinho");
const quantidadeCarrinhoTopo = $("quantidade-carrinho-topo");
const contadorBadge = $("contador-badge");
const contadorNav = $("contador-nav");

const campoBusca = $("busca-produto");
const botaoOrdenar = $("ordenar-preco");
const contagemProdutos = $("contagem-produtos");
const semResultados = $("sem-resultados");
const gradeProdutosBusca = $("grade-produtos");
const gradeProdutosInicio = $("grade-produtos-inicio");

const mensagemCupom = $("mensagem-cupom");
const botaoAplicarCupom = $("aplicar-cupom");
const campoCupomManual = $("cupom-manual");
const mensagemCarrinho = $("mensagem-carrinho");
const botaoLimparCarrinho = $("limpar-carrinho");
const caixaTema = $("alternar-tema");
const pilulaCarrinho = $("pilula-carrinho");
const botaoFinalizar = $("finalizar-pedido");
const botaoVoltarCheckout = $("voltar-checkout");

const chipsCategoriaInicio = $("chips-categoria-inicio");
const botoesFiltroBusca = document.querySelectorAll(".chip.filtro");

// Checkout / confirmação
const formCheckout = $("form-checkout");
const checkoutResumo = $("checkout-resumo");
const erroForm = $("erro-form");
const confirmacaoConteudo = $("confirmacao-conteudo");
const toasts = $("toasts");

const navInferior = document.querySelector(".nav-inferior");
const itensNav = document.querySelectorAll(".item-nav");

// ----- Estado -----
let carrinho = carregarCarrinho();
let categoriaAtiva = "todos";
let ordenacaoAtiva = false;
let cupomAtivo = localStorage.getItem(CONFIG.chaveCupom) || "";

// =========================================================
//  Utilidades
// =========================================================
function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

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

function definirMensagemCarrinho(texto) {
    if (mensagemCarrinho) mensagemCarrinho.textContent = texto;
}

function escaparHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}

// =========================================================
//  Navegação por views
// =========================================================
const VIEWS = ["inicio", "busca", "pedidos", "perfil"];

function irPara(view) {
    VIEWS.forEach((v) => {
        const secao = $(`view-${v}`);
        if (secao) secao.hidden = v !== view;
    });
    itensNav.forEach((btn) => {
        const ativo = btn.dataset.view === view;
        btn.classList.toggle("ativo", ativo);
        btn.setAttribute("aria-current", ativo ? "page" : "false");
    });
    if (view === "perfil") renderizarPerfil();
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

function mostrarSubPedido(sub) {
    const mapa = { carrinho: "sub-carrinho", checkout: "sub-checkout", confirmacao: "sub-confirmacao" };
    Object.entries(mapa).forEach(([chave, id]) => {
        const el = $(id);
        if (el) el.hidden = chave !== sub;
    });
}

navInferior.addEventListener("click", (e) => {
    const botao = e.target.closest(".item-nav");
    if (!botao) return;
    if (botao.dataset.view === "pedidos") mostrarSubPedido("carrinho");
    irPara(botao.dataset.view);
});

pilulaCarrinho.addEventListener("click", () => {
    mostrarSubPedido("carrinho");
    irPara("pedidos");
});

// =========================================================
//  Persistência
// =========================================================
function carregarCarrinho() {
    try {
        const dados = JSON.parse(localStorage.getItem(CONFIG.chaveCarrinho));
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

function salvarCarrinho() {
    localStorage.setItem(CONFIG.chaveCarrinho, JSON.stringify(carrinho));
}

// =========================================================
//  Carrinho
// =========================================================
function adicionarAoCarrinho(nome, preco, imagem) {
    const existente = carrinho.find((item) => item.nome === nome);
    if (existente) {
        existente.qtd += 1;
    } else {
        carrinho.push({ nome, preco, qtd: 1, imagem: imagem || "assets/produto.svg" });
    }
    notificar(`${nome} adicionado ao carrinho.`);
    atualizarCarrinho();
}

function alterarQuantidade(nome, delta) {
    const item = carrinho.find((i) => i.nome === nome);
    if (!item) return;
    item.qtd += delta;
    if (item.qtd <= 0) {
        carrinho = carrinho.filter((i) => i.nome !== nome);
        notificar(`${nome} removido do carrinho.`, "info");
    }
    atualizarCarrinho();
}

function removerItem(nome) {
    carrinho = carrinho.filter((i) => i.nome !== nome);
    notificar(`${nome} removido do carrinho.`, "info");
    atualizarCarrinho();
}

function calcularTotais() {
    const subtotal = carrinho.reduce((s, i) => s + i.preco * i.qtd, 0);
    const cupom = CUPONS[cupomAtivo];

    let desconto = 0;
    let freteGratisPorCupom = false;

    if (cupom && subtotal > 0) {
        if (cupom.tipo === "percentual") {
            desconto = subtotal * cupom.valor;
        } else if (cupom.tipo === "frete") {
            freteGratisPorCupom = true;
        }
    }

    let frete = 0;
    if (subtotal > 0) {
        const gratisPorValor = subtotal >= CONFIG.freteGratisAcima;
        frete = gratisPorValor || freteGratisPorCupom ? 0 : CONFIG.freteBase;
    }

    const total = Math.max(subtotal - desconto, 0) + frete;
    return { subtotal, desconto, frete, total };
}

function renderizarItens() {
    listaCarrinho.innerHTML = "";

    carrinho.forEach((item) => {
        const li = document.createElement("li");
        li.className = "item-carrinho";
        li.innerHTML = `
            <img class="imagem-item" loading="lazy" src="${item.imagem}" alt="">
            <div class="item-info">
                <div class="item-nome">${escaparHtml(item.nome)}</div>
                <div class="item-preco-unit">${formatarMoeda(item.preco)} / un.</div>
                <div class="controle-qtd">
                    <button class="qtd-menos" data-nome="${escaparHtml(item.nome)}" aria-label="Diminuir">−</button>
                    <span>${item.qtd}</span>
                    <button class="qtd-mais" data-nome="${escaparHtml(item.nome)}" aria-label="Aumentar">+</button>
                </div>
            </div>
            <button class="remover-item" data-nome="${escaparHtml(item.nome)}" aria-label="Remover ${escaparHtml(item.nome)}">✕</button>
        `;
        listaCarrinho.appendChild(li);
    });

    carrinhoVazio.hidden = carrinho.length > 0;
}

function atualizarCarrinho() {
    const { subtotal, desconto, frete, total } = calcularTotais();
    const totalItens = carrinho.reduce((s, i) => s + i.qtd, 0);

    renderizarItens();

    subtotalEl.textContent = formatarMoeda(subtotal);
    descontoEl.textContent = `- ${formatarMoeda(desconto)}`;
    linhaDesconto.hidden = desconto <= 0;
    freteEl.textContent = frete === 0 ? "Grátis" : formatarMoeda(frete);
    totalCarrinho.textContent = formatarMoeda(total);
    quantidadeCarrinhoTopo.textContent = `${totalItens} ${totalItens === 1 ? "item" : "itens"}`;
    contadorBadge.textContent = String(totalItens);
    contadorNav.textContent = String(totalItens);
    contadorNav.hidden = totalItens === 0;

    salvarCarrinho();
}

listaCarrinho.addEventListener("click", (e) => {
    const nome = e.target.closest("[data-nome]")?.dataset.nome;
    if (!nome) return;
    if (e.target.closest(".qtd-mais")) alterarQuantidade(nome, 1);
    else if (e.target.closest(".qtd-menos")) alterarQuantidade(nome, -1);
    else if (e.target.closest(".remover-item")) removerItem(nome);
});

// =========================================================
//  Produtos: renderização, busca, filtro, ordenação
// =========================================================
function cartaoProdutoHtml(produto) {
    return `
        <article class="card-produto" data-categoria="${produto.categoria}" data-nome="${produto.nome.toLowerCase()}">
            <img class="imagem-produto" loading="lazy" src="${produto.imagem}" alt="${escaparHtml(produto.nome)}">
            <div class="info-produto">
                <span class="tag-categoria">${capitalizar(produto.categoria)}</span>
                <h3>${escaparHtml(produto.nome)}</h3>
                <p>${escaparHtml(produto.descricao)}</p>
                <span class="preco-produto">${formatarMoeda(produto.preco)}</span>
            </div>
            <button class="botao adicionar" data-nome="${escaparHtml(produto.nome)}" data-preco="${produto.preco}" data-imagem="${produto.imagem}" aria-label="Adicionar ${escaparHtml(produto.nome)} ao carrinho">+</button>
        </article>
    `;
}

function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function renderizarDestaques() {
    const destaques = PRODUTOS.filter((p) => p.destaque);
    gradeProdutosInicio.innerHTML = destaques.map(cartaoProdutoHtml).join("");
}

function exibirProdutosBusca() {
    const busca = campoBusca.value.trim().toLowerCase();
    let visiveis = PRODUTOS.filter((p) => {
        const atendeBusca = p.nome.toLowerCase().includes(busca);
        const atendeCategoria = categoriaAtiva === "todos" || p.categoria === categoriaAtiva;
        return atendeBusca && atendeCategoria;
    });

    visiveis = [...visiveis].sort((a, b) => (ordenacaoAtiva ? b.preco - a.preco : a.preco - b.preco));

    gradeProdutosBusca.innerHTML = visiveis.map(cartaoProdutoHtml).join("");
    contagemProdutos.textContent = `${visiveis.length} produto${visiveis.length === 1 ? "" : "s"}`;
    semResultados.hidden = visiveis.length > 0;
}

// Delegação: botão "Adicionar" tanto nos destaques (Início) quanto na Busca
document.addEventListener("click", (e) => {
    const botao = e.target.closest(".botao.adicionar");
    if (!botao) return;
    adicionarAoCarrinho(botao.dataset.nome, Number(botao.dataset.preco), botao.dataset.imagem);
    botao.classList.remove("pulsando");
    void botao.offsetWidth;
    botao.classList.add("pulsando");
});

campoBusca.addEventListener("input", exibirProdutosBusca);

botoesFiltroBusca.forEach((botao) => {
    botao.addEventListener("click", () => {
        botoesFiltroBusca.forEach((item) => item.classList.remove("ativo"));
        botao.classList.add("ativo");
        categoriaAtiva = botao.dataset.categoria;
        exibirProdutosBusca();
    });
});

botaoOrdenar.addEventListener("click", () => {
    ordenacaoAtiva = !ordenacaoAtiva;
    botaoOrdenar.textContent = ordenacaoAtiva ? "Preço: maior → menor" : "Preço: menor → maior";
    exibirProdutosBusca();
});

chipsCategoriaInicio.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    categoriaAtiva = chip.dataset.categoria;
    botoesFiltroBusca.forEach((item) => item.classList.toggle("ativo", item.dataset.categoria === categoriaAtiva));
    exibirProdutosBusca();
    irPara("busca");
});

// =========================================================
//  Cupons
// =========================================================
document.querySelectorAll(".copiar-cupom").forEach((botao) => {
    botao.addEventListener("click", async () => {
        const cupom = botao.dataset.cupom;
        try {
            await navigator.clipboard.writeText(cupom);
            mensagemCupom.textContent = `Cupom ${cupom} copiado com sucesso!`;
            notificar(`Cupom ${cupom} copiado!`, "info");
        } catch {
            mensagemCupom.textContent = `Cupom disponível: ${cupom}`;
        }
    });
});

function aplicarCupom(codigo) {
    const cupomDigitado = codigo.trim().toUpperCase();

    if (!cupomDigitado) {
        definirMensagemCarrinho("Digite um cupom para aplicar.");
        return;
    }
    if (carrinho.length === 0) {
        definirMensagemCarrinho("Adicione produtos antes de aplicar cupom.");
        notificar("Adicione produtos antes de aplicar cupom.", "erro");
        return;
    }
    if (!CUPONS[cupomDigitado]) {
        definirMensagemCarrinho("Cupom inválido.");
        notificar("Cupom inválido.", "erro");
        return;
    }

    cupomAtivo = cupomDigitado;
    localStorage.setItem(CONFIG.chaveCupom, cupomAtivo);
    definirMensagemCarrinho(`Cupom aplicado: ${CUPONS[cupomDigitado].descricao}.`);
    notificar(`Cupom ${cupomDigitado} aplicado!`);
    atualizarCarrinho();
}

botaoAplicarCupom.addEventListener("click", () => aplicarCupom(campoCupomManual.value));
campoCupomManual.addEventListener("keydown", (e) => {
    if (e.key === "Enter") aplicarCupom(campoCupomManual.value);
});

botaoLimparCarrinho.addEventListener("click", () => {
    if (carrinho.length === 0) return;
    carrinho = [];
    cupomAtivo = "";
    localStorage.removeItem(CONFIG.chaveCupom);
    campoCupomManual.value = "";
    definirMensagemCarrinho("Carrinho limpo com sucesso.");
    notificar("Carrinho esvaziado.", "info");
    atualizarCarrinho();
});

// =========================================================
//  Checkout
// =========================================================
function abrirCheckout() {
    if (carrinho.length === 0) {
        notificar("Seu carrinho está vazio.", "erro");
        return;
    }
    if (!window.usuarioLogado) {
        notificar("Faça login para finalizar seu pedido.", "erro");
        setTimeout(() => {
            window.location.href = "login.html?redirecionar=index.html";
        }, 1200);
        return;
    }
    const { subtotal, desconto, frete, total } = calcularTotais();
    checkoutResumo.innerHTML = `
        <div class="linha-resumo"><span>Subtotal</span><span>${formatarMoeda(subtotal)}</span></div>
        ${desconto > 0 ? `<div class="linha-resumo"><span>Desconto</span><span>- ${formatarMoeda(desconto)}</span></div>` : ""}
        <div class="linha-resumo"><span>Entrega</span><span>${frete === 0 ? "Grátis" : formatarMoeda(frete)}</span></div>
        <div class="linha-resumo total-linha"><span>Total</span><strong>${formatarMoeda(total)}</strong></div>
    `;
    erroForm.hidden = true;
    mostrarSubPedido("checkout");
    setTimeout(() => $("cli-nome")?.focus(), 150);
}

function confirmarPedido(e) {
    e.preventDefault();
    const nome = $("cli-nome").value.trim();
    const telefone = $("cli-telefone").value.trim();
    const endereco = $("cli-endereco").value.trim();
    const pagamento = $("cli-pagamento").value;

    if (!nome || !telefone || !endereco || !pagamento) {
        erroForm.textContent = "Preencha todos os campos para confirmar.";
        erroForm.hidden = false;
        return;
    }

    const { total } = calcularTotais();
    const numeroPedido = "INV" + Date.now().toString().slice(-6);

    carrinho = [];
    cupomAtivo = "";
    localStorage.removeItem(CONFIG.chaveCupom);
    campoCupomManual.value = "";
    atualizarCarrinho();
    definirMensagemCarrinho("");
    formCheckout.reset();

    confirmacaoConteudo.innerHTML = `
        <div class="icone-ok"><span aria-hidden="true">✓</span></div>
        <h2>Pedido confirmado!</h2>
        <p>Obrigado, <strong>${escaparHtml(nome)}</strong>! Seu pedido está a caminho.</p>
        <p class="pedido-numero">Pedido ${numeroPedido}</p>
        <p>Total: <strong>${formatarMoeda(total)}</strong> · ${escaparHtml(pagamento)}</p>
        <p>Entrega estimada: até 45 minutos.</p>
        <div class="acoes-confirmacao">
            <button class="botao primario" id="botao-voltar-inicio">Voltar para o início</button>
        </div>
    `;
    mostrarSubPedido("confirmacao");
    notificar(`Pedido ${numeroPedido} confirmado! 🎉`);
    $("botao-voltar-inicio").addEventListener("click", () => {
        mostrarSubPedido("carrinho");
        irPara("inicio");
    });
}

botaoFinalizar.addEventListener("click", abrirCheckout);
botaoVoltarCheckout.addEventListener("click", () => mostrarSubPedido("carrinho"));
formCheckout.addEventListener("submit", confirmarPedido);

// =========================================================
//  Tema
// =========================================================
function aplicarTema(claro) {
    document.body.classList.toggle("tema-claro", claro);
    caixaTema.checked = claro;
    localStorage.setItem(CONFIG.chaveTema, claro ? "claro" : "escuro");
}

caixaTema.addEventListener("change", () => aplicarTema(caixaTema.checked));

// =========================================================
//  Fallback de imagens (delegado, pois "error" não borbulha)
// =========================================================
document.addEventListener(
    "error",
    (e) => {
        const imagem = e.target;
        if (!(imagem instanceof HTMLImageElement)) return;
        if (!imagem.classList.contains("imagem-produto") && !imagem.classList.contains("imagem-item")) return;
        if (imagem.dataset.fallbackAplicado) return;
        imagem.dataset.fallbackAplicado = "true";
        imagem.src = "assets/produto.svg";
    },
    true
);

// =========================================================
//  Autenticação (login / cadastro / sessão)
// =========================================================
const areaConta = $("area-conta");
const areaPerfil = $("area-perfil");
window.usuarioLogado = null;

async function verificarSessao() {
    try {
        const resposta = await fetch("/api/me");
        if (resposta.ok) {
            const usuario = await resposta.json();
            renderizarContaLogada(usuario);
        } else {
            renderizarContaDeslogada();
        }
    } catch {
        renderizarContaDeslogada();
    }
}

function iniciais(nome) {
    return nome
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0].toUpperCase())
        .join("");
}

function renderizarContaLogada(usuario) {
    window.usuarioLogado = usuario;
    if (areaConta) {
        const primeiroNome = usuario.nome.split(" ")[0];
        areaConta.innerHTML = `
            <button class="conta-mini" id="botao-conta-mini">
                <span class="avatar-mini">${iniciais(usuario.nome)}</span>
                Olá, ${escaparHtml(primeiroNome)}
            </button>
        `;
        $("botao-conta-mini").addEventListener("click", () => irPara("perfil"));
    }
    renderizarPerfil();
}

function renderizarContaDeslogada() {
    window.usuarioLogado = null;
    if (areaConta) {
        areaConta.innerHTML = `<a href="login.html" class="conta-mini">Entrar</a>`;
    }
    renderizarPerfil();
}

function renderizarPerfil() {
    if (!areaPerfil) return;
    if (window.usuarioLogado) {
        const usuario = window.usuarioLogado;
        areaPerfil.innerHTML = `
            <div class="cartao-perfil">
                <div class="avatar-perfil">${iniciais(usuario.nome)}</div>
                <div class="nome-perfil">${escaparHtml(usuario.nome)}</div>
                <div class="email-perfil">${escaparHtml(usuario.email)}</div>
            </div>
            <div class="lista-links-perfil">
                <a class="link-perfil" href="#" id="link-meus-pedidos">Meus pedidos</a>
                <a class="link-perfil" href="index.html#cupons">Cupons de desconto</a>
                <button class="link-perfil sair" id="botao-sair" type="button">Sair da conta</button>
            </div>
        `;
        $("link-meus-pedidos").addEventListener("click", (e) => {
            e.preventDefault();
            mostrarSubPedido("carrinho");
            irPara("pedidos");
        });
        $("botao-sair").addEventListener("click", encerrarSessao);
    } else {
        areaPerfil.innerHTML = `
            <div class="perfil-deslogado">
                <div class="avatar-perfil" style="margin: 0 auto;">?</div>
                <p>Entre na sua conta para acompanhar pedidos e finalizar compras mais rápido.</p>
                <a href="login.html" class="botao primario">Entrar</a>
                <a href="cadastro.html" class="botao secundario">Criar conta</a>
            </div>
        `;
    }
}

async function encerrarSessao() {
    try {
        await fetch("/api/logout", { method: "POST" });
    } catch {
        // Ignora falha de rede: encerra a sessão localmente de qualquer forma.
    } finally {
        notificar("Você saiu da sua conta.", "info");
        renderizarContaDeslogada();
        irPara("inicio");
    }
}

// =========================================================
//  Inicialização
// =========================================================
function init() {
    aplicarTema(localStorage.getItem(CONFIG.chaveTema) === "claro");
    const ano = $("ano-atual");
    if (ano) ano.textContent = new Date().getFullYear();

    renderizarDestaques();
    exibirProdutosBusca();
    atualizarCarrinho();

    if (cupomAtivo && carrinho.length > 0) {
        definirMensagemCarrinho(`Cupom ativo: ${cupomAtivo}.`);
    }

    verificarSessao();
}

init();
