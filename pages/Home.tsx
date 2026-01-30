
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { Button } from '../components/ui/Button';
import { CATEGORIES } from '../constants';
import { Course, CourseStatus, UserRole } from '../types';
import { getAIRecommendations } from '../services/geminiService';

const Home: React.FC = () => {
  const { courses, enrollments, feedback, users, currentUser, addCourse, removeCourse, updateEnrollment } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'latest' | 'rating'>('latest');
  const [showAddModal, setShowAddModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  const filteredCourses = useMemo(() => {
    let result = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (sortBy === 'rating') {
      result = [...result].sort((a, b) => {
        const ratingA = feedback.filter(f => f.courseId === a.id).reduce((acc, f) => acc + f.rating, 0) / (feedback.filter(f => f.courseId === a.id).length || 1);
        const ratingB = feedback.filter(f => f.courseId === b.id).reduce((acc, f) => acc + f.rating, 0) / (feedback.filter(f => f.courseId === b.id).length || 1);
        return ratingB - ratingA;
      });
    } else {
      result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [courses, searchTerm, selectedCategory, sortBy, feedback]);

  const handleFetchAI = async () => {
    setAiLoading(true);
    const suggestions = await getAIRecommendations(['Generative AI', 'Agentic Workflows', 'Python'], courses);
    setAiSuggestions(suggestions);
    setAiLoading(false);
  };

  const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
    const userEnrollment = enrollments.find(e => e.courseId === course.id && e.userId === currentUser?.id);
    const courseFeedback = feedback.filter(f => f.courseId === course.id);
    const avgRating = courseFeedback.length > 0 
      ? (courseFeedback.reduce((acc, f) => acc + f.rating, 0) / courseFeedback.length).toFixed(1)
      : 'N/A';
    const recommender = users.find(u => u.id === course.recommendedBy)?.name || 'Unknown';

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md uppercase tracking-wide">
              {course.category}
            </span>
            <div className="flex items-center text-amber-500">
              <i className="fas fa-star mr-1"></i>
              <span className="text-sm font-bold text-slate-700">{avgRating}</span>
              <span className="text-xs text-slate-400 ml-1">({courseFeedback.length})</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">{course.title}</h3>
          <p className="text-slate-600 text-sm line-clamp-3 mb-4">{course.description}</p>
          
          <div className="flex items-center text-xs text-slate-400 mt-auto mb-6">
            <i className="fas fa-user-circle mr-1.5"></i>
            <span>Recommended by <span className="text-slate-600 font-medium">{recommender}</span></span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex flex-col">
               <span className="text-[10px] text-slate-400 uppercase font-bold mb-1">Status</span>
               <select 
                value={userEnrollment?.status || CourseStatus.NOT_STARTED}
                onChange={(e) => updateEnrollment(course.id, e.target.value as CourseStatus)}
                className="text-xs border-none bg-slate-100 rounded px-2 py-1 focus:ring-1 ring-blue-500"
               >
                 <option value={CourseStatus.NOT_STARTED}>Not Started</option>
                 <option value={CourseStatus.IN_PROGRESS}>In Progress</option>
                 <option value={CourseStatus.PARTIALLY_COMPLETED}>Partially</option>
                 <option value={CourseStatus.FULLY_COMPLETED}>Completed</option>
               </select>
            </div>
            <div className="flex gap-2">
              <a href={course.link} target="_blank" rel="noopener noreferrer">
                <Button size="sm">Go</Button>
              </a>
              {currentUser?.role === UserRole.ADMIN && (
                <Button variant="danger" size="sm" onClick={() => removeCourse(course.id)}>
                  <i className="fas fa-trash"></i>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Discover Learning</h2>
          <p className="text-slate-500">Tailored courses for advanced researchers.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleFetchAI} disabled={aiLoading}>
            <i className={`fas fa-magic mr-2 ${aiLoading ? 'animate-spin' : ''}`}></i>
            AI Recommendations
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <i className="fas fa-plus mr-2"></i>
            Post Course
          </Button>
        </div>
      </header>

      {/* AI Suggestions Row */}
      {aiSuggestions.length > 0 && (
        <div className="mb-12 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-blue-800 flex items-center">
              <i className="fas fa-sparkles mr-2"></i>
              AI Suggestion Hub
            </h3>
            <button className="text-blue-500 hover:text-blue-700 text-sm font-medium" onClick={() => setAiSuggestions([])}>Clear</button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {aiSuggestions.map((s, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col h-full">
                <h4 className="font-bold text-slate-800 mb-2">{s.title}</h4>
                <p className="text-xs text-slate-500 flex-1 mb-4">{s.description}</p>
                <Button size="sm" variant="secondary" onClick={() => {
                   addCourse({
                     title: s.title,
                     description: s.description,
                     link: '#',
                     type: 'Online',
                     category: s.category,
                     recommendedBy: currentUser?.id || '1',
                     tags: s.tags
                   });
                   setAiSuggestions(prev => prev.filter((_, idx) => idx !== i));
                }}>
                  Add to Hub
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters & Sorting */}
      <div className="mb-8 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            placeholder="Search by title or description..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <select 
            className="flex-1 lg:w-48 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select 
            className="flex-1 lg:w-48 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="latest">Newest First</option>
            <option value="rating">Top Rated (Rank)</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => <CourseCard key={course.id} course={course} />)
        ) : (
          <div className="col-span-full py-20 text-center text-slate-400">
            <i className="fas fa-inbox text-5xl mb-4 opacity-20"></i>
            <p className="text-lg">No courses found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Recommend a Course</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addCourse({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                link: formData.get('link') as string,
                type: formData.get('type') as any,
                category: formData.get('category') as string,
                recommendedBy: currentUser?.id || '1',
                tags: (formData.get('tags') as string).split(',').map(t => t.trim())
              });
              setShowAddModal(false);
            }}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Title</label>
                <input required name="title" type="text" className="w-full p-2 border rounded-lg" placeholder="e.g. Intro to Agents" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea required name="description" className="w-full p-2 border rounded-lg h-24" placeholder="What will they learn?" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select name="type" className="w-full p-2 border rounded-lg">
                    <option>Online</option>
                    <option>Offline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select name="category" className="w-full p-2 border rounded-lg">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL / Link</label>
                <input required name="link" type="url" className="w-full p-2 border rounded-lg" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
                <input name="tags" type="text" className="w-full p-2 border rounded-lg" placeholder="AI, Research, Productivity" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit">Publish to Hub</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
