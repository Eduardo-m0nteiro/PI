import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CONFIG, CUPONS, MERCADOS, ofertas, produtoPorId } from "../data/catalogo";
import { gravarStorage, lerStorage } from "../utils";
import { useToast } from "./ToastContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const notificar = useToast();
    const [lista, setLista] = useState(() => {
        const dados = lerStorage(CONFIG.chaveCarrinho, []);
        return Array.isArray(dados) ? dados.filter((i) => produtoPorId(i.id) && i.qtd > 0) : [];
    });
    const [modo, setModo] = useState("dividida"); // dividida | unico
    const [cupom, setCupom] = useState(() => lerStorage(CONFIG.chaveCupom, ""));

    useEffect(() => gravarStorage(CONFIG.chaveCarrinho, lista), [lista]);
    useEffect(() => gravarStorage(CONFIG.chaveCupom, cupom), [cupom]);

    const resumo = useMemo(() => {
        // Total de cada mercado se TUDO fosse comprado nele.
        const totalPorMercado = Object.fromEntries(MERCADOS.map((m) => [m, 0]));
        lista.forEach(({ id, qtd }) => {
            const p = produtoPorId(id);
            MERCADOS.forEach((m) => (totalPorMercado[m] += p.precos[m] * qtd));
        });
        const ranking = Object.entries(totalPorMercado).sort((a, b) => a[1] - b[1]);
        const mercadoUnico = ranking[0][0];

        const itens = lista.map(({ id, qtd }) => {
            const produto = produtoPorId(id);
            const oferta = modo === "dividida"
                ? ofertas(produto)[0]
                : { mercado: mercadoUnico, preco: produto.precos[mercadoUnico] };
            return { produto, qtd, mercado: oferta.mercado, preco: oferta.preco };
        });

        const subtotal = itens.reduce((s, i) => s + i.preco * i.qtd, 0);
        const maisCaro = ranking.at(-1)[1];
        const economia = Math.max(maisCaro - subtotal, 0);

        const def = CUPONS[cupom];
        const desconto = def?.tipo === "percentual" && subtotal > 0 ? subtotal * def.valor : 0;
        const freteGratis = subtotal >= CONFIG.freteGratisAcima || def?.tipo === "frete";
        const frete = subtotal > 0 && !freteGratis ? CONFIG.freteBase : 0;
        const total = Math.max(subtotal - desconto, 0) + frete;
        const quantidade = lista.reduce((s, i) => s + i.qtd, 0);

        return { itens, subtotal, desconto, frete, total, economia, quantidade, mercadoUnico };
    }, [lista, modo, cupom]);

    const quantidadeDe = useCallback((id) => lista.find((i) => i.id === id)?.qtd ?? 0, [lista]);

    const alterar = useCallback((id, delta) => {
        setLista((atual) => {
            const existe = atual.find((i) => i.id === id);
            if (!existe) return delta > 0 ? [...atual, { id, qtd: delta }] : atual;
            return atual.map((i) => (i.id === id ? { ...i, qtd: i.qtd + delta } : i)).filter((i) => i.qtd > 0);
        });
    }, []);

    const adicionar = useCallback((produto) => {
        alterar(produto.id, 1);
        notificar(`${produto.nome} adicionado ao carrinho.`);
    }, [alterar, notificar]);

    const limpar = useCallback(() => {
        setLista([]);
        setCupom("");
    }, []);

    // Retorna true se o cupom foi aplicado.
    const aplicarCupom = useCallback((codigo) => {
        const digitado = codigo.trim().toUpperCase();
        if (!digitado) return false;
        if (!CUPONS[digitado]) {
            notificar("Cupom inválido.", "erro");
            return false;
        }
        setCupom(digitado);
        notificar(`Cupom ${digitado} aplicado: ${CUPONS[digitado].descricao}.`);
        return true;
    }, [notificar]);

    const valor = { resumo, modo, setModo, cupom, quantidadeDe, alterar, adicionar, limpar, aplicarCupom };
    return <CartContext.Provider value={valor}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
