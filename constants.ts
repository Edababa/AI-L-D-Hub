
import { User, UserRole, Course } from './types';

export const INITIAL_USERS: User[] = [
  { id: 'admin-1', name: 'Yang F.', email: 'yangf@a-star.edu.sg', role: UserRole.ADMIN, points: 500, joinedDate: '2023-01-01' },
  { id: '1', name: 'Alice Admin', email: 'alice@research.ci', role: UserRole.ADMIN, points: 150, joinedDate: '2023-01-01' },
  { id: '2', name: 'Bob Researcher', email: 'bob@research.ci', role: UserRole.RESEARCHER, points: 80, joinedDate: '2023-02-15' },
  { id: '3', name: 'Charlie Dave', email: 'charlie@research.ci', role: UserRole.RESEARCHER, points: 210, joinedDate: '2023-03-10' },
  { id: '4', name: 'test0', email: 'test0@a-star.edu.sg', role: UserRole.RESEARCHER, points: 100, joinedDate: '2023-03-10' },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Generative AI Fundamentals',
    description: 'Learn the basics of LLMs and Diffusion models for research workflows.',
    link: 'https://example.com/ai-basics',
    type: 'Online',
    category: 'AI Agents',
    recommendedBy: 'admin-1',
    createdAt: '2023-10-01',
    tags: ['AI', 'LLM', 'Intro']
  },
  {
    id: 'c2',
    title: 'Advanced Python for Researchers',
    description: 'Deep dive into data analysis and automation scripts.',
    link: 'https://example.com/python-adv',
    type: 'Online',
    category: 'Programming',
    recommendedBy: '2',
    createdAt: '2023-11-05',
    tags: ['Python', 'Data Science']
  }
];

export const CATEGORIES = ['AI Agents', 'Machine Learning', 'Programming', 'Data Analysis', 'Soft Skills', 'Methodology'];
