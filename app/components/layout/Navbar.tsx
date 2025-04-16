
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="flex justify-between items-center w-full px-6 py-4">
      <div className="flex items-center">
        <Link href="/dashboard" className="text-white-text text-xl font-bold">
          <span>amMENT</span>
          <span className="text-primary-yellow">&lt;</span>
          <span className="text-primary-yellow">&gt;</span>
          <span>R</span>
        </Link>
      </div>
      <div className="flex items-center space-x-8">
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
    </nav>
  );
};

export default Navbar;