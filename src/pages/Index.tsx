import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Upload, BookOpen, Users, FileText, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Advanced Filters',
    description: 'Find exactly what you need with powerful search and filtering by board, class, subject, and year.',
  },
  {
    icon: Upload,
    title: 'Easy Uploads',
    description: 'Share your question papers effortlessly. Drag, drop, and help fellow students succeed.',
  },
  {
    icon: BookOpen,
    title: 'Academic Success',
    description: 'Access thousands of past papers from Indian and International boards to ace your exams.',
  },
];

const stats = [
  { value: '10K+', label: 'Question Papers' },
  { value: '50+', label: 'Subjects' },
  { value: '15+', label: 'Boards' },
  { value: '10K+', label: 'Students' },
];

export default function Index() {
  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 pb-16 pt-20 text-center">
        <div className="mx-auto max-w-3xl animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-secondary-foreground">
              Your Academic Resource Hub
            </span>
          </div>
          
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Discover, Download & Share{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Question Papers
            </span>
          </h1>
          
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Access thousands of past exam papers from CBSE, ICSE, IB, Cambridge, and more. 
            Prepare smarter, score better.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/browse">
              <Button size="lg" className="gradient-primary px-8 shadow-glow">
                Browse Papers
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="lg" variant="outline" className="px-8">
                <Upload className="mr-2 h-4 w-4" />
                Upload a Paper
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            Why Choose QP Hub?
          </h2>
          <p className="text-muted-foreground">
            Everything you need to excel in your exams, all in one place.
          </p>
        </div>
        
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group border-border/50 bg-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary transition-colors group-hover:bg-primary">
                  <feature.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 pb-20">
        <Card className="gradient-primary overflow-hidden">
          <CardContent className="p-8 text-center md:p-12">
            <Users className="mx-auto mb-4 h-12 w-12 text-primary-foreground/80" />
            <h2 className="mb-4 text-2xl font-bold text-primary-foreground md:text-3xl">
              Join Our Growing Community
            </h2>
            <p className="mb-6 text-primary-foreground/80">
              Help fellow students by sharing your question papers. Together, we learn better.
            </p>
            <Link to="/auth?mode=signup">
              <Button size="lg" variant="secondary" className="px-8">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">QP Hub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} QP Hub. Empowering students worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}