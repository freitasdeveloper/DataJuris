# Configuração do ambiente e publicação

## Projeto Supabase conectado

O frontend do DataJuris está configurado para usar o projeto Supabase abaixo por meio de uma URL e de uma chave **publishable**:

- URL do projeto: `https://acqausvydpkvciwmyski.supabase.co`
- Chave: publishable (pública; não é uma credencial administrativa)

Esses valores públicos são usados como configuração padrão do cliente web. Variáveis locais podem substituí-los. Não documente nem versione chaves `sb_secret_*`, `service_role`, senhas ou strings de conexão.

## Pré-requisitos

- Node.js 22 LTS ou compatível.
- Projeto Supabase.
- Hospedagem estática para Vite (GitHub Pages, Cloudflare Pages, Netlify ou Vercel).
- E-mail transacional configurado no Supabase Auth para produção.

## Banco de dados

1. Abra o projeto no [Supabase Dashboard](https://supabase.com/dashboard/project/acqausvydpkvciwmyski).
2. Instale Supabase CLI e autentique localmente.
3. Execute `supabase link --project-ref acqausvydpkvciwmyski`.
4. Revise as migrações em `supabase/migrations/` (inicial e endurecimento de segurança) e execute `supabase db push` para aplicá-las em ordem.
5. Configure o bucket privado `legal-documents`, limite de 20 MB e políticas de Storage. Não torne arquivos privados públicos.
6. Configure URLs permitidas de autenticação, redirect URLs e SMTP.
7. Promova o primeiro administrador por operação segura no SQL Editor, após confirmar o UUID do usuário:
   `insert into public.user_roles(user_id, role) values ('UUID_CONFIRMADO', 'admin');`
   Nunca conceda admin a partir de metadados enviados pelo navegador.

**Importante:** fornecer a URL e a publishable key não aplica a migração ao banco. A migração ainda precisa ser revisada e executada no projeto Supabase.

## Frontend

1. Copie `.env.example` para `.env.local` se quiser usar uma configuração local explícita.
2. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` quando precisar substituir os valores padrão.
3. Execute `npm install`, `npm run build` e `npm run dev`.
4. Publique o diretório `dist`. O workflow do GitHub Pages já compila o frontend com a configuração pública padrão.

A publishable key é destinada ao frontend e pode ser visualizada por qualquer visitante do site. Ela **não protege os dados por si só**: habilite RLS em todas as tabelas expostas, revise privilégios e políticas para `anon` e `authenticated`, e teste acessos com contas diferentes.

Nunca use `sb_secret_*`, `service_role` ou segredos administrativos no Vite, no navegador ou no repositório.

## Antes de produção

- Revisar e testar todas as políticas RLS com contas de papéis distintos.
- Configurar políticas de Storage: upload autenticado apenas em prefixo próprio; leitura apenas após autorização; remoção por dono/staff; bloquear SVG/HTML executável e tipos não permitidos.
- Habilitar MFA para administradores e moderadores.
- Configurar CAPTCHA/rate limit no Auth e formulários.
- Validar e-mail, termos, privacidade, retenção, canal de titulares e contratos de operadores LGPD.
- Ativar backups e testar restauração.
- Configurar domínio, HTTPS, CSP, HSTS e cabeçalhos de segurança.
- Configurar monitoramento de erros, alertas e logs sem dados pessoais desnecessários.
- Fazer pentest e testes E2E/carga antes de abrir cadastro público.

## Aviso

A migração cria tabelas e RLS de base, mas ainda exige revisão técnica das políticas, configuração do Storage e testes em projeto Supabase real. A conexão do cliente frontend não comprova que o banco foi migrado, que as políticas estão seguras ou que a aplicação está pronta para uso comercial.
