import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DropdownStyles = () => (
  <style>{`
    @keyframes fadeSlideDown {
      from { opacity:0; transform:translateY(-6px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .dropdown-animate { animation: fadeSlideDown 0.15s ease both; }
  `}</style>
);

/* ── Icons ── */
const I = {
  Profile:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="opacity-50 flex-shrink-0"><path stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" d="M4 18a4 4 0 014-4h8a4 4 0 014 4a2 2 0 01-2 2H6a2 2 0 01-2-2Z"/><circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="1.8"/></svg>,
  Dashboard: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="opacity-50 flex-shrink-0"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/></svg>,
  Tasks:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="opacity-50 flex-shrink-0"><path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
  Team:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="opacity-50 flex-shrink-0"><path stroke="currentColor" strokeWidth="1.8" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/><path stroke="currentColor" strokeWidth="1.8" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  Verify:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="opacity-50 flex-shrink-0"><polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  History:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="opacity-50 flex-shrink-0"><path stroke="currentColor" strokeWidth="1.8" d="M3 3v5h5M3.05 13A9 9 0 106 5.3"/><path stroke="currentColor" strokeWidth="1.8" d="M12 7v5l3 3"/></svg>,
  About:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="opacity-50 flex-shrink-0"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/><path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="1.8"/></svg>,
  Users:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="opacity-50 flex-shrink-0"><path stroke="currentColor" strokeWidth="1.8" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/><path stroke="currentColor" strokeWidth="1.8" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  Logout:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="opacity-75 flex-shrink-0"><path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  Login:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="opacity-50 flex-shrink-0"><path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>,
  Signup:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="opacity-50 flex-shrink-0"><path stroke="currentColor" strokeWidth="1.8" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/><line x1="19" y1="8" x2="19" y2="14" stroke="currentColor" strokeWidth="1.8"/><line x1="22" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="1.8"/></svg>,
};

function Item({ icon, label, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] text-left
        transition-colors duration-100 cursor-pointer border-none bg-transparent
        ${danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-800 hover:bg-gray-50'}`}
    >
      {icon}
      {label}
    </button>
  );
}

function ProfileDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const go  = (path) => { navigate(path); setOpen(false); };
  const out = () => { logout(); navigate('/'); setOpen(false); };

  return (
    <>
      <DropdownStyles/>
      <div ref={ref} className="relative">

        {/* Trigger */}
        <button
          onClick={() => setOpen(p => !p)}
          aria-label="Profile menu"
          className={`w-9 h-9 flex items-center justify-center rounded-full
            bg-blue-50 border-[1.5px] transition-all duration-150
            ${open ? 'border-blue-600 bg-blue-100' : 'border-transparent hover:border-blue-500 hover:bg-blue-100'}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path stroke="#1d4ed8" strokeWidth="1.8" strokeLinejoin="round"
              d="M4 18a4 4 0 014-4h8a4 4 0 014 4a2 2 0 01-2 2H6a2 2 0 01-2-2Z"/>
            <circle cx="12" cy="7" r="3" stroke="#1d4ed8" strokeWidth="1.8"/>
          </svg>
        </button>

        {/* Dropdown panel */}
        {open && (
          <div
            className="dropdown-animate absolute right-0 mt-2.5 bg-white border border-gray-200 rounded-[10px] z-50 overflow-hidden"
            style={{boxShadow:'0 8px 30px rgba(0,0,0,0.09)', width: 'min(220px, calc(100vw - 32px)'}}
          >

            {/* GUEST */}
            {!user && (
              <>
                <Item icon={<I.Login/>}   label="Login"      onClick={()=>go('/login')}/>
                <Item icon={<I.Signup/>}  label="Signup"     onClick={()=>go('/signup')}/>
                <Item icon={<I.About/>}   label="About"      onClick={()=>go('/about')}/>
                <Item icon={<I.Users/>}   label="Who We Are" onClick={()=>go('/who-we-are')}/>
              </>
            )}

            {/* LOGGED IN */}
            {user && (
              <>
                {/* Header */}
<div className="px-4 py-3 border-b border-gray-100">
  <p className="text-sm font-semibold text-gray-900 truncate">
    {user.name}
  </p>

  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-blue-50 text-blue-700 capitalize">
    {user.role}
  </span>

  {/* 🔥 ADD THIS LINE */}
  <p className="text-xs text-blue-600 font-semibold mt-1">
    Credits: {user?.credits ?? 0}
  </p>
</div>

                {/* USER */}
                {user && user.role !== 'admin' && (
                  <>
                    <Item icon={<I.Profile/>}   label="Profile"       onClick={()=>go('/profile')}/>
                    <Item icon={<I.Dashboard/>} label="Dashboard"     onClick={()=>go('/dashboard')}/>
                    <Item icon={<I.Tasks/>}     label="My Tasks"      onClick={()=>go('/my-tasks')}/>
                    <Item icon={<I.History/>}   label="Task History"  onClick={()=>go('/task-history')}/>
                    <Item icon={<I.Team/>}      label="My Team"       onClick={()=>go('/my-team')}/>
                    <Item icon={<I.About/>}     label="About"         onClick={()=>go('/about')}/>
                    <Item icon={<I.Users/>}     label="Who We Are"    onClick={()=>go('/who-we-are')}/>
                  </>
                )}

                {/* ADMIN */}
               {user?.role === 'admin' && (
                  <>
                    <Item icon={<I.Dashboard/>} label="Admin Dashboard"    onClick={()=>go('/admin/history')}/>
                    <Item icon={<I.Verify/>}    label="Verify Tasks"       onClick={()=>go('/admin/verify-tasks')}/>
                    <Item icon={<I.History/>}   label="Task History"       onClick={()=>go('/admin/task-history')}/>
                  </>
                )}

                <div className="border-t border-gray-100">
                  <Item icon={<I.Logout/>} label="Logout" onClick={out} danger/>
                </div>
              </>
            )}

          </div>
        )}
      </div>
    </>
  );
}

export default ProfileDropdown;