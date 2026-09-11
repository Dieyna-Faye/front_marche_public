export const roles = [
  { id: 'admin', label: 'Administrateur' },
  { id: 'authority', label: 'Autorité contractante' },
  { id: 'supplier', label: 'Fournisseur' },
  { id: 'commission', label: "Commission d'évaluation" },
  { id: 'auditor', label: 'Auditeur' },
]

export const currentUsers = {
  admin: { name: 'Aminata Ndiaye', initials: 'AN', role: 'Administrateur', organization: 'Direction centrale' },
  authority: { name: 'Moussa Diop', initials: 'MD', role: 'Autorité contractante', organization: 'Ministère des Infrastructures' },
  supplier: { name: 'Fatou Bâ', initials: 'FB', role: 'Fournisseur', organization: 'Sénégal BTP Services' },
  commission: { name: 'Ibrahima Fall', initials: 'IF', role: "Commission d'évaluation", organization: 'Commission technique' },
  auditor: { name: 'Awa Sarr', initials: 'AS', role: 'Auditeur', organization: 'Inspection générale' },
}

export const tenders = [
  {
    id: 'AO-2026-0042',
    title: "Construction et équipement de 12 salles de classe dans la région de Thiès",
    authority: "Ministère de l'Éducation nationale",
    type: 'Travaux',
    budget: '480 000 000 FCFA',
    budgetValue: 480000000,
    deadline: '18 sept. 2026',
    published: '22 août 2026',
    status: 'Publié',
    submissions: 14,
    progress: 68,
    risk: 'Faible',
    description: "Le présent marché porte sur la construction, l’aménagement et l’équipement de douze salles de classe réparties dans quatre communes de la région de Thiès.",
    requirements: ['Agrément BTP catégorie 3', 'Quitus fiscal valide', 'Délai maximal de 8 mois'],
  },
  {
    id: 'AO-2026-0038',
    title: 'Fourniture de matériel informatique pour les services déconcentrés',
    authority: 'Ministère de la Fonction publique',
    type: 'Fournitures',
    budget: '125 000 000 FCFA',
    budgetValue: 125000000,
    deadline: '05 sept. 2026',
    published: '12 août 2026',
    status: 'Évaluation',
    submissions: 23,
    progress: 91,
    risk: 'Moyen',
    description: "Acquisition, livraison et installation d’ordinateurs portables, de postes fixes et d’équipements réseau pour huit directions régionales.",
    requirements: ['Garantie constructeur 3 ans', 'Service après-vente local', 'Certificat de conformité'],
  },
  {
    id: 'AO-2026-0035',
    title: "Étude et déploiement d’un portail national de données ouvertes",
    authority: 'Ministère du Numérique',
    type: 'Prestations intellectuelles',
    budget: '210 000 000 FCFA',
    budgetValue: 210000000,
    deadline: '28 sept. 2026',
    published: '19 août 2026',
    status: 'Publié',
    submissions: 9,
    progress: 42,
    risk: 'Faible',
    description: "Conception et mise en œuvre d’une plateforme nationale interopérable de publication, d’analyse et de réutilisation des données publiques.",
    requirements: ['Équipe de cinq experts minimum', 'Références similaires', 'Méthodologie détaillée'],
  },
  {
    id: 'AO-2026-0029',
    title: "Maintenance préventive du parc automobile administratif",
    authority: 'Direction du Matériel et du Transit',
    type: 'Maintenance',
    budget: '86 500 000 FCFA',
    budgetValue: 86500000,
    deadline: '30 août 2026',
    published: '01 août 2026',
    status: 'Clôturé',
    submissions: 17,
    progress: 100,
    risk: 'Élevé',
    description: "Entretien préventif et correctif d’un parc de 135 véhicules administratifs pour une durée de douze mois.",
    requirements: ['Atelier agréé', 'Stock minimal de pièces', 'Assistance 24h/24'],
  },
  {
    id: 'AO-2026-0024',
    title: "Réhabilitation de trois centres de santé communautaires",
    authority: 'Ministère de la Santé et de l’Action sociale',
    type: 'Travaux',
    budget: '325 000 000 FCFA',
    budgetValue: 325000000,
    deadline: '12 août 2026',
    published: '10 juil. 2026',
    status: 'Attribué',
    submissions: 11,
    progress: 100,
    risk: 'Faible',
    description: "Travaux de réhabilitation, de mise aux normes et d’extension de trois centres de santé communautaires.",
    requirements: ['Visite de site obligatoire', 'Assurance décennale', 'Plan HSE'],
  },
]

export const submissions = [
  { id: 'SO-1188', tender: 'AO-2026-0038', supplier: 'Ndar Digital Solutions', amount: '119 800 000 FCFA', date: '29 août 2026, 14:32', status: 'À évaluer', completion: 100, score: 86, risk: 'Faible' },
  { id: 'SO-1182', tender: 'AO-2026-0038', supplier: 'SunuTech SARL', amount: '116 450 000 FCFA', date: '28 août 2026, 09:18', status: 'Analyse IA', completion: 94, score: 78, risk: 'Moyen' },
  { id: 'SO-1179', tender: 'AO-2026-0042', supplier: 'Sénégal BTP Services', amount: '462 000 000 FCFA', date: '27 août 2026, 17:05', status: 'Conforme', completion: 100, score: 91, risk: 'Faible' },
  { id: 'SO-1167', tender: 'AO-2026-0042', supplier: 'Sahel Construction', amount: '391 200 000 FCFA', date: '26 août 2026, 11:42', status: 'Pièce manquante', completion: 83, score: 62, risk: 'Élevé' },
  { id: 'SO-1141', tender: 'AO-2026-0035', supplier: 'Teranga Data Lab', amount: '198 750 000 FCFA', date: '23 août 2026, 15:20', status: 'Brouillon', completion: 58, score: null, risk: 'Non analysé' },
]

export const suppliers = [
  { id: 1, name: 'Sénégal BTP Services', category: 'Travaux publics', score: 91, admin: 96, technical: 92, financial: 86, experience: 90, timeliness: 88, tenders: 18, won: 6, risk: 'Faible' },
  { id: 2, name: 'Ndar Digital Solutions', category: 'Informatique', score: 86, admin: 100, technical: 87, financial: 81, experience: 78, timeliness: 93, tenders: 12, won: 4, risk: 'Faible' },
  { id: 3, name: 'Teranga Data Lab', category: 'Conseil & Data', score: 82, admin: 92, technical: 91, financial: 74, experience: 72, timeliness: 84, tenders: 9, won: 3, risk: 'Faible' },
  { id: 4, name: 'SunuTech SARL', category: 'Équipements', score: 78, admin: 88, technical: 76, financial: 84, experience: 70, timeliness: 65, tenders: 21, won: 5, risk: 'Moyen' },
  { id: 5, name: 'Sahel Construction', category: 'BTP', score: 62, admin: 55, technical: 71, financial: 89, experience: 68, timeliness: 42, tenders: 15, won: 2, risk: 'Élevé' },
]

export const risks = [
  { id: 'AL-209', severity: 'Élevé', title: 'Similarité documentaire inhabituelle', detail: 'Deux mémoires techniques présentent 87 % de similarité.', entities: 'Sahel Construction · BatiPro Afrique', tender: 'AO-2026-0042', time: 'Il y a 18 min', status: 'À investiguer', confidence: 94 },
  { id: 'AL-205', severity: 'Élevé', title: 'Montant anormalement bas', detail: 'L’offre est inférieure de 24 % à la médiane des soumissions.', entities: 'Sahel Construction', tender: 'AO-2026-0042', time: 'Il y a 2 h', status: 'En cours', confidence: 89 },
  { id: 'AL-198', severity: 'Moyen', title: 'Coordonnées partagées', detail: 'La même adresse IP a été utilisée pour deux dépôts distincts.', entities: 'SunuTech SARL · Delta Equip', tender: 'AO-2026-0038', time: 'Hier, 16:40', status: 'À investiguer', confidence: 78 },
  { id: 'AL-184', severity: 'Faible', title: 'Document proche de l’expiration', detail: 'Le quitus fiscal expire dans moins de 15 jours.', entities: 'Ndar Digital Solutions', tender: 'AO-2026-0038', time: '28 août, 09:18', status: 'Signalé', confidence: 100 },
]

export const contracts = [
  { id: 'MP-2026-0018', title: 'Réhabilitation de trois centres de santé', supplier: 'Sénégal BTP Services', amount: '319 500 000 FCFA', progress: 72, deadline: '15 déc. 2026', status: 'Dans les délais', payment: 60 },
  { id: 'MP-2026-0014', title: 'Mise en place du réseau administratif sécurisé', supplier: 'Ndar Digital Solutions', amount: '142 000 000 FCFA', progress: 48, deadline: '30 oct. 2026', status: 'Dans les délais', payment: 40 },
  { id: 'MP-2026-0009', title: 'Entretien des bâtiments administratifs', supplier: 'Sahel Construction', amount: '94 800 000 FCFA', progress: 56, deadline: '10 sept. 2026', status: 'En retard', payment: 50 },
]

export const users = [
  { id: 1, name: 'Aminata Ndiaye', email: 'a.ndiaye@marches.sn', role: 'Administrateur', organization: 'Direction centrale', status: 'Actif', lastSeen: 'À l’instant' },
  { id: 2, name: 'Moussa Diop', email: 'm.diop@mit.sn', role: 'Autorité contractante', organization: 'Min. des Infrastructures', status: 'Actif', lastSeen: 'Il y a 12 min' },
  { id: 3, name: 'Fatou Bâ', email: 'fatou.ba@sbs.sn', role: 'Fournisseur', organization: 'Sénégal BTP Services', status: 'Actif', lastSeen: 'Il y a 1 h' },
  { id: 4, name: 'Ibrahima Fall', email: 'i.fall@commission.sn', role: "Commission d'évaluation", organization: 'Commission technique', status: 'Actif', lastSeen: 'Hier, 18:22' },
  { id: 5, name: 'Awa Sarr', email: 'a.sarr@ige.sn', role: 'Auditeur', organization: 'Inspection générale', status: 'Suspendu', lastSeen: '24 août 2026' },
]

export const auditLogs = [
  { id: 1, action: 'Publication d’un appel d’offres', actor: 'Moussa Diop', target: 'AO-2026-0042', ip: '196.207.220.18', date: '30 août 2026, 09:41', category: 'Appel d’offres' },
  { id: 2, action: 'Consultation d’un rapport de risque', actor: 'Awa Sarr', target: 'AL-209', ip: '154.65.39.110', date: '30 août 2026, 09:26', category: 'Audit' },
  { id: 3, action: 'Dépôt d’une offre financière', actor: 'Ndar Digital Solutions', target: 'SO-1188', ip: '41.82.188.45', date: '29 août 2026, 14:32', category: 'Soumission' },
  { id: 4, action: 'Modification des permissions', actor: 'Aminata Ndiaye', target: 'Commission technique', ip: '196.207.220.9', date: '29 août 2026, 11:08', category: 'Sécurité' },
  { id: 5, action: 'Validation d’une grille d’évaluation', actor: 'Ibrahima Fall', target: 'SO-1179', ip: '102.164.32.17', date: '28 août 2026, 16:54', category: 'Évaluation' },
]

export const activityData = [42, 56, 49, 68, 72, 64, 88, 76, 91, 84, 96, 89]

export const categoryData = [
  { label: 'Travaux', value: 38, color: '#2f4156' },
  { label: 'Fournitures', value: 27, color: '#567c8d' },
  { label: 'Services', value: 21, color: '#247f5b' },
  { label: 'Conseil', value: 14, color: '#fe811b' },
]
