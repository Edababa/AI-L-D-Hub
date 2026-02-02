
import React, { useState } from 'react';
import { useApp } from '../App';
import { CourseStatus } from '../types';
import { Button } from '../components/ui/Button';

const MyLearning: React.FC = () => {
  const { enrollments, courses, currentUser, updateEnrollment, addFeedback, feedback } = useApp();
  const [feedbackCourseId, setFeedbackCourseId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const myEnrollments = enrollments.filter(e => e.userId === currentUser?.id);
  const history = [...myEnrollments].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const inProgress = myEnrollments.filter(e => e.status === CourseStatus.IN_PROGRESS || e.status === CourseStatus.PARTIALLY_COMPLETED);
  const completed = myEnrollments.filter(e => e.status === CourseStatus.FULLY_COMPLETED);

  const stats = [
    { label: 'Courses Started', value: myEnrollments.length, icon: 'fa-play' },
    { label: 'Completed', value: completed.length, icon: 'fa-check-circle' },
    { label: 'Total Points', value: currentUser?.points || 0, icon: 'fa-star' }
  ];

  const handleFeedbackSubmit = () => {
    if (feedbackCourseId) {
      addFeedback(feedbackCourseId, rating, comment);
      setFeedbackCourseId(null);
      setComment('');
      setRating(5);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Learning Hub</h2>
        <p className="text-slate-500">Track your progress and build your AI expertise.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
              <i className={`fas ${s.icon}`}></i>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{s.label}</p>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Active Courses */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <i className="fas fa-tasks mr-2 text-blue-500"></i>
              Currently Learning
            </h3>
            {inProgress.length > 0 ? (
              <div className="space-y-4">
                {inProgress.map(e => {
                  const course = courses.find(c => c.id === e.courseId);
                  if (!course) return null;
                  return (
                    <div key={e.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-800">{course.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">Status: <span className="text-blue-500 font-bold uppercase">{e.status}</span></p>
                      </div>
                      <div className="flex space-x-2">
                         <Button size="sm" variant="secondary" onClick={() => updateEnrollment(course.id, CourseStatus.FULLY_COMPLETED)}>
                           <i className="fas fa-check mr-2"></i> Mark Done
                         </Button>
                         <a href={course.link} target="_blank" rel="noopener noreferrer">
                           <Button size="sm" variant="ghost">Continue</Button>
                         </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-100/50 border border-dashed border-slate-300 rounded-xl py-10 text-center text-slate-400">
                You're not currently taking any courses.
              </div>
            )}
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <i className="fas fa-history mr-2 text-slate-500"></i>
              Learning History
            </h3>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-600">Course</th>
                    <th className="px-4 py-3 font-bold text-slate-600">Status</th>
                    <th className="px-4 py-3 font-bold text-slate-600">Last Activity</th>
                    <th className="px-4 py-3 font-bold text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(e => {
                    const course = courses.find(c => c.id === e.courseId);
                    if (!course) return null;
                    const hasFeedback = feedback.some(f => f.userId === currentUser?.id && f.courseId === e.courseId);
                    return (
                      <tr key={e.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-4 py-3 font-medium">{course.title}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            e.status === CourseStatus.FULLY_COMPLETED ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {e.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{new Date(e.updatedAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                           {e.status === CourseStatus.FULLY_COMPLETED && !hasFeedback ? (
                             <Button size="sm" variant="ghost" onClick={() => setFeedbackCourseId(course.id)}>
                               Rate & Review
                             </Button>
                           ) : (
                             <span className="text-slate-300 italic">No actions</span>
                           )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar / Reminders */}
        <div className="space-y-8">
           <div className="bg-indigo-600 text-white rounded-2xl p-6 shadow-lg shadow-indigo-100">
              <h4 className="text-lg font-bold mb-2 flex items-center">
                <i className="fas fa-bell mr-2"></i> Reminders (coming soon..)
              </h4>
              <p className="text-indigo-100 text-sm mb-4">Don't forget to complete your goals this month!</p>
              <div className="bg-white/10 rounded-xl p-3 mb-3 border border-white/10">
                <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Upcoming</p>
                <p className="text-sm">Research Sync: Advanced LLM Architectures</p>
                <p className="text-[10px] mt-1 text-indigo-200 italic">Friday, 10:00 AM @ Teams</p>
              </div>
              <Button variant="secondary" className="w-full bg-white text-indigo-600 hover:bg-slate-100" size="sm">
                Set New Reminder
              </Button>
           </div>

           <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4">My Stats Breakdown</h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500">Course Completion Rate</span>
                   <span className="font-bold">{(completed.length / (myEnrollments.length || 1) * 100).toFixed(0)}%</span>
                 </div>
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                   <div 
                    className="bg-blue-500 h-full" 
                    style={{ width: `${(completed.length / (myEnrollments.length || 1) * 100)}%` }}
                   />
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500">Points to next level</span>
                   <span className="font-bold">{250 - (currentUser?.points || 0)}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {feedbackCourseId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Course Feedback</h3>
            <p className="text-sm text-slate-500 mb-6">Your feedback helps fellow researchers find the best content.</p>
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Rating (1-5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(v => (
                  <button 
                    key={v} 
                    onClick={() => setRating(v)}
                    className={`w-10 h-10 rounded-full border-2 font-bold ${rating >= v ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 text-slate-400'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Comment</label>
              <textarea 
                className="w-full border rounded-xl p-3 h-24 text-sm" 
                placeholder="What was most useful?"
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setFeedbackCourseId(null)}>Cancel</Button>
              <Button onClick={handleFeedbackSubmit}>Submit Feedback</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLearning;
