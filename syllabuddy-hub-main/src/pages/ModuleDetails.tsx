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
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const [module, setModule] = useState<ModuleWithChapters | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchModule = async () => {
      if (!courseId || !moduleId) return;
      
      try {
        const response = await coursesApi.getModule(courseId, moduleId);
        if (response.status === 'success') {
          setModule(response.body);
        } else {
          setError(response.message || 'Failed to load module details');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchModule();
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

  if (error || !module) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error || 'Module not found'}</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/courses">Courses</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/courses/${courseId}`}>Course</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Module {module.module_number}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Button */}
        <Link 
          to={`/courses/${courseId}`} 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">
                  Module {module.module_number}
                </Badge>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  Created {formatDate(module.created_at)}
                </Badge>
                <Badge variant="outline">
                  {module.chapters.length} Chapter{module.chapters.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <h1 className="text-3xl font-bold text-foreground mb-4">{module.module_title}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {module.module_description}
              </p>
            </div>

            {/* Module Info Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Module Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-primary-light rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {module.chapters.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Chapters</div>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {module.module_number}
                    </div>
                    <div className="text-sm text-muted-foreground">Module Number</div>
                  </div>
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <div className="text-2xl font-bold text-accent mb-1">
                      {formatDate(module.created_at).split(',')[0]}
                    </div>
                    <div className="text-sm text-muted-foreground">Created</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Chapters */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Module Chapters
                </CardTitle>
                <CardDescription>
                  {module.chapters.length} chapter{module.chapters.length !== 1 ? 's' : ''} available
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {module.chapters.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No chapters available yet
                  </p>
                ) : (
                  module.chapters
                    .sort((a, b) => a.chapter_number - b.chapter_number)
                    .map((chapter) => (
                      <Link
                        key={chapter.chapter_id}
                        to={`/courses/${courseId}/modules/${moduleId}/chapters/${chapter.chapter_id}`}
                        className="block"
                      >
                        <Card className="hover:shadow-soft transition-all duration-200 hover:scale-[1.02] group cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    Chapter {chapter.chapter_number}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Click to view chapter content
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ModuleDetails;