# Invenire Delivery

Loja online que **compara preços entre supermercados**, com login/cadastro reais, autenticação por sessão e banco de dados SQLite.

- **Front-end:** React 18 + React Router, compilado com Vite (`client/`).
- **Back-end:** Node.js + Express (`server.js`, `routes/`), sessão via cookie e SQLite (`better-sqlite3`).
- **Layout:** mobile primeiro; a partir de 900px de largura a navegação vira menu lateral e o conteúdo se reorganiza em colunas.

## Requisitos

- **Node.js 22 LTS** (ou outra versão LTS com binário pré-compilado do `better-sqlite3`).
  Versões muito novas ou _alpha_ (ex.: Node 27) não têm binário e exigem compilador (`gcc`/`make`), o que costuma falhar. Com nvm: `nvm install 22 && nvm use 22`.

## Como rodar

O front precisa ser compilado antes de o servidor entregá-lo.

```bash
npm install          # dependências do servidor (uma vez, ou quando package.json mudar)
npm run build        # instala as dependências de client/ e gera client/dist
npm start            # http://localhost:3000
```

Se abrir o site sem ter rodado o build, o servidor responde _"Front-end não compilado"_.
Para parar o servidor, use Ctrl+C.

### Modo desenvolvimento (recarga automática do front)

Use dois terminais:

```bash
npm start              # API + servidor em :3000
npm run dev:client     # Vite em http://localhost:5173 (repassa /api para :3000)
```

Abra **http://localhost:5173**. Alterações em `client/src` aparecem na hora, sem rebuild.

### Scripts

| Comando | O que faz |
| --- | --- |
| `npm start` | Sobe o Express (serve `client/dist` e a API) |
| `npm run build` | Instala `client/` e gera o build de produção |
| `npm run dev` | Sobe o Express com `--watch` (reinicia ao mudar o servidor) |
| `npm run dev:client` | Sobe o Vite em modo desenvolvimento |

## Estrutura

```
server.js              Servidor Express: sessão, API e entrega do build do front
db.js                  Conexão com o SQLite (better-sqlite3) e criação das tabelas
auth-utils.js          Hash e verificação de senha (scrypt nativo do Node)
routes/auth.js         /api/cadastro, /api/login, /api/logout, /api/me
docs/                  Documento de requisitos
client/
  index.html           Entrada do Vite (fontes, meta tags)
  vite.config.js       Proxy de /api para o Express em desenvolvimento
  public/assets/       Imagens dos produtos (servidas em /assets)
  src/
    main.jsx           Ponto de entrada e providers
    App.jsx            Rotas
    style.css          Estilos (paleta, mobile e desktop)
    utils.js           Formatação de moeda, storage, fallback de imagem
    data/catalogo.js   Produtos, mercados, categorias, cupons e regras de frete
    context/           AuthContext (sessão), CartContext (carrinho/totais), ToastContext (avisos)
    components/        Layout (navegação), Logo, Icons, cards e linhas de produto, etc.
    pages/             Inicio, Busca, Produto, Carrinho, Checkout, Confirmacao, Perfil, Login
```

### Rotas do front

| Rota | Tela |
| --- | --- |
| `/` | Início (saudação, banner, categorias, destaques) |
| `/busca` | Busca com filtro por categoria e ordenação por preço (`?q=` e `?categoria=`) |
| `/produto/:id` | Detalhe do produto e "Onde comprar" |
| `/carrinho` | Carrinho com modo "Compra dividida" ou "Só um mercado" |
| `/checkout` | Dados de entrega, pagamento e cupom (exige login) |
| `/confirmacao` | Pedido confirmado |
| `/perfil` | Dados da conta e menu |
| `/login` | Entrar / Cadastrar (`?aba=cadastrar`, `?redirecionar=/caminho`) |

## Catálogo e regras de negócio

Tudo fica em `client/src/data/catalogo.js`:

- **Produtos:** cada um tem `precos` por mercado (`Compre Bem` e `SuperVi`). **Os preços atuais são fictícios**; substitua pelos reais.
- **Compra dividida:** cada item é comprado no mercado mais barato para ele.
- **Só um mercado:** todos os itens vão para o mercado com menor total do carrinho.
- **Economia:** diferença entre o total no mercado mais caro (tudo em um só lugar) e o total da compra atual.
- **Frete:** R$ 10,00; grátis a partir de R$ 120,00 ou com o cupom `FRETEGRATIS`.
- **Cupons:** `BEMVINDO10` (10%), `ECONOMIA15` (15%) e `FRETEGRATIS`, aplicados no checkout.
- O carrinho e o cupom ficam no `localStorage` do navegador. **Pedidos não são gravados no banco** ainda.

## Onde ficam os dados

O banco de dados (`invenire.db`) e o segredo de sessão **não ficam dentro da pasta do projeto**. Eles são salvos em:

- Windows: `%APPDATA%\InvenireDelivery\`
- macOS: `~/Library/Application Support/InvenireDelivery/`
- Linux/WSL: `~/.local/share/invenire-delivery/`

Isso é proposital: bancos SQLite podem apresentar erros de gravação quando o arquivo fica dentro de uma pasta sincronizada pelo OneDrive, Google Drive ou Dropbox. Para escolher outro local, defina `INVENIRE_DB_PATH` com o caminho completo do arquivo `.db` antes de rodar `npm start`.

## Segurança (resumo)

- Senhas nunca são salvas em texto puro: hash com salt aleatório (scrypt).
- Login incorreto 5 vezes bloqueia tentativas para aquele e-mail por 15 minutos.
- A sessão fica em um cookie `httpOnly` (inacessível via JavaScript) por 8 horas.
- O redirecionamento pós-login só aceita caminhos internos do site.
- Em produção, sirva via HTTPS, ajuste `cookie.secure: true` em `server.js` e defina `SESSION_SECRET` como variável de ambiente.

## Limitações conhecidas

- O login aceita apenas **e-mail** (não há login por telefone ou CPF).
- "Entrar com o Google" e "Esqueceu sua senha?" ainda não têm funcionamento (mostram aviso).
- No perfil, "Meus pedidos", "Endereços", "Notificações" e "Ajuda e suporte" são placeholders.
- Não há tema escuro/claro nem histórico de pedidos.
