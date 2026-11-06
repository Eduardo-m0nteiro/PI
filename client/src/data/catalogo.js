export const MERCADOS = ["Compre Bem", "SuperVi"];

export const CONFIG = {
    freteBase: 10,
    freteGratisAcima: 120,
    chaveCarrinho: "invenire-carrinho-v2",
    chaveCupom: "invenire-cupom",
};

export const CUPONS = {
    BEMVINDO10: { tipo: "percentual", valor: 0.1, descricao: "10% de desconto" },
    ECONOMIA15: { tipo: "percentual", valor: 0.15, descricao: "15% de desconto" },
    FRETEGRATIS: { tipo: "frete", valor: 0, descricao: "frete grátis" },
};

export const CATEGORIAS = [
    { id: "padaria", rotulo: "Padaria" },
    { id: "hortifruti", rotulo: "Hortifruti" },
    { id: "bebidas", rotulo: "Bebidas" },
    { id: "limpeza", rotulo: "Limpeza" },
    { id: "mercearia", rotulo: "Mercearia" },
];

// precos: valor em cada mercado (Compre Bem, SuperVi).
export const PRODUTOS = [
    { id: "arroz", nome: "Arroz Branco", peso: "5 Kg", marca: "Cristal", categoria: "mercearia", imagem: "/assets/arroz.jpg", precos: { "Compre Bem": 24.9, SuperVi: 27.5 }, destaque: true },
    { id: "feijao", nome: "Feijão Carioca", peso: "1 Kg", marca: "Camil", categoria: "mercearia", imagem: "/assets/feijao.jpg", precos: { "Compre Bem": 8.9, SuperVi: 7.9 }, destaque: true },
    { id: "leite", nome: "Leite Integral", peso: "1 L", marca: "Piracanjuba", categoria: "bebidas", imagem: "/assets/leite.jpg", precos: { "Compre Bem": 5.49, SuperVi: 5.99 }, destaque: true },
    { id: "banana", nome: "Banana Prata", peso: "1 Kg", marca: "Hortifruti", categoria: "hortifruti", imagem: "/assets/banana.jpg", precos: { "Compre Bem": 7.99, SuperVi: 6.99 }, destaque: true },
    { id: "pao", nome: "Pão Francês", peso: "500 g", marca: "Padaria do dia", categoria: "padaria", imagem: "/assets/pao.jpg", precos: { "Compre Bem": 8.5, SuperVi: 9.2 }, destaque: true },
    { id: "cafe", nome: "Café Torrado e Moído", peso: "500 g", marca: "Pilão", categoria: "mercearia", imagem: "/assets/cafe.jpg", precos: { "Compre Bem": 18.9, SuperVi: 17.5 }, destaque: true },
    { id: "detergente", nome: "Detergente Neutro", peso: "500 ml", marca: "Ypê", categoria: "limpeza", imagem: "/assets/detergente.jpg", precos: { "Compre Bem": 2.99, SuperVi: 3.39 } },
    { id: "suco", nome: "Suco de Laranja", peso: "1 L", marca: "Del Valle", categoria: "bebidas", imagem: "/assets/suco-laranja.jpg", precos: { "Compre Bem": 11.9, SuperVi: 10.9 } },
    { id: "macarrao", nome: "Macarrão Espaguete", peso: "500 g", marca: "Renata", categoria: "mercearia", imagem: "/assets/macarrao.jpg", precos: { "Compre Bem": 6.79, SuperVi: 7.49 } },
    { id: "maca", nome: "Maçã Gala", peso: "1 Kg", marca: "Hortifruti", categoria: "hortifruti", imagem: "/assets/maca.jpg", precos: { "Compre Bem": 12.49, SuperVi: 13.9 } },
    { id: "agua-sanitaria", nome: "Água Sanitária", peso: "2 L", marca: "Qboa", categoria: "limpeza", imagem: "/assets/agua-sanitaria.jpg", precos: { "Compre Bem": 7.59, SuperVi: 6.9 } },
    { id: "bolo", nome: "Bolo de Chocolate", peso: "400 g", marca: "Padaria do dia", categoria: "padaria", imagem: "/assets/bolo-chocolate.jpg", precos: { "Compre Bem": 16.5, SuperVi: 18.9 } },
    { id: "agua", nome: "Água Mineral sem Gás", peso: "1,5 L", marca: "Crystal", categoria: "bebidas", imagem: "/assets/agua-mineral.jpg", precos: { "Compre Bem": 3.29, SuperVi: 2.99 } },
    { id: "sabao", nome: "Sabão em Pó", peso: "1 Kg", marca: "OMO", categoria: "limpeza", imagem: "/assets/sabao-po.jpg", precos: { "Compre Bem": 14.2, SuperVi: 15.5 } },
];

export const produtoPorId = (id) => PRODUTOS.find((p) => p.id === id);

// Mercados do produto ordenados do mais barato ao mais caro.
export function ofertas(produto) {
    return Object.entries(produto.precos)
        .map(([mercado, preco]) => ({ mercado, preco }))
        .sort((a, b) => a.preco - b.preco);
}
export const menorPreco = (p) => ofertas(p)[0].preco;
export const maiorPreco = (p) => ofertas(p).at(-1).preco;
