import { Link, useNavigate } from "react-router-dom";
import Categorias from "../components/Categorias";
import { IconArrowRight, IconBell, IconCart, IconSearch } from "../components/Icons";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { PRODUTOS } from "../data/catalogo";

export default function Inicio() {
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const notificar = useToast();

    return (
        <>
            <header className="saudacao">
                <div>
                    <h1>Olá, {usuario ? usuario.nome.split(" ")[0] : "visitante"}!</h1>
                    <p>Vamos encontrar as melhores ofertas para você hoje?</p>
                </div>
                <button className="botao-sino" onClick={() => notificar("Notificações em breve.", "info")} aria-label="Notificações">
                    <IconBell />
                </button>
            </header>

            <form className="campo-busca" role="search" onSubmit={(e) => { e.preventDefault(); navigate(`/busca?q=${encodeURIComponent(e.target.q.value)}`); }}>
                <IconSearch />
                <input type="search" name="q" placeholder="Buscar produtos..." aria-label="Buscar produtos" />
            </form>

            <Link to="/busca" className="banner">
                <span className="banner-icone"><IconCart /></span>
                <span className="banner-texto">
                    <strong>Mais economia para o seu dia a dia</strong>
                    <span>Compare preços entre os maiores supermercados</span>
                </span>
                <span className="banner-seta"><IconArrowRight /></span>
            </Link>

            <h2 className="titulo-secao">Categorias</h2>
            <Categorias onEscolher={(id) => navigate(`/busca?categoria=${id}`)} />

            <h2 className="titulo-secao">Produtos em Destaque</h2>
            <div className="grade-produtos">
                {PRODUTOS.filter((p) => p.destaque).map((p) => <ProductCard key={p.id} produto={p} />)}
            </div>
        </>
    );
}
