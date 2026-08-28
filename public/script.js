/* =========================================================
   Invenire Delivery — lógica da loja
   Carrinho com quantidades, persistência, frete, cupons,
   checkout e notificações.
========================================================= */

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

// ----- Elementos -----
const $ = (id) => document.getElementById(id);

const listaCarrinho = $("itens-carrinho");
const carrinhoVazio = $("carrinho-vazio");
const subtotalEl = $("subtotal-carrinho");
const descontoEl = $("desconto-carrinho");
const linhaDesconto = $("linha-desconto");
const freteEl = $("frete-carrinho");
const totalCarrinho = $("total-carrinho");
const quantidadeCarrinho = $("quantidade-carrinho");
const contadorBadge = $("contador-badge");
const freteTexto = $("frete-texto");
const barraFrete = $("barra-frete-preenchida");

const campoBusca = $("busca-produto");
const botaoOrdenar = $("ordenar-preco");
const contagemProdutos = $("contagem-produtos");
const semResultados = $("sem-resultados");

const mensagemCupom = $("mensagem-cupom");
const botaoAplicarCupom = $("aplicar-cupom");
const campoCupomManual = $("cupom-manual");
const mensagemCarrinho = $("mensagem-carrinho");
const botaoLimparCarrinho = $("limpar-carrinho");
const botaoTema = $("alternar-tema");
const botaoAbrirCarrinho = $("abrir-carrinho");
const botaoFinalizar = $("finalizar-pedido");

const botoesFiltro = document.querySelectorAll(".filtro");
const botoesCupom = document.querySelectorAll(".copiar-cupom");
const cardsProduto = Array.from(document.querySelectorAll(".card-produto"));
const imagensProduto = document.querySelectorAll(".imagem-produto");

// Modal
const modalCheckout = $("modal-checkout");
const fecharModal = $("fechar-modal");
const formCheckout = $("form-checkout");
const checkoutResumo = $("checkout-resumo");
const erroForm = $("erro-form");
const toasts = $("toasts");

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
    mensagemCarrinho.textContent = texto;
}

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
function adicionarAoCarrinho(nome, preco) {
    const existente = carrinho.find((item) => item.nome === nome);
    if (existente) {
        existente.qtd += 1;
    } else {
        carrinho.push({ nome, preco, qtd: 1 });
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
            <div class="item-topo">
                <div>
                    <div class="item-nome">${item.nome}</div>
                    <div class="item-preco-unit">${formatarMoeda(item.preco)} / un.</div>
                </div>
                <button class="remover-item" data-nome="${item.nome}" aria-label="Remover ${item.nome}">Remover</button>
            </div>
            <div class="item-base">
                <div class="controle-qtd">
                    <button class="qtd-menos" data-nome="${item.nome}" aria-label="Diminuir">−</button>
                    <span>${item.qtd}</span>
                    <button class="qtd-mais" data-nome="${item.nome}" aria-label="Aumentar">+</button>
                </div>
                <span class="item-subtotal">${formatarMoeda(item.preco * item.qtd)}</span>
            </div>
        `;
        listaCarrinho.appendChild(li);
    });

    carrinhoVazio.hidden = carrinho.length > 0;
}

function renderizarFrete(subtotal) {
    if (subtotal === 0) {
        freteTexto.textContent = "Adicione produtos para ver o frete.";
        barraFrete.style.width = "0%";
        return;
    }
    if (cupomAtivo === "FRETEGRATIS") {
        freteTexto.textContent = "🎉 Frete grátis com o cupom aplicado!";
        barraFrete.style.width = "100%";
        return;
    }
    const restante = CONFIG.freteGratisAcima - subtotal;
    if (restante <= 0) {
        freteTexto.textContent = "🎉 Você ganhou frete grátis!";
        barraFrete.style.width = "100%";
    } else {
        freteTexto.textContent = `Faltam ${formatarMoeda(restante)} para frete grátis.`;
        barraFrete.style.width = `${(subtotal / CONFIG.freteGratisAcima) * 100}%`;
    }
}

function atualizarCarrinho() {
    const { subtotal, desconto, frete, total } = calcularTotais();
    const totalItens = carrinho.reduce((s, i) => s + i.qtd, 0);

    renderizarItens();
    renderizarFrete(subtotal);

    subtotalEl.textContent = formatarMoeda(subtotal);
    descontoEl.textContent = `- ${formatarMoeda(desconto)}`;
    linhaDesconto.hidden = desconto <= 0;
    freteEl.textContent = frete === 0 ? "Grátis" : formatarMoeda(frete);
    totalCarrinho.textContent = formatarMoeda(total);
    quantidadeCarrinho.textContent = String(totalItens);
    contadorBadge.textContent = String(totalItens);

    salvarCarrinho();
}

// Delegação de eventos no carrinho
listaCarrinho.addEventListener("click", (e) => {
    const nome = e.target.dataset.nome;
    if (!nome) return;
    if (e.target.classList.contains("qtd-mais")) alterarQuantidade(nome, 1);
    else if (e.target.classList.contains("qtd-menos")) alterarQuantidade(nome, -1);
    else if (e.target.classList.contains("remover-item")) removerItem(nome);
});

// =========================================================
//  Produtos: busca, filtro, ordenação
// =========================================================
function exibirProdutos() {
    const busca = campoBusca.value.trim().toLowerCase();
    let visiveis = 0;

    cardsProduto.forEach((card) => {
        const nome = card.dataset.nome;
        const categoria = card.dataset.categoria;
        const atendeBusca = nome.includes(busca);
        const atendeCategoria = categoriaAtiva === "todos" || categoria === categoriaAtiva;
        const mostrar = atendeBusca && atendeCategoria;
        card.style.display = mostrar ? "flex" : "none";
        if (mostrar) visiveis += 1;
    });

    contagemProdutos.textContent = `${visiveis} produto${visiveis === 1 ? "" : "s"}`;
    semResultados.hidden = visiveis > 0;
}

function ordenarProdutosPorPreco() {
    const grade = $("grade-produtos");
    const ordenados = [...cardsProduto].sort((a, b) => {
        const pa = Number(a.dataset.preco);
        const pb = Number(b.dataset.preco);
        return ordenacaoAtiva ? pb - pa : pa - pb;
    });
    ordenados.forEach((card) => grade.appendChild(card));
    ordenacaoAtiva = !ordenacaoAtiva;
    botaoOrdenar.textContent = ordenacaoAtiva ? "Preço: maior → menor" : "Preço: menor → maior";
}

// =========================================================
//  Cupons
// =========================================================
function aplicarCupom(codigo) {
    const cupomDigitado = codigo.trim().toUpperCase();
    const { subtotal } = calcularTotais();

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
    modalCheckout.hidden = false;
    formCheckout.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(() => $("cli-nome").focus(), 100);
}

function fecharCheckout() {
    modalCheckout.hidden = true;
    document.body.style.overflow = "";
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

    // Limpa o carrinho após o pedido
    carrinho = [];
    cupomAtivo = "";
    localStorage.removeItem(CONFIG.chaveCupom);
    campoCupomManual.value = "";
    atualizarCarrinho();
    definirMensagemCarrinho("");

    formCheckout.reset();
    formCheckout.hidden = true;
    checkoutResumo.innerHTML = `
        <div class="confirmacao">
            <div class="icone-ok">✅</div>
            <h3>Pedido confirmado!</h3>
            <p>Obrigado, <strong>${nome}</strong>! Seu pedido está a caminho.</p>
            <p class="pedido-numero">Pedido ${numeroPedido}</p>
            <p>Total: <strong>${formatarMoeda(total)}</strong> · ${pagamento}</p>
            <p>Entrega estimada: até 45 minutos.</p>
            <button class="botao" id="fechar-confirmacao">Fechar</button>
        </div>
    `;
    notificar(`Pedido ${numeroPedido} confirmado! 🎉`);
    $("fechar-confirmacao").addEventListener("click", fecharCheckout);
}

// =========================================================
//  Tema
// =========================================================
function aplicarTema(escuro) {
    document.body.classList.toggle("tema-escuro", escuro);
    botaoTema.textContent = escuro ? "☀️ Tema claro" : "🌙 Tema escuro";
    botaoTema.setAttribute("aria-pressed", String(escuro));
    localStorage.setItem(CONFIG.chaveTema, escuro ? "escuro" : "claro");
}

// =========================================================
//  Fallback de imagens
// =========================================================
function configurarFallbackImagens() {
    imagensProduto.forEach((imagem) => {
        imagem.addEventListener("error", () => {
            if (!imagem.dataset.fallbackAplicado) {
                imagem.dataset.fallbackAplicado = "true";
                imagem.src = "./assets/produto.svg";
            }
        });
    });
}

// =========================================================
//  Eventos
// =========================================================
cardsProduto.forEach((card) => {
    const botao = card.querySelector(".adicionar");
    botao.addEventListener("click", () => {
        adicionarAoCarrinho(botao.dataset.nome, Number(botao.dataset.preco));
    });
});

botoesCupom.forEach((botao) => {
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

campoBusca.addEventListener("input", exibirProdutos);

botoesFiltro.forEach((botao) => {
    botao.addEventListener("click", () => {
        botoesFiltro.forEach((item) => item.classList.remove("ativo"));
        botao.classList.add("ativo");
        categoriaAtiva = botao.dataset.categoria;
        exibirProdutos();
    });
});

botaoOrdenar.addEventListener("click", ordenarProdutosPorPreco);

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

botaoAplicarCupom.addEventListener("click", () => aplicarCupom(campoCupomManual.value));
campoCupomManual.addEventListener("keydown", (e) => {
    if (e.key === "Enter") aplicarCupom(campoCupomManual.value);
});

botaoTema.addEventListener("click", () => {
    aplicarTema(!document.body.classList.contains("tema-escuro"));
});

botaoAbrirCarrinho.addEventListener("click", () => {
    $("carrinho").scrollIntoView({ behavior: "smooth", block: "start" });
});

botaoFinalizar.addEventListener("click", abrirCheckout);
fecharModal.addEventListener("click", fecharCheckout);
formCheckout.addEventListener("submit", confirmarPedido);
modalCheckout.addEventListener("click", (e) => {
    if (e.target === modalCheckout) fecharCheckout();
});
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modalCheckout.hidden) fecharCheckout();
});

// =========================================================
//  Inicialização
// =========================================================
function init() {
    aplicarTema(localStorage.getItem(CONFIG.chaveTema) === "escuro");
    if (cupomAtivo && carrinho.length > 0) {
        definirMensagemCarrinho(`Cupom ativo: ${cupomAtivo}.`);
    }
    const ano = $("ano-atual");
    if (ano) ano.textContent = new Date().getFullYear();
    atualizarCarrinho();
    exibirProdutos();
    configurarFallbackImagens();
}

init();

// =========================================================
//  Autenticação (login / cadastro / sessão)
// =========================================================
const areaConta = $("area-conta");
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
        // Sem servidor rodando (ex.: página aberta direto via arquivo) — trata como deslogado.
        renderizarContaDeslogada();
    }
}

function renderizarContaLogada(usuario) {
    window.usuarioLogado = usuario;
    if (!areaConta) return;
    const primeiroNome = usuario.nome.split(" ")[0];
    areaConta.innerHTML = `
        <span class="conta-saudacao">Olá, ${primeiroNome}</span>
        <button class="botao secundario" id="botao-sair">Sair</button>
    `;
    const botaoSair = $("botao-sair");
    if (botaoSair) botaoSair.addEventListener("click", encerrarSessao);
}

function renderizarContaDeslogada() {
    window.usuarioLogado = null;
    if (!areaConta) return;
    areaConta.innerHTML = `<a href="login.html" class="botao secundario">Entrar</a>`;
}

async function encerrarSessao() {
    try {
        await fetch("/api/logout", { method: "POST" });
    } catch {
        // Ignora falha de rede: encerra a sessão localmente de qualquer forma.
    } finally {
        notificar("Você saiu da sua conta.", "info");
        renderizarContaDeslogada();
    }
}

verificarSessao();
