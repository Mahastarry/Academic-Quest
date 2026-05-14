import React from "react";
import { useListProcessingJobs } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertCircle, Loader2, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Processing() {
  const { data: jobs, isLoading } = useListProcessingJobs({ query: { refetchInterval: 3000 } });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "queued": return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-0">Queued</Badge>;
      case "processing": return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-0"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing</Badge>;
      case "completed": return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
      case "failed": return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-0"><AlertCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default: return null;
    }
  };

  const getJobTypeLabel = (type: string) => {
    switch(type) {
      case "study_notes": return "Study Notes";
      case "mcq_generation": return "MCQ Generation";
      case "both": return "Notes + MCQs";
      default: return type;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">AI Processing Queue</h2>
        <p className="text-muted-foreground mt-2">Monitor the status of your document intelligence extraction.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      ) : jobs?.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-xl bg-card/50 text-muted-foreground">
          <Cpu className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-foreground mb-1">No active jobs</h3>
          <p>Start processing a document from the Upload Center.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {jobs?.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <Card className="overflow-hidden border-border hover-elevate transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg mb-1 truncate max-w-md">{job.uploadName || `Job #${job.id}`}</h4>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs font-normal">
                            {getJobTypeLabel(job.jobType)}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {job.estimatedTime ? `~${job.estimatedTime}s remaining` : 'Calculating...'}
                          </span>
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(job.status)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className={job.status === "failed" ? "text-destructive" : "text-primary"}>
                          {job.progress}%
                        </span>
                      </div>
                      <Progress 
                        value={job.progress} 
                        className={`h-2 ${job.status === "failed" ? "bg-red-100" : ""}`}
                        // If progress component supports custom indicator classes, we'd apply them here
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
