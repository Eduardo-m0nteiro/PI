// Marca "invenire" desenhada em SVG: texto itálico, curva âmbar e carrinho com rastro de velocidade.
export default function Logo({ altura = 56, ...props }) {
    return (
        <svg viewBox="0 0 380 120" height={altura} role="img" aria-label="Invenire" {...props}>
            <text x="8" y="78" fontFamily="Poppins, Inter, sans-serif" fontWeight="800" fontStyle="italic" fontSize="84" letterSpacing="-4" fill="#14141F">invenire</text>
            <path d="M12 104 C80 84 190 80 268 86" fill="none" stroke="#FFBD22" strokeWidth="7" strokeLinecap="round" />
            <g fill="none" stroke="#FFBD22" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M286 38h14l8 36h44l8-26h-52" />
                <path d="M300 54h-16M304 66h-18" strokeWidth="5" />
                <path d="M316 28l-6-14M332 26l8-12M346 36l12-8" strokeWidth="5" />
            </g>
            <circle cx="314" cy="90" r="7.5" fill="#FFBD22" /><circle cx="344" cy="90" r="7.5" fill="#FFBD22" />
            <circle cx="314" cy="90" r="2.6" fill="#14141F" /><circle cx="344" cy="90" r="2.6" fill="#14141F" />
        </svg>
    );
}
