import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8000';



// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Types
export interface User {
  email: string;
  user_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  user_name: string;
  email: string;
  password: string;
  college: string;
  role: string;
}

export interface Course {
  course_id: string;
  title: string;
  description: string;
  course_image_url: string;
  created_at: string;
  updated_at: string;
}

export interface Module {
  module_id: string;
  course_id: string;
  module_title: string;
  module_description: string;
  module_number: number;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  chapter_id: string;
  module_id: string;
  course_id: string;
  chapter_content: string;
  chapter_number: number;
  created_at: string;
  updated_at: string;
}

export interface CourseWithModules extends Course {
  modules: Module[];
}

export interface ModuleWithChapters extends Module {
  chapters: Chapter[];
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  body: T;
}

// API functions
export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await api.post<ApiResponse<{ access_token: string; token_type: string }>>('/login', data);
    return response.data;
  },
  
  register: async (data: RegisterRequest) => {
    const response = await api.post<ApiResponse<User>>('/register', data);
    return response.data;
  },
  getUserByEmail: async (email: string) => {
    const encodedEmail = encodeURIComponent(email);
        const response = await api.get<ApiResponse<User>>(`/${encodedEmail}`);
    return response.data;
  },
};

export const coursesApi = {
  getCourses: async () => {
    const response = await api.get<ApiResponse<Course[]>>('/courses/');
    return response.data;
  },
  
  getCourse: async (courseId: string) => {
    const response = await api.get<ApiResponse<CourseWithModules>>(`/courses/${courseId}`);
    return response.data;
  },
  
  getModule: async (courseId: string, moduleId: string) => {
    const response = await api.get<ApiResponse<ModuleWithChapters>>(`/courses/${courseId}/modules/${moduleId}`);
    return response.data;
  },
  
  getChapter: async (courseId: string, moduleId: string, chapterId: string) => {
    const response = await api.get<ApiResponse<Chapter>>(`/courses/${courseId}/modules/${moduleId}/chapters/${chapterId}`);
    return response.data;
  },

  getCourseModules: async (courseId: string) => {
    const response = await api.get<ApiResponse<ModuleWithChapters[]>>(`/courses/${courseId}/modules`);
    return response.data;
  },
   getModuleChapters: async (courseId: string, moduleId: string) => {
    const response = await api.get<ApiResponse<Chapter[]>>(`/courses/${courseId}/modules/${moduleId}/chapters`);
    return response.data;
  },
};
