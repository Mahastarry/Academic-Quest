import React, { useState } from "react";
import { useListUploads, useCreateUpload, useDeleteUpload, useCreateProcessingJob, UploadStatus, UploadFileType } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, FileText, Trash2, Cpu, File, FileArchive, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function UploadCenter() {
  const { toast } = useToast();
  const { data: uploads, isLoading, refetch } = useListUploads();
  const createUpload = useCreateUpload();
  const deleteUpload = useDeleteUpload();
  const createProcessingJob = useCreateProcessingJob();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await handleFileUpload(file);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      let type: UploadFileType = "other";
      if (file.name.toLowerCase().includes("syllabus")) type = "syllabus";
      else if (file.name.toLowerCase().includes("textbook") || file.name.toLowerCase().includes("book")) type = "textbook";
      else if (file.name.toLowerCase().includes("notes")) type = "notes";

      await createUpload.mutateAsync({
        data: {
          fileName: file.name,
          fileSize: file.size,
          fileType: type
        }
      });
      toast({ title: "File uploaded successfully" });
      refetch();
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUpload.mutateAsync({ id });
      toast({ title: "File deleted" });
      refetch();
    } catch (error) {
      toast({ title: "Failed to delete file", variant: "destructive" });
    }
  };

  const handleStartProcessing = async (id: number) => {
    try {
      await createProcessingJob.mutateAsync({
        data: {
          uploadId: id,
          jobType: "both"
        }
      });
      toast({ title: "Processing job started!" });
    } catch (error) {
      toast({ title: "Failed to start processing", variant: "destructive" });
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "syllabus": return <FileText className="text-blue-500 w-8 h-8" />;
      case "textbook": return <FileArchive className="text-purple-500 w-8 h-8" />;
      case "notes": return <File className="text-green-500 w-8 h-8" />;
      default: return <File className="text-gray-500 w-8 h-8" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Upload Center</h2>
        <p className="text-muted-foreground mt-2">Upload your course materials to generate insights.</p>
      </div>

      <Card 
        className={`border-2 border-dashed transition-all duration-300 ease-in-out ${
          isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border bg-card"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <UploadCloud className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Drag and drop your files here</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Support for PDF syllabi, textbooks, and lecture notes up to 50MB.
          </p>
          <div className="relative">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={handleFileInput}
            />
            <Button variant="outline" className="px-8 shadow-sm">
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Recent Uploads</h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : uploads?.length === 0 ? (
          <div className="text-center py-12 border rounded-xl bg-card/50 text-muted-foreground">
            No files uploaded yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {uploads?.map((upload) => (
              <Card key={upload.id} className="hover-elevate transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 bg-muted rounded-xl">
                    {getFileIcon(upload.fileType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{upload.fileName}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="uppercase tracking-wider font-medium">{upload.fileType}</span>
                      <span>•</span>
                      <span>{(upload.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {upload.status === "uploading" && (
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading
                      </div>
                    )}
                    {upload.status === "ready" && (
                      <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Ready
                      </Badge>
                    )}
                    {upload.status === "error" && (
                      <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">
                        <AlertCircle className="w-3 h-3 mr-1" /> Error
                      </Badge>
                    )}
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="ml-2"
                      onClick={() => handleStartProcessing(upload.id)}
                      disabled={upload.status !== "ready"}
                    >
                      <Cpu className="w-4 h-4 mr-2" />
                      Start Processing
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(upload.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
