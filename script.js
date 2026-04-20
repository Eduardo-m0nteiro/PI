const botoesAdicionar = document.querySelectorAll(".adicionar");
const listaCarrinho = document.getElementById("itens-carrinho");
const totalCarrinho = document.getElementById("total-carrinho");
const botoesCupom = document.querySelectorAll(".copiar-cupom");
const mensagemCupom = document.getElementById("mensagem-cupom");
const campoBusca = document.getElementById("busca-produto");
const botoesFiltro = document.querySelectorAll(".filtro");
const botaoOrdenar = document.getElementById("ordenar-preco");
const botaoLimparCarrinho = document.getElementById("limpar-carrinho");
const botaoTema = document.getElementById("alternar-tema");
const quantidadeCarrinho = document.getElementById("quantidade-carrinho");
const botaoAplicarCupom = document.getElementById("aplicar-cupom");
const campoCupomManual = document.getElementById("cupom-manual");
const mensagemCarrinho = document.getElementById("mensagem-carrinho");
const cardsProduto = Array.from(document.querySelectorAll(".card-produto"));
const imagensProduto = document.querySelectorAll(".imagem-produto");

const carrinho = [];
let categoriaAtiva = "todos";
let ordenacaoAtiva = false;
let descontoAplicado = 0;

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function renderizarCarrinho() {
    listaCarrinho.innerHTML = "";

    carrinho.forEach((item, indice) => {
        const linha = document.createElement("li");
        linha.className = "item-carrinho";
        linha.innerHTML = `
            <span>${item.nome} - ${formatarMoeda(item.preco)}</span>
            <button class="botao perigo remover-item" data-indice="${indice}">Remover</button>
        `;
        listaCarrinho.appendChild(linha);
    });

    const subtotal = carrinho.reduce((soma, item) => soma + item.preco, 0);
    const total = Math.max(subtotal - descontoAplicado, 0);
    totalCarrinho.textContent = formatarMoeda(total);
    quantidadeCarrinho.textContent = String(carrinho.length);
}

function exibirProdutos() {
    const busca = campoBusca.value.trim().toLowerCase();

    cardsProduto.forEach((card) => {
        const nome = card.dataset.nome;
        const categoria = card.dataset.categoria;
        const atendeBusca = nome.includes(busca);
        const atendeCategoria = categoriaAtiva === "todos" || categoria === categoriaAtiva;
        card.style.display = atendeBusca && atendeCategoria ? "grid" : "none";
    });
}

function ordenarProdutosPorPreco() {
    const grade = document.querySelector(".grade-produtos");
    const ordenados = [...cardsProduto].sort((a, b) => {
        const precoA = Number(a.dataset.preco);
        const precoB = Number(b.dataset.preco);
        return ordenacaoAtiva ? precoB - precoA : precoA - precoB;
    });

    ordenados.forEach((card) => grade.appendChild(card));
    ordenacaoAtiva = !ordenacaoAtiva;
    botaoOrdenar.textContent = ordenacaoAtiva ? "Preço: maior para menor" : "Preço: menor para maior";
}

function definirMensagemCarrinho(texto) {
    mensagemCarrinho.textContent = texto;
}

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

botoesAdicionar.forEach((botao) => {
    botao.addEventListener("click", () => {
        carrinho.push({
            nome: botao.dataset.nome,
            preco: Number(botao.dataset.preco)
        });
        definirMensagemCarrinho("Produto adicionado ao carrinho.");
        renderizarCarrinho();
    });
});

listaCarrinho.addEventListener("click", (evento) => {
    if (!evento.target.classList.contains("remover-item")) {
        return;
    }

    const indice = Number(evento.target.dataset.indice);
    carrinho.splice(indice, 1);
    definirMensagemCarrinho("Item removido do carrinho.");
    renderizarCarrinho();
});

botoesCupom.forEach((botao) => {
    botao.addEventListener("click", async () => {
        const cupom = botao.dataset.cupom;
        try {
            await navigator.clipboard.writeText(cupom);
            mensagemCupom.textContent = `Cupom ${cupom} copiado com sucesso!`;
        } catch (erro) {
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
    carrinho.length = 0;
    descontoAplicado = 0;
    campoCupomManual.value = "";
    definirMensagemCarrinho("Carrinho limpo com sucesso.");
    renderizarCarrinho();
});

botaoAplicarCupom.addEventListener("click", () => {
    const cupomDigitado = campoCupomManual.value.trim().toUpperCase();
    const subtotal = carrinho.reduce((soma, item) => soma + item.preco, 0);

    if (!cupomDigitado) {
        definirMensagemCarrinho("Digite um cupom para aplicar.");
        return;
    }

    if (subtotal === 0) {
        definirMensagemCarrinho("Adicione produtos antes de aplicar cupom.");
        return;
    }

    if (cupomDigitado === "BEMVINDO10") {
        descontoAplicado = subtotal * 0.1;
        definirMensagemCarrinho("Cupom de 10% aplicado.");
    } else if (cupomDigitado === "ECONOMIA15") {
        descontoAplicado = subtotal * 0.15;
        definirMensagemCarrinho("Cupom de 15% aplicado.");
    } else if (cupomDigitado === "FRETEGRATIS") {
        descontoAplicado = 8;
        definirMensagemCarrinho("Cupom de frete aplicado (R$ 8,00).");
    } else {
        descontoAplicado = 0;
        definirMensagemCarrinho("Cupom invalido.");
    }

    renderizarCarrinho();
});

botaoTema.addEventListener("click", () => {
    document.body.classList.toggle("tema-escuro");
    botaoTema.textContent = document.body.classList.contains("tema-escuro") ? "Tema claro" : "Tema escuro";
});

renderizarCarrinho();
exibirProdutos();
configurarFallbackImagens();
