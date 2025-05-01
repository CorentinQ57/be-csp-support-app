'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  // Get the page title based on the current path
  const getPageTitle = () => {
    const routes: { [key: string]: string } = {
      '/dashboard': 'Tableau de bord',
      '/tickets': 'Tickets',
      '/documentation': 'Documentation',
      '/webinaires': 'Webinaires',
      '/admin': 'Administration',
      '/settings': 'Paramètres',
      '/help': 'Aide',
    };

    // Check if we're in a sub-route
    const rootPath = '/' + pathname.split('/')[1];
    return routes[pathname] || routes[rootPath] || 'BE-CSP Support';
  };

  // Contextual actions based on the current path
  const getContextualActions = () => {
    switch (pathname) {
      case '/tickets':
        return (
          <button className="rounded-md bg-be-csp-primary px-4 py-2 text-sm font-medium text-white hover:bg-be-csp-primary/90">
            Nouveau ticket
          </button>
        );
      case '/documentation':
        return (
          <button className="rounded-md bg-be-csp-accent px-4 py-2 text-sm font-medium text-white hover:bg-be-csp-accent/90">
            Rechercher
          </button>
        );
      case '/webinaires':
        return (
          <button className="rounded-md bg-be-csp-primary px-4 py-2 text-sm font-medium text-white hover:bg-be-csp-primary/90">
            S'inscrire au prochain
          </button>
        );
      case '/admin':
        return (
          <button className="rounded-md bg-be-csp-primary px-4 py-2 text-sm font-medium text-white hover:bg-be-csp-primary/90">
            Nouvelle action
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      {/* Left Side - Page Title */}
      <div className="flex items-center">
        <h1 className="text-xl font-semibold tracking-tight text-gray-800">{getPageTitle()}</h1>
      </div>

      {/* Right Side - Search, Notifications, User Menu */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="h-9 w-[220px] rounded-md border border-gray-200 bg-gray-50 px-3 py-2 pl-9 pr-4 text-sm placeholder:text-gray-400 focus:border-be-csp-accent focus:outline-none focus:ring-1 focus:ring-be-csp-accent"
          />
        </div>

        {/* Notifications */}
        <button className="relative rounded-md p-2 text-gray-600 hover:bg-gray-100">
          <Bell size={20} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-be-csp-accent"></span>
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md text-sm hover:bg-gray-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-be-csp-accent">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden font-medium text-gray-700 md:inline">{user?.email?.split('@')[0] || 'Utilisateur'}</span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-medium tracking-tight">Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex cursor-pointer items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex cursor-pointer items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/help" className="flex cursor-pointer items-center">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Aide et support</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => signOut()}
              className="flex cursor-pointer items-center text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar; 