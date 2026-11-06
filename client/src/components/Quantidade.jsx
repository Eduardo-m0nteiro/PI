import { IconMinus, IconPlus } from "./Icons";

export default function Quantidade({ valor, onMenos, onMais, rotulo }) {
    return (
        <div className="quantidade">
            <button onClick={onMenos} aria-label={`Diminuir ${rotulo}`}><IconMinus /></button>
            <span aria-live="polite">{valor}</span>
            <button onClick={onMais} aria-label={`Aumentar ${rotulo}`}><IconPlus /></button>
        </div>
    );
}
