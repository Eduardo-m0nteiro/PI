// Ícones simples em SVG (traço herda a cor via currentColor).
const base = { width: "1em", height: "1em", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

const I = (children, extra = {}) => (props) => <svg {...base} {...extra} {...props}>{children}</svg>;

export const IconHome = I(<><path d="M3 11l9-8 9 8" /><path d="M5 10v10h5v-6h4v6h5V10" /></>);
export const IconSearch = I(<><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>);
export const IconCart = I(<><path d="M2 3h3l2.4 11.2a2 2 0 002 1.6h7.6a2 2 0 002-1.5L20.5 7H6" /><circle cx="10" cy="20" r="1.6" fill="currentColor" /><circle cx="17" cy="20" r="1.6" fill="currentColor" /></>);
export const IconUser = I(<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></>);
export const IconBell = I(<><path d="M6 17V11a6 6 0 1112 0v6l1.5 2h-15z" /><path d="M10 21h4" /></>);
export const IconBack = I(<><path d="M20 12H4" /><path d="M10 6l-6 6 6 6" /></>, { strokeWidth: 2.4 });
export const IconArrowRight = I(<><path d="M4 12h16" /><path d="M14 6l6 6-6 6" /></>, { strokeWidth: 2.4 });
export const IconPlus = I(<path d="M12 5v14M5 12h14" />, { strokeWidth: 2.6 });
export const IconMinus = I(<path d="M5 12h14" />, { strokeWidth: 2.6 });
export const IconChevron = I(<path d="M9 5l7 7-7 7" />);
export const IconPin = I(<><path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></>);
export const IconHelp = I(<><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1-1.5 2" /><path d="M12 17h.01" /></>);
export const IconLogout = I(<><path d="M10 4H5v16h5" /><path d="M9 12h11" /><path d="M16 8l4 4-4 4" /></>, { strokeWidth: 2.4 });
export const IconEye = I(<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>);
export const IconEyeOff = I(<><path d="M3 3l18 18" /><path d="M10.6 5.1A9.7 9.7 0 0112 5c6 0 10 7 10 7a17 17 0 01-3.2 3.9M6.6 6.7C3.9 8.5 2 12 2 12s4 7 10 7c1.4 0 2.7-.3 3.8-.8" /></>);
export const IconCheck = I(<path d="M5 12.5l4.5 4.5L19 7" />, { strokeWidth: 3 });
export const IconBread = I(<><path d="M5 19L19 5a3.2 3.2 0 014.5 4.5L9.5 23.5" transform="translate(-2 -2) scale(.95)" /><path d="M8 11l5 5M11 8l5 5" /></>);
export const IconCherry = I(<><circle cx="7" cy="17" r="3.5" /><circle cx="17" cy="16" r="3.5" /><path d="M7 13.5C8 8 11 5 15 4M17 12.5C16.5 8 15 5 15 4" /></>);
export const IconCup = I(<><path d="M6 4h12l-1.4 16H7.4z" /><path d="M6.6 10h10.8" /></>);
export const IconSpray = I(<><path d="M9 21V10h6v11z" /><path d="M10 10V7h4v3" /><path d="M14 5h4M14 3h3M18 7h2" /></>);
export const IconSack = I(<><path d="M9 3h6l-1 3c3 2 5 5 5 9a5 5 0 01-5 5h-4a5 5 0 01-5-5c0-4 2-7 5-9z" /><path d="M9.5 6h5" /></>);

export function IconGoogle(props) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
            <circle cx="12" cy="12" r="12" fill="#EDEDED" />
            <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="800" fontFamily="Inter, sans-serif" fill="#1A1A2E">G</text>
        </svg>
    );
}
