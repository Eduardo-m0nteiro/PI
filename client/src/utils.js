export const formatarMoeda = (valor) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).replace(/ /g, " ");

export function lerStorage(chave, padrao) {
    try {
        const bruto = localStorage.getItem(chave);
        return bruto === null ? padrao : JSON.parse(bruto);
    } catch {
        return padrao;
    }
}

export function gravarStorage(chave, valor) {
    try {
        if (valor === "" || valor == null) localStorage.removeItem(chave);
        else localStorage.setItem(chave, JSON.stringify(valor));
    } catch {
        /* storage indisponível: segue sem persistir */
    }
}

// Troca por um SVG genérico uma única vez se a imagem falhar.
export function imagemFallback(e) {
    if (e.currentTarget.dataset.fallback) return;
    e.currentTarget.dataset.fallback = "1";
    e.currentTarget.src = "/assets/produto.svg";
}
