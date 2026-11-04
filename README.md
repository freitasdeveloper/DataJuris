# DataJuris

Plataforma independente de pesquisa, organização e produção de documentos jurídicos. O projeto utiliza plataformas de biblioteca jurídica como referência funcional, mas possui implementação, conteúdo e identidade próprios.

## Objetivos do produto
- Biblioteca pesquisável de modelos e documentos jurídicos.
- Organização por áreas do Direito, tags e metadados.
- Área do usuário com favoritos, histórico e documentos enviados.
- Contribuição comunitária com moderação.
- Fórum de perguntas e respostas.
- Conteúdo editorial e vídeos.
- Painel administrativo e métricas.
- Preparação para recursos de IA com revisão humana.

## Stack inicial
- React + TypeScript + Vite
- CSS responsivo com tokens de design próprios
- Persistência local temporária para favoritos no protótipo
- Arquitetura preparada para API e banco de dados em etapa posterior

## Executar localmente
```bash
npm install
npm run dev
```

## Situação atual
O primeiro commit entrega a fundação visual navegável e um protótipo front-end com dados demonstrativos. Ainda não há autenticação real, banco de dados, upload persistente, fórum conectado, armazenamento de documentos nem backend. Não utilizar em produção antes de implementar e testar esses serviços.

## Documentação
- [Escopo e roadmap](docs/ROADMAP.md)
