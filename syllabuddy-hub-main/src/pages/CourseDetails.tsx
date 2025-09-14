import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { coursesApi, CourseWithModules } from '@/lib/api';
import { ArrowLeft, BookOpen, Clock, PlayCircle, ChevronRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';

const CourseDetails = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<CourseWithModules | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      
      try {
        const response = await coursesApi.getCourse(courseId);
        if (response.status === 'success') {
          setCourse(response.body);
        } else {
          setError(response.message || 'Failed to load course details');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

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
          <Skeleton className="h-4 w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-6" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div>
              <Skeleton className="h-6 w-32 mb-4" />
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full mb-3" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !course) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error || 'Course not found'}</AlertDescription>
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
              <BreadcrumbPage>{course.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Button */}
        <Link to="/courses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Created {formatDate(course.created_at)}
                </Badge>
                <Badge variant="outline">
                  {course.modules.length} Module{course.modules.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <h1 className="text-3xl font-bold text-foreground mb-4">{course.title}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* Course Image */}
            {course.course_image_url && (
              <div className="mb-8 rounded-xl overflow-hidden shadow-medium">
                <img
                  src={course.course_image_url}
                  alt={course.title}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Sidebar - Modules */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Course Modules
                </CardTitle>
                <CardDescription>
                  {course.modules.length} module{course.modules.length !== 1 ? 's' : ''} available
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.modules.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No modules available yet
                  </p>
                ) : (
                  course.modules
                    .sort((a, b) => a.module_number - b.module_number)
                    .map((module) => (
                      <Link
                        key={module.module_id}
                        to={`/courses/${courseId}/modules/${module.module_id}`}
                        className="block"
                      >
                        <Card className="hover:shadow-soft transition-all duration-200 hover:scale-[1.02] group cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    Module {module.module_number}
                                  </Badge>
                                </div>
                                <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                                  {module.module_title}
                                </h4>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                  {module.module_description}
                                </p>
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

export default CourseDetails;