# Validação do Supabase — DataJuris

Este roteiro deve ser concluído antes de habilitar cadastros públicos ou armazenar documentos reais.

## Estado da integração

- Projeto selecionado: `tlpbmatbkdphpvnkprxn`
- URL: `https://tlpbmatbkdphpvnkprxn.supabase.co`
- Frontend: URL padrão atualizada; configure a publishable key obtida neste mesmo projeto.
- Migração inicial: `202611040001_initial_schema.sql`.
- Endurecimento de políticas: `202611040002_security_hardening.sql`.
- Proteção de funções privilegiadas: `202611040003_private_role_helpers.sql`.
- Storage privado: `202611040004_private_storage.sql`.
- Índices de chaves estrangeiras: `202611040005_foreign_key_indexes.sql`.
- Integridade de campos de moderação: `202611040006_content_integrity_triggers.sql`.
- **Aplicação confirmada em 04/11/2026:** as seis migrações locais foram implantadas no projeto Supabase `tlpbmatbkdphpvnkprxn`; a API registrou operações individuais no histórico remoto.
- **Verificação do schema:** 16 tabelas públicas encontradas; RLS habilitado nas 16.
- **Verificação de segurança:** Security Advisors sem alertas após a terceira migração; funções `SECURITY DEFINER` foram retiradas do schema público (os helpers internos ficam no schema `private`).
- Áreas jurídicas e tipos de documentos iniciais inseridos (12 áreas e 8 tipos).
- **Storage aplicado em 04/11/2026:** bucket `legal-documents` privado, limite 20 MB e MIME allowlist (PDF, DOC, DOCX, ODT, TXT e RTF).
- **Políticas de Storage aplicadas:** upload apenas na pasta UUID do próprio usuário; leitura e atualização pelo proprietário ou equipe staff.
- **Integridade de conteúdo:** triggers bloqueiam alteração de ocultação/bloqueio por autores, status de denúncia fora de `open`, metadados de moderação em novas submissões e metadados de revisão/publicação por autores.
- **Restrição intencional:** não existe política de exclusão pelo cliente; exclusões devem passar por fluxo confiável no servidor.
- **Pendente:** testes de isolamento com contas distintas, Auth por e-mail, fluxos reais de upload/download e reconciliação do histórico local da Supabase CLI.

## Histórico de migrações e Supabase CLI

As migrações foram aplicadas diretamente ao projeto pelo conector Supabase. O histórico remoto recebeu versões geradas pelo serviço (por exemplo, `20261104221825`), enquanto os arquivos do repositório usam versões `202611040001` a `202611040004`. **Não execute `supabase db push` antes de reconciliar essa diferença**, pois a CLI pode tentar reaplicar migrações já executadas.

Com Supabase CLI autenticada e o projeto correto selecionado, reconcilie os quatro arquivos locais já aplicados:

```bash
supabase link --project-ref tlpbmatbkdphpvnkprxn
supabase migration repair --status applied 202611040001 202611040002 202611040003 202611040004 202611040005 202611040006
supabase migration list
```

Confirme que as seis versões locais aparecem como aplicadas e que não há migrações pendentes inesperadas. Só então use `supabase db push` para futuras migrações. Não marque versões como aplicadas se os respectivos arquivos locais não corresponderem ao SQL efetivamente implantado.

## Verificar tabelas e RLS

Execute no SQL Editor do novo projeto:

```sql
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in (
    'profiles','user_roles','legal_areas','document_types','documents',
    'document_files','tags','document_tags','favorites','document_events',
    'submissions','forum_topics','forum_posts','forum_reports','articles','audit_logs'
  )
order by c.relname;
```

Todas as tabelas expostas pelo frontend devem apresentar `rls_enabled = true`. Investigue qualquer tabela ausente ou sem RLS.

Confira as políticas efetivamente instaladas:

```sql
select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

## Configurar Storage privado

O bucket já foi criado pela migração `202611040004_private_storage.sql` com:
- Público: desativado.
- Limite máximo: 20 MB.
- MIME permitidos: PDF, DOC, DOCX, ODT, TXT e RTF.
- Pasta de primeiro nível obrigatória: UUID do usuário autenticado.

Políticas implantadas:
- INSERT: usuário autenticado só envia para a própria pasta.
- SELECT: proprietário ou staff.
- UPDATE: proprietário ou staff.
- DELETE: sem política de cliente; deve ser feito por backend confiável.

A migração exige que `submissions.storage_path` comece com `<UUID-do-usuário>/`. Ainda é necessário testar upload/download com duas contas reais, incluindo tentativa de acesso cruzado. Não habilite o fluxo de submissão até esses testes passarem.

## Matriz de testes obrigatória

Use duas contas comuns distintas (A e B), uma conta moderadora e uma conta administradora. Não use a chave service_role nos testes do navegador.

| Cenário | Resultado esperado |
|---|---|
| Visitante consulta documentos publicados | Permitido |
| Visitante consulta rascunhos/submissões | Negado |
| Usuário A lê/edita o próprio perfil | Permitido |
| Usuário A altera perfil de B | Negado |
| Usuário A lê favoritos de B | Negado |
| Usuário A cria favorito próprio | Permitido |
| Usuário A cria documento como autor A em rascunho | Permitido |
| Usuário A publica documento diretamente | Negado |
| Usuário A atualiza documento de B | Negado |
| Usuário A envia submissão com prefixo de B | Negado |
| Usuário A cria tópico oculto/travado diretamente | Negado |
| Usuário A cria post em tópico bloqueado/oculto | Negado |
| Usuário comum lê/injeta audit_logs | Negado |
| Moderador gerencia conteúdo conforme política | Permitido |
| Usuário comum assume papel admin/moderator | Negado |

Registre o resultado, data, usuário de teste e evidência de cada cenário. Testes devem ser feitos pelo cliente autenticado, não apenas pelo SQL Editor com privilégios elevados.

## Autenticação

No Supabase Dashboard:
1. Configure confirmação de e-mail e SMTP confiável.
2. Cadastre as URLs de redirecionamento do site publicado e do ambiente local.
3. Configure CAPTCHA/rate limits conforme o tráfego esperado.
4. Teste cadastro, confirmação, login, logout e recuperação de senha.
5. Verifique que a conta recém-criada recebe apenas o papel `student`.

## Critérios para liberar

- [x] As seis migrações locais foram aplicadas ao novo banco.
- [x] Todas as 16 tabelas públicas têm RLS habilitado.
- [x] Security Advisors sem alertas após o endurecimento de funções privilegiadas.
- [x] Bucket privado criado e políticas de upload/leitura/atualização implantadas.
- [x] Triggers de integridade protegem os campos de moderação e revisão.
- [ ] Isolamento do Storage testado com A e B (incluindo tentativas de acesso cruzado).
- [ ] Matriz de testes executada sem falhas.
- [ ] E-mail, recuperação de senha e URLs de redirect validados.
- [ ] Backups e restauração testados.
- [ ] Revisão LGPD, monitoramento e plano de incidentes concluídos.

A conexão do frontend ou uma compilação bem-sucedida não comprova a segurança nem a disponibilidade do banco. O DataJuris permanece em desenvolvimento até a conclusão destes gates.
