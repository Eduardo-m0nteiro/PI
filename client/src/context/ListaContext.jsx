import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MERCADOS, produtoPorId } from "../data/catalogo";
import { gravarStorage, lerStorage } from "../utils";
import { useToast } from "./ToastContext";

const CHAVE_LISTA = "invenire-lista";
const ListaContext = createContext(null);

// Lista de compras: guarda os produtos escolhidos e compara o total em cada mercado.
export function ListaProvider({ children }) {
    const notificar = useToast();
    const [ids, setIds] = useState(() => {
        const dados = lerStorage(CHAVE_LISTA, []);
        return Array.isArray(dados) ? dados.filter((id) => produtoPorId(id)) : [];
    });

    useEffect(() => gravarStorage(CHAVE_LISTA, ids), [ids]);

    const produtos = useMemo(() => ids.map(produtoPorId), [ids]);

    // Total da lista em cada mercado, do mais barato ao mais caro.
    const comparacao = useMemo(() => {
        const totais = MERCADOS.map((mercado) => ({
            mercado,
            total: produtos.reduce((soma, p) => soma + p.precos[mercado], 0),
        })).sort((a, b) => a.total - b.total);
        const maisCaro = totais.at(-1)?.total ?? 0;
        return totais.map((t, i) => ({ ...t, melhor: i === 0, economia: maisCaro - t.total, diferenca: t.total - totais[0].total }));
    }, [produtos]);

    const naLista = useCallback((id) => ids.includes(id), [ids]);

    const adicionarNaLista = useCallback((produto) => {
        setIds((atual) => (atual.includes(produto.id) ? atual : [...atual, produto.id]));
        notificar(`${produto.nome} adicionado à lista.`);
    }, [notificar]);

    const removerDaLista = useCallback((id) => setIds((atual) => atual.filter((i) => i !== id)), []);
    const limparLista = useCallback(() => setIds([]), []);

    const valor = { produtos, comparacao, naLista, adicionarNaLista, removerDaLista, limparLista };
    return <ListaContext.Provider value={valor}>{children}</ListaContext.Provider>;
}

export const useLista = () => useContext(ListaContext);
