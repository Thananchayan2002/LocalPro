import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Layout as UserLayout } from './users/components/layout/Layout';
import { Home } from './users/components/home/Home';
import { Services as UserServices } from './users/components/service/Services';
import { About } from './users/components/about/About';
import { Feedback } from './users/components/feedback/Feedback';
import { Professionals } from './users/components/professionals/Professionals';
import { Profile } from './users/components/profile/Profile';
import RegisterProfessional from './users/components/professionalRegister/RegisterProfessional';
import CustomerBookings from './users/components/bookService/Bookings';
import UserProtectedRoute from './users/components/auth/ProtectedRoute';
import { AuthProvider } from './worker/context/AuthContext';
import { ProtectedRoute as WorkerProtectedRoute } from './worker/components/auth/ProtectedRoute';
import { Layout as WorkerLayout } from './worker/components/layout/Layout';
import { Dashboard } from './worker/components/dashboard/Dashboard';
import { Bookings } from './worker/components/bookings/Bookings';
import { Payments } from './worker/components/payments/Payments';
import { Notifications } from './worker/components/notifications/Notifications';
import { Account } from './worker/components/account/Account';
import WorkerServices from './worker/components/services/Services';
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import { Login as WorkerLogin } from './worker/components/auth/Login';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public auth routes */}
          <Route path='/' element={<Login />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />

          {/* User routes under /app */}
          <Route
            path='/app'
            element={(
              <UserProtectedRoute>
                <UserLayout />
              </UserProtectedRoute>
            )}
          >
            <Route index element={<Home />} />
            <Route path='services' element={<UserServices />} />
            <Route path='about' element={<About />} />
            <Route path='feedback' element={<Feedback />} />
            <Route path='professionals' element={<Professionals />} />
            <Route path='become-pro' element={<RegisterProfessional />} />
          </Route>

          <Route path='/app/bookings' element={<CustomerBookings />} />

          <Route
            path='/app/profile'
            element={(
              <UserProtectedRoute>
                <Profile />
              </UserProtectedRoute>
            )}
          />

          {/* Worker routes */}

          <Route
            path='/worker'
            element={(
              <WorkerProtectedRoute>
                <WorkerLayout />
              </WorkerProtectedRoute>
            )}
          >
            <Route index element={<Navigate to="/worker/dashboard" replace />} />
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='bookings' element={<Bookings />} />
            <Route path='payments' element={<Payments />} />
            <Route path='services' element={<WorkerServices />} />
            <Route path='notifications' element={<Notifications />} />
            <Route path='account' element={<Account />} />
            <Route path='*' element={<Navigate to="/worker/dashboard" replace />} />
          </Route>

          {/* Fallback to login */}
          <Route path='*' element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;