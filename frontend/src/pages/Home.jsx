import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const IconWrench = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);
const IconFile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const FEATURES = [
  { Icon: IconCalendar, title: 'Control de vencimientos', desc: 'Seguro, VTV, matafuegos y más. Recordatorios automáticos antes de que venzan.' },
  { Icon: IconWrench,   title: 'Historial de reparaciones', desc: 'Registrá cada intervención con fecha, costo y kilometraje.' },
  { Icon: IconFile,     title: 'Gestión de documentos', desc: 'Guardá PDFs y fotos del seguro, cédula verde o cualquier documento.' },
  { Icon: IconUsers,    title: 'Cuenta familiar', desc: 'Una sola cuenta accesible desde cualquier dispositivo de la familia.' },
];

const Home = () => {
  const { isAuthenticated, initialized } = useAuth();

  if (!initialized) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-1 { animation: fadeUp 0.6s ease forwards; }
        .anim-2 { animation: fadeUp 0.6s ease 0.1s forwards; opacity: 0; }
        .anim-3 { animation: fadeUp 0.6s ease 0.25s forwards; opacity: 0; }
        .anim-4 { animation: fadeUp 0.6s ease 0.4s forwards; opacity: 0; }
      `}</style>

      <div className="max-w-4xl mx-auto pt-10 pb-16 px-4 text-center">

        {/* Título */}
        <h1 className="anim-1 text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-6">
          Garage<span className="text-blue-500">Manager</span>
        </h1>

        <p className="anim-2 text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
          Vencimientos, reparaciones y documentos de todos los autos de la familia en un solo lugar, con recordatorios automáticos.
        </p>

        {/* Botones */}
        <div className="anim-3 flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <Link
            to="/register"
            className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-500/25"
          >
            Crear cuenta familiar
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center bg-slate-800 text-slate-200 border border-slate-700 px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-700 hover:text-white active:scale-95 transition-all"
          >
            Iniciar sesión
          </Link>
        </div>

        {/* Features */}
        <div className="anim-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="group bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all duration-200"
            >
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 mb-3 group-hover:bg-blue-500/20 transition-colors">
                <Icon />
              </div>
              <h3 className="font-semibold text-white mb-1">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
