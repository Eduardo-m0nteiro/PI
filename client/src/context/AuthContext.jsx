import { createContext, useCallback, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);

    const verificarSessao = useCallback(async () => {
        try {
            const resposta = await fetch("/api/me");
            setUsuario(resposta.ok ? await resposta.json() : null);
        } catch {
            setUsuario(null);
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        verificarSessao();
    }, [verificarSessao]);

    const sair = useCallback(async () => {
        try {
            await fetch("/api/logout", { method: "POST" });
        } catch {
            /* encerra localmente de qualquer forma */
        }
        setUsuario(null);
    }, []);

    return (
        <AuthContext.Provider value={{ usuario, carregando, sair, atualizar: verificarSessao }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
