import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { menorPreco } from "../data/catalogo";
import { formatarMoeda, imagemFallback } from "../utils";
import { IconPlus } from "./Icons";

// Cartão da home: imagem, nome, menor preço e botão "+".
export default function ProductCard({ produto }) {
    const { adicionar } = useCart();
    return (
        <article className="card-produto">
            <Link to={`/produto/${produto.id}`} className="card-produto-link">
                <span className="card-imagem"><img loading="lazy" src={produto.imagem} alt="" onError={imagemFallback} /></span>
                <span className="card-nome">{produto.nome}</span>
            </Link>
            <div className="card-rodape">
                <span className="card-preco">{formatarMoeda(menorPreco(produto))}</span>
                <button className="botao-mais" onClick={() => adicionar(produto)} aria-label={`Adicionar ${produto.nome} ao carrinho`}>
                    <IconPlus />
                </button>
            </div>
        </article>
    );
}
