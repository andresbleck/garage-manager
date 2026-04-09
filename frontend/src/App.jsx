import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import VehicleDetail from './pages/VehicleDetail';
import AddVehicle from './pages/AddVehicle';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-600 text-white p-4 shadow-md">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">GarageManager</h1>
            <p className="text-sm opacity-90">Gestión de vehículos doméstica</p>
          </div>
        </header>
        
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vehicle/:id" element={<VehicleDetail />} />
            <Route path="/add-vehicle" element={<AddVehicle />} />
            <Route path="/edit-vehicle/:id" element={<AddVehicle />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
