import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { DemoBotProvider } from '@/context/DemoBotContext';
import { VisualDemoBotOverlay } from '@/components/demo/VisualDemoBotOverlay';
import { appNavGroups } from '@/lib/erpModules';
import {
  Search, Settings as SettingsIcon, Sliders,
  Sun, Moon, Menu, X, ShieldCheck, Mail, Star, ChevronsUpDown, ChevronsDownUp,
  ChevronDown, ChevronUp, Bell,
} from 'lucide-react';

const navGroups = appNavGroups;

export function AppLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  // Sidebar Search & Pin States
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedPaths, setPinnedPaths] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('pinned_sidebar_items') || '[]');
    } catch {
      return [];
    }
  });
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Slash (/) key outside inputs
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Escape (Esc) key to clear/blur
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const togglePin = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPinnedPaths(prev => {
      const updated = prev.includes(path) 
        ? prev.filter(p => p !== path) 
        : [...prev, path];
      localStorage.setItem('pinned_sidebar_items', JSON.stringify(updated));
      return updated;
    });
  };

  const collapseAll = () => {
    setExpandedGroups({});
  };

  const expandAll = () => {
    const expanded: Record<string, boolean> = {};
    navGroups.forEach(group => {
      if (group.isCollapsible) {
        expanded[group.title] = true;
      }
    });
    setExpandedGroups(expanded);
  };

  const allNavItems = navGroups.flatMap(group => group.items);
  const uniquePinnedItems = allNavItems.filter(item => pinnedPaths.includes(item.path))
    .filter((item, index, self) => self.findIndex(t => t.path === item.path) === index);

  // Filter groups based on search query
  const filteredGroups = navGroups.map(group => {
    const groupTitleMatches = group.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchingItems = group.items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const itemsToKeep = searchQuery ? (groupTitleMatches ? group.items : matchingItems) : group.items;
    
    return {
      ...group,
      items: itemsToKeep,
      hasMatches: itemsToKeep.length > 0
    };
  }).filter(group => group.hasMatches);

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase()
            ? <mark key={i} className="bg-teal-500/35 text-white font-semibold rounded-[2px] px-0.5">{part}</mark>
            : part
        )}
      </>
    );
  };
  
  // Theme state
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Auto-expand active group
  useEffect(() => {
    const activeGroup = navGroups.find(group => 
      group.items.some(item => location.pathname === item.path || 
                              (item.path !== '/' && location.pathname.startsWith(item.path)))
    );
    if (activeGroup && activeGroup.isCollapsible) {
      setExpandedGroups(prev => ({ ...prev, [activeGroup.title]: true }));
    }
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const renderSidebarContent = () => (
    <>
      {/* Brand Logo area */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-700 flex-shrink-0 bg-zinc-900">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-teal-400" />
          <span className="text-xl font-extrabold tracking-wider text-white">CORP-ERP</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-zinc-400 hover:text-white"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Search Input Box */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0 bg-zinc-800">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search... (Ctrl+K or /)"
            className="w-full bg-zinc-700/35 border border-zinc-700/60 rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-zinc-200 placeholder:text-zinc-500 transition-all animate-none"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <span className="absolute right-2.5 top-2.5 text-[10px] bg-zinc-700 text-zinc-400 border border-zinc-600 rounded px-1.5 py-0.5 select-none hidden sm:inline-block">
              /
            </span>
          )}
        </div>
      </div>

      {/* Navigation menu */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 px-3 custom-sidebar-scrollbar">
        {/* Pinned / Favorites Section */}
        {!searchQuery && uniquePinnedItems.length > 0 && (
          <div className="space-y-1 pb-3 mb-2 border-b border-zinc-700/30">
            <div className="py-2 px-3 text-[10px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-teal-400 text-teal-400" />
              Pinned Pages
            </div>
            <div className="space-y-0.5 pl-2">
              {uniquePinnedItems.map((item) => {
                const isActive = location.pathname === item.path || 
                                 (item.path !== '/' && location.pathname.startsWith(item.path));
                const ItemIcon = (item as any).icon;
                return (
                  <Link
                    key={`pinned-${item.path}`}
                    to={item.path}
                    className={`group/link flex items-center justify-between px-3 py-1.5 text-sm font-medium transition-colors border-l-4 rounded-r-md ${
                      isActive
                        ? 'bg-zinc-700/50 text-white border-teal-500 font-semibold'
                        : 'text-zinc-300 border-transparent hover:bg-zinc-700/20 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center min-w-0">
                      {ItemIcon && <ItemIcon className="mr-3 h-4 w-4 text-zinc-400 flex-shrink-0" />}
                      <span className="truncate">{item.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => togglePin(item.path, e)}
                      className="opacity-100 p-1 text-teal-400 hover:text-teal-300 transition-opacity ml-2"
                      title="Unpin page"
                    >
                      <Star className="h-3.5 w-3.5 fill-teal-400 text-teal-400" />
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Controls / Menu title */}
        <div className="flex items-center justify-between px-3 py-1 text-[10px] font-bold text-zinc-500 border-b border-zinc-700/30 pb-2 mb-2">
          <span className="uppercase tracking-wider">NAVIGATION</span>
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              title="Expand All Groups"
              className="p-1 hover:text-white hover:bg-zinc-700/50 rounded transition-colors"
            >
              <ChevronsUpDown className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={collapseAll}
              title="Collapse All Groups"
              className="p-1 hover:text-white hover:bg-zinc-700/50 rounded transition-colors"
            >
              <ChevronsDownUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Filtered navigation groups */}
        {filteredGroups.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-zinc-500">
            No matches found for "{searchQuery}"
          </div>
        ) : (
          filteredGroups.map((group) => {
            const isCollapsed = group.isCollapsible && !expandedGroups[group.title] && !searchQuery;
            const GroupIcon = group.icon;
            
            return (
              <div key={group.title} className="space-y-1">
                {group.isCollapsible ? (
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className="w-full flex items-center justify-between py-2 px-3 text-xs font-semibold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      {GroupIcon && <GroupIcon className="h-4 w-4 text-zinc-500" />}
                      {highlightMatch(group.title, searchQuery)}
                    </span>
                    {isCollapsed ? (
                      <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                    ) : (
                      <ChevronUp className="h-3.5 w-3.5 text-zinc-500" />
                    )}
                  </button>
                ) : (
                  <div className="py-2 px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    {highlightMatch(group.title, searchQuery)}
                  </div>
                )}

                {(group.items.length === 0 ? false : !isCollapsed) && (
                  <div className="space-y-0.5 pl-2 border-l border-zinc-700/50 ml-3">
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.path || 
                                       (item.path !== '/' && location.pathname.startsWith(item.path));
                      const ItemIcon = (item as any).icon;
                      const isPinned = pinnedPaths.includes(item.path);
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`group/link flex items-center justify-between px-3 py-1.5 text-sm font-medium transition-colors border-l-4 rounded-r-md ${
                            isActive
                              ? 'bg-zinc-700/50 text-white border-teal-500 font-semibold'
                              : 'text-zinc-300 border-transparent hover:bg-zinc-700/20 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center min-w-0">
                            {ItemIcon && <ItemIcon className="mr-3 h-4 w-4 text-zinc-400 flex-shrink-0" />}
                            <span className="truncate">{highlightMatch(item.name, searchQuery)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => togglePin(item.path, e)}
                            className={`opacity-0 group-hover/link:opacity-100 focus:opacity-100 p-1 hover:text-teal-400 transition-opacity ml-2 ${
                              isPinned ? 'opacity-100 text-teal-400' : 'text-zinc-500'
                            }`}
                            title={isPinned ? 'Unpin page' : 'Pin page'}
                          >
                            <Star className={`h-3.5 w-3.5 ${isPinned ? 'fill-teal-400 text-teal-400' : ''}`} />
                          </button>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Profile Panel */}
      <div className="p-4 border-t border-zinc-700 bg-zinc-900/60 flex items-center justify-between flex-shrink-0 text-zinc-300">
        <div className="flex items-center gap-3">
          <div className="bg-zinc-700 p-2 rounded-full text-teal-400">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none">Suketu Shah</p>
            <p className="text-xs text-zinc-500 mt-1">v2.1 Stable</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="text-xs text-zinc-400 hover:text-white h-8 px-2 hover:bg-zinc-700/50">
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <DemoBotProvider>
      <div className="flex h-screen bg-background font-sans text-foreground antialiased">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-zinc-800 bg-zinc-900 text-zinc-200 md:flex">
          {renderSidebarContent()}
        </aside>

        {/* Mobile Drawer Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 max-md:flex md:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Drawer Content */}
            <aside className="relative z-10 flex w-64 animate-in flex-col border-r border-zinc-800 bg-zinc-900 text-zinc-200 duration-200 slide-in-from-left">
              {renderSidebarContent()}
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Top Header - White background */}
          <header className="z-10 flex h-16 items-center justify-between gap-3 border-b border-border bg-card px-3 shadow-sm sm:px-4 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center">
              {/* Hamburger Button for mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 shrink-0 text-muted-foreground hover:text-foreground md:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle mobile navigation</span>
              </Button>

              {/* Wide Search Bar in the Center */}
              <div className="relative hidden w-full max-w-lg sm:block">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search resources, documents, or systems..."
                  className="w-full rounded-full border-0 bg-muted py-2 pl-10 pr-4 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-4">
              {/* Theme Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-foreground"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5 text-teal-400" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>

              <Link to="/communication">
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                  <Mail className="h-5 w-5" />
                  <span className="sr-only">Messages</span>
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary"></span>
                </Button>
              </Link>

              <Link to="/tasks">
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-red-500 text-[10px] font-bold text-white dark:border-zinc-950">
                    3
                  </span>
                </Button>
              </Link>

              {/* User Profile Avatar with dropdown */}
              <div
                className="flex cursor-pointer items-center gap-2 border-l border-border pl-2 hover:opacity-85 sm:pl-4"
                onClick={() => navigate('/settings')}
                onKeyDown={e => { if (e.key === 'Enter') navigate('/settings'); }}
                role="button"
                tabIndex={0}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                  SS
                </div>
                <div className="hidden text-left lg:block">
                  <p className="text-xs font-semibold leading-none text-foreground">Suketu Shah</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">Admin Director</p>
                </div>
                <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-auto bg-background p-3 sm:p-5 lg:p-8">
            <div className="mx-auto w-full max-w-7xl space-y-6 lg:space-y-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
      <VisualDemoBotOverlay />
    </DemoBotProvider>
  );
}
