export type LegalDocument = {
  id: number
  title: string
  area: string
  kind: string
  description: string
  updatedAt: string
  downloads: number
  format: string
}

export const categories = [
  'Direito Civil',
  'Direito Trabalhista',
  'Direito Penal',
  'Direito de Família',
  'Direito do Consumidor',
  'Direito Contratual',
  'Direito Empresarial',
  'Direito Previdenciário',
  'Direito Imobiliário',
  'Direito Tributário',
  'Direito Administrativo',
  'Direito Ambiental',
]

export const documents: LegalDocument[] = [
  { id: 1, title: 'Petição inicial — Ação de cobrança', area: 'Direito Civil', kind: 'Petição inicial', description: 'Estrutura-base para ação de cobrança, com tópicos editáveis e indicação dos documentos que podem instruir a demanda.', updatedAt: '04 nov 2026', downloads: 1280, format: 'DOCX' },
  { id: 2, title: 'Contrato de prestação de serviços', area: 'Direito Contratual', kind: 'Contrato', description: 'Modelo orientativo com cláusulas de objeto, prazo, remuneração, obrigações e encerramento.', updatedAt: '02 nov 2026', downloads: 964, format: 'DOCX' },
  { id: 3, title: 'Reclamação trabalhista — Rito ordinário', area: 'Direito Trabalhista', kind: 'Petição inicial', description: 'Roteiro de organização dos fatos, pedidos e documentos para uma reclamação trabalhista.', updatedAt: '29 out 2026', downloads: 842, format: 'PDF' },
  { id: 4, title: 'Ação de alimentos — Fixação', area: 'Direito de Família', kind: 'Petição inicial', description: 'Modelo de referência para pedido de fixação de alimentos, sujeito à adequação ao caso concreto.', updatedAt: '25 out 2026', downloads: 731, format: 'DOCX' },
  { id: 5, title: 'Notificação extrajudicial ao fornecedor', area: 'Direito do Consumidor', kind: 'Notificação', description: 'Estrutura para formalizar reclamação, descrever fatos e estabelecer prazo razoável para resposta.', updatedAt: '21 out 2026', downloads: 615, format: 'DOCX' },
  { id: 6, title: 'Resposta à acusação', area: 'Direito Penal', kind: 'Defesa', description: 'Material de apoio para organizar preliminares, argumentos defensivos e requerimentos.', updatedAt: '18 out 2026', downloads: 588, format: 'DOCX' },
  { id: 7, title: 'Ação de usucapião — roteiro documental', area: 'Direito Imobiliário', kind: 'Petição inicial', description: 'Checklist de informações e documentos normalmente relevantes à análise de usucapião.', updatedAt: '14 out 2026', downloads: 452, format: 'PDF' },
  { id: 8, title: 'Mandado de segurança — modelo estrutural', area: 'Direito Administrativo', kind: 'Petição inicial', description: 'Estrutura de referência para exposição do direito alegado, autoridade coatora e pedidos.', updatedAt: '10 out 2026', downloads: 397, format: 'DOCX' },
  { id: 9, title: 'Planejamento previdenciário — ficha de atendimento', area: 'Direito Previdenciário', kind: 'Formulário', description: 'Ficha demonstrativa para organizar dados de atendimento e histórico contributivo.', updatedAt: '06 out 2026', downloads: 326, format: 'XLSX' },
  { id: 10, title: 'Acordo de sócios — cláusulas essenciais', area: 'Direito Empresarial', kind: 'Contrato', description: 'Guia de tópicos para estruturar regras de governança, saída e resolução de conflitos.', updatedAt: '01 out 2026', downloads: 284, format: 'DOCX' },
]
