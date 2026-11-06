/* =========================================================
   Invenire Delivery — servidor
   Serve o site estático e expõe a API de autenticação.
========================================================= */
"use strict";

const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");
const express = require("express");
const session = require("express-session");

const rotasAuth = require("./routes/auth");

const app = express();
const PORTA = process.env.PORT || 3000;

// ----- Pasta de dados do aplicativo -----
// Mesma pasta usada pelo banco (ver comentário em db.js): fica fora do
// projeto para não sofrer os efeitos de sincronização de nuvem
// (OneDrive/Google Drive/Dropbox), que pode causar falhas de I/O.
function obterPastaDadosApp() {
    if (process.env.APPDATA) return path.join(process.env.APPDATA, "InvenireDelivery");
    if (process.platform === "darwin") {
        return path.join(os.homedir(), "Library", "Application Support", "InvenireDelivery");
    }
    return path.join(os.homedir(), ".local", "share", "invenire-delivery");
}

// ----- Segredo de sessão -----
// Em produção, defina a variável de ambiente SESSION_SECRET.
// Em desenvolvimento, geramos um segredo e o guardamos em disco
// para que as sessões sobrevivam a reinícios do servidor.
function obterSegredoSessao() {
    if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;

    const pastaDados = obterPastaDadosApp();
    if (!fs.existsSync(pastaDados)) fs.mkdirSync(pastaDados, { recursive: true });

    const caminhoSegredo = path.join(pastaDados, "session-secret.txt");
    if (fs.existsSync(caminhoSegredo)) {
        return fs.readFileSync(caminhoSegredo, "utf8").trim();
    }
    const novoSegredo = crypto.randomBytes(32).toString("hex");
    fs.writeFileSync(caminhoSegredo, novoSegredo, { mode: 0o600 });
    return novoSegredo;
}

app.disable("x-powered-by");
app.use(express.json());
app.use(
    session({
        name: "invenire.sid",
        secret: obterSegredoSessao(),
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 8, // 8 horas
            // Em produção, sirva o site via HTTPS e defina secure: true.
            secure: false,
        },
    })
);

// ----- API -----
app.use("/api", rotasAuth);

// ----- Front-end (React/Vite) -----
// Servimos apenas o build em client/dist: o código do servidor (server.js,
// db.js, routes/, node_modules) nunca fica acessível pelo navegador.
// Em desenvolvimento, use `npm run dev` (Vite em :5173 com proxy para /api).
const pastaFront = path.join(__dirname, "client", "dist");
app.use(express.static(pastaFront));
app.get(/^\/(?!api\/).*/, (req, res) => {
    const index = path.join(pastaFront, "index.html");
    if (!fs.existsSync(index)) {
        return res.status(503).send("Front-end não compilado. Rode `npm run build`.");
    }
    res.sendFile(index);
});

// ----- Tratamento de erros da API -----
app.use("/api", (erro, req, res, next) => {
    console.error("Erro na API:", erro);
    res.status(500).json({ erro: "Erro interno do servidor." });
});

app.listen(PORTA, () => {
    console.log(`Invenire Delivery rodando em http://localhost:${PORTA}`);
});
