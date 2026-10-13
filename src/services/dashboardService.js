import { api } from '../api/client'

export const dashboardService = {
  getSummary: async () => {
    const result = await api.get('/dashboard')
    const k = result.kpis || {}
    return {
      ...result,
      nombreAppelsOffres: k.nombreAppelsOffres || 0,
      appelsOffresPublies: k.appelOffresPublies || 0,
      appelsOffresBrouillon: k.appelOffresBrouillons || 0,
      appelsOffresArchives: k.appelOffresArchives || 0,
      nombreOffresRecues: k.offresRecues || 0,
      nombreFournisseursInscrits: k.fournisseursActifs || 0,
      tauxParticipationMoyen: k.averageOffersPerTender ?? 0,
      montantTotalEstimeAppelsPublies: k.budgetTotal || 0,
      nombreSoumissions: k.offresRecues || 0,
      soumissionsAcceptees: 0,
      soumissionsEnEvaluation: 0,
      soumissionsRejetees: 0,
      opportunitesPubliees: k.appelOffresPublies || 0,
      documentsDeposes: 0,
      monthlySubmissions: result.monthlySubmissions || [],
    }
  },
}
