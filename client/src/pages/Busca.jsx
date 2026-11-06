import { useSearchParams } from "react-router-dom";
import Categorias from "../components/Categorias";
import { IconSearch } from "../components/Icons";
import Logo from "../components/Logo";
import ProductRow from "../components/ProductRow";
import Voltar from "../components/Voltar";
import { PRODUTOS, menorPreco } from "../data/catalogo";
import { useState } from "react";

export default function Busca() {
    const [params, setParams] = useSearchParams();
    const [decrescente, setDecrescente] = useState(false);
    const q = params.get("q") ?? "";
    const categoria = params.get("categoria") ?? "";

    function atualizar(chave, valor) {
        const novo = new URLSearchParams(params);
        if (valor) novo.set(chave, valor);
        else novo.delete(chave);
        setParams(novo, { replace: true });
    }

    const termo = q.trim().toLowerCase();
    const produtos = PRODUTOS
        .filter((p) => (!termo || `${p.nome} ${p.marca}`.toLowerCase().includes(termo)) && (!categoria || p.categoria === categoria))
        .sort((a, b) => (decrescente ? menorPreco(b) - menorPreco(a) : menorPreco(a) - menorPreco(b)));

    return (
        <>
            <div className="topo-pagina">
                <Voltar />
                <Logo altura={46} className="logo-topo" />
            </div>

            <label className="campo-busca">
                <IconSearch />
                <input type="search" value={q} onChange={(e) => atualizar("q", e.target.value)} placeholder="Buscar produtos..." aria-label="Buscar produtos" />
            </label>

            <Categorias ativa={categoria} onEscolher={(id) => atualizar("categoria", categoria === id ? "" : id)} />

            <div className="barra-ordenar">
                <button className="pilula" onClick={() => setDecrescente((v) => !v)}>
                    {decrescente ? "Preço: maior → menor" : "Ordenar por preço"}
                </button>
                <span className="contagem">{produtos.length} produto{produtos.length === 1 ? "" : "s"}</span>
            </div>

            <div className="lista-produtos">
                {produtos.map((p) => <ProductRow key={p.id} produto={p} />)}
            </div>
            {produtos.length === 0 && <p className="vazio">Nenhum produto encontrado para sua busca.</p>}
        </>
    );
}
