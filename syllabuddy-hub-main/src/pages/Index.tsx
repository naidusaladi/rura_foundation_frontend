import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, BookOpen, Users, Award, ArrowRight, CheckCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';

const Index = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: "Rich Course Content",
      description: "Access comprehensive courses with structured modules and chapters"
    },
    {
      icon: Users,
      title: "Expert Instructors", 
      description: "Learn from industry professionals and experienced educators"
    },
    {
      icon: Award,
      title: "Track Progress",
      description: "Monitor your learning journey and celebrate achievements"
    }
  ];

  const benefits = [
    "Self-paced learning",
    "High-quality content",
    "Interactive modules",
    "Progress tracking",
    "Mobile friendly",
    "Expert support"
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-light via-background to-primary-light/30">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <GraduationCap className="h-16 w-16 text-primary" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Your Gateway to 
              <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent block">
                Exceptional Learning
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover world-class courses, learn at your own pace, and unlock your potential 
              with our comprehensive educational platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/courses">
                  <Button size="lg" variant="hero" className="text-lg px-8 py-6">
                    Explore Courses
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" variant="hero" className="text-lg px-8 py-6">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose EduPortal?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We provide everything you need for a successful learning experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-medium transition-all duration-300 hover:scale-[1.02] group">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Our platform is designed with learners in mind, providing all the tools 
                and resources you need to achieve your educational goals.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <Card className="shadow-strong">
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-20 w-20 text-primary mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Start Learning Today
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Join thousands of learners who have transformed their careers with our courses.
                  </p>
                  {!isAuthenticated && (
                    <Link to="/register">
                      <Button variant="hero" size="lg" className="w-full">
                        Create Free Account
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
