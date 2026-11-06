import { IconBread, IconCherry, IconCup, IconSack, IconSpray } from "./Icons";
import { CATEGORIAS } from "../data/catalogo";

const ICONES = { padaria: IconBread, hortifruti: IconCherry, bebidas: IconCup, limpeza: IconSpray, mercearia: IconSack };

export default function Categorias({ ativa, onEscolher }) {
    return (
        <div className="categorias" role="group" aria-label="Categorias">
            {CATEGORIAS.map(({ id, rotulo }) => {
                const Icone = ICONES[id];
                return (
                    <button key={id} className={`categoria cat-${id}${ativa === id ? " ativa" : ""}`} onClick={() => onEscolher(id)} aria-pressed={ativa === id}>
                        <span className="categoria-icone"><Icone /></span>
                        {rotulo}
                    </button>
                );
            })}
        </div>
    );
}
