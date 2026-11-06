import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Voltar from "../components/Voltar";
import { formatarMoeda } from "../utils";

export default function Checkout() {
    const navigate = useNavigate();
    const { usuario, carregando } = useAuth();
    const { resumo, cupom, aplicarCupom, limpar } = useCart();
    const [form, setForm] = useState({ nome: usuario?.nome ?? "", telefone: "", endereco: "", pagamento: "", cupom });
    const [erro, setErro] = useState("");

    if (carregando) return null;
    if (!usuario) return <Navigate to="/login?redirecionar=/carrinho" replace />;
    if (resumo.itens.length === 0) return <Navigate to="/carrinho" replace />;

    const campo = (nome) => ({ value: form[nome], onChange: (e) => setForm({ ...form, [nome]: e.target.value }) });

    function confirmar(e) {
        e.preventDefault();
        if ([form.nome, form.telefone, form.endereco, form.pagamento].some((v) => !v.trim())) {
            return setErro("Preencha todos os campos para confirmar.");
        }
        if (form.cupom.trim() && form.cupom.trim().toUpperCase() !== cupom && !aplicarCupom(form.cupom)) return;
        const numero = "INV" + Date.now().toString().slice(-6);
        const pedido = { numero, total: resumo.total, pagamento: form.pagamento, nome: form.nome.trim() };
        limpar();
        navigate("/confirmacao", { state: pedido, replace: true });
    }

    return (
        <>
            <div className="topo-pagina"><Voltar para="/carrinho" /></div>
            <h1 className="titulo-pagina">Finalizar pedido</h1>

            <form className="checkout-layout" onSubmit={confirmar} noValidate>
                <div className="campos">
                    <label>Nome completo<input type="text" autoComplete="name" {...campo("nome")} /></label>
                    <label>Telefone<input type="tel" autoComplete="tel" placeholder="(00) 00000-0000" {...campo("telefone")} /></label>
                    <label>Endereço de entrega<input type="text" autoComplete="street-address" {...campo("endereco")} /></label>
                    <label>Forma de pagamento
                        <select {...campo("pagamento")}>
                            <option value="">Selecione...</option>
                            <option>Pix</option>
                            <option>Cartão de crédito</option>
                            <option>Cartão de débito</option>
                            <option>Dinheiro</option>
                        </select>
                    </label>
                    <label>Cupom<input type="text" placeholder="Opcional" {...campo("cupom")} /></label>
                </div>

                <div className="checkout-resumo">
                    <div className="linha-valor"><span>Subtotal</span><span>{formatarMoeda(resumo.subtotal)}</span></div>
                    {resumo.desconto > 0 && <div className="linha-valor"><span>Desconto</span><span>- {formatarMoeda(resumo.desconto)}</span></div>}
                    <div className="linha-valor"><span>Entrega</span><span>{resumo.frete === 0 ? "Grátis" : formatarMoeda(resumo.frete)}</span></div>
                    <div className="linha-valor total"><span>Total</span><span>{formatarMoeda(resumo.total)}</span></div>
                    {erro && <p className="erro-form">{erro}</p>}
                    <button type="submit" className="botao amarelo">Confirmar pedido</button>
                </div>
            </form>
        </>
    );
}
