import AppRoutes from './routes/AppRoutes';
import AuthSessionHydrator from './components/AuthSessionHydrator';

function App() {
  return (
    <div className="app-shell page">
      <AuthSessionHydrator />
      <div className="container">
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;
