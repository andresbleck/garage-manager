import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
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
        <div className="min-h-screen bg-slate-50">
          <AuthenticatedHeader />

          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Home />} />
              <Route path="/seguros" element={<Insurance />} />
              <Route
                path="/vehicle/:id"
                element={
                  <RequireAuth>
                    <VehicleDetail />
                  </RequireAuth>
                }
              />
              <Route
                path="/add-vehicle"
                element={
                  <RequireAuth>
                    <AddVehicle />
                  </RequireAuth>
                }
              />
              <Route
                path="/edit-vehicle/:id"
                element={
                  <RequireAuth>
                    <AddVehicle />
                  </RequireAuth>
                }
              />
            </Routes>
          </main>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            pauseOnHover
            theme="colored"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

const AuthenticatedHeader = () => {
  const { user, logout, isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-700 text-white shadow-2xl">
      <div className="container mx-auto px-4 py-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">GarageManager</h1>
            <p className="text-sm text-slate-300 mt-0.5">
              {user.displayName} · Familia {user.familyName}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-full px-4 py-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 transition"
          >
            Cerrar sesión
          </button>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? 'bg-white text-slate-900 shadow' : 'text-slate-300 hover:bg-white/10'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/seguros"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? 'bg-white text-slate-900 shadow' : 'text-slate-300 hover:bg-white/10'
              }`
            }
          >
            Seguros
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default App;
