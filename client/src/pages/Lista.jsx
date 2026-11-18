import { useState } from "react";
import { Link } from "react-router-dom";
import { IconCart, IconCheck, IconList, IconTrash } from "../components/Icons";
import Voltar from "../components/Voltar";
import { useCart } from "../context/CartContext";
import { useLista } from "../context/ListaContext";
import { useToast } from "../context/ToastContext";
import { formatarMoeda, imagemFallback } from "../utils";

const SIGLA = { "Compre Bem": "CB", SuperVi: "SV" };

export default function Lista() {
    const { produtos, comparacao, removerDaLista, limparLista } = useLista();
    const { alterar } = useCart();
    const notificar = useToast();
    const [detalhes, setDetalhes] = useState(false);

    function levarAoCarrinho() {
        produtos.forEach((p) => alterar(p.id, 1));
        notificar("Itens da lista adicionados ao carrinho.");
        limparLista();
    }

    return (
        <>
            <div className="topo-lista">
                <Voltar />
                <Link to="/carrinho" className="icone-topo" aria-label="Ir para o carrinho"><IconCart /></Link>
            </div>
            <h1 className="titulo-pagina centro">Lista de Compras</h1>

            {produtos.length === 0 ? (
                <div className="lista-vazia">
                    <span className="lista-vazia-icone"><IconList /></span>
                    <h2>Sua lista de compras está vazia!</h2>
                    <p>Adicione os produtos que você precisa para ver as melhores opções de compra.</p>
                    <Link to="/busca" className="botao amarelo">Buscar produtos</Link>
                </div>
            ) : (
                <div className="lista-layout">
                    <section className="cartao-lista" aria-label="Sua lista">
                        <header className="cartao-lista-topo">
                            <h2>Sua Lista:</h2>
                            <span className="selo-itens">{produtos.length} {produtos.length === 1 ? "item" : "itens"}</span>
                        </header>
                        <ul>
                            {produtos.map((p) => (
                                <li key={p.id} className="lista-item">
                                    <span className="item-imagem"><img src={p.imagem} alt="" onError={imagemFallback} /></span>
                                    <div className="lista-item-info">
                                        <strong>{p.nome} {p.marca}</strong>
                                        <span>{p.peso}</span>
                                    </div>
                                    <button className="botao-lixeira" onClick={() => removerDaLista(p.id)} aria-label={`Remover ${p.nome} da lista`}><IconTrash /></button>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="cartao-lista opcoes" aria-label="Melhores opções">
                        <h2>Melhores opções para você:</h2>
                        <ul>
                            {comparacao.map((c) => (
                                <li key={c.mercado} className={`opcao${c.melhor ? " melhor" : ""}`}>
                                    <span className={`logo-mercado m-${SIGLA[c.mercado]}`}>{SIGLA[c.mercado]}</span>
                                    <div className="opcao-info">
                                        <strong>{c.mercado}</strong>
                                        {c.melhor && c.economia > 0 && <span className="economia-linha"><IconCheck /> Economia de {formatarMoeda(c.economia)}</span>}
                                    </div>
                                    <div className="opcao-preco">
                                        <strong>{formatarMoeda(c.total)}</strong>
                                        {c.melhor ? <span className="selo-melhor">Melhor preço</span> : <small>+{formatarMoeda(c.diferenca)}</small>}
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {detalhes && (
                            <table className="tabela-comparacao">
                                <thead>
                                    <tr><th scope="col">Produto</th>{comparacao.map((c) => <th scope="col" key={c.mercado}>{c.mercado}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {produtos.map((p) => (
                                        <tr key={p.id}>
                                            <th scope="row">{p.nome}</th>
                                            {comparacao.map((c) => <td key={c.mercado}>{formatarMoeda(p.precos[c.mercado])}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </section>

                    <div className="acoes-lista">
                        <button className="botao amarelo" onClick={() => setDetalhes((v) => !v)} aria-expanded={detalhes}>
                            {detalhes ? "Ocultar detalhes" : "Ver detalhes da comparação"}
                        </button>
                        {detalhes && <button className="botao contorno" onClick={levarAoCarrinho}>Adicionar lista ao carrinho</button>}
                    </div>
                </div>
            )}
        </>
    );
}
