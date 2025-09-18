import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { coursesApi, ModuleWithChapters } from '@/lib/api';
import { ArrowLeft, FileText, Clock, ChevronRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';

const ModuleDetails = () => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId?: string }>();
  const [modules, setModules] = useState<ModuleWithChapters[]>([]);
  const [selectedModule, setSelectedModule] = useState<ModuleWithChapters | null>(null);
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
  }, [courseId, moduleId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
      <div className="container mx-auto px-4 py-8">
        {/* Updated Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/courses">Courses</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {courseId && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/courses/${courseId}/modules`}>Modules</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
           
            <BreadcrumbItem>
              <BreadcrumbPage>
                {moduleId ? (selectedModule ? selectedModule.module_title : 'Module') : ''}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Removed Back Buttons as per user request */}

        <div className="grid grid-cols-1 gap-8">
          {/* Main Content */}
          <div>
            {moduleId && selectedModule ? (
              <>
                <h1 className="text-3xl font-bold text-foreground mb-4">{selectedModule.module_title}</h1>
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-lg">Module Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{selectedModule.module_description}</p>
                  </CardContent>
                </Card>

                {/* Chapters for selected module */}
                <h2 className="text-2xl font-bold text-foreground mb-4">Chapters</h2>
                {selectedModule.chapters && selectedModule.chapters.length > 0 ? (
                  selectedModule.chapters.map((chapter) => (
                    <Card key={chapter.chapter_id} className="mb-4">
                      <CardHeader>
                        <CardTitle className="text-lg">Chapter {chapter.chapter_number}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{chapter.chapter_content}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground">No chapters available for this module.</p>
                )}
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ModuleDetails;
