import Link from "next/link"
import { Download, Play, Upload, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12 md:py-24">
        <div className="inline-block">
          <div className="bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Upload Your Knowledge
            </h1>
          </div>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create custom quizzes with JSON files, track your progress, and challenge yourself with our intelligent quiz platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/setup">
              <Play className="mr-2 h-5 w-5" />
              Start Quiz
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-lg px-8">
            <a href="/Quiz_Template.json" download="Quiz_Template.json">
              <Download className="mr-2 h-5 w-5" />
              Download Template
            </a>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>1. Upload Your Quiz</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Download our template and create a custom JSON file with your questions. Support for multiple choice, true/false, and fill-in-the-blank questions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Play className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>2. Take the Quiz</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Set your time limit and start answering questions. Navigate freely between questions and track your progress with our intuitive timer.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>3. Review & Improve</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Get instant feedback with detailed explanations for each question. Track your history and monitor your improvement over time.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features List */}
      <section className="py-12 md:py-20">
        <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Why Choose Our Platform?</CardTitle>
            <CardDescription className="text-base">
              Powerful features designed for effective learning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Secure & Private</h3>
                  <p className="text-sm text-muted-foreground">
                    Your data is protected with email verification and secure authentication
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Instant Feedback</h3>
                  <p className="text-sm text-muted-foreground">
                    Get detailed explanations for every question immediately after submission
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Custom Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload unlimited custom quizzes in simple JSON format
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Progress Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor your performance history and see your improvement over time
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12 md:py-20">
        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary to-purple-600 text-white border-0">
          <CardHeader>
            <CardTitle className="text-3xl text-white">Ready to Get Started?</CardTitle>
            <CardDescription className="text-white/90 text-base">
              Create your account now and start learning with custom quizzes
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg">
              <Link href="/register">
                Sign Up Free
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg bg-white/10 border-white/20 text-white hover:bg-white/20">
              <a href="/Quiz_Template.json" download="Quiz_Template.json">
                <Download className="mr-2 h-5 w-5" />
                Get Template
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
