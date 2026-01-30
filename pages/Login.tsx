
import React, { useState } from 'react';
import { useApp } from '../App';
import { Button } from '../components/ui/Button';

const Login: React.FC = () => {
  const { login, register, users } = useApp();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(email);
    if (!success) {
      setError('Researcher email not found. Please register if you are new.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError('This email is already registered.');
      return;
    }
    register(name, email);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 mb-6">
            <i className="fas fa-microscope text-3xl text-white"></i>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">CI L&D Hub</h1>
          <p className="text-slate-400 text-sm">Advanced Learning for Elite Researchers</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => { setMode('signin'); setError(''); }}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${mode === 'signin' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${mode === 'register' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Join Hub
            </button>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}

            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Corporate Email</label>
                  <div className="relative">
                    <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-blue-500 outline-none transition-all text-sm"
                      placeholder="e.g. researcher@ci.corp"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full py-4 rounded-xl shadow-lg shadow-blue-500/20">
                    Access Platform
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-[10px] text-slate-400 font-medium">
                    Secured via CI Corporate SSO Simulation
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                  <div className="relative">
                    <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                    <input 
                      type="text" 
                      required 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-blue-500 outline-none transition-all text-sm"
                      placeholder="John Researcher"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Corporate Email</label>
                  <div className="relative">
                    <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-blue-500 outline-none transition-all text-sm"
                      placeholder="e.g. researcher@ci.corp"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full py-4 rounded-xl shadow-lg shadow-blue-500/20">
                    Create Hub Account
                  </Button>
                </div>

                <p className="text-[10px] text-slate-400 text-center px-4">
                  By joining, you agree to share your learning progress with the department.
                </p>
              </form>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Quick start as admin: <button onClick={() => setEmail('yangf@a-star.edu.sg')} className="text-blue-400 hover:underline font-bold">Yang F.</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
