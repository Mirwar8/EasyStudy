import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import GlobalModals from './GlobalModals';
import Toaster from '../ui/Toast';

export default function AppShell() {
  const location = useLocation();
  
  // Páginas donde el BottomNav estorba o no es deseado
  const hideNavPaths = ['/quiz', '/summaries/'];
  const shouldHideNav = hideNavPaths.some(path => location.pathname.includes(path));

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark font-display max-w-[430px] mx-auto shadow-2xl relative overflow-hidden">
      <main className={`flex-1 overflow-y-auto ${shouldHideNav ? 'pb-0' : 'pb-24'}`}>
        <Outlet />
      </main>
      
      {!shouldHideNav && <BottomNav />}
      <GlobalModals />
      <Toaster />
    </div>
  );
}
