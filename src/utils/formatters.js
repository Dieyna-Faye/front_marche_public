export const roleKeys = {
  ADMIN: 'admin',
  AUTORITE_CONTRACTANTE: 'authority',
  FOURNISSEUR: 'supplier',
  COMMISSION_EVALUATION: 'commission',
  AUDITEUR: 'auditor',
}

export const roleLabels = {
  ADMIN: 'Administrateur',
  AUTORITE_CONTRACTANTE: 'Autorité contractante',
  FOURNISSEUR: 'Fournisseur',
  COMMISSION_EVALUATION: "Commission d’évaluation",
  AUDITEUR: 'Auditeur',
}

export const tenderStatusLabels = {
  BROUILLON: 'Brouillon',
  PUBLIE: 'Publié',
  ARCHIVE: 'Archivé',
}

export const offerStatusLabels = {
  BROUILLON: 'Brouillon',
  SOUMISE: 'Soumise',
  EN_COURS_EVALUATION: 'En cours d’évaluation',
  ACCEPTEE: 'Acceptée',
  REJETEE: 'Rejetée',
}

export const marketTypeLabels = {
  FOURNITURES: 'Fournitures',
  SERVICES: 'Services',
  TRAVAUX: 'Travaux',
  PRESTATIONS_INTELLECTUELLES: 'Prestations intellectuelles',
  MAINTENANCE: 'Maintenance',
  INFORMATIQUE: 'Informatique',
  EQUIPEMENTS: 'Équipements',
}

export function formatMoney(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  return `${new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(amount)} FCFA`
}

export function formatDate(value, options = {}) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-SN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date)
}

export function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U'
}

export function toTenderView(tender) {
  return {
    ...tender,
    id: String(tender.id),
    title: tender.titre,
    description: tender.description,
    authority: tender.auteur?.nom || 'Autorité contractante',
    type: marketTypeLabels[tender.typeMarche] || tender.typeMarche,
    budget: formatMoney(tender.budgetEstimatif),
    deadline: formatDate(tender.dateLimiteSoumission),
    published: formatDate(tender.updatedAt || tender.createdAt),
    status: tenderStatusLabels[tender.statut] || tender.statut,
  }
}
