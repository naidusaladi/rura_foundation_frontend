import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import ModuleDetails from "./pages/ModuleDetails";
import ChapterDetails from "./pages/ChapterDetails";
import AddCourse from "./pages/AddCourse";
import AddModule from "./pages/AddModule";
import AddChapter from "./pages/AddChapter";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <Courses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:courseId"
              element={
                <ProtectedRoute>
                  <CourseDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:courseId/modules"
              element={
                <ProtectedRoute>
                  <ModuleDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:courseId/modules/:moduleId"
              element={
                <ProtectedRoute>
                  <ModuleDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:courseId/modules/:moduleId/chapters/:chapterId"
              element={
                <ProtectedRoute>
                  <ModuleDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-course"
              element={
                <ProtectedRoute>
                  <AddCourse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:courseId/add-module"
              element={
                <ProtectedRoute>
                  <AddModule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:courseId/modules/:moduleId/add-chapter"
              element={
                <ProtectedRoute>
                  <AddChapter />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
