import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
import VehicleDetail from './pages/VehicleDetail';
import AddVehicle from './pages/AddVehicle';
import Insurance from './pages/Insurance';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Header />

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/seguros" element={<Insurance />} />
            <Route path="/vehicle/:id" element={<VehicleDetail />} />
            <Route path="/add-vehicle" element={<AddVehicle />} />
            <Route path="/edit-vehicle/:id" element={<AddVehicle />} />
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
  );
}

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-700 text-white shadow-2xl">
      <div className="container mx-auto px-4 py-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">GarageManager</h1>
            <p className="mt-2 text-sm text-slate-200 max-w-xl">
              Controla tus vehículos, vencimientos y reparaciones con una experiencia más clara y profesional.
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-3">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-200 hover:bg-white/10'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/seguros"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-200 hover:bg-white/10'
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
