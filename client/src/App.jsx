import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Busca from "./pages/Busca";
import Carrinho from "./pages/Carrinho";
import Checkout from "./pages/Checkout";
import Confirmacao from "./pages/Confirmacao";
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import Perfil from "./pages/Perfil";
import Produto from "./pages/Produto";

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Inicio />} />
                <Route path="/busca" element={<Busca />} />
                <Route path="/produto/:id" element={<Produto />} />
                <Route path="/carrinho" element={<Carrinho />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/confirmacao" element={<Confirmacao />} />
                <Route path="/perfil" element={<Perfil />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Navigate to="/login?aba=cadastrar" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
