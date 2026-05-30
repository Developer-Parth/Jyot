import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, CircleDashed, Sparkles, BookOpen, User, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

const HIDE_NAV_PATHS = ['/wishes', '/wish/', '/record-wish'];

export default function Layout() {
  const location = useLocation();
  const hideNav = HIDE_NAV_PATHS.some(p => location.pathname.startsWith(p));

  const navItems = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/jaap', icon: CircleDashed, label: 'Jaap' },
    { to: '/wishes', icon: Heart, label: 'Wishes' },
    { to: '/palm-reading', icon: Sparkles, label: 'Astro' },
    { to: '/puja', icon: BookOpen, label: 'Puja' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-transparent max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-amber-900/10">
      <main className={`flex-1 overflow-y-auto ${hideNav ? '' : 'pb-20'}`}>
        <Outlet />
      </main>
      
      {!hideNav && (
        <nav className="absolute bottom-0 w-full bg-[#2b1d16]/90 backdrop-blur-md border-t border-amber-500/20 px-2 py-2 pb-safe shadow-[0_-4px_24px_rgba(45,29,18,0.22)] z-50">
          <div className="flex justify-around items-center">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200",
                    isActive 
                      ? "text-stone-950 bg-amber-100 font-medium" 
                      : "text-amber-100/60 hover:text-amber-100 hover:bg-amber-100/10"
                  )
                }
              >
                <item.icon className="w-6 h-6 mb-1" strokeWidth={2} />
                <span className="text-[10px]">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
