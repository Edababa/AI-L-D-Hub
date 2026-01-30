
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

// --- Context Setup ---
interface AppContextType extends AppState {
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
  exportData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// --- Protected Route Wrapper ---
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// --- Main App Component ---
const App: React.FC = () => {
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
    localStorage.setItem('ci_ld_hub_data', JSON.stringify(state));
  }, [state]);

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
    setState(prev => ({
      ...prev,
      users: [...prev.users, newUser],
      currentUser: newUser
    }));
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
    setState(prev => ({
      ...prev,
      courses: [...prev.courses, newCourse],
      users: prev.users.map(u => u.id === prev.currentUser?.id ? { ...u, points: u.points + 20 } : u),
      currentUser: prev.currentUser?.id === prev.currentUser?.id ? { ...prev.currentUser!, points: prev.currentUser!.points + 20 } : prev.currentUser
    }));
  };

  const removeCourse = (courseId: string) => {
    if (state.currentUser?.role !== UserRole.ADMIN) return;
    setState(prev => ({
      ...prev,
      courses: prev.courses.filter(c => c.id !== courseId),
      enrollments: prev.enrollments.filter(e => e.courseId !== courseId),
      feedback: prev.feedback.filter(f => f.courseId !== courseId)
    }));
  };

  const updateEnrollment = (courseId: string, status: CourseStatus) => {
    if (!state.currentUser) return;
    setState(prev => {
      const existingIdx = prev.enrollments.findIndex(e => e.courseId === courseId && e.userId === prev.currentUser?.id);
      let newEnrollments = [...prev.enrollments];
      let pointBump = 0;

      if (status === CourseStatus.FULLY_COMPLETED) pointBump = 50;

      if (existingIdx > -1) {
        newEnrollments[existingIdx] = { ...newEnrollments[existingIdx], status, updatedAt: new Date().toISOString() };
      } else {
        newEnrollments.push({
          id: Math.random().toString(36).substr(2, 9),
          userId: prev.currentUser.id,
          courseId,
          status,
          updatedAt: new Date().toISOString()
        });
      }

      const updatedUsers = prev.users.map(u => u.id === prev.currentUser?.id ? { ...u, points: u.points + pointBump } : u);
      const updatedCurrentUser = prev.currentUser ? { ...prev.currentUser, points: prev.currentUser.points + pointBump } : null;

      return {
        ...prev,
        enrollments: newEnrollments,
        users: updatedUsers,
        currentUser: updatedCurrentUser
      };
    });
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
    setState(prev => ({
      ...prev,
      feedback: [...prev.feedback, newFeedback],
      users: prev.users.map(u => u.id === prev.currentUser?.id ? { ...u, points: u.points + 5 } : u),
      currentUser: prev.currentUser ? { ...prev.currentUser, points: prev.currentUser.points + 5 } : null
    }));
  };

  const promoteUser = (userId: string) => {
    const adminCount = state.users.filter(u => u.role === UserRole.ADMIN).length;
    if (adminCount >= 10) {
      alert("Maximum of 10 admins allowed.");
      return;
    }
    setState(prev => {
      const updatedUsers = prev.users.map(u => u.id === userId ? { ...u, role: UserRole.ADMIN } : u);
      const updatedCurrentUser = prev.currentUser?.id === userId ? { ...prev.currentUser, role: UserRole.ADMIN } : prev.currentUser;
      return { ...prev, users: updatedUsers, currentUser: updatedCurrentUser };
    });
  };

  const demoteUser = (userId: string) => {
    setState(prev => {
      const updatedUsers = prev.users.map(u => u.id === userId ? { ...u, role: UserRole.RESEARCHER } : u);
      const updatedCurrentUser = prev.currentUser?.id === userId ? { ...prev.currentUser, role: UserRole.RESEARCHER } : prev.currentUser;
      return { ...prev, users: updatedUsers, currentUser: updatedCurrentUser };
    });
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "ci_ld_hub_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const contextValue: AppContextType = {
    ...state,
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
    exportData,
  };

  return (
    // FIX: Changed 'context' prop to 'value' as required by React Context Provider
    <AppContext.Provider value={contextValue}>
      <Router>
        <AppLayout />
      </Router>
    </AppContext.Provider>
  );
};

const AppLayout: React.FC = () => {
  const { currentUser, logout, users, setCurrentUser } = useApp();
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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold tracking-tight text-blue-400">CI L&D Hub</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Researcher Central</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-colors ${location.pathname === '/' ? 'bg-slate-800 text-blue-400' : ''}`}>
            <i className="fas fa-home w-5"></i>
            <span>Courses</span>
          </Link>
          <Link to="/my-learning" className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-colors ${location.pathname === '/my-learning' ? 'bg-slate-800 text-blue-400' : ''}`}>
            <i className="fas fa-book-open w-5"></i>
            <span>My Learning</span>
          </Link>
          <Link to="/leaderboard" className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-colors ${location.pathname === '/leaderboard' ? 'bg-slate-800 text-blue-400' : ''}`}>
            <i className="fas fa-trophy w-5"></i>
            <span>Leaderboard</span>
          </Link>
          {currentUser?.role === UserRole.ADMIN && (
            <Link to="/admin" className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-blue-400 ${location.pathname === '/admin' ? 'bg-slate-800' : ''}`}>
              <i className="fas fa-user-shield w-5"></i>
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{currentUser?.role}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded text-[10px] font-bold">
              <span className="text-slate-400">MY SCORE</span>
              <span className="text-blue-400">{currentUser?.points} PTS</span>
            </div>
            <Button variant="ghost" size="sm" className="w-full text-xs text-slate-400 hover:text-white" onClick={logout}>
              <i className="fas fa-sign-out-alt mr-2"></i> Log Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
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
      </main>
    </div>
  );
};

export default App;
