import AppRoutes from "./routes/AppRoutes";
import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <ToastProvider>
      <div className="bg-[#050816] min-h-screen">
        <AppRoutes />
      </div>
    </ToastProvider>
  );
}

export default App;