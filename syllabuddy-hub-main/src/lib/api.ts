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

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 (Unauthorized) response, clear the auth data
    if (error.response?.status === 401) {
      console.log('Authentication failed, clearing stored credentials');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  email: string;
  user_name: string;
  role: string;
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
  chapter_title: string;
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

export interface CreateCourseRequest {
  title: string;
  description: string;
  course_image_url?: string;
}

export interface CreateModuleRequest {
  module_title: string;
  module_description?: string;
  module_number: number;
}

export interface CreateChapterRequest {
  chapter_title: string;
  chapter_content: string;
  chapter_number?: number;
}

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

  createCourse: async (data: CreateCourseRequest) => {
    const response = await api.post<ApiResponse<Course>>('/courses/', data);
    return response.data;
  },

  deleteCourse: async (courseId: string) => {
    const response = await api.delete<ApiResponse<{ course_id: string }>>(`/courses/${courseId}`);
    return response.data;
  },

  createModule: async (courseId: string, data: CreateModuleRequest) => {
    const response = await api.post<ApiResponse<Module>>(`/courses/${courseId}/modules`, data);
    return response.data;
  },

  createChapter: async (courseId: string, moduleId: string, data: CreateChapterRequest) => {
    const response = await api.post<ApiResponse<Chapter>>(`/courses/${courseId}/modules/${moduleId}/chapters`, data);
    return response.data;
  },

  getNextChapterNumber: async (courseId: string, moduleId: string) => {
    const response = await api.get<ApiResponse<{ next_chapter_number: number }>>(`/courses/${courseId}/modules/${moduleId}/chapters/next-number`);
    return response.data;
  },

  deleteModule: async (courseId: string, moduleId: string) => {
    const response = await api.delete<ApiResponse<{ module_id: string }>>(`/courses/${courseId}/modules/${moduleId}`);
    return response.data;
  },

  updateChapter: async (courseId: string, moduleId: string, chapterId: string, data: CreateChapterRequest) => {
    const response = await api.put<ApiResponse<Chapter>>(`/courses/${courseId}/modules/${moduleId}/chapters/${chapterId}`, data);
    return response.data;
  },

  deleteChapter: async (courseId: string, moduleId: string, chapterId: string) => {
    const response = await api.delete<ApiResponse<{ chapter_id: string }>>(`/courses/${courseId}/modules/${moduleId}/chapters/${chapterId}`);
    return response.data;
  },
};
