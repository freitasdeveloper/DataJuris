# Validação do Supabase — DataJuris

Este roteiro deve ser concluído antes de habilitar cadastros públicos ou armazenar documentos reais.

## Estado da integração

- Projeto selecionado: `tlpbmatbkdphpvnkprxn`
- URL: `https://tlpbmatbkdphpvnkprxn.supabase.co`
- Frontend: URL padrão atualizada; configure a publishable key obtida neste mesmo projeto.
- Migração inicial: `202611040001_initial_schema.sql`.
- Endurecimento de políticas: `202611040002_security_hardening.sql`.
- **Atenção:** o código e as migrações no GitHub não aplicam alterações ao banco. Confirme o estado do novo projeto antes de considerar a integração funcional.

## Aplicar migrações

Com Supabase CLI autenticada e o projeto correto selecionado:

```bash
supabase link --project-ref tlpbmatbkdphpvnkprxn
supabase db push
```

Antes de confirmar a operação, confira o diff apresentado pela CLI. Como este é um Project ID diferente do anteriormente documentado, não presuma que o histórico de migrações ou os dados do projeto anterior existam aqui.

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

Crie o bucket `legal-documents` com:
- Público: desativado.
- Limite máximo: 20 MB.
- Tipos permitidos definidos por uma lista explícita de formatos necessários.
- Pastas de submissão com prefixo do UUID do usuário.

A migração exige que `submissions.storage_path` comece com `<UUID-do-usuário>/`. As políticas do Storage ainda precisam ser criadas e testadas separadamente. Não libere upload enquanto elas não estiverem prontas.

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

- [ ] A migração inicial e a de endurecimento aparecem no histórico do novo banco.
- [ ] Todas as tabelas públicas têm RLS habilitado.
- [ ] Matriz de testes executada sem falhas.
- [ ] Bucket privado e políticas de Storage testados com A e B.
- [ ] E-mail, recuperação de senha e URLs de redirect validados.
- [ ] Backups e restauração testados.
- [ ] Revisão LGPD, monitoramento e plano de incidentes concluídos.

A conexão do frontend ou uma compilação bem-sucedida não comprova a segurança nem a disponibilidade do banco. O DataJuris permanece em desenvolvimento até a conclusão destes gates.
