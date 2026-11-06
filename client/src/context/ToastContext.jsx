import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const proximoId = useRef(0);

    const notificar = useCallback((texto, tipo = "sucesso") => {
        const id = proximoId.current++;
        setToasts((atuais) => [...atuais, { id, texto, tipo, saindo: false }]);
        setTimeout(() => setToasts((a) => a.map((t) => (t.id === id ? { ...t, saindo: true } : t))), 3000);
        setTimeout(() => setToasts((a) => a.filter((t) => t.id !== id)), 3400);
    }, []);

    return (
        <ToastContext.Provider value={notificar}>
            {children}
            <div className="toasts" aria-live="polite">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast ${t.tipo}${t.saindo ? " saindo" : ""}`}>
                        {t.texto}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
