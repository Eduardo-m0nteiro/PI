/* =========================================================
   Invenire Delivery — acesso ao banco de dados (SQLite)
   Usa o pacote "better-sqlite3" (binário pré-compilado,
   funciona em qualquer versão recente do Node, sem exigir
   compilador instalado na máquina).

   O arquivo do banco fica fora da pasta do projeto, em uma
   pasta de dados do aplicativo (ex.: %APPDATA% no Windows).
   Isso evita erros de "disk I/O error" que acontecem quando
   o SQLite tenta travar um arquivo dentro de uma pasta
   sincronizada pelo OneDrive/Google Drive/Dropbox (como
   costuma ser o caso de Área de Trabalho e Documentos).
   Para usar outro local, defina a variável de ambiente
   INVENIRE_DB_PATH com o caminho completo do arquivo .db.
========================================================= */
"use strict";

const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs");
const Database = require("better-sqlite3");

function obterPastaDadosApp() {
    if (process.env.APPDATA) return path.join(process.env.APPDATA, "InvenireDelivery");
    if (process.platform === "darwin") {
        return path.join(os.homedir(), "Library", "Application Support", "InvenireDelivery");
    }
    return path.join(os.homedir(), ".local", "share", "invenire-delivery");
}

function obterCaminhoBanco() {
    if (process.env.INVENIRE_DB_PATH) return process.env.INVENIRE_DB_PATH;
    return path.join(obterPastaDadosApp(), "invenire.db");
}

const caminhoBanco = obterCaminhoBanco();
const pastaBanco = path.dirname(caminhoBanco);
if (!fs.existsSync(pastaBanco)) {
    fs.mkdirSync(pastaBanco, { recursive: true });
}

const db = new Database(caminhoBanco);
db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        senha_hash TEXT NOT NULL,
        criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );
`);

console.log(`[Invenire] Banco de dados em: ${caminhoBanco}`);

module.exports = db;
