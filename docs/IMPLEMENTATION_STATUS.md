# DataJuris — status de implementação

Última atualização: 04/11/2026

## Entregue neste primeiro ciclo
- Projeto React + TypeScript + Vite.
- Identidade visual inicial própria, responsiva.
- Página inicial com busca local nos dados demonstrativos.
- Filtro por área do Direito.
- Lista de modelos demonstrativos.
- Modal de detalhes.
- Favoritos persistidos no navegador via localStorage.
- README, roadmap funcional e workflow de build no GitHub Actions.

## Ainda não entregue
- Backend/API e banco de dados.
- Autenticação, recuperação de senha e controle de acesso.
- Upload, antivírus, armazenamento e download real.
- CRUD administrativo persistente.
- Fórum, artigos, vídeos e contribuições funcionais.
- IA, pagamentos, analytics de produção e notificações.
- Testes automatizados unitários, integração, E2E, segurança e carga.
- Deploy e configuração de domínio.

## Verificação feita
- Arquivos enviados ao branch `main`.
- Listagem de conteúdo do GitHub consultada após os commits.
- README, componente principal e roadmap recuperados do repositório para confirmar publicação.

## Verificação pendente
O ambiente desta execução não instalou dependências nem executou `npm run build`. O workflow CI foi adicionado para realizar a verificação de build no GitHub Actions após o push. Até a conclusão bem-sucedida do workflow, a compilação deve ser considerada não verificada.

## Regra para publicação
Não liberar o sistema para uso comercial enquanto autenticação, autorização, persistência, segurança de arquivos, privacidade, backup, observabilidade e testes dos fluxos críticos não estiverem implementados e aprovados.
