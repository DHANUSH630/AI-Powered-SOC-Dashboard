import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AIAssistantModal from '../common/AIAssistantModal';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex relative">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pl-64 transition-all duration-300">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating AI SOC Security Assistant */}
      <AIAssistantModal />
    </div>
  );
}
