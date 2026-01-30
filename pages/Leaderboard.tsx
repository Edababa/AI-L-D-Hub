
import React from 'react';
import { useApp } from '../App';

const Leaderboard: React.FC = () => {
  const { users, courses, enrollments } = useApp();

  const sortedByPoints = [...users].sort((a, b) => b.points - a.points);
  
  // Calculate Top Recommenders
  const recommenderCounts = users.map(u => ({
    ...u,
    recommendations: courses.filter(c => c.recommendedBy === u.id).length
  })).sort((a, b) => b.recommendations - a.recommendations);

  // Calculate Most Active (Enrollments)
  const activityCounts = users.map(u => ({
    ...u,
    completions: enrollments.filter(e => e.userId === u.id && e.status === 'FULLY_COMPLETED').length
  })).sort((a, b) => b.completions - a.completions);

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Department Leaderboard</h2>
        <p className="text-slate-500">Celebrating our top learners and contributors.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Top Learners (Points) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            <h3 className="text-lg font-bold flex items-center">
              <i className="fas fa-award mr-2"></i> Points Champions
            </h3>
            <p className="text-xs opacity-75 mt-1">Total points earned through activity.</p>
          </div>
          <div className="flex-1 p-4">
            {sortedByPoints.slice(0, 10).map((u, i) => (
              <div key={u.id} className="flex items-center p-3 mb-2 rounded-xl hover:bg-slate-50 transition-colors">
                <span className={`w-6 text-sm font-bold ${i < 3 ? 'text-blue-500' : 'text-slate-400'}`}>{i + 1}.</span>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 font-bold text-xs">
                  {u.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{u.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase">Researcher</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-blue-600">{u.points}</span>
                  <p className="text-[8px] text-slate-400 font-bold uppercase">Points</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Recommenders */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <h3 className="text-lg font-bold flex items-center">
              <i className="fas fa-bullhorn mr-2"></i> Knowledge Sharers
            </h3>
            <p className="text-xs opacity-75 mt-1">Most courses recommended to the hub.</p>
          </div>
          <div className="flex-1 p-4">
            {recommenderCounts.slice(0, 10).map((u, i) => (
              <div key={u.id} className="flex items-center p-3 mb-2 rounded-xl hover:bg-slate-50 transition-colors">
                <span className={`w-6 text-sm font-bold ${i < 3 ? 'text-amber-500' : 'text-slate-400'}`}>{i + 1}.</span>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 font-bold text-xs">
                  {u.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{u.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-amber-600">{u.recommendations}</span>
                  <p className="text-[8px] text-slate-400 font-bold uppercase">Posted</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completionists */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <h3 className="text-lg font-bold flex items-center">
              <i className="fas fa-check-double mr-2"></i> Completionists
            </h3>
            <p className="text-xs opacity-75 mt-1">Most courses fully completed.</p>
          </div>
          <div className="flex-1 p-4">
            {activityCounts.slice(0, 10).map((u, i) => (
              <div key={u.id} className="flex items-center p-3 mb-2 rounded-xl hover:bg-slate-50 transition-colors">
                <span className={`w-6 text-sm font-bold ${i < 3 ? 'text-emerald-500' : 'text-slate-400'}`}>{i + 1}.</span>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 font-bold text-xs">
                  {u.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{u.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-600">{u.completions}</span>
                  <p className="text-[8px] text-slate-400 font-bold uppercase">Done</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 p-8 bg-blue-50 rounded-3xl text-center border border-blue-100">
        <h4 className="text-2xl font-black text-blue-900 mb-2">Rewards Program</h4>
        <p className="text-blue-700 max-w-2xl mx-auto">
          Top 3 researchers in each category will be recognized during our monthly department sync. 
          Prizes include exclusive tech swag, conference passes, and professional certifications.
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
