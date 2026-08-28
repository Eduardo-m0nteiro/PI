/* =========================================================
   Invenire Delivery — utilitários de senha
   Hash com scrypt (nativo do Node, sem dependências externas),
   salt aleatório por usuário e comparação em tempo constante.
========================================================= */
"use strict";

const crypto = require("node:crypto");

const TAMANHO_SALT = 16;
const TAMANHO_HASH = 64;

function gerarHashSenha(senha) {
    const salt = crypto.randomBytes(TAMANHO_SALT).toString("hex");
    const hash = crypto.scryptSync(senha, salt, TAMANHO_HASH).toString("hex");
    return `${salt}:${hash}`;
}

function verificarSenha(senha, senhaArmazenada) {
    const [salt, hashArmazenado] = String(senhaArmazenada || "").split(":");
    if (!salt || !hashArmazenado) return false;
    const hashCalculado = crypto.scryptSync(senha, salt, TAMANHO_HASH);
    const bufferArmazenado = Buffer.from(hashArmazenado, "hex");
    if (bufferArmazenado.length !== hashCalculado.length) return false;
    return crypto.timingSafeEqual(hashCalculado, bufferArmazenado);
}

module.exports = { gerarHashSenha, verificarSenha };
