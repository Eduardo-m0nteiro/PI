import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { IconCheck } from "../components/Icons";
import { formatarMoeda } from "../utils";

export default function Confirmacao() {
    const { state: pedido } = useLocation();
    const navigate = useNavigate();
    if (!pedido) return <Navigate to="/" replace />;

    return (
        <div className="confirmacao">
            <span className="confirmacao-icone"><IconCheck /></span>
            <h1>Pedido confirmado!</h1>
            <p className="pedido-numero">Pedido nº {pedido.numero}</p>
            <p>Seu pedido já está a caminho, {pedido.nome.split(" ")[0]}.<br />Obrigado!</p>
            <hr />
            <div className="painel-escuro">
                <div className="painel-total verde"><span>Total</span><strong>{formatarMoeda(pedido.total)}</strong></div>
                <div className="painel-total"><span>Forma de pagamento</span><span>{pedido.pagamento}</span></div>
                <p>Entrega estimada: 45 minutos</p>
            </div>
            <button className="botao amarelo" onClick={() => navigate("/")}>Voltar a tela inicial</button>
        </div>
    );
}
