import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ListaProvider } from "./context/ListaContext";
import { ToastProvider } from "./context/ToastContext";
import "./style.css";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <ToastProvider>
                <AuthProvider>
                    <CartProvider>
                        <ListaProvider>
                            <App />
                        </ListaProvider>
                    </CartProvider>
                </AuthProvider>
            </ToastProvider>
        </BrowserRouter>
    </StrictMode>
);
