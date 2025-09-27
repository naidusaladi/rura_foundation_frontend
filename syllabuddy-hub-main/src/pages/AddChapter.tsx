import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import QuillEditor, { QuillEditorRef } from '@/components/ui/quill-editor';

import { coursesApi } from '@/lib/api';
import { Loader2, ArrowLeft, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';

const AddChapter = () => {
  const [formData, setFormData] = useState({
    chapter_title: '',
    chapter_content: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const editorRef = useRef<QuillEditorRef>(null);

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

  // Fetch course and module details to show context and get next chapter number
  useEffect(() => {
    const fetchDetails = async () => {
      if (!courseId || !moduleId) return;

      try {
        // Fetch course details
        const courseResponse = await coursesApi.getCourse(courseId);
        if (courseResponse.status === 'success') {
          setCourseTitle(courseResponse.body.title);
        }

        // Fetch module details
        const moduleResponse = await coursesApi.getModule(courseId, moduleId);
        if (moduleResponse.status === 'success') {
          setModuleTitle(moduleResponse.body.module_title);
        }


      } catch (err) {
        console.error('Failed to fetch details:', err);
      }
    };

    fetchDetails();
  }, [courseId, moduleId]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditorChange = (content: string) => {
    setFormData(prev => ({ ...prev, chapter_content: content }));
  };

  const loadTemplate = () => {
    const template = `<h2>Chapter Overview</h2>
<p>Brief introduction to what students will learn in this chapter.</p>

<h3>Learning Objectives</h3>
<ul>
  <li>Objective 1</li>
  <li>Objective 2</li>
  <li>Objective 3</li>
</ul>

<h3>Key Concepts</h3>
<p>Explain the main concepts covered in this chapter.</p>

<blockquote>
  <p>💡 <strong>Tip:</strong> Add helpful tips or important notes here.</p>
</blockquote>

<h3>Examples</h3>
<p>Provide practical examples to illustrate the concepts.</p>

<pre>// Code example (if applicable)
console.log("Hello, World!");</pre>

<h3>Summary</h3>
<p>Summarize the key points covered in this chapter.</p>

<h3>Next Steps</h3>
<p>What students should do next or what they'll learn in the following chapter.</p>`;

    if (editorRef.current) {
      editorRef.current.setContent(template);
    }
    setFormData(prev => ({ ...prev, chapter_content: template }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !moduleId) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Get content from Quill editor
      const editorContent = editorRef.current?.getContent() || formData.chapter_content;
      const chapterData = {
        chapter_title: formData.chapter_title,
        chapter_content: editorContent
      };

      console.log('Creating chapter with data:', chapterData);
      console.log('Course ID:', courseId, 'Module ID:', moduleId);

      const response = await coursesApi.createChapter(courseId, moduleId, chapterData);
      console.log('Chapter creation response:', response);

      if (response.status === 'success') {
        setSuccess('Chapter created successfully!');
        const newChapterId = response.body.chapter_id;
        setTimeout(() => navigate(`/courses/${courseId}/modules/${moduleId}/chapters/${newChapterId}`), 2000);
      } else {
        setError(response.message || 'Failed to create chapter');
      }
    } catch (err: any) {
      console.error('Chapter creation error:', err);
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
            onClick={() => navigate(`/courses/${courseId}/modules/${moduleId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Module
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <Plus className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Add New Chapter</h1>
              {moduleTitle && (
                <p className="text-muted-foreground mt-1">
                  to "{moduleTitle}"
                  {courseTitle && <span className="text-xs"> in {courseTitle}</span>}
                </p>
              )}
            </div>
          </div>
          <p className="text-muted-foreground">
            Create a new chapter with content for this module.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Chapter Details</CardTitle>
            <CardDescription>
              Fill in the information below to create a new chapter. Chapter numbers are automatically assigned.
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
                <Label htmlFor="chapter_title">Chapter Title *</Label>
                <Input
                  id="chapter_title"
                  type="text"
                  placeholder="Enter chapter title"
                  value={formData.chapter_title}
                  onChange={(e) => handleInputChange('chapter_title', e.target.value)}
                  required
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  A descriptive title for this chapter
                </p>
              </div>



              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="chapter_content">Chapter Content *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={loadTemplate}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    📝 Load Template
                  </Button>
                </div>
                <QuillEditor
                  ref={editorRef}
                  value={formData.chapter_content}
                  onChange={handleEditorChange}
                  placeholder="Write your chapter content here... You can format text, add lists, links, and more!"
                  className="min-h-[300px]"
                />
                <p className="text-sm text-muted-foreground">
                  Use the rich text editor to create engaging chapter content with formatting, lists, links, and more. Click "Load Template" for a structured starting point.
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
                      Creating Chapter...
                    </>
                  ) : (
                    'Create Chapter'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/courses/${courseId}/modules/${moduleId}`)}
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

export default AddChapter;