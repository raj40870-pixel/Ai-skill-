import React, { useState } from 'react';
import { 
  Target, 
  Home, 
  User, 
  Upload, 
  BarChart3, 
  Briefcase, 
  TrendingUp, 
  MessageSquare, 
  Zap, 
  History, 
  Settings, 
  LogOut,
  Menu,
  X,
  Map,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LifeBuoy
} from 'lucide-react';
import { cn, getUserAvatar, getUserCleanName } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  user: any;
}

const ADMIN_EMAILS = [
  "kamaljit444501@gmail.com",
  "kamaljit44501@gmail.com"
];

export function Header({ activeTab, onTabChange, onLogout, user }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userEmail = (user?.email || '').toLowerCase().trim();
  const isAdmin = Boolean(
    user && (
      ADMIN_EMAILS.includes(userEmail) ||
      user.plan === 'ENTERPRISE_ADMIN' ||
      user.plan === 'ADMIN' ||
      user.isAdmin === true ||
      user.role === 'admin'
    )
  );

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: ShieldCheck }] : []),
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'upload', label: 'Resume Upload', icon: Upload },
    { id: 'mentorship', label: 'AI Mentorship', icon: Sparkles },
    { id: 'ats', label: 'ATS Score', icon: BarChart3 },
    { id: 'salary', label: 'Salary Insights', icon: TrendingUp },
    { id: 'interview', label: 'Interview Preparation', icon: MessageSquare },
    { id: 'roadmap', label: 'Career Roadmap', icon: Map },
    { id: 'skillgap', label: 'Skill Gap Analysis', icon: Zap },
    { id: 'resources', label: 'Learning Resources', icon: BookOpen },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Help Desk', icon: LifeBuoy },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ];

  const handleNavClick = (id: string) => {
    onTabChange(id);
    setIsMobileMenuOpen(false);
  };

  const navRef = React.useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  React.useEffect(() => {
    const el = navRef.current;
    if (el) {
      const timer = setTimeout(checkScroll, 150);
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        clearTimeout(timer);
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [activeTab]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (navRef.current) {
      if (navRef.current.scrollWidth > navRef.current.clientWidth) {
        navRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (navRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      navRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Unified Fixed Top Header with Branding and Nav Tabs */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 shadow-xs select-none">
        {/* Row 1: Logo, User, Quick Settings & Sign Out (Height: 60px) */}
        <div className="h-[60px] flex items-center justify-between px-4 sm:px-6 border-b border-gray-100 dark:border-zinc-800/80">
          {/* Left: Logo & Branding */}
          <div 
            onClick={() => handleNavClick('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-md shadow-blue-500/20">
              <Target className="text-white w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="font-extrabold text-base sm:text-lg md:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-800 to-indigo-900">
              Career Nav AI
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick-Access Settings Icon */}
            <button
              onClick={() => handleNavClick('settings')}
              className={cn(
                "p-2 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer",
                activeTab === 'settings' ? "text-[#2563EB] bg-blue-50 dark:bg-blue-950/40" : "text-gray-500 dark:text-gray-400"
              )}
              title="Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 animate-hover-spin" />
            </button>

            {/* Quick Admin Console Trigger */}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer border shadow-sm shrink-0",
                  activeTab === 'admin'
                    ? "bg-red-600 text-white border-red-600 shadow-red-500/20 scale-105"
                    : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/60"
                )}
                title="Open Admin Management Console"
              >
                <ShieldCheck className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="hidden sm:inline">Admin Panel</span>
                <span className="sm:hidden">Admin</span>
              </button>
            )}

            {/* User Display (Desktop) */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-zinc-800/60 rounded-xl border border-gray-100 dark:border-zinc-700/60 max-w-[200px]">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-blue-100 shrink-0 shadow-inner">
                  <img 
                    src={getUserAvatar(user.email, user.displayName, user.photoURL)} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200 truncate leading-tight">
                    {getUserCleanName(user)}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => handleNavClick('admin')}
                      className="text-[8px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest flex items-center gap-0.5 hover:underline cursor-pointer"
                      title="Click to open Admin Panel"
                    >
                      <Zap className="w-2 h-2 fill-current" />
                      Admin Console
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Sign Out Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onLogout}
              className="hidden sm:flex items-center gap-1.5 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl h-8 px-3.5 font-semibold text-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Sign Out</span>
            </Button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-200 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Navigation Tabs Bar (Height: 48px, horizontal scrollable) */}
        <div className="h-[48px] bg-gray-50/70 dark:bg-zinc-900/90 flex items-center px-2 relative overflow-hidden">
          {/* Left Fading Gradient & Arrow */}
          {showLeftArrow && (
            <div className="absolute left-0 top-0 bottom-0 w-14 bg-gradient-to-r from-gray-50 via-gray-50/90 to-transparent dark:from-zinc-900 dark:via-zinc-900/90 dark:to-transparent z-10 flex items-center pl-2 pointer-events-none">
              <button
                onClick={() => scroll('left')}
                className="pointer-events-auto flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          <nav 
            ref={navRef}
            onWheel={handleWheel}
            className="flex items-center gap-1.5 max-w-7xl w-full mx-auto justify-start overflow-x-auto scrollbar-none py-1 px-3 sm:px-6 select-none touch-pan-x scroll-smooth"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 select-none whitespace-nowrap shrink-0 cursor-pointer",
                    isActive 
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-bold" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-zinc-800/80 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <item.icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Fading Gradient & Arrow */}
          {showRightArrow && (
            <div className="absolute right-0 top-0 bottom-0 w-14 bg-gradient-to-l from-gray-50 via-gray-50/90 to-transparent dark:from-zinc-900 dark:via-zinc-900/90 dark:to-transparent z-10 flex items-center justify-end pr-2 pointer-events-none">
              <button
                onClick={() => scroll('right')}
                className="pointer-events-auto flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Drawer Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] lg:hidden"
            />

            {/* Side Drawer Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white dark:bg-zinc-900 z-[60] shadow-2xl lg:hidden flex flex-col border-l border-gray-100 dark:border-zinc-800 pt-[60px]"
            >
              {/* User Identity inside drawer */}
              {user && (
                <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                      <img 
                        src={getUserAvatar(user.email, user.displayName, user.photoURL)} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm truncate max-w-[180px]">
                        {getUserCleanName(user)}
                      </h4>
                      <p className="text-xs text-gray-400 truncate max-w-[180px]">
                        {user.email || 'Free Tier Account'}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleNavClick('admin')}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-600 dark:text-red-400 font-bold text-xs mt-1 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-red-600" />
                        <span>Admin Console</span>
                      </div>
                      <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded uppercase tracking-wider font-black">Founder</span>
                    </button>
                  )}
                </div>
              )}

              {/* Navigation Items Links */}
              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left font-semibold text-sm transition-all duration-200",
                        isActive 
                          ? "bg-blue-50 text-[#2563EB]" 
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-[#2563EB]" : "text-gray-400")} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

              </div>

              {/* Bottom Drawer Actions */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <Button
                  variant="ghost"
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 bg-red-50/30 rounded-xl py-3 font-semibold text-sm"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
