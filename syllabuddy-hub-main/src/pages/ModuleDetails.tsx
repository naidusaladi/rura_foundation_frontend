import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { coursesApi, ModuleWithChapters, Chapter } from '@/lib/api';
import { ArrowLeft, FileText, Clock, ChevronRight, Check, Lock } from 'lucide-react';
import Layout from '@/components/layout/Layout';

const ModuleDetails = () => {
  const { courseId, moduleId, chapterId } = useParams<{ courseId: string; moduleId?: string; chapterId?: string }>();
  const navigate = useNavigate();
  const [modules, setModules] = useState<ModuleWithChapters[]>([]);
  const [selectedModule, setSelectedModule] = useState<ModuleWithChapters | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [completedChapters, setCompletedChapters] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchModules = async () => {
      if (!courseId) return;

      try {
        const response = await coursesApi.getCourseModules(courseId);
        if (response.status === 'success') {
          setModules(response.body);

          // If moduleId is provided, find and set the selected module
          if (moduleId) {
            const module = response.body.find(m => m.module_id === moduleId);
            if (module) {
              setSelectedModule(module);
              
              // Set current chapter
              if (chapterId) {
                const chapter = module.chapters?.find(c => c.chapter_id === chapterId);
                setCurrentChapter(chapter || module.chapters?.[0] || null);
              } else if (module.chapters && module.chapters.length > 0) {
                setCurrentChapter(module.chapters[0]);
                // Navigate to first chapter if no chapter is specified
                navigate(`/courses/${courseId}/modules/${moduleId}/chapters/${module.chapters[0].chapter_id}`, { replace: true });
              }
            } else {
              setError('Module not found');
            }
          }
        } else {
          setError(response.message || 'Failed to load module details');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchModules();
  }, [courseId, moduleId, chapterId, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleChapterClick = (chapter: Chapter) => {
    setCurrentChapter(chapter);
    navigate(`/courses/${courseId}/modules/${moduleId}/chapters/${chapter.chapter_id}`);
  };

  const handleMarkComplete = () => {
    if (currentChapter) {
      setCompletedChapters(prev => new Set([...prev, currentChapter.chapter_id]));
    }
  };

  const handleNextChapter = () => {
    if (selectedModule && currentChapter) {
      const currentIndex = selectedModule.chapters?.findIndex(c => c.chapter_id === currentChapter.chapter_id) || 0;
      const nextChapter = selectedModule.chapters?.[currentIndex + 1];
      if (nextChapter) {
        handleChapterClick(nextChapter);
      }
    }
  };

  const isChapterCompleted = (chapterId: string) => completedChapters.has(chapterId);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-4 w-96 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-6" />
            </div>
            <div>
              <Skeleton className="h-6 w-32 mb-4" />
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full mb-3" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !modules) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error || 'Modules not found'}</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-screen flex">
        {/* Left Sidebar - Module Navigation */}
        {moduleId && selectedModule && (
          <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
            {/* Module Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Lock className="w-4 h-4" />
                <span>Module {selectedModule.module_number || 1}: {selectedModule.module_title}</span>
              </div>
              <h2 className="font-semibold text-gray-900">{selectedModule.module_title}</h2>
            </div>

            {/* Chapter List */}
            <div className="flex-1 overflow-y-auto">
              {selectedModule.chapters && selectedModule.chapters.length > 0 ? (
                selectedModule.chapters.map((chapter, index) => (
                  <div
                    key={chapter.chapter_id}
                    onClick={() => handleChapterClick(chapter)}
                    className={`flex items-center gap-3 p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${
                      currentChapter?.chapter_id === chapter.chapter_id ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isChapterCompleted(chapter.chapter_id) ? (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {chapter.chapter_number}. Chapter {chapter.chapter_number}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-sm text-gray-500">No chapters available</div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {moduleId && selectedModule && currentChapter ? (
            <>
              {/* Content Header */}
              <div className="p-6 border-b border-gray-200">
                <Breadcrumb className="mb-4">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to="/courses">Courses</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to={`/courses/${courseId}/modules`}>Modules</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{selectedModule.module_title}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
                <h1 className="text-3xl font-bold text-gray-900">{selectedModule.module_title}</h1>
              </div>

              {/* Chapter Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Chapter {currentChapter.chapter_number}
                  </h2>
                  
                  <div className="prose prose-lg max-w-none">
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {currentChapter.chapter_content}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                    <Button
                      onClick={handleMarkComplete}
                      disabled={isChapterCompleted(currentChapter.chapter_id)}
                      className="bg-gray-800 hover:bg-gray-900 text-white"
                    >
                      {isChapterCompleted(currentChapter.chapter_id) ? 'Completed' : 'Mark as Complete'}
                    </Button>

                    {selectedModule.chapters && 
                     selectedModule.chapters.findIndex(c => c.chapter_id === currentChapter.chapter_id) < 
                     selectedModule.chapters.length - 1 && (
                      <Button
                        onClick={handleNextChapter}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        Next Chapter
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Module List View */
            <div className="container mx-auto px-4 py-8">
              <Breadcrumb className="mb-6">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/courses">Courses</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Modules</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <h1 className="text-3xl font-bold text-foreground mb-4">Course Modules</h1>
              {modules.length === 0 ? (
                <p className="text-muted-foreground">No modules available for this course.</p>
              ) : (
                <div className="grid gap-4">
                  {modules.map((module) => (
                    <Link
                      key={module.module_id}
                      to={`/courses/${courseId}/modules/${module.module_id}`}
                      className="block"
                    >
                      <Card className="hover:shadow-soft transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                        <CardHeader>
                          <CardTitle className="text-lg">{module.module_title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{module.module_description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ModuleDetails;
