/* =========================================================
   Invenire Delivery — rotas de autenticação
   Cadastro, login, logout e verificação de sessão.
========================================================= */
"use strict";

const express = require("express");
const db = require("../db");
const { gerarHashSenha, verificarSenha } = require("../auth-utils");

const router = express.Router();

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ----- Política de senha (mantida em sincronia com o checklist do cliente) -----
function senhaAtendePolitica(senha) {
    return (
        senha.length >= 8 &&
        /[A-Z]/.test(senha) &&
        /[0-9]/.test(senha) &&
        /[^A-Za-z0-9]/.test(senha)
    );
}

// ----- Proteção simples contra força bruta -----
const LIMITE_TENTATIVAS = 5;
const JANELA_BLOQUEIO_MS = 15 * 60 * 1000;
const tentativasFalhas = new Map();

function estaBloqueado(chave) {
    const registro = tentativasFalhas.get(chave);
    if (!registro || !registro.bloqueadoAte) return false;
    if (registro.bloqueadoAte <= Date.now()) {
        tentativasFalhas.delete(chave);
        return false;
    }
    return true;
}

function registrarFalha(chave) {
    const registro = tentativasFalhas.get(chave) || { falhas: 0 };
    registro.falhas += 1;
    if (registro.falhas >= LIMITE_TENTATIVAS) {
        registro.bloqueadoAte = Date.now() + JANELA_BLOQUEIO_MS;
    }
    tentativasFalhas.set(chave, registro);
}

function limparFalhas(chave) {
    tentativasFalhas.delete(chave);
}

// ----- Consultas preparadas -----
const selecionarUsuarioPorEmail = db.prepare("SELECT * FROM usuarios WHERE email = ?");
const selecionarUsuarioPorId = db.prepare("SELECT id, nome, email FROM usuarios WHERE id = ?");
const inserirUsuario = db.prepare("INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)");

// ----- Cadastro -----
router.post("/cadastro", (req, res) => {
    const { nome, email, senha } = req.body || {};

    if (typeof nome !== "string" || nome.trim().length < 2) {
        return res.status(400).json({ erro: "Informe um nome com pelo menos 2 caracteres." });
    }
    if (typeof email !== "string" || !REGEX_EMAIL.test(email.trim())) {
        return res.status(400).json({ erro: "Informe um e-mail válido." });
    }
    if (typeof senha !== "string" || !senhaAtendePolitica(senha)) {
        return res.status(400).json({
            erro: "A senha deve ter pelo menos 8 caracteres, com 1 letra maiúscula, 1 número e 1 caractere especial.",
        });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const nomeNormalizado = nome.trim();

    const existente = selecionarUsuarioPorEmail.get(emailNormalizado);
    if (existente) {
        return res.status(409).json({ erro: "Já existe uma conta com este e-mail." });
    }

    let resultado;
    try {
        const senhaHash = gerarHashSenha(senha);
        resultado = inserirUsuario.run(nomeNormalizado, emailNormalizado, senhaHash);
    } catch (erro) {
        if (String(erro && erro.message).includes("UNIQUE")) {
            return res.status(409).json({ erro: "Já existe uma conta com este e-mail." });
        }
        console.error("Erro ao cadastrar usuário:", erro);
        return res.status(500).json({ erro: "Não foi possível concluir o cadastro." });
    }

    req.session.regenerate((erro) => {
        if (erro) {
            console.error("Erro ao criar sessão:", erro);
            return res.status(500).json({ erro: "Cadastro criado, mas não foi possível iniciar a sessão." });
        }
        req.session.usuarioId = Number(resultado.lastInsertRowid);
        res.status(201).json({ nome: nomeNormalizado, email: emailNormalizado });
    });
});

// ----- Login -----
router.post("/login", (req, res) => {
    const { email, senha } = req.body || {};

    if (typeof email !== "string" || typeof senha !== "string" || !email || !senha) {
        return res.status(400).json({ erro: "Informe e-mail e senha." });
    }

    const emailNormalizado = email.trim().toLowerCase();

    if (estaBloqueado(emailNormalizado)) {
        return res.status(429).json({ erro: "Muitas tentativas de login. Tente novamente em alguns minutos." });
    }

    const usuario = selecionarUsuarioPorEmail.get(emailNormalizado);
    const senhaValida = usuario ? verificarSenha(senha, usuario.senha_hash) : false;

    if (!usuario || !senhaValida) {
        registrarFalha(emailNormalizado);
        return res.status(401).json({ erro: "E-mail ou senha inválidos." });
    }

    limparFalhas(emailNormalizado);

    req.session.regenerate((erro) => {
        if (erro) {
            console.error("Erro ao criar sessão:", erro);
            return res.status(500).json({ erro: "Não foi possível iniciar a sessão." });
        }
        req.session.usuarioId = usuario.id;
        res.json({ nome: usuario.nome, email: usuario.email });
    });
});

// ----- Logout -----
router.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.status(204).end();
    });
});

// ----- Sessão atual -----
router.get("/me", (req, res) => {
    if (!req.session || !req.session.usuarioId) {
        return res.status(401).json({ erro: "Não autenticado." });
    }
    const usuario = selecionarUsuarioPorId.get(req.session.usuarioId);
    if (!usuario) {
        return res.status(401).json({ erro: "Não autenticado." });
    }
    res.json({ nome: usuario.nome, email: usuario.email });
});

module.exports = router;
