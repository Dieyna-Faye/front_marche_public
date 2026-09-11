import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import PublicLayout from './components/PublicLayout'
import CreateTenderPage from './pages/CreateTenderPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import PublicTenderDetailsPage from './pages/PublicTenderDetailsPage'
import PublicTendersPage from './pages/PublicTendersPage'
import SubmissionFormPage from './pages/SubmissionFormPage'
import SubmissionsPage from './pages/SubmissionsPage'
import SubmissionDetailsPage from './pages/SubmissionDetailsPage'
import TenderDetailsPage from './pages/TenderDetailsPage'
import TendersPage from './pages/TendersPage'
import UsersPage from './pages/UsersPage'
import CreateUserPage from './pages/CreateUserPage'
import RisksPage from './pages/RisksPage'
import ContractsPage from './pages/ContractsPage'
import SuppliersPage from './pages/SuppliersPage'
import EvaluationsPage from './pages/EvaluationsPage'
import ScoringPage from './pages/ScoringPage'
import AuditLogPage from './pages/AuditLogPage'
import DocumentsPage from './pages/DocumentsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="a-propos" element={<AboutPage />} />
        <Route path="appels-offres" element={<PublicTendersPage />} />
        <Route path="appels-offres/:id" element={<PublicTenderDetailsPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>
      <Route path="connexion" element={<LoginPage />} />
      <Route path="inscription" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="appels-offres" element={<TendersPage />} />
          <Route path="appels-offres/:id" element={<TenderDetailsPage />} />
          <Route path="soumissions" element={<SubmissionsPage />} />
          <Route path="soumissions/:id" element={<SubmissionDetailsPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute roles={['admin', 'authority']} />}>
        <Route path="app/appels-offres/nouveau" element={<AppLayout />}>
          <Route index element={<CreateTenderPage />} />
        </Route>
        <Route path="app/appels-offres/:id/modifier" element={<AppLayout />}>
          <Route index element={<CreateTenderPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute roles={['authority']} />}>
        <Route path="app/fournisseurs" element={<AppLayout />}>
          <Route index element={<SuppliersPage />} />
        </Route>
        <Route path="app/analyse" element={<AppLayout />}>
          <Route index element={<EvaluationsPage />} />
        </Route>
        <Route path="app/analyse/:id" element={<AppLayout />}>
          <Route index element={<EvaluationsPage />} />
        </Route>
        <Route path="app/scoring" element={<AppLayout />}>
          <Route index element={<ScoringPage />} />
        </Route>
        <Route path="app/audit" element={<AppLayout />}>
          <Route index element={<AuditLogPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute roles={['supplier']} />}>
        <Route path="app/soumissions/nouvelle" element={<AppLayout />}>
          <Route index element={<SubmissionFormPage />} />
        </Route>
        <Route path="app/documents" element={<AppLayout />}>
          <Route index element={<DocumentsPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="app/utilisateurs" element={<AppLayout />}>
          <Route index element={<UsersPage />} />
        </Route>
        <Route path="app/utilisateurs/nouveau" element={<AppLayout />}>
          <Route index element={<CreateUserPage />} />
        </Route>
        <Route path="app/fraudes" element={<AppLayout />}>
          <Route index element={<RisksPage />} />
        </Route>
        <Route path="app/contrats" element={<AppLayout />}>
          <Route index element={<ContractsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
