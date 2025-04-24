'use client';

import { usePathname } from 'next/navigation';

import Link from 'next/link';
import Logo from '../ui/logo';

const Navbar = () => {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 bg-dark-bg w-full py-4 px-4 flex justify-between mx-auto max-w-[1650px] min-h-[10vh] font-bold">

      <div className="flex items-center">
        <Logo />
      </div>
      
      {/* Removed the center div and moved links to the right */}
      <div className="flex items-center">
        <div className="flex items-center space-x-8 text-xl mr-4">
          <Link 
            href="/dashboard" 
            className={`${isActive('/dashboard') ? 'text-primary-yellow' : 'text-white-text'} hover:text-primary-yellow transition-colors`}
          >
            Dashboard
          </Link>
          <Link 
            href="/submission" 
            className={`${isActive('/submission') ? 'text-primary-yellow' : 'text-white-text'} hover:text-primary-yellow transition-colors`}
          >
            Submission
          </Link>
          <Link 
            href="/leaderboard" 
            className={`${isActive('/leaderboard') ? 'text-primary-yellow' : 'text-white-text'} hover:text-primary-yellow transition-colors`}
          >
            Leaderboard
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-white-text" aria-label="Notifications">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button className="text-white-text" aria-label="Profile">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;