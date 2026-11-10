# Guia de Benefícios Interplan

Site público do guia (rede credenciada + parceiros em destaque) e painel ADM para cadastrar, editar e desativar prestadores e anúncios.

- **Stack:** React + Vite, Firebase (Authentication, Firestore e, opcionalmente, Storage)
- **Site público:** `/`
- **Painel ADM:** `/#/admin` (ex.: `https://seusite/#/admin`)

## Rodando no computador

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Sem o Firebase configurado, o site já funciona com os dados do site atual (`public/dados/rede.json`). O painel fica em `http://localhost:5173/#/admin` e só funciona depois do passo a passo abaixo.

## Configurando o Firebase (uma vez só)

1. Em <https://console.firebase.google.com>, crie um projeto (ex.: `guia-interplan`).
2. **Authentication** → Começar → ative **E-mail/senha**. Depois, em **Usuários**, adicione o e-mail e a senha de cada administrador.
3. **Firestore Database** → Criar banco → modo produção → região `southamerica-east1` (São Paulo).
4. **Configurações do projeto** → **Seus apps** → adicione um app **Web** (</>). Copie os valores para um arquivo `.env` na raiz do projeto, seguindo o `.env.example`.
5. **Tornar alguém administrador:** no Firestore, crie a coleção `admins` e, dentro dela, um documento cujo **ID é o UID do usuário** (o UID aparece em Authentication → Usuários). O documento pode ter um campo qualquer, ex.: `nome: "Jones"`.
6. Publique as regras de segurança:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add          # escolha o projeto criado
   firebase deploy --only firestore:rules
   ```
7. Rode `npm run dev`, acesse `/#/admin`, entre e clique em **Importar dados do site atual**. Pronto: a partir daí o site lê do Firebase.

### Imagens dos anúncios (Storage)

O upload de imagens pelo painel usa o **Firebase Storage**, que hoje exige o plano **Blaze** (pago por uso; nesse volume o custo tende a ser zero ou centavos).

- **Sem o Storage:** o painel mostra só o campo "Endereço (URL) da imagem". As 66 imagens atuais já estão em `public/anuncios/` e continuam funcionando.
- **Com o Storage:** ative-o no console, preencha `VITE_FIREBASE_STORAGE_BUCKET` no `.env` e rode `firebase deploy --only storage`. O botão **Enviar imagem** aparece no painel.

## Como os dados funcionam

- O ADM edita as coleções `prestadores` e `anuncios`.
- A cada alteração salva, o painel gera um **documento único** (`publicacao/atual`) com tudo que é público. O site lê só esse documento: **1 leitura por visita**, em vez de 1.135. É isso que mantém o projeto dentro do plano gratuito (50 mil leituras/dia).
- **Desativar** (desmarcar "Ativo") tira do site sem apagar. **Excluir** apaga de vez.
- **Nota interna** nunca vai para o site. Use o filtro "Com nota interna (revisar)" no painel para ver os 9 cadastros que vieram com observações de revisão.
- **Baixar backup** no painel gera um JSON com tudo. Vale fazer de vez em quando.

## Publicando o site

```bash
npm run build
```

Gera a pasta `dist/`. O build usa caminhos relativos, então funciona na raiz de um domínio ou numa subpasta. Para publicar:

- **GitHub Pages** (repositório público):
  ```bash
  npm run deploy
  ```
  Esse comando gera o build e envia a pasta `dist` para a branch `gh-pages`. Na primeira vez, em **Settings → Pages** do repositório, escolha *Deploy from a branch* → branch **`gh-pages`** → pasta **`/ (root)`**. O site fica em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`. As chaves do `.env` entram no build feito no seu computador; o `.env` em si não vai para o GitHub.

- **Firebase Hosting:** `firebase deploy --only hosting` (já configurado em `firebase.json`).
- **Netlify:** conecte o repositório do GitHub, com comando de build `npm run build` e pasta `dist`. As variáveis do `.env` vão em *Site settings → Environment variables*. O arquivo `public/_redirects` já cuida das rotas.

## Onde editar o quê

| O quê | Onde |
|---|---|
| Telefone do plantão, e-mail, CNPJ, links das redes sociais, aviso do rodapé | `src/config.js` |
| Banner principal | `public/img/banner.png` (1400×450). Para uma arte própria de celular, veja `src/components/Hero.jsx` |
| Cores e espaçamentos | `src/styles/guia.css` (variáveis em `src/styles/base.css`) |
| Quantidade de cards por página | `POR_PAGINA` em `src/config.js` |

## Estrutura

```
src/
  Guia.jsx               página pública (filtros, lista, paginação)
  components/            cabeçalho, hero, destaques, card, menu de contato, modal, rodapé
  lib/                   dados (leitura do Firebase), PDF, formatação de telefone etc.
  admin/                 login, painel, listas e formulários do ADM
scripts/converter-site-atual.mjs   converte dados/site-atual.json → public/dados/rede.json
firestore.rules / storage.rules    regras de segurança
```
