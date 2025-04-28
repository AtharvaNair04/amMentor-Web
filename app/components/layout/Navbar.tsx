'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Logo from '../ui/logo';

const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  const isActive = (path: string) => {
    return pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-dark-bg w-full py-4 px-4 flex justify-between mx-auto max-w-[1650px] min-h-[10vh] font-bold">
        <div className="flex items-center">
          <Logo />
        </div>
        
        {isMobile ? (
          <div className="flex items-center">
            <button 
              onClick={toggleMenu} 
              className="text-white-text focus:outline-none"
              aria-label="Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        ) : (
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
              <Link href="/profile" className="text-white-text hover:text-primary-yellow transition-colors" aria-label="Profile">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </nav>
      
      {isMobile && isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={toggleMenu}
        />
      )}
      
      {isMobile && isMenuOpen && (
        <div className="fixed top-0 right-0 z-50 bg-dark-bg h-full w-1/2 pt-[10vh] shadow-lg">
          <div className="flex flex-col items-center p-4">
            <div className="absolute top-4 right-4">
              <button 
                onClick={toggleMenu} 
                className="text-white-text focus:outline-none"
                aria-label="Close menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex flex-col items-center space-y-6 mt-8 w-full">
              <Link 
                href="/dashboard" 
                className={`${isActive('/dashboard') ? 'text-primary-yellow' : 'text-white-text'} text-xl hover:text-primary-yellow transition-colors`}
                onClick={toggleMenu}
              >
                Dashboard
              </Link>
              <Link 
                href="/submission" 
                className={`${isActive('/submission') ? 'text-primary-yellow' : 'text-white-text'} text-xl hover:text-primary-yellow transition-colors`}
                onClick={toggleMenu}
              >
                Submission
              </Link>
              <Link 
                href="/leaderboard" 
                className={`${isActive('/leaderboard') ? 'text-primary-yellow' : 'text-white-text'} text-xl hover:text-primary-yellow transition-colors`}
                onClick={toggleMenu}
              >
                Leaderboard
              </Link>
              
              <div className="flex items-center space-x-8 mt-6">
                <button className="text-white-text" aria-label="Notifications">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <Link 
                  href="/profile" 
                  className="text-white-text hover:text-primary-yellow transition-colors" 
                  aria-label="Profile"
                  onClick={toggleMenu}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;