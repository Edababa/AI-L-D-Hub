
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AppState, User, Course, Enrollment, Feedback, UserRole, CourseStatus } from './types';
import { INITIAL_USERS, INITIAL_COURSES } from './constants';
import { Button } from './components/ui/Button';
import Home from './pages/Home';
import MyLearning from './pages/MyLearning';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

/**
 * --- CLOUD CONFIGURATION ---
 * 1. PASTE YOUR GOOGLE APPS SCRIPT URL BELOW between the quotes.
 * Example: const CLOUD_URL: string = "https://script.google.com/macros/s/ABC123xyz/exec";
 */
const CLOUD_URL: string = "https://script.google.com/macros/s/AKfycbxdibLzZ-q94bGsxv5TLF6bIYmm3HNa7yc20CNEYXQDR56Eg5ibkEXtahBDsOqJ4EkIqQ/exec"; 

interface AppContextType extends AppState {
  isSyncing: boolean;
  cloudError: string | null;
  setCurrentUser: (user: User | null) => void;
  login: (email: string) => boolean;
  register: (name: string, email: string) => void;
  logout: () => void;
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => void;
  removeCourse: (courseId: string) => void;
  updateEnrollment: (courseId: string, status: CourseStatus) => void;
  addFeedback: (courseId: string, rating: number, comment: string) => void;
  promoteUser: (userId: string) => void;
  demoteUser: (userId: string) => void;
  syncToCloud: (overrideState?: AppState) => Promise<void>;
  fetchFromCloud: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const App: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('ci_ld_hub_data');
    if (saved) return JSON.parse(saved);
    return {
      users: INITIAL_USERS,
      courses: INITIAL_COURSES,
      enrollments: [],
      feedback: [],
      currentUser: null,
    };
  });

  useEffect(() => {
    if (CLOUD_URL && CLOUD_URL.startsWith('http')) {
      fetchFromCloud();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ci_ld_hub_data', JSON.stringify(state));
  }, [state]);

  const fetchFromCloud = async () => {
    if (!CLOUD_URL || !CLOUD_URL.startsWith('http')) return;
    setIsSyncing(true);
    try {
      const response = await fetch(CLOUD_URL);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      
      if (data && data.courses && data.courses.length > 0) {
        setState(prev => ({
          ...prev,
          users: data.users && data.users.length > 0 ? data.users : prev.users,
          courses: data.courses,
          enrollments: data.enrollments || [],
          feedback: data.feedback || [],
          currentUser: prev.currentUser
        }));
      }
      setCloudError(null);
    } catch (err) {
      console.error("Cloud fetch failed:", err);
      setCloudError("Offline: Using local cache.");
    } finally {
      setIsSyncing(false);
    }
  };

  const syncToCloud = async (overrideState?: AppState) => {
    if (!CLOUD_URL || !CLOUD_URL.startsWith('http')) {
       alert("ACTION REQUIRED: You must paste your Google Web App URL into App.tsx (Line 17) before you can push data.");
       return;
    }
    setIsSyncing(true);
    const stateToSync = overrideState || state;
    
    try {
      await fetch(CLOUD_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users: stateToSync.users,
          courses: stateToSync.courses,
          enrollments: stateToSync.enrollments,
          feedback: stateToSync.feedback
        })
      });
      setCloudError(null);
    } catch (err) {
      console.error("Cloud sync failed:", err);
      setCloudError("Sync Error: Cloud update failed.");
    } finally {
      setTimeout(() => setIsSyncing(false), 1200);
    }
  };

  const login = (email: string) => {
    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setState(prev => ({ ...prev, currentUser: user }));
      return true;
    }
    return false;
  };

  const register = (name: string, email: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role: UserRole.RESEARCHER,
      points: 0,
      joinedDate: new Date().toISOString()
    };
    const newState = {
      ...state,
      users: [...state.users, newUser],
      currentUser: newUser
    };
    setState(newState);
    syncToCloud(newState);
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

  const addCourse = (courseData: Omit<Course, 'id' | 'createdAt'>) => {
    const newCourse: Course = {
      ...courseData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    const newState = {
      ...state,
      courses: [newCourse, ...state.courses],
      users: state.users.map(u => u.id === state.currentUser?.id ? { ...u, points: u.points + 20 } : u),
      currentUser: state.currentUser ? { ...state.currentUser, points: state.currentUser.points + 20 } : null
    };
    setState(newState);
    syncToCloud(newState);
  };

  const removeCourse = (courseId: string) => {
    if (state.currentUser?.role !== UserRole.ADMIN) return;
    const newState = {
      ...state,
      courses: state.courses.filter(c => c.id !== courseId),
      enrollments: state.enrollments.filter(e => e.courseId !== courseId),
      feedback: state.feedback.filter(f => f.courseId !== courseId)
    };
    setState(newState);
    syncToCloud(newState);
  };

  const updateEnrollment = (courseId: string, status: CourseStatus) => {
    if (!state.currentUser) return;
    const existingIdx = state.enrollments.findIndex(e => e.courseId === courseId && e.userId === state.currentUser?.id);
    let newEnrollments = [...state.enrollments];
    let pointBump = 0;

    const alreadyCompleted = state.enrollments.some(e => e.courseId === courseId && e.userId === state.currentUser?.id && e.status === CourseStatus.FULLY_COMPLETED);
    if (status === CourseStatus.FULLY_COMPLETED && !alreadyCompleted) pointBump = 50;

    if (existingIdx > -1) {
      newEnrollments[existingIdx] = { ...newEnrollments[existingIdx], status, updatedAt: new Date().toISOString() };
    } else {
      newEnrollments.push({
        id: Math.random().toString(36).substr(2, 9),
        userId: state.currentUser!.id,
        courseId,
        status,
        updatedAt: new Date().toISOString()
      });
    }

    const updatedUsers = state.users.map(u => u.id === state.currentUser?.id ? { ...u, points: u.points + pointBump } : u);
    const updatedCurrentUser = state.currentUser ? { ...state.currentUser, points: state.currentUser.points + pointBump } : null;

    const newState = {
      ...state,
      enrollments: newEnrollments,
      users: updatedUsers,
      currentUser: updatedCurrentUser
    };
    setState(newState);
    syncToCloud(newState);
  };

  const addFeedback = (courseId: string, rating: number, comment: string) => {
    if (!state.currentUser) return;
    const newFeedback: Feedback = {
      id: Math.random().toString(36).substr(2, 9),
      userId: state.currentUser.id,
      courseId,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };
    const newState = {
      ...state,
      feedback: [...state.feedback, newFeedback],
      users: state.users.map(u => u.id === state.currentUser?.id ? { ...u, points: u.points + 5 } : u),
      currentUser: state.currentUser ? { ...state.currentUser, points: state.currentUser.points + 5 } : null
    };
    setState(newState);
    syncToCloud(newState);
  };

  const promoteUser = (userId: string) => {
    const adminCount = state.users.filter(u => u.role === UserRole.ADMIN).length;
    if (adminCount >= 10) return;
    const newState = {
      ...state,
      users: state.users.map(u => u.id === userId ? { ...u, role: UserRole.ADMIN } : u),
      currentUser: state.currentUser?.id === userId ? { ...state.currentUser, role: UserRole.ADMIN } : state.currentUser
    };
    setState(newState);
    syncToCloud(newState);
  };

  const demoteUser = (userId: string) => {
    const newState = {
      ...state,
      users: state.users.map(u => u.id === userId ? { ...u, role: UserRole.RESEARCHER } : u),
      currentUser: state.currentUser?.id === userId ? { ...state.currentUser, role: UserRole.RESEARCHER } : state.currentUser
    };
    setState(newState);
    syncToCloud(newState);
  };

  const contextValue: AppContextType = {
    ...state,
    isSyncing,
    cloudError,
    setCurrentUser: (user) => setState(prev => ({ ...prev, currentUser: user })),
    login,
    register,
    logout,
    addCourse,
    removeCourse,
    updateEnrollment,
    addFeedback,
    promoteUser,
    demoteUser,
    syncToCloud,
    fetchFromCloud,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <Router>
        <AppLayout />
      </Router>
    </AppContext.Provider>
  );
};

const AppLayout: React.FC = () => {
  const { currentUser, logout, isSyncing, cloudError, fetchFromCloud } = useApp();
  const location = useLocation();

  if (!currentUser && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="w-64 bg-slate-900 text-white flex flex-col relative z-20 shadow-2xl">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-black tracking-tight text-blue-400">CI L&D Hub</h1>
            {isSyncing ? (
              <i className="fas fa-sync animate-spin text-blue-400 text-xs"></i>
            ) : (
              <button 
                onClick={() => fetchFromCloud()} 
                title="Refresh from Google Sheets"
                className="text-slate-500 hover:text-blue-400 transition-colors"
              >
                <i className="fas fa-cloud-download-alt text-xs"></i>
              </button>
            )}
          </div>
          <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none">Researcher Platform</p>
          
          {cloudError && (
            <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded p-2">
              <p className="text-[8px] text-amber-400 font-bold uppercase leading-tight">{cloudError}</p>
            </div>
          )}
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link to="/" className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-all font-bold text-sm ${location.pathname === '/' ? 'bg-slate-800 text-blue-400 shadow-inner' : 'text-slate-400'}`}>
            <i className="fas fa-compass w-5 text-center"></i>
            <span>Browse Hub</span>
          </Link>
          <Link to="/my-learning" className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-all font-bold text-sm ${location.pathname === '/my-learning' ? 'bg-slate-800 text-blue-400 shadow-inner' : 'text-slate-400'}`}>
            <i className="fas fa-graduation-cap w-5 text-center"></i>
            <span>My Progress</span>
          </Link>
          <Link to="/leaderboard" className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-all font-bold text-sm ${location.pathname === '/leaderboard' ? 'bg-slate-800 text-blue-400 shadow-inner' : 'text-slate-400'}`}>
            <i className="fas fa-medal w-5 text-center"></i>
            <span>Rankings</span>
          </Link>
          
          <div className="pt-4 pb-2 px-3">
             <div className="h-px bg-slate-800 w-full" />
          </div>

          {currentUser?.role === UserRole.ADMIN && (
            <Link to="/admin" className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-all font-bold text-sm text-blue-400 ${location.pathname === '/admin' ? 'bg-slate-800' : ''}`}>
              <i className="fas fa-user-shield w-5 text-center"></i>
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-black shadow-lg text-white">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-black truncate text-slate-100">{currentUser?.name}</p>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{currentUser?.role}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center bg-slate-800/80 p-2 rounded-lg text-[9px] font-black border border-slate-700/50">
              <span className="text-slate-500 uppercase">My Points</span>
              <span className="text-blue-400">{currentUser?.points}</span>
            </div>
            <Button variant="ghost" size="sm" className="w-full text-[10px] text-slate-500 hover:text-white uppercase font-black tracking-widest" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/my-learning" element={<MyLearning />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route 
              path="/admin" 
              element={currentUser?.role === UserRole.ADMIN ? <AdminDashboard /> : <Navigate to="/" />} 
            />
            <Route path="/login" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;
