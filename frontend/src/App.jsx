import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MisVehiculos from './pages/MisVehiculos';
import VehicleDetail from './pages/VehicleDetail';
import AddVehicle from './pages/AddVehicle';
import Insurance from './pages/Insurance';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#0d1117] text-slate-100">
          <AuthenticatedHeader />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/vehicles" element={<RequireAuth><MisVehiculos /></RequireAuth>} />
              <Route path="/seguros" element={<Insurance />} />
              <Route path="/vehicle/:id" element={<RequireAuth><VehicleDetail /></RequireAuth>} />
              <Route path="/add-vehicle" element={<RequireAuth><AddVehicle /></RequireAuth>} />
              <Route path="/edit-vehicle/:id" element={<RequireAuth><AddVehicle /></RequireAuth>} />
            </Routes>
          </main>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="dark"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/vehicles', label: 'Mis vehículos', end: false },
  { to: '/seguros', label: 'Seguros', end: false },
];

const AuthenticatedHeader = () => {
  const { user, logout, isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#0d1117]/90 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div>
            <span className="font-bold text-white tracking-tight text-lg">GarageManager</span>
            <p className="text-[11px] text-slate-500 leading-none mt-0.5">{user.displayName} · {user.familyName}</p>
          </div>

          {/* Nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            className="text-sm font-medium text-slate-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-slate-800"
          >
            Salir
          </button>
        </div>

        {/* Mobile nav */}
        <nav className="flex sm:hidden items-center gap-1 pb-3 overflow-x-auto">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default App;
