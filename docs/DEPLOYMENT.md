# Configuração e publicação do DataJuris

## Projetos e ambientes

O frontend está configurado para o projeto Supabase:

- Project ID: `tlpbmatbkdphpvnkprxn`
- URL: `https://tlpbmatbkdphpvnkprxn.supabase.co`
- PostgreSQL remoto: 17.11.

O site é publicado pelo GitHub Pages:
- Repositório: [freitasdeveloper/DataJuris](https://github.com/freitasdeveloper/DataJuris)
- Demonstração: [freitasdeveloper.github.io/DataJuris](https://freitasdeveloper.github.io/DataJuris/)

## Estado do banco

O schema inicial já foi implantado no projeto Supabase por seis arquivos SQL versionados no diretório `supabase/migrations/`. A verificação remota confirmou 16 tabelas públicas com RLS, bucket privado, políticas de Storage, índices e triggers.

**Não execute `supabase db push` neste momento.** O conector registrou 15 operações no histórico remoto com timestamps diferentes dos seis arquivos do GitHub. Primeiro conclua a reconciliação por:

1. Configure os secrets `SUPABASE_ACCESS_TOKEN` e `SUPABASE_DB_PASSWORD` em **GitHub → Settings → Secrets and variables → Actions**.
2. Abra **GitHub → Actions → Repair Supabase Migration History → Run workflow**.
3. Digite a confirmação `REPAIR-DATAJURIS-HISTORY`.
4. Verifique nos logs que as seis migrações versionadas aparecem como aplicadas e que não restam as 15 versões geradas pelo conector.

Esse workflow usa `supabase migration repair`, que ajusta somente o histórico de controle; não executa SQL nem altera os dados/schema. Não adicione credenciais em arquivos, commits ou mensagens. Veja [SUPABASE_VALIDATION.md](SUPABASE_VALIDATION.md).

## Trabalho sem diretório local

O código e as migrações estão no GitHub. As verificações automatizadas rodam no GitHub Actions:

- `DataJuris CI`: instala dependências, verifica TypeScript e compila o frontend.
- `DataJuris Database Tests`: inicia um banco Supabase limpo e executa os testes pgTAP.
- `Deploy DataJuris to GitHub Pages`: publica o frontend quando o workflow de deploy termina com sucesso.

Assim, não é necessário manter o projeto no computador para acompanhar os testes e a publicação. Para desenvolvimento local futuro, clone o repositório e use a Supabase CLI somente depois de reconciliar o histórico.

## Configuração do frontend

O cliente usa a URL do projeto e uma publishable key pública. As variáveis aceitas são:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

A publishable key pode ser enviada ao navegador; a proteção dos dados depende de RLS e das permissões. Nunca use `service_role`, `sb_secret_*`, senha do banco ou token pessoal em variáveis `VITE_*`, arquivos públicos ou código do frontend.

Se alterar a chave, configure a variável no ambiente de build do GitHub Actions e no arquivo de ambiente de desenvolvimento local, sem versionar o valor secreto. A chave publishable não deve ser confundida com uma senha.

## Configuração pendente do Supabase Auth

No Dashboard do projeto:
1. Configure SMTP transacional confiável.
2. Defina confirmação de e-mail e URLs de redirecionamento do site publicado.
3. Teste cadastro, confirmação, login, logout e recuperação de senha.
4. Configure proteção antiabuso, rate limits e MFA para contas privilegiadas.
5. Crie contas separadas de teste: dois usuários comuns, um moderador e um administrador.
6. Confirme que novas contas recebem apenas o papel `student`.

No momento da última consulta, `auth.users` não tinha contas. Não conceda papel de administrador até criar e validar a conta pretendida e seguir um procedimento administrativo controlado.

## Limites atuais da aplicação

- Biblioteca e documentos ainda usam conteúdo demonstrativo local.
- Favoritos e Meu Caderno são armazenados no navegador, sem sincronização por conta.
- O modal de login/cadastro e o cliente Supabase Auth existem, mas Auth ainda depende da configuração e de testes reais.
- Upload/download de arquivos, submissões, fórum, moderação e painel administrativo ainda não estão integrados ponta a ponta.

## Checklist antes de produção

- [ ] Histórico de migrações reconciliado.
- [ ] CI do frontend e testes pgTAP aprovados.
- [ ] Auth e e-mail validados.
- [ ] Testes A/B de RLS e Storage aprovados.
- [ ] Fluxos críticos da interface integrados ao banco.
- [ ] Sanitização, proteção de upload e CSP revisadas.
- [ ] Backups e restauração testados.
- [ ] Monitoramento, logs, alertas e plano de incidentes ativos.
- [ ] Revisão LGPD, termos e política de privacidade concluídos.
- [ ] Pentest, acessibilidade e testes de carga aprovados.

O DataJuris ainda está em desenvolvimento e não deve ser liberado comercialmente até a aprovação dos itens acima.
