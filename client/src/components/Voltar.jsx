import { useNavigate } from "react-router-dom";
import { IconBack } from "./Icons";

export default function Voltar({ para = "/" }) {
    const navigate = useNavigate();
    return (
        <button className="voltar" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(para))} aria-label="Voltar">
            <IconBack />
        </button>
    );
}
