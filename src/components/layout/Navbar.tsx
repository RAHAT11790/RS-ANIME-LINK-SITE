import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { Link as LinkIcon, LogIn, LayoutDashboard, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Navbar() {
  const { user, signIn, logout } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-black p-1.5 rounded-lg">
              <LinkIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">RS Links</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-1 text-sm font-medium hover:text-neutral-600 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
                <div className="h-8 w-8 rounded-full overflow-hidden border border-neutral-200">
                  <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="User" />
                </div>
              </>
            ) : (
              <button
                onClick={signIn}
                className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all shadow-sm active:scale-95"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
