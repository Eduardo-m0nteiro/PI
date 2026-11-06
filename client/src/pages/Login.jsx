import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { IconEye, IconEyeOff, IconGoogle } from "../components/Icons";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const REGRAS = [
    { id: "tamanho", texto: "Mínimo 8 caracteres", ok: (s) => s.length >= 8 },
    { id: "maiuscula", texto: "1 letra maiúscula", ok: (s) => /[A-Z]/.test(s) },
    { id: "numero", texto: "1 número", ok: (s) => /[0-9]/.test(s) },
    { id: "especial", texto: "1 caractere especial", ok: (s) => /[^A-Za-z0-9]/.test(s) },
];

async function enviarJson(url, dados) {
    const resposta = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
    });
    let corpo = {};
    try {
        corpo = await resposta.json();
    } catch {
        /* resposta sem corpo JSON */
    }
    return { ok: resposta.ok, corpo };
}

function CampoSenha({ valor, onChange, autoComplete }) {
    const [visivel, setVisivel] = useState(false);
    return (
        <span className="campo-senha">
            <input type={visivel ? "text" : "password"} value={valor} onChange={onChange} required autoComplete={autoComplete} />
            <button type="button" onClick={() => setVisivel((v) => !v)} aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}>
                {visivel ? <IconEyeOff /> : <IconEye />}
            </button>
        </span>
    );
}

export default function Login() {
    const [params, setParams] = useSearchParams();
    const navigate = useNavigate();
    const notificar = useToast();
    const { atualizar } = useAuth();

    const aba = params.get("aba") === "cadastrar" ? "cadastrar" : "entrar";
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [login, setLogin] = useState({ email: "", senha: "" });
    const [cadastro, setCadastro] = useState({ nome: "", email: "", senha: "" });

    function trocarAba(nova) {
        setErro("");
        const novo = new URLSearchParams(params);
        if (nova === "cadastrar") novo.set("aba", "cadastrar");
        else novo.delete("aba");
        setParams(novo, { replace: true });
    }

    // Só aceita caminhos internos do próprio site, nunca URLs externas.
    function destino() {
        const d = params.get("redirecionar");
        return d && /^\/[a-zA-Z0-9_\-/]*$/.test(d) ? d : "/";
    }

    async function concluir(url, dados, mensagem) {
        setErro("");
        setEnviando(true);
        try {
            const { ok, corpo } = await enviarJson(url, dados);
            if (!ok) return setErro(corpo.erro || "Não foi possível concluir. Tente novamente.");
            notificar(mensagem(corpo.nome.split(" ")[0]));
            await atualizar();
            navigate(destino(), { replace: true });
        } catch {
            setErro("Falha de conexão com o servidor. Verifique se ele está em execução.");
        } finally {
            setEnviando(false);
        }
    }

    function aoEntrar(e) {
        e.preventDefault();
        concluir("/api/login", { email: login.email.trim(), senha: login.senha }, (n) => `Bem-vindo, ${n}!`);
    }

    function aoCadastrar(e) {
        e.preventDefault();
        if (!REGRAS.every((r) => r.ok(cadastro.senha))) return setErro("A senha precisa atender a todos os requisitos listados.");
        concluir("/api/cadastro", { nome: cadastro.nome.trim(), email: cadastro.email.trim(), senha: cadastro.senha }, (n) => `Conta criada com sucesso, ${n}!`);
    }

    return (
        <main className="tela-auth">
            <div className="auth-cartao">
                <Link to="/" className="auth-logo" aria-label="Ir para o catálogo"><Logo altura={72} /></Link>

                <div className="abas" role="tablist" aria-label="Entrar ou cadastrar">
                    <button role="tab" aria-selected={aba === "entrar"} className={aba === "entrar" ? "ativa" : ""} type="button" onClick={() => trocarAba("entrar")}>Entrar</button>
                    <button role="tab" aria-selected={aba === "cadastrar"} className={aba === "cadastrar" ? "ativa" : ""} type="button" onClick={() => trocarAba("cadastrar")}>Cadastrar</button>
                </div>

                {aba === "entrar" ? (
                    <form className="campos" onSubmit={aoEntrar} noValidate>
                        <label>E-mail
                            <input type="email" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} required autoComplete="email" />
                        </label>
                        <label>Senha
                            <CampoSenha valor={login.senha} onChange={(e) => setLogin({ ...login, senha: e.target.value })} autoComplete="current-password" />
                        </label>
                        <a href="#" className="link-esqueci" onClick={(e) => { e.preventDefault(); notificar("Recuperação de senha em breve. Fale com o suporte por enquanto.", "info"); }}>Esqueceu sua senha?</a>
                        {erro && <p className="erro-form" role="alert">{erro}</p>}
                        <button type="submit" className="botao escuro" disabled={enviando}>Entrar</button>
                    </form>
                ) : (
                    <form className="campos" onSubmit={aoCadastrar} noValidate>
                        <label>Nome Completo
                            <input type="text" value={cadastro.nome} onChange={(e) => setCadastro({ ...cadastro, nome: e.target.value })} required autoComplete="name" />
                        </label>
                        <label>E-mail
                            <input type="email" value={cadastro.email} onChange={(e) => setCadastro({ ...cadastro, email: e.target.value })} required autoComplete="email" />
                        </label>
                        <label>Senha
                            <CampoSenha valor={cadastro.senha} onChange={(e) => setCadastro({ ...cadastro, senha: e.target.value })} autoComplete="new-password" />
                        </label>
                        <ul className="regras-senha">
                            {REGRAS.map((r) => (
                                <li key={r.id} className={r.ok(cadastro.senha) ? "ok" : ""}>{r.texto}</li>
                            ))}
                        </ul>
                        {erro && <p className="erro-form" role="alert">{erro}</p>}
                        <button type="submit" className="botao escuro" disabled={enviando}>Criar conta</button>
                        <button type="button" className="link-simples" onClick={() => trocarAba("entrar")}>Já tenho conta</button>
                    </form>
                )}

                {aba === "entrar" && (
                    <>
                        <div className="divisor"><span>ou</span></div>
                        <button type="button" className="botao escuro google" onClick={() => notificar("Login com Google em breve.", "info")}>
                            Entrar com o Google <IconGoogle width="34" height="34" />
                        </button>
                    </>
                )}
            </div>
        </main>
    );
}
