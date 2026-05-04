import { BrowserRouter, Routes, Route } from 'react-router-dom';

// AUTH
import Signup         from '../pages/auth/Signup';
import Login          from '../pages/auth/Login';
import Profile        from '../pages/user/Profile';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword  from '../pages/auth/ResetPassword';

// PUBLIC
import Home        from '../pages/public/Home';
import Leaderboard from '../pages/user/Leaderboard';
import About       from '../pages/public/About';
import WhoWeAre    from '../pages/public/WhoWeAre';

// USER
import Dashboard       from '../pages/user/Dashboard';
import DonationPage    from '../pages/user/DonationPage';
import ActionPage      from '../pages/user/ActionPage';
import TeamSearch      from '../pages/user/TeamSearch';
import MyTeam          from '../pages/user/MyTeam';
import Tasks           from '../pages/user/Tasks';
import MyTasks         from '../pages/user/MyTasks';
import TaskHistory     from '../pages/user/TaskHistory';
import AIProofVerifier from '../pages/user/AIProofVerifier';

// ADMIN
import AdminDashboard   from '../pages/admin/AdminDashboard';
import VerifyDonations  from '../pages/admin/VerifyDonations';
import CreateTask       from '../pages/admin/CreateTask';
import VerifyTasks      from '../pages/admin/VerifyTasks';
import AdminTaskHistory from '../pages/admin/TaskHistory';

// CORE
import ProtectedRoute from './ProtectedRoute';
import AdminRoute     from './AdminRoute';
import Navbar         from '../components/layout/Navbar';
import Footer         from '../components/layout/Footer';

function AppRoutes() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">

        <Navbar />

        <div className="flex-grow">
          <Routes>

            {/* ═══════════════ PUBLIC ═══════════════ */}
            <Route path="/"                element={<Home />} />
            <Route path="/leaderboard"     element={<Leaderboard />} />
            <Route path="/login"           element={<Login />} />
            <Route path="/signup"          element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password"  element={<ResetPassword />} />
            <Route path="/about"           element={<About />} />
            <Route path="/who-we-are"      element={<WhoWeAre />} />

            {/* ═══════════════ USER (protected) ═══════════════ */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard"    element={<Dashboard />} />
              <Route path="/donate"       element={<DonationPage />} />
              <Route path="/teams"        element={<ActionPage />} />
              <Route path="/team-search"  element={<TeamSearch />} />
              <Route path="/my-team"      element={<MyTeam />} />
              <Route path="/profile"      element={<Profile />} />

              {/* Task flow */}
              <Route path="/tasks"        element={<Tasks />} />
              <Route path="/my-tasks"     element={<MyTasks />} />
              <Route path="/task-history" element={<TaskHistory />} />

              {/* AI Proof Verification */}
              <Route path="/ai-verify"    element={<AIProofVerifier />} />
            </Route>

            {/* ═══════════════ ADMIN ═══════════════ */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/history"      element={<AdminDashboard />} />
              <Route path="/admin/donations"    element={<VerifyDonations />} />
              <Route path="/admin/create-task"  element={<CreateTask />} />
              <Route path="/admin/verify-tasks" element={<VerifyTasks />} />
              <Route path="/admin/task-history" element={<AdminTaskHistory />} />
              <Route path="/ai-verify"          element={<AIProofVerifier />} />
            </Route>

            {/* ═══════════════ FALLBACK ═══════════════ */}
            <Route path="*" element={<Home />} />

          </Routes>
        </div>

        <Footer />

      </div>
    </BrowserRouter>
  );
}

export default AppRoutes;