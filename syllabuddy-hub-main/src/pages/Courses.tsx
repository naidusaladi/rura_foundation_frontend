import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { coursesApi, Course, api, API_BASE_URL } from '@/lib/api';
import { Search, Clock, BookOpen, ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await coursesApi.getCourses();
        if (response.status === 'success') {
          setCourses(response.body);
          setFilteredCourses(response.body);
        } else {
          setError(response.message || 'Failed to load courses');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const filtered = courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCourseImageUrl = (courseId: string) => {
    const imageUrl = `${api.defaults.baseURL}/courses/${courseId}/image`;
    console.log('Image URL:', imageUrl);
    return imageUrl;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="mb-6">
            <Skeleton className="h-10 w-full max-w-md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-80">
                <CardHeader>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
  <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[80vh]">
  {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Explore Courses</h1>
          <p className="text-muted-foreground">
            Discover amazing courses and start your learning journey today
          </p>
        </div>

  {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

  {/* Courses Grid */}
        {filteredCourses.length === 0 && !isLoading ? (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-radial from-primary/30 via-info/20 to-transparent blur-3xl scale-150"></div>
              <div className="relative bg-gradient-to-br from-card via-card/90 to-card/70 backdrop-blur-xl border border-border/40 rounded-3xl p-8 shadow-floating">
                <BookOpen className="mx-auto h-20 w-20 text-primary mb-6 animate-pulse" />
                <h3 className="text-2xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                  {searchTerm ? 'No courses found' : 'No courses available yet'}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  {searchTerm 
                    ? 'Try adjusting your search terms or browse all available courses' 
                    : 'New courses are being added regularly. Check back soon for exciting content!'
                  }
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10 justify-center">
            {filteredCourses.map((course, index) => (
              <div 
                key={course.course_id} 
                className="group relative"
              >
                {/* Main card container */}
                <div className="relative">
                  <Card className="relative h-full bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-xl border-0 shadow-lg transition-all duration-500 overflow-hidden rounded-2xl p-8">
                    <CardHeader className="pb-6 relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <Badge className="text-xs font-medium bg-gradient-to-r from-primary/20 to-info/20 text-primary border-primary/30 hover:from-primary/30 hover:to-info/30 transition-all duration-300 shadow-soft">
                          <Clock className="h-3 w-3 mr-1.5" />
                          {formatDate(course.created_at)}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-success animate-pulse shadow-success"></div>
                          <span className="text-xs text-success font-medium">Active</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl font-bold group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-info group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500 leading-tight mb-3">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-muted-foreground/90 leading-relaxed text-sm">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col pb-6 relative z-10">
                      {/* Enhanced image container */}
                      <div className="mb-6 relative group/image">
                        {course.course_image_url ? (
                          <div className="rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-info/5 border border-border/30 shadow-soft group-hover:shadow-medium transition-all duration-500">
<img
                              src={getCourseImageUrl(course.course_id)}
                              alt={course.title}
                              className="w-full h-44 object-cover"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          </div>
                        ) : (
                          <div className="h-44 rounded-xl bg-gradient-to-br from-primary/15 via-info/15 to-primary/10 border border-border/30 flex items-center justify-center group-hover:from-primary/25 group-hover:via-info/25 group-hover:to-primary/15 transition-all duration-500 shadow-soft group-hover:shadow-medium relative overflow-hidden">
                            {/* Animated background pattern */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            <BookOpen className="h-16 w-16 text-primary/70 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                          </div>
                        )}
                        {/* Overlay icons */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-soft">
                            <ArrowRight className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-auto space-y-5">
                        {/* Enhanced course stats */}
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-muted/30 to-muted/20 rounded-xl border border-border/30 backdrop-blur-sm">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="p-1.5 bg-primary/10 rounded-lg">
                              <BookOpen className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">Interactive</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="p-1.5 bg-info/10 rounded-lg">
                              <Clock className="h-4 w-4 text-info" />
                            </div>
                            <span className="font-medium">Self-paced</span>
                          </div>
                        </div>
                        
                        {/* Enhanced button */}
                        <Link to={`/courses/${course.course_id}`} className="block group/button">
                          <Button className="w-full h-12 bg-gradient-to-r from-primary via-primary-dark to-primary hover:from-primary-dark hover:via-primary hover:to-primary-dark text-primary-foreground shadow-floating hover:shadow-magical transition-all duration-500 group-hover:scale-[1.02] group/button:hover:scale-[1.05] font-semibold text-base rounded-xl relative overflow-hidden">
                            {/* Button shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-700"></div>
                            <span className="flex items-center justify-center gap-3 relative z-10">
                              Start Learning
                              <ArrowRight className="h-5 w-5 group-hover/button:translate-x-2 transition-transform duration-300" />
                            </span>
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Courses;
