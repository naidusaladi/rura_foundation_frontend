import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { coursesApi, ModuleWithChapters, Chapter } from '@/lib/api';
import { ArrowLeft, FileText, Clock, ChevronRight, Check, Lock, Plus, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';

const ModuleDetails = () => {
  const { courseId, moduleId, chapterId } = useParams<{ courseId: string; moduleId?: string; chapterId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [modules, setModules] = useState<ModuleWithChapters[]>([]);
  const [selectedModule, setSelectedModule] = useState<ModuleWithChapters | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [completedChapters, setCompletedChapters] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingChapterId, setDeletingChapterId] = useState<string | null>(null);
  const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
      if (!courseId) return;

      setIsLoading(true);
      try {
        const response = await coursesApi.getCourseModules(courseId);
        console.log('Modules response:', response);
        if (response.status === 'success') {
          setModules(response.body || []);

          // If moduleId is provided, find and set the selected module
          if (moduleId) {
            const module = response.body.find(m => m.module_id === moduleId);
            if (module) {

              setSelectedModule(module);

              // Set current chapter
              if (chapterId) {
                const chapter = module.chapters?.find(c => c.chapter_id === chapterId);
                if (chapter) {
                  // Fetch the full chapter content
                  try {
                    const chapterResponse = await coursesApi.getChapter(courseId, moduleId, chapterId);
                    if (chapterResponse.status === 'success') {
                      setCurrentChapter(chapterResponse.body);
                    } else {
                      setCurrentChapter(chapter);
                    }
                  } catch (err) {
                    console.error('Error fetching chapter content:', err);
                    setCurrentChapter(chapter);
                  }
                } else if (module.chapters && module.chapters.length > 0) {
                  setCurrentChapter(module.chapters[0]);
                  navigate(`/courses/${courseId}/modules/${moduleId}/chapters/${module.chapters[0].chapter_id}`, { replace: true });
                }
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
          console.log('Failed response:', response);
          setError(response.message || 'Failed to load module details');
        }
      } catch (err: any) {
        console.error('Error fetching modules:', err);
        console.error('Error response:', err.response?.data);
        // Don't set error for 404 when no modules exist, just set empty array
        if (err.response?.status === 404) {
          setModules([]);
        } else {
          setError(err.response?.data?.message || 'Network error. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchModules();
  }, [courseId, moduleId, chapterId, navigate]);

  // Separate effect to handle chapter changes when URL changes
  useEffect(() => {
    if (selectedModule && chapterId) {
      const chapter = selectedModule.chapters?.find(c => c.chapter_id === chapterId);
      if (chapter && chapter.chapter_id !== currentChapter?.chapter_id) {
        // Fetch the full chapter content when URL changes
        const fetchChapterContent = async () => {
          try {
            const response = await coursesApi.getChapter(courseId!, moduleId!, chapterId);
            if (response.status === 'success') {
              setCurrentChapter(response.body);
            } else {
              setCurrentChapter(chapter);
            }
          } catch (err) {
            console.error('Error fetching chapter content:', err);
            setCurrentChapter(chapter);
          }
        };
        fetchChapterContent();
      }
    }
  }, [chapterId, selectedModule, currentChapter?.chapter_id, courseId, moduleId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleChapterClick = async (chapter: Chapter) => {
    try {
      // Always fetch the full chapter content from the API to ensure we have the latest data
      const response = await coursesApi.getChapter(courseId!, moduleId!, chapter.chapter_id);
      if (response.status === 'success') {
        const fullChapter = response.body;
        setCurrentChapter(fullChapter);

        // Update the chapter in the selectedModule as well
        if (selectedModule) {
          const updatedChapters = selectedModule.chapters?.map(c =>
            c.chapter_id === chapter.chapter_id ? fullChapter : c
          ) || [];
          setSelectedModule({ ...selectedModule, chapters: updatedChapters });
        }
      }
    } catch (err) {
      console.error('Error fetching chapter:', err);
      setCurrentChapter(chapter); // Fallback to the original chapter
    }

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

  const handleDeleteChapter = async (chapterId: string, chapterTitle: string) => {
    if (!courseId || !moduleId) return;

    if (!confirm(`Are you sure you want to delete "${chapterTitle}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingChapterId(chapterId);
    try {
      const response = await coursesApi.deleteChapter(courseId, moduleId, chapterId);
      if (response.status === 'success') {
        // Remove the deleted chapter from the state
        if (selectedModule) {
          const updatedChapters = selectedModule.chapters?.filter(chapter => chapter.chapter_id !== chapterId) || [];
          setSelectedModule({ ...selectedModule, chapters: updatedChapters });

          // If we deleted the current chapter, navigate to first available chapter or show empty state
          if (currentChapter?.chapter_id === chapterId) {
            if (updatedChapters.length > 0) {
              setCurrentChapter(updatedChapters[0]);
              navigate(`/courses/${courseId}/modules/${moduleId}/chapters/${updatedChapters[0].chapter_id}`, { replace: true });
            } else {
              setCurrentChapter(null);
              navigate(`/courses/${courseId}/modules/${moduleId}`, { replace: true });
            }
          }
        }
      } else {
        setError(response.message || 'Failed to delete chapter');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setDeletingChapterId(null);
    }
  };

  const handleDeleteModule = async (moduleTitle: string) => {
    if (!courseId || !moduleId) return;

    if (!confirm(`Are you sure you want to delete the module "${moduleTitle}"? This will also delete all chapters in this module. This action cannot be undone.`)) {
      return;
    }

    setDeletingModuleId(moduleId);
    try {
      const response = await coursesApi.deleteModule(courseId, moduleId);
      if (response.status === 'success') {
        // Navigate back to course modules page
        navigate(`/courses/${courseId}/modules`);
      } else {
        setError(response.message || 'Failed to delete module');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setDeletingModuleId(null);
    }
  };

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
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">{selectedModule.module_title}</h2>
                {user?.role === 'admin' && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteModule(selectedModule.module_title)}
                      disabled={deletingModuleId === moduleId}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1"
                    >
                      {deletingModuleId === moduleId ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                    <Link to={`/courses/${courseId}/modules/${moduleId}/add-chapter`}>
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <Plus className="h-3 w-3" />
                        Add Chapter
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Chapter List */}
            <div className="flex-1 overflow-y-auto">
              {selectedModule.chapters && selectedModule.chapters.length > 0 ? (
                selectedModule.chapters.map((chapter, index) => {

                  return (
                    <div
                      key={chapter.chapter_id}
                      className={`group flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-blue-50 transition-colors ${currentChapter?.chapter_id === chapter.chapter_id ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
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
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => handleChapterClick(chapter)}
                      >
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {chapter.chapter_title
                            ? `${chapter.chapter_number}. ${chapter.chapter_title}`
                            : `Chapter ${chapter.chapter_number}`
                          }
                        </p>
                      </div>
                      {user?.role === 'admin' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChapter(chapter.chapter_id, chapter.chapter_title || `Chapter ${chapter.chapter_number}`);
                          }}
                          disabled={deletingChapterId === chapter.chapter_id}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {deletingChapterId === chapter.chapter_id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="p-4 text-center">
                  <div className="text-sm text-gray-500 mb-3">No chapters available</div>
                  {user?.role === 'admin' && (
                    <Link to={`/courses/${courseId}/modules/${moduleId}/add-chapter`}>
                      <Button size="sm" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add First Chapter
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {moduleId && selectedModule ? (
            selectedModule.chapters && selectedModule.chapters.length > 0 && currentChapter ? (
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
                      Chapter {currentChapter.chapter_number}: {currentChapter.chapter_title?.trim() || `Chapter ${currentChapter.chapter_number}`}
                    </h2>



                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                      <div
                        className="quill-content p-6"
                        dangerouslySetInnerHTML={{ __html: currentChapter.chapter_content || '<p>No content available</p>' }}
                      />
                    </div>

                    <style>{`
                    .quill-content {
                      font-family: inherit;
                      font-size: 14px;
                      line-height: 1.6;
                      color: #374151;
                    }
                    
                    .quill-content h1 {
                      font-size: 2em;
                      font-weight: bold;
                      margin: 1em 0 0.5em 0;
                      color: #1f2937;
                    }
                    
                    .quill-content h2 {
                      font-size: 1.5em;
                      font-weight: bold;
                      margin: 1em 0 0.5em 0;
                      color: #1f2937;
                    }
                    
                    .quill-content h3 {
                      font-size: 1.25em;
                      font-weight: bold;
                      margin: 1em 0 0.5em 0;
                      color: #1f2937;
                    }
                    
                    .quill-content p {
                      margin: 0.75em 0;
                      line-height: 1.6;
                    }
                    
                    .quill-content blockquote {
                      border-left: 4px solid #e5e7eb;
                      padding-left: 16px;
                      margin: 16px 0;
                      font-style: italic;
                      color: #6b7280;
                      background-color: #f9fafb;
                      padding: 12px 16px;
                      border-radius: 0 6px 6px 0;
                    }
                    
                    .quill-content pre {
                      background-color: #1f2937;
                      color: #f9fafb;
                      padding: 16px;
                      border-radius: 6px;
                      overflow-x: auto;
                      margin: 16px 0;
                      font-family: 'Courier New', monospace;
                      font-size: 13px;
                    }
                    
                    .quill-content code {
                      background-color: #f3f4f6;
                      padding: 2px 4px;
                      border-radius: 3px;
                      font-family: 'Courier New', monospace;
                      font-size: 0.9em;
                      color: #1f2937;
                    }
                    
                    .quill-content ul,
                    .quill-content ol {
                      margin: 16px 0;
                      padding-left: 24px;
                    }
                    
                    .quill-content li {
                      margin: 4px 0;
                      line-height: 1.6;
                    }
                    
                    .quill-content a {
                      color: #2563eb;
                      text-decoration: underline;
                    }
                    
                    .quill-content a:hover {
                      color: #1d4ed8;
                    }
                    
                    .quill-content strong {
                      font-weight: bold;
                    }
                    
                    .quill-content em {
                      font-style: italic;
                    }
                    
                    .quill-content u {
                      text-decoration: underline;
                    }
                    
                    .quill-content s {
                      text-decoration: line-through;
                    }
                    
                    /* Color classes that Quill might use */
                    .quill-content .ql-color-red {
                      color: #ef4444;
                    }
                    
                    .quill-content .ql-color-blue {
                      color: #3b82f6;
                    }
                    
                    .quill-content .ql-color-green {
                      color: #10b981;
                    }
                    
                    .quill-content .ql-bg-yellow {
                      background-color: #fef3c7;
                    }
                    
                    .quill-content .ql-bg-blue {
                      background-color: #dbeafe;
                    }
                    
                    /* Text alignment */
                    .quill-content .ql-align-center {
                      text-align: center;
                    }
                    
                    .quill-content .ql-align-right {
                      text-align: right;
                    }
                    
                    .quill-content .ql-align-justify {
                      text-align: justify;
                    }
                  `}</style>

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
              /* Module selected but no chapters */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center py-12">
                  <div className="mb-4">
                    <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Chapters Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    This module doesn't have any chapters yet.
                    {user?.role === 'admin' ? ' Add the first chapter to get started.' : ' Check back later for content.'}
                  </p>
                  {user?.role === 'admin' && (
                    <Link to={`/courses/${courseId}/modules/${moduleId}/add-chapter`}>
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add First Chapter
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )
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

              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-foreground">Course Modules</h1>
                {user?.role === 'admin' && (
                  <Link to={`/courses/${courseId}/add-module`}>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Module
                    </Button>
                  </Link>
                )}
              </div>

              {modules.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">No modules available for this course.</p>
                  {user?.role === 'admin' && (
                    <Link to={`/courses/${courseId}/add-module`}>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Module
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid gap-4">
                  {modules.map((module) => (
                    <div key={module.module_id} className="relative group">
                      <Link
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
                      {user?.role === 'admin' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete the module "${module.module_title}"? This will also delete all chapters in this module. This action cannot be undone.`)) {
                              coursesApi.deleteModule(courseId!, module.module_id).then(() => {
                                // Remove the deleted module from the state
                                setModules(prev => prev.filter(m => m.module_id !== module.module_id));
                              }).catch((err) => {
                                setError(err.response?.data?.message || 'Failed to delete module');
                              });
                            }
                          }}
                          className="absolute top-4 right-4 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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
