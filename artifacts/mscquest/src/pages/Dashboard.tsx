import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useGetAnalyticsSummary } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Sparkles, BookOpen, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: analytics, isLoading } = useGetAnalyticsSummary();

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12 md:py-20 relative">
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="w-[600px] h-[600px] bg-primary/30 rounded-full blur-[100px]" />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-0">
            <Sparkles className="w-3 h-3 mr-2" />
            MSCQuest v2.0 is live
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            AI Academic <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">
              Intelligence Platform
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform raw syllabi and textbooks into structured study notes and adaptive review questions in seconds.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center gap-4 pt-4"
        >
          <Link href="/upload">
            <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/notes">
            <Button variant="outline" size="lg" className="rounded-full px-8 bg-background/50 backdrop-blur border-border">
              View Demo
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Stats Ticker */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
          ) : (
            <>
              <StatCard label="Total Uploads" value={analytics?.totalUploads || 0} />
              <StatCard label="Study Notes Generated" value={analytics?.totalNotes || 0} />
              <StatCard label="Review Questions" value={analytics?.totalQuestions || 0} />
              <StatCard label="Completion Rate" value={`${analytics?.studyCompletionPercent || 0}%`} />
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6">
        <FeatureCard 
          icon={<BookOpen className="w-8 h-8 text-primary" />}
          title="Instant Study Guides"
          description="Upload your textbook PDFs and syllabus. Our AI reads the material and generates comprehensive study guides."
        />
        <FeatureCard 
          icon={<BrainCircuit className="w-8 h-8 text-primary" />}
          title="Adaptive MCQs"
          description="Test your knowledge with multiple-choice questions mapped to Bloom's Taxonomy levels."
        />
        <FeatureCard 
          icon={<Sparkles className="w-8 h-8 text-primary" />}
          title="Deep Analytics"
          description="Track your topic coverage, difficulty distribution, and study completion in real-time."
        />
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string, value: string | number }) {
  return (
    <Card className="border-border bg-card/50 backdrop-blur overflow-hidden hover-elevate">
      <CardContent className="p-6">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <h3 className="text-3xl font-bold mt-2">{value}</h3>
      </CardContent>
    </Card>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="hover:-translate-y-1 transition-transform duration-300 border-border bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="mb-4 bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${className}`}>
      {children}
    </span>
  );
}
