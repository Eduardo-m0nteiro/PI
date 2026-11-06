import { NavLink, Outlet } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { IconCart, IconHome, IconSearch, IconUser } from "./Icons";
import Logo from "./Logo";

const ITENS = [
    { to: "/", rotulo: "Início", Icone: IconHome, fim: true },
    { to: "/busca", rotulo: "Busca", Icone: IconSearch },
    { to: "/carrinho", rotulo: "Carrinho", Icone: IconCart },
    { to: "/perfil", rotulo: "Perfil", Icone: IconUser },
];

export default function Layout() {
    const { resumo } = useCart();

    return (
        <div className="app">
            <a className="pular-link" href="#conteudo">Pular para o conteúdo</a>

            <nav className="nav" aria-label="Navegação principal">
                <div className="nav-logo"><Logo altura={44} /></div>
                {ITENS.map(({ to, rotulo, Icone, fim }) => (
                    <NavLink key={to} to={to} end={fim} className={({ isActive }) => `nav-item${isActive ? " ativo" : ""}`}>
                        <span className="nav-icone"><Icone />
                            {to === "/carrinho" && resumo.quantidade > 0 && <span className="nav-contador">{resumo.quantidade}</span>}
                        </span>
                        {rotulo}
                    </NavLink>
                ))}
            </nav>

            <main className="conteudo" id="conteudo">
                <Outlet />
            </main>
        </div>
    );
}
