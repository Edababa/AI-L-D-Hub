
import React, { useState } from 'react';
import { useApp } from '../App';
import { UserRole } from '../types';
import { Button } from '../components/ui/Button';

const AdminDashboard: React.FC = () => {
  const { users, courses, enrollments, promoteUser, demoteUser, exportData, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'users' | 'stats'>('users');

  const stats = {
    totalUsers: users.length,
    totalCourses: courses.length,
    totalEnrollments: enrollments.length,
    totalCompletions: enrollments.filter(e => e.status === 'FULLY_COMPLETED').length,
    adminCount: users.filter(u => u.role === UserRole.ADMIN).length
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Control Panel</h2>
          <p className="text-slate-500">Manage researchers, roles, and platform health.</p>
        </div>
        <Button variant="secondary" onClick={exportData}>
          <i className="fas fa-file-export mr-2"></i>
          Export to JSON (Sheet-Ready)
        </Button>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-400 uppercase font-bold">Researchers</p>
          <p className="text-xl font-black">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-400 uppercase font-bold">Courses</p>
          <p className="text-xl font-black">{stats.totalCourses}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-400 uppercase font-bold">Admins</p>
          <p className="text-xl font-black">{stats.adminCount}/10</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-400 uppercase font-bold">Enrollments</p>
          <p className="text-xl font-black">{stats.totalEnrollments}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-400 uppercase font-bold">Success Rate</p>
          <p className="text-xl font-black">{(stats.totalCompletions / (stats.totalEnrollments || 1) * 100).toFixed(0)}%</p>
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-sm font-bold rounded-lg ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-200'}`}
        >
          Researcher Management
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 text-sm font-bold rounded-lg ${activeTab === 'stats' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-200'}`}
        >
          Detailed Statistics
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Researcher</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Email</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Role</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Points</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                       <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">
                         {user.name.charAt(0)}
                       </div>
                       <span className="font-bold text-slate-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                      user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">{user.points}</td>
                  <td className="px-6 py-4 text-right">
                    {user.id !== currentUser?.id ? (
                      user.role === UserRole.ADMIN ? (
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => demoteUser(user.id)}>
                          Demote
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="text-blue-500 hover:text-blue-700" onClick={() => promoteUser(user.id)} disabled={stats.adminCount >= 10}>
                          Promote
                        </Button>
                      )
                    ) : (
                      <span className="text-xs text-slate-300 italic">Self (Admin)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <h4 className="font-bold mb-4">Course Popularity</h4>
             <div className="space-y-4">
                {courses.map(c => {
                  const enrolls = enrollments.filter(e => e.courseId === c.id).length;
                  const percent = (enrolls / (enrollments.length || 1) * 100);
                  return (
                    <div key={c.id}>
                       <div className="flex justify-between text-xs mb-1">
                         <span className="font-medium truncate max-w-[70%]">{c.title}</span>
                         <span className="text-slate-400">{enrolls} Enrolled</span>
                       </div>
                       <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                         <div className="bg-blue-500 h-full" style={{ width: `${percent}%` }} />
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <h4 className="font-bold mb-4">Engagement Trends</h4>
             <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <i className="fas fa-chart-line text-4xl mb-2 opacity-20"></i>
                <p className="text-sm">Dynamic charting would load here in production.</p>
                <Button size="sm" variant="secondary" className="mt-4" onClick={() => alert("Detailed logs being generated for download...")}>
                  Download Audit Log
                </Button>
             </div>
          </div>
        </div>
      )}

      <div className="mt-12 p-6 bg-slate-900 text-white rounded-3xl">
        <div className="flex items-center space-x-4">
          <div className="bg-white/10 p-3 rounded-2xl">
            <i className="fas fa-info-circle text-2xl"></i>
          </div>
          <div>
            <h4 className="font-bold">Pro-Tip for Admins</h4>
            <p className="text-sm text-slate-400">
              You can export this data anytime and paste it directly into Google Sheets or MS Teams. 
              The JSON format is optimized for easy parsing into columns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
