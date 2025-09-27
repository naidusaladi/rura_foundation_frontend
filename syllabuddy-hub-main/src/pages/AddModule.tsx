import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { coursesApi } from '@/lib/api';
import { Loader2, ArrowLeft, BookOpen, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';

const AddModule = () => {
  const [formData, setFormData] = useState({
    module_title: '',
    module_description: '',
    module_number: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const { user, isLoading: authLoading } = useAuth();

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Redirect if not admin (only after auth is loaded)
  if (user && user.role !== 'admin') {
    navigate('/courses');
    return null;
  }

  // Redirect if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  // Fetch course details to show course title
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      
      try {
        const response = await coursesApi.getCourse(courseId);
        if (response.status === 'success') {
          setCourseTitle(response.body.title);
        }
      } catch (err) {
        console.error('Failed to fetch course details:', err);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Creating module with data:', formData);
      console.log('Course ID:', courseId);
      
      const response = await coursesApi.createModule(courseId, formData);
      console.log('Module creation response:', response);
      
      if (response.status === 'success') {
        const moduleId = response.body.module_id;
        setSuccess('Module created successfully! Redirecting to module...');
        setTimeout(() => navigate(`/courses/${courseId}/modules/${moduleId}`), 2000);
      } else {
        setError(response.message || 'Failed to create module');
      }
    } catch (err: any) {
      console.error('Module creation error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data?.detail?.message || 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/courses/${courseId}/modules`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>
        
        <div className="flex items-center gap-3 mb-2">
          <Plus className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Add New Module</h1>
            {courseTitle && (
              <p className="text-muted-foreground mt-1">
                to "{courseTitle}"
              </p>
            )}
          </div>
        </div>
        <p className="text-muted-foreground">
          Create a new module to organize course content into sections.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Module Details</CardTitle>
          <CardDescription>
            Fill in the information below to create a new module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="border-success text-success">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="module_title">Module Title *</Label>
              <Input
                id="module_title"
                type="text"
                placeholder="Enter module title"
                value={formData.module_title}
                onChange={(e) => handleInputChange('module_title', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="module_description">Module Description</Label>
              <Textarea
                id="module_description"
                placeholder="Enter module description (optional)"
                value={formData.module_description}
                onChange={(e) => handleInputChange('module_description', e.target.value)}
                disabled={isLoading}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="module_number">Module Number *</Label>
              <Input
                id="module_number"
                type="number"
                min="1"
                placeholder="Enter module number"
                value={formData.module_number}
                onChange={(e) => handleInputChange('module_number', parseInt(e.target.value) || 1)}
                required
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                The order in which this module appears in the course
              </p>
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Module...
                  </>
                ) : (
                  'Create Module'
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(`/courses/${courseId}/modules`)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
};

export default AddModule;