
import React, { useState } from 'react';
import { useApp } from '../App';
import { UserRole } from '../types';
import { Button } from '../components/ui/Button';

const AdminDashboard: React.FC = () => {
  const { users, courses, enrollments, promoteUser, demoteUser, currentUser, syncToCloud, fetchFromCloud, isSyncing } = useApp();
  const [activeTab, setActiveTab] = useState<'users' | 'stats' | 'data'>('users');

  const stats = {
    totalUsers: users.length,
    totalCourses: courses.length,
    totalEnrollments: enrollments.length,
    totalCompletions: enrollments.filter(e => e.status === 'FULLY_COMPLETED').length,
    adminCount: users.filter(u => u.role === UserRole.ADMIN).length
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Admin Operations</h2>
          <p className="text-slate-500 font-medium">Manage the department hub and researcher permissions.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => fetchFromCloud()} disabled={isSyncing} className="shadow-sm">
            <i className={`fas fa-sync mr-2 ${isSyncing ? 'animate-spin' : ''}`}></i>
            Refresh Cloud
          </Button>
          <Button variant="primary" onClick={() => syncToCloud()} disabled={isSyncing} className="shadow-lg shadow-blue-500/20">
            <i className="fas fa-cloud-upload-alt mr-2"></i>
            Push Master Data
          </Button>
        </div>
      </header>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {[
          { label: 'Researchers', val: stats.totalUsers },
          { label: 'Courses', val: stats.totalCourses },
          { label: 'Admins', val: `${stats.adminCount}/10` },
          { label: 'Active Enrolls', val: stats.totalEnrollments },
          { label: 'Completions', val: stats.totalCompletions }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">{item.label}</p>
            <p className="text-2xl font-black text-slate-800">{item.val}</p>
          </div>
        ))}
      </div>

      {/* Sub-navigation */}
      <div className="flex space-x-2 mb-8 bg-slate-200/50 p-1.5 rounded-2xl w-fit border border-slate-200">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === 'users' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Researchers
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === 'stats' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Insights
        </button>
        <button 
          onClick={() => setActiveTab('data')}
          className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all flex items-center uppercase tracking-widest ${activeTab === 'data' ? 'bg-emerald-600 shadow-lg text-white' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <i className="fas fa-database mr-2"></i>
          Cloud Setup
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Researcher</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Level</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{user.name}</span>
                        <span className="text-[10px] text-slate-400">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {user.id !== currentUser?.id ? (
                      user.role === UserRole.ADMIN ? (
                        <Button size="sm" variant="ghost" className="text-red-500 font-bold" onClick={() => demoteUser(user.id)}>Revoke Admin</Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="text-blue-500 font-bold" onClick={() => promoteUser(user.id)} disabled={stats.adminCount >= 10}>Grant Admin</Button>
                      )
                    ) : (
                      <span className="text-[10px] text-slate-300 italic">Self</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'data' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <h4 className="text-xl font-black text-slate-800 mb-6">Cloud Sync Setup</h4>
            <div className="space-y-4 text-sm text-slate-600 font-medium">
              <p>1. Paste your Web App URL into <code className="bg-slate-100 px-1 rounded">App.tsx</code> (Line 17).</p>
              <p>2. Click <span className="text-blue-600 font-bold uppercase">Push Master Data</span> at the top right to initialize the Spreadsheet.</p>
              <p>3. The app will now automatically save all changes to your Google Sheet.</p>
            </div>
          </div>
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200">
            <h4 className="text-xl font-black mb-6 text-emerald-400">Data Governance</h4>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">Your data is stored securely in your private Google Sheet. You can download the current state as Excel anytime from the Sheet interface.</p>
            <div className="space-y-3">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="font-bold text-emerald-400 text-[10px] mb-1 uppercase tracking-widest">Excel Export</p>
                <p className="text-[11px] text-slate-300">Google Sheet > File > Download > .xlsx</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="font-bold text-emerald-400 text-[10px] mb-1 uppercase tracking-widest">Management</p>
                <p className="text-[11px] text-slate-300">Use the Sheet tabs to generate your own department statistics.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-lg font-black mb-6 uppercase tracking-widest text-slate-800">L&D Performance</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-bold border-b border-slate-100 pb-3">
                <span className="text-slate-500">Participation Rate</span>
                <span className="text-slate-900">{((stats.totalEnrollments / (stats.totalUsers || 1)) * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold border-b border-slate-100 pb-3">
                <span className="text-slate-500">Avg Courses/Researcher</span>
                <span className="text-slate-900">{(stats.totalEnrollments / (stats.totalUsers || 1)).toFixed(1)}</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-slate-200">
               <div className="text-5xl font-black text-blue-600 mb-1">{stats.totalCompletions}</div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed Certs</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
