# DataJuris — status de implementação

Última atualização: 04/11/2026

## Frontend entregue

- Projeto React 19 + TypeScript + Vite.
- Identidade visual própria e interface responsiva.
- Página de exploração com pesquisa e filtros sobre conteúdo demonstrativo local.
- Modal de detalhes dos documentos demonstrativos.
- Favoritos persistidos em `localStorage`.
- Meu Caderno com criação, edição, exclusão e pesquisa de anotações locais.
- Modal de cadastro/login conectado ao cliente Supabase Auth, listener de sessão e logout.
- Deploy pelo GitHub Pages.

## Backend Supabase implantado

Projeto `tlpbmatbkdphpvnkprxn` (`https://tlpbmatbkdphpvnkprxn.supabase.co`).

- [x] Seis arquivos SQL versionados em `supabase/migrations/`.
- [x] 16 tabelas públicas com RLS habilitado.
- [x] Dados iniciais: 12 áreas jurídicas e 8 tipos de documentos.
- [x] Funções de autorização internas no schema `private`; wrappers públicos `SECURITY INVOKER`.
- [x] Bucket `legal-documents` privado, limite de 20 MB e allowlist de tipos.
- [x] Três políticas de Storage para upload, leitura e atualização por proprietário/staff.
- [x] 15 índices de chaves estrangeiras.
- [x] Cinco triggers de integridade/moderação.
- [x] Security Advisor sem alertas na última consulta.
- [ ] Reconciliar o histórico remoto das migrações pelo workflow manual do GitHub.

## Funcionalidades ainda não integradas ponta a ponta

- Documentos e biblioteca continuam usando dados demonstrativos locais; CRUD real não está conectado.
- Favoritos e caderno são locais ao navegador, sem sincronização por usuário.
- Upload/download real no Storage ainda não está conectado à interface.
- Submissões e fluxo de moderação ainda não estão integrados à interface.
- Fórum, denúncias e artigos ainda não têm fluxos completos no frontend.
- Painel administrativo não foi implementado.
- Recuperação de senha, confirmação de e-mail e telas de gestão de conta não estão completas.

## Verificações

- [x] Workflow CI do frontend: instalação, type-check e build aprovados no commit `e7ebc65fafc9fbc51b3366328e75b296162e7b3e`.
- [ ] Workflow de testes de banco/pgTAP: execução do GitHub Actions pendente de conclusão.
- [x] Consulta remota confirmou 16 tabelas com RLS, 3 políticas de Storage, 5 triggers distintos e 15 índices.
- [x] Security Advisor: nenhum alerta na última consulta.
- [ ] Performance Advisor: resolver 18 avisos de initplan e revisar 6 grupos de políticas permissivas sobrepostas; avaliar os 26 índices sem uso somente após tráfego real.
- [ ] Criar duas contas comuns, uma moderadora e uma administradora para executar testes reais de isolamento.
- [ ] Testar Auth, e-mail, redirects e recuperação de senha.
- [ ] Testar upload/download e tentativas de acesso cruzado no Storage.
- [ ] Executar testes E2E, acessibilidade, LGPD, backup/restauração e carga.

## Regra para publicação

O DataJuris permanece em desenvolvimento. Não liberar cadastro público, dados reais ou uso comercial enquanto os fluxos críticos, controles de autorização, testes de isolamento, privacidade, backups e monitoramento não estiverem implementados e aprovados.

Consulte:
- [Validação Supabase](SUPABASE_VALIDATION.md)
- [Revisão de segurança](SECURITY_REVIEW.md)
- [Guia de implantação](DEPLOYMENT.md)
