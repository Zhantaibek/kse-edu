import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUiStore } from '../../store/uiStore';
import { cn } from '../../utils';

export function AppLayout() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <div className="app-canvas min-h-screen">
      <Sidebar />
      <div className={cn('min-h-screen transition-[padding] duration-300', collapsed ? 'lg:pl-[76px]' : 'lg:pl-64')}>
        <Header />
        <main className="animate-fade-up px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
