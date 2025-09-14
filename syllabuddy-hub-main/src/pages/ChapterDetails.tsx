import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { coursesApi, Chapter } from '@/lib/api';
import { ArrowLeft, FileText, Clock } from 'lucide-react';
import Layout from '@/components/layout/Layout';

const ChapterDetails = () => {
  const { courseId, moduleId, chapterId } = useParams<{ 
    courseId: string; 
    moduleId: string; 
    chapterId: string; 
  }>();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChapter = async () => {
      if (!courseId || !moduleId || !chapterId) return;
      
      try {
        const response = await coursesApi.getChapter(courseId, moduleId, chapterId);
        if (response.status === 'success') {
          setChapter(response.body);
        } else {
          setError(response.message || 'Failed to load chapter details');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapter();
  }, [courseId, moduleId, chapterId]);

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
          <Skeleton className="h-4 w-full max-w-lg mb-6" />
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-32 mb-6" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !chapter) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error || 'Chapter not found'}</AlertDescription>
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
              <BreadcrumbLink asChild>
                <Link to={`/courses/${courseId}/modules/${moduleId}`}>Module</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Chapter {chapter.chapter_number}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Button */}
        <Link 
          to={`/courses/${courseId}/modules/${moduleId}`} 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Module
        </Link>

        {/* Chapter Content */}
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">
                Chapter {chapter.chapter_number}
              </Badge>
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                Created {formatDate(chapter.created_at)}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Chapter {chapter.chapter_number}
            </h1>
          </div>

          {/* Chapter Content Card */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Chapter Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate max-w-none">
                <div className="bg-muted/30 p-6 rounded-lg border-l-4 border-primary">
                  <div className="whitespace-pre-wrap leading-relaxed text-foreground">
                    {chapter.chapter_content}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chapter Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-primary mb-1">
                  {chapter.chapter_number}
                </div>
                <div className="text-sm text-muted-foreground">Chapter Number</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-foreground mb-1">
                  {formatDate(chapter.created_at).split(',')[0]}
                </div>
                <div className="text-sm text-muted-foreground">Created</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-accent mb-1">
                  {formatDate(chapter.updated_at).split(',')[0]}
                </div>
                <div className="text-sm text-muted-foreground">Last Updated</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChapterDetails;