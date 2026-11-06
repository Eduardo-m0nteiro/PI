import { Link, useNavigate } from "react-router-dom";
import { IconBell, IconCart, IconChevron, IconHelp, IconLogout, IconPin, IconUser } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Perfil() {
    const { usuario, sair } = useAuth();
    const notificar = useToast();
    const navigate = useNavigate();

    if (!usuario) {
        return (
            <div className="perfil">
                <h1 className="titulo-pagina">Perfil</h1>
                <span className="avatar"><IconUser /></span>
                <p className="perfil-email">Entre na sua conta para acompanhar pedidos e finalizar compras mais rápido.</p>
                <Link to="/login" className="botao escuro">Entrar</Link>
                <Link to="/login?aba=cadastrar" className="botao amarelo">Criar conta</Link>
            </div>
        );
    }

    const emBreve = (nome) => () => notificar(`${nome} em breve.`, "info");
    const itens = [
        { rotulo: "Meus pedidos", Icone: IconCart, acao: emBreve("Histórico de pedidos") },
        { rotulo: "Endereços", Icone: IconPin, acao: emBreve("Endereços") },
        { rotulo: "Notificações", Icone: IconBell, acao: emBreve("Notificações") },
        { rotulo: "Ajuda e suporte", Icone: IconHelp, acao: emBreve("Ajuda e suporte") },
        { rotulo: "Sair da conta", Icone: IconLogout, perigo: true, acao: async () => { await sair(); notificar("Você saiu da sua conta.", "info"); navigate("/"); } },
    ];

    return (
        <div className="perfil">
            <h1 className="titulo-pagina">Perfil</h1>
            <span className="avatar"><IconUser /></span>
            <strong className="perfil-nome">{usuario.nome}</strong>
            <span className="perfil-email">{usuario.email}</span>
            <ul className="menu-perfil">
                {itens.map(({ rotulo, Icone, acao, perigo }) => (
                    <li key={rotulo}>
                        <button className={perigo ? "perigo" : ""} onClick={acao}>
                            <span className="menu-icone"><Icone /></span>
                            {rotulo}
                            <IconChevron className="menu-seta" />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
