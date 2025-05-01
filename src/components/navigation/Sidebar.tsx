'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Ticket,
  FileText,
  Video,
  Settings,
  HelpCircle,
  Shield,
  LogOut
} from 'lucide-react';

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  isCollapsed?: boolean;
};

const NavItem = ({ href, icon, label, isActive, isCollapsed }: NavItemProps) => {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors',
        isActive 
          ? 'bg-be-csp-accent/10 text-white border-l-4 border-be-csp-accent' 
          : 'text-gray-300 hover:bg-white/5 hover:text-white',
        isCollapsed && 'justify-center px-2'
      )}
    >
      <div className={cn(
        "flex items-center justify-center",
        isCollapsed ? "w-8 h-8" : "w-5 h-5 text-gray-400"
      )}>
        {icon}
      </div>
      {!isCollapsed && <span className="tracking-tight">{label}</span>}
    </Link>
  );
};

const Sidebar = () => {
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    // Primary Navigation
    { 
      section: 'primary',
      items: [
        { href: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Tableau de bord' },
        { href: '/tickets', icon: <Ticket size={20} />, label: 'Tickets' },
        { href: '/documentation', icon: <FileText size={20} />, label: 'Documentation' },
        { href: '/webinaires', icon: <Video size={20} />, label: 'Webinaires' },
      ]
    },
    // Admin Section (shown only for admin users)
    {
      section: 'admin',
      items: [
        { href: '/admin', icon: <Shield size={20} />, label: 'Administration' },
      ]
    },
    // Secondary Navigation (Bottom)
    {
      section: 'secondary',
      items: [
        { href: '/settings', icon: <Settings size={20} />, label: 'Paramètres' },
        { href: '/help', icon: <HelpCircle size={20} />, label: 'Aide' },
      ]
    }
  ];

  // Function to check if a user has admin role
  const isAdmin = () => {
    return user?.app_metadata?.role === 'admin';
  };

  return (
    <aside
      className={cn(
        'relative flex h-screen flex-col border-r border-gray-800 bg-be-csp-primary transition-all duration-300',
        isCollapsed ? 'w-[70px]' : 'w-64'
      )}
    >
      {/* Sidebar Header with Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
        {!isCollapsed && (
          <div className="flex items-center">
            <span className="font-bold tracking-tight text-be-csp-accent">BE-CSP</span>
            <span className="ml-2 text-sm font-medium text-white tracking-tight">Support</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Primary Navigation */}
      <div className="flex-1 overflow-auto py-6">
        <nav className="flex flex-col gap-2 px-3">
          {navItems[0].items.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* Admin Section - Only visible for admin users */}
        {isAdmin() && (
          <>
            <div className={cn('my-6 px-4', isCollapsed && 'text-center')}>
              {!isCollapsed && <p className="text-xs font-semibold tracking-tight text-gray-400">Administration</p>}
              <div className={cn('mt-1 h-px bg-gray-800', isCollapsed && 'mx-auto w-8')} />
            </div>
            <nav className="flex flex-col gap-2 px-3">
              {navItems[1].items.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                  isCollapsed={isCollapsed}
                />
              ))}
            </nav>
          </>
        )}
      </div>

      {/* User & Bottom Navigation */}
      <div className="border-t border-gray-800 py-4">
        <nav className="flex flex-col gap-2 px-3">
          {navItems[2].items.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname === item.href}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* User Profile */}
        <div className={cn('mt-4 px-4', isCollapsed ? 'text-center' : 'flex items-center justify-between')}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-be-csp-accent/10 text-be-csp-accent">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="ml-2">
                  <p className="text-sm font-medium tracking-tight text-white">{user?.email?.split('@')[0] || 'Utilisateur'}</p>
                  <p className="text-xs text-gray-400">{user?.email || ''}</p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="rounded-md p-1.5 text-gray-400 hover:text-white"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={() => signOut()}
              className="flex w-full justify-center rounded-md p-1.5 text-gray-400 hover:text-white"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 