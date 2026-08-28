# Invenire Delivery

Loja online (front-end) com login/cadastro reais, autenticação por sessão e banco de dados SQLite.

## Como rodar

Este projeto agora tem um back-end (Node.js). **Não abra mais o `index.html` direto no navegador** — o login não vai funcionar assim, pois depende do servidor. Sempre acesse pelo endereço `http://localhost:3000`.

1. Instale as dependências (só precisa fazer isso uma vez, ou quando o `package.json` mudar):
   ```
   npm install
   ```
2. Inicie o servidor:
   ```
   npm start
   ```
3. Abra `http://localhost:3000` no navegador.

Para parar o servidor, use Ctrl+C no terminal onde ele está rodando.

## Estrutura

- `public/` — todo o site (HTML, CSS, JS, imagens). É a única pasta servida ao navegador.
- `server.js` — servidor Express: serve o site e a API de autenticação.
- `db.js` — conexão com o banco SQLite (via módulo nativo `node:sqlite`, sem dependências externas).
- `auth-utils.js` — hash e verificação de senha (scrypt nativo do Node).
- `routes/auth.js` — rotas `/api/cadastro`, `/api/login`, `/api/logout`, `/api/me`.

## Onde ficam os dados

O banco de dados (`invenire.db`) e o segredo de sessão **não ficam dentro da pasta do projeto**. Eles são salvos em:

- Windows: `%APPDATA%\InvenireDelivery\`
- macOS: `~/Library/Application Support/InvenireDelivery/`
- Linux: `~/.local/share/invenire-delivery/`

Isso é proposital: bancos SQLite podem apresentar erros de gravação quando o arquivo fica dentro de uma pasta sincronizada pelo OneDrive, Google Drive ou Dropbox (como costuma ser o caso de Área de Trabalho e Documentos no Windows). Se quiser escolher outro local, defina a variável de ambiente `INVENIRE_DB_PATH` com o caminho completo do arquivo `.db` antes de rodar `npm start`.

## Segurança (resumo)

- Senhas nunca são salvas em texto puro: usamos hash com salt aleatório (scrypt).
- Login incorreto repetidas vezes (5x) bloqueia tentativas para aquele e-mail por 15 minutos.
- A sessão fica em um cookie `httpOnly` (não acessível via JavaScript do navegador) por 8 horas.
- Em produção (site publicado na internet), sirva via HTTPS e ajuste `cookie.secure: true` em `server.js`, além de definir `SESSION_SECRET` como variável de ambiente.
