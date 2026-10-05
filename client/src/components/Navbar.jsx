import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, LogOut, ChevronDown, Bell, Mail, Search, CheckCircle } from 'lucide-react';

const Navbar = ({ onOpenCreateModal, stats, onSearchChange, searchQuery, onOpenAuthModal }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#F4F6F5]/90 backdrop-blur-md border-b border-[#E5EAE6] py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo - TaskFlow */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#EAF4EE] border border-[#D1E7DD] flex items-center justify-center shadow-xs">
            <svg className="w-5 h-5 text-[#194D33]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-[#111827]">
              TaskFlow
            </span>
          </div>
        </div>

        {/* Center Search Bar with Keyboard shortcut */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              placeholder="Search task..."
              value={searchQuery || ''}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-10 pr-12 py-2 rounded-full bg-white border border-[#E5EAE6] text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#194D33] focus:ring-2 focus:ring-[#194D33]/15 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
            />
            <span className="absolute right-3 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-500">
              ⌘F
            </span>
          </div>
        </div>

        {/* Right Section: Notification Icons & User Profile */}
        <div className="flex items-center gap-3">
          {/* Notification buttons */}
          <button
            className="w-9 h-9 rounded-full bg-white border border-[#E5EAE6] flex items-center justify-center text-slate-600 hover:text-[#194D33] hover:border-[#194D33]/40 transition-colors shadow-sm cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* User Profile Pill or Sign In Button */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1 pr-3 rounded-full bg-white border border-[#E5EAE6] hover:border-slate-300 transition-all shadow-sm cursor-pointer"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#EAF4EE] text-[#194D33] border border-[#D2E7DC] flex items-center justify-center text-xs font-bold">
                    {getInitials(user?.name || user?.email)}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[110px]">
                    {user?.name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[110px]">{user?.email}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-[#E5EAE6] shadow-xl p-2 z-50 animate-fade-in">
                  <div className="p-3 border-b border-slate-100 mb-1">
                    <p className="text-[11px] text-slate-400 uppercase font-semibold">Workspace Account</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate mb-1.5">{user?.email}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF4EE] text-[#194D33]">
                      <CheckCircle className="w-3 h-3 text-[#194D33]" />
                      {user?.authProvider === 'google' ? 'Google Auth' : 'Verified OTP'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#194D33] hover:bg-[#143F2A] text-white text-xs font-bold shadow-sm transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Sign In / Sign Up</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
