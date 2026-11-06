import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import Quantidade from "../components/Quantidade";
import Voltar from "../components/Voltar";
import { formatarMoeda, imagemFallback } from "../utils";

export default function Carrinho() {
    const navigate = useNavigate();
    const notificar = useToast();
    const { usuario } = useAuth();
    const { resumo, modo, setModo, alterar, limpar } = useCart();
    const { itens, economia, mercadoUnico } = resumo;

    function finalizar() {
        if (itens.length === 0) return notificar("Seu carrinho está vazio.", "erro");
        if (!usuario) {
            notificar("Faça login para finalizar seu pedido.", "erro");
            return navigate("/login?redirecionar=/carrinho");
        }
        navigate("/checkout");
    }

    return (
        <>
            <div className="topo-pagina"><Voltar /></div>
            <h1 className="titulo-pagina">Seu carrinho</h1>

            <div className="abas" role="tablist" aria-label="Modo de compra">
                <button role="tab" aria-selected={modo === "dividida"} className={modo === "dividida" ? "ativa" : ""} onClick={() => setModo("dividida")}>Compra dividida</button>
                <button role="tab" aria-selected={modo === "unico"} className={modo === "unico" ? "ativa" : ""} onClick={() => setModo("unico")}>Só um mercado</button>
            </div>

            {itens.length === 0 ? (
                <p className="vazio">Seu carrinho está vazio. <Link to="/busca">Buscar produtos</Link></p>
            ) : (
                <div className="carrinho-layout">
                    <ul className="itens-carrinho">
                        {itens.map(({ produto, qtd, mercado, preco }) => (
                            <li key={produto.id} className="item-carrinho">
                                <span className="item-imagem"><img src={produto.imagem} alt="" onError={imagemFallback} /></span>
                                <div className="item-info">
                                    <strong>{produto.nome}</strong>
                                    <span className="selo-mercado">{mercado}</span>
                                    <Quantidade valor={qtd} rotulo={produto.nome} onMenos={() => alterar(produto.id, -1)} onMais={() => alterar(produto.id, 1)} />
                                </div>
                                <strong className="item-preco">{formatarMoeda(preco * qtd)}</strong>
                            </li>
                        ))}
                    </ul>

                    <aside className="painel-escuro">
                        <p className="economia">Você economizou {formatarMoeda(economia)}</p>
                        <p>
                            {modo === "dividida"
                                ? "Comparando sua compra em um só mercado que contém opções mais caras."
                                : `Comprando tudo no ${mercadoUnico}, o mercado mais barato para este carrinho.`}
                        </p>
                        <div className="painel-total"><span>Subtotal</span><strong>{formatarMoeda(resumo.subtotal)}</strong></div>
                        <button className="botao amarelo" onClick={finalizar}>Finalizar pedido</button>
                        <button className="link-limpar" onClick={() => { limpar(); notificar("Carrinho esvaziado.", "info"); }}>Limpar carrinho</button>
                    </aside>
                </div>
            )}
        </>
    );
}
