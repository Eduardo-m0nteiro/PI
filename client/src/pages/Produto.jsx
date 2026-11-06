import { Navigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ofertas, produtoPorId } from "../data/catalogo";
import Quantidade from "../components/Quantidade";
import Voltar from "../components/Voltar";
import { formatarMoeda, imagemFallback } from "../utils";

export default function Produto() {
    const { id } = useParams();
    const produto = produtoPorId(id);
    const { quantidadeDe, alterar, adicionar } = useCart();
    if (!produto) return <Navigate to="/busca" replace />;

    const lista = ofertas(produto);
    const qtd = quantidadeDe(produto.id);

    return (
        <>
            <div className="topo-pagina"><Voltar para="/busca" /></div>
            <div className="produto-detalhe">
                <div className="produto-foto"><img src={produto.imagem} alt={produto.nome} onError={imagemFallback} /></div>
                <div className="produto-dados">
                    <h1>{produto.nome}</h1>
                    <p className="produto-linha">Tipo {produto.peso}</p>
                    <p className="produto-linha">Marca - {produto.marca}</p>
                    <hr />
                    <h2 className="titulo-secao">Onde comprar</h2>
                    <ul className="onde-comprar">
                        {lista.map(({ mercado, preco }, i) => (
                            <li key={mercado} className={i === 0 ? "melhor" : "caro"}>
                                <span className="ponto" /> <span className="mercado">{mercado}</span>
                                <strong>{formatarMoeda(preco)}</strong>
                            </li>
                        ))}
                    </ul>
                    <div className="produto-acao">
                        {qtd === 0 ? (
                            <button className="botao amarelo" onClick={() => adicionar(produto)}>Adicionar ao carrinho</button>
                        ) : (
                            <Quantidade valor={qtd} rotulo={produto.nome} onMenos={() => alterar(produto.id, -1)} onMais={() => alterar(produto.id, 1)} />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
