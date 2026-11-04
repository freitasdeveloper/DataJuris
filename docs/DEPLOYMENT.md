# Configuração do ambiente e publicação

## Projeto Supabase selecionado

O frontend do DataJuris está apontado para o projeto Supabase:

- Project ID: `tlpbmatbkdphpvnkprxn`
- URL: `https://tlpbmatbkdphpvnkprxn.supabase.co`
- Chave publishable: deve ser obtida nas configurações/API Keys deste mesmo projeto e configurada como variável de ambiente.

A chave publishable do projeto anterior não deve ser reutilizada. Não documente nem versione chaves `sb_secret_*`, `service_role`, senhas ou strings de conexão.

## Pré-requisitos

- Node.js 22 LTS ou compatível.
- Acesso ao projeto Supabase acima.
- Publishable key correspondente ao mesmo projeto.
- Hospedagem estática para Vite (GitHub Pages, Cloudflare Pages, Netlify ou Vercel).
- E-mail transacional configurado no Supabase Auth para produção.

## Banco de dados

1. Abra o [Dashboard do novo projeto](https://supabase.com/dashboard/project/tlpbmatbkdphpvnkprxn).
2. Instale Supabase CLI e autentique localmente.
3. Execute `supabase link --project-ref tlpbmatbkdphpvnkprxn`.
4. Revise as migrações em `supabase/migrations/` (inicial e endurecimento de segurança) e execute `supabase db push` para aplicá-las em ordem.
5. Configure o bucket privado `legal-documents`, limite de 20 MB e políticas de Storage. Não torne arquivos privados públicos.
6. Configure URLs permitidas de autenticação, redirect URLs e SMTP.
7. Promova o primeiro administrador por operação segura no SQL Editor, após confirmar o UUID do usuário:
   `insert into public.user_roles(user_id, role) values ('UUID_CONFIRMADO', 'admin');`
   Nunca conceda admin a partir de metadados enviados pelo navegador.

**Importante:** apontar o frontend ao projeto não aplica migrações ao banco. Confirme o histórico e revise o diff antes de executar `supabase db push` no novo projeto.

## Frontend

1. Copie `.env.example` para `.env.local`.
2. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` com os valores do novo projeto.
3. Execute `npm install`, `npm run build` e `npm run dev`.
4. Configure as mesmas variáveis no ambiente de build do GitHub Actions para que o site publicado possa conectar-se.
5. Publique o diretório `dist`. O cliente não será considerado configurado até receber a publishable key correta.

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
