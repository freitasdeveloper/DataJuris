# Configuração do ambiente e publicação

## Pré-requisitos
- Node.js 22 LTS ou compatível.
- Projeto Supabase.
- Domínio e hospedagem estática para Vite (ex.: Cloudflare Pages, Netlify ou Vercel).
- E-mail transacional configurado no Supabase Auth para produção.

## Banco de dados
1. Crie um projeto Supabase em região adequada aos usuários e requisitos LGPD.
2. Instale Supabase CLI e autentique localmente.
3. Execute `supabase link --project-ref SEU_PROJECT_REF`.
4. Execute `supabase db push` para aplicar `supabase/migrations`.
5. Configure o bucket privado `legal-documents`, limite de 20 MB e políticas de Storage. Não torne arquivos privados públicos.
6. Configure URLs permitidas de autenticação, redirect URLs e SMTP.
7. Promova o primeiro administrador por operação segura no SQL Editor, após confirmar o UUID do usuário:
   `insert into public.user_roles(user_id, role) values ('UUID_CONFIRMADO', 'admin');`
   Nunca conceda admin a partir de metadados enviados pelo navegador.

## Frontend
1. Copie `.env.example` para `.env.local`.
2. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. Execute `npm install`, `npm run build` e `npm run dev`.
4. Configure as mesmas variáveis no painel da hospedagem.
5. Publique o diretório `dist` com fallback SPA para `index.html`.

A chave anon/public pode estar no frontend quando as políticas RLS estiverem corretas. Nunca use `service_role` ou segredos administrativos no Vite.

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
A migração cria tabelas e RLS de base, mas ainda exige revisão técnica das políticas, configuração do Storage e testes em projeto Supabase real. Não representa certificação de segurança ou prontidão comercial.
