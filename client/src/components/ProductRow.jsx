import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { maiorPreco, menorPreco } from "../data/catalogo";
import { formatarMoeda, imagemFallback } from "../utils";
import Quantidade from "./Quantidade";

// Linha da busca: imagem, nome/peso, menor (verde) e maior (vermelho) preço, quantidade.
export default function ProductRow({ produto }) {
    const { quantidadeDe, alterar } = useCart();
    return (
        <article className="linha-produto">
            <Link to={`/produto/${produto.id}`} className="linha-imagem"><img loading="lazy" src={produto.imagem} alt="" onError={imagemFallback} /></Link>
            <div className="linha-info">
                <Link to={`/produto/${produto.id}`} className="linha-nome">{produto.nome}</Link>
                <span className="linha-peso">{produto.peso}</span>
                <div className="linha-precos">
                    <span className="preco-verde">{formatarMoeda(menorPreco(produto))}</span>
                    <span className="preco-vermelho">{formatarMoeda(maiorPreco(produto))}</span>
                </div>
            </div>
            <Quantidade
                valor={quantidadeDe(produto.id)}
                rotulo={produto.nome}
                onMenos={() => alterar(produto.id, -1)}
                onMais={() => alterar(produto.id, 1)}
            />
        </article>
    );
}
