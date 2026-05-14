import { useState, useRef, useCallback } from "react";
import {
  useListUploads,
  useDeleteUpload,
  useCreateProcessingJob,
  getListUploadsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileText,
  Trash2,
  Cpu,
  File,
  BookOpen,
  CheckCircle2,
  Loader2,
  AlertCircle,
  X,
  FilePlus,
} from "lucide-react";

const ACCEPTED_TYPES = ".pdf,.docx,.doc,.txt,.md";
const ACCEPTED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "text/markdown",
]);
const MAX_SIZE = 50 * 1024 * 1024;

interface UploadingFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "done" | "error";
  errorMsg?: string;
}

function detectFileType(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("syllabus") || lower.includes("curriculum") || lower.includes("outline")) return "syllabus";
  if (lower.includes("textbook") || lower.includes("book") || lower.includes("edition")) return "textbook";
  if (lower.includes("notes") || lower.includes("lecture") || lower.includes("summary")) return "notes";
  return "other";
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

function getFileIcon(type: string, size: "sm" | "lg" = "lg") {
  const cls = size === "lg" ? "w-7 h-7" : "w-4 h-4";
  switch (type) {
    case "syllabus": return <FileText className={`${cls} text-blue-500`} />;
    case "textbook": return <BookOpen className={`${cls} text-violet-500`} />;
    case "notes": return <FilePlus className={`${cls} text-emerald-500`} />;
    default: return <File className={`${cls} text-gray-400`} />;
  }
}

function typeColor(type: string) {
  switch (type) {
    case "syllabus": return "bg-blue-50 text-blue-700 border-blue-200";
    case "textbook": return "bg-violet-50 text-violet-700 border-violet-200";
    case "notes": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default: return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

export default function UploadCenter() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: uploads, isLoading } = useListUploads();
  const deleteUpload = useDeleteUpload();
  const createProcessingJob = useCreateProcessingJob();

  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    (file: File): Promise<void> => {
      return new Promise((resolve) => {
        if (!ACCEPTED_MIME.has(file.type) && !file.name.match(/\.(pdf|docx|doc|txt|md)$/i)) {
          toast({
            title: "Unsupported file type",
            description: `${file.name} is not a supported format. Please use PDF, DOCX, TXT, or MD files.`,
            variant: "destructive",
          });
          resolve();
          return;
        }

        if (file.size > MAX_SIZE) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds the 50 MB limit.`,
            variant: "destructive",
          });
          resolve();
          return;
        }

        const uid = `${Date.now()}-${Math.random()}`;
        const entry: UploadingFile = {
          id: uid,
          name: file.name,
          size: file.size,
          progress: 0,
          status: "uploading",
        };
        setUploading((prev) => [...prev, entry]);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileType", detectFileType(file.name));

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setUploading((prev) =>
              prev.map((u) => (u.id === uid ? { ...u, progress: pct } : u))
            );
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 201) {
            setUploading((prev) =>
              prev.map((u) => (u.id === uid ? { ...u, progress: 100, status: "done" } : u))
            );
            queryClient.invalidateQueries({ queryKey: getListUploadsQueryKey() });
            toast({ title: "Upload complete", description: file.name });
            setTimeout(() => {
              setUploading((prev) => prev.filter((u) => u.id !== uid));
            }, 3000);
          } else {
            let msg = "Server error";
            try {
              msg = JSON.parse(xhr.responseText)?.error ?? msg;
            } catch {}
            setUploading((prev) =>
              prev.map((u) => (u.id === uid ? { ...u, status: "error", errorMsg: msg } : u))
            );
            toast({ title: "Upload failed", description: msg, variant: "destructive" });
          }
          resolve();
        });

        xhr.addEventListener("error", () => {
          setUploading((prev) =>
            prev.map((u) => (u.id === uid ? { ...u, status: "error", errorMsg: "Network error" } : u))
          );
          toast({ title: "Upload failed", description: "Network error — please try again.", variant: "destructive" });
          resolve();
        });

        xhr.open("POST", `${import.meta.env.BASE_URL}api/uploads/file`);
        xhr.send(formData);
      });
    },
    [queryClient, toast]
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files);
      for (const file of arr) {
        await uploadFile(file);
      }
    },
    [uploadFile]
  );

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: number) => {
    await deleteUpload.mutateAsync({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUploadsQueryKey() });
        toast({ title: "File removed" });
      },
      onError: () => {
        toast({ title: "Failed to remove file", variant: "destructive" });
      },
    });
  };

  const handleStartProcessing = async (id: number) => {
    await createProcessingJob.mutateAsync(
      { data: { uploadId: id, jobType: "both" } },
      {
        onSuccess: () => toast({ title: "AI processing started", description: "Study notes and MCQs will be generated shortly." }),
        onError: () => toast({ title: "Failed to start processing", variant: "destructive" }),
      }
    );
  };

  const dismissError = (uid: string) => setUploading((prev) => prev.filter((u) => u.id !== uid));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Upload Center</h2>
        <p className="text-muted-foreground mt-1.5">
          Upload syllabi, textbooks, and lecture notes — the AI will generate study notes and MCQs automatically.
        </p>
      </div>

      {/* Drop zone */}
      <div
        data-testid="upload-dropzone"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 select-none ${
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01] shadow-lg shadow-primary/10"
            : "border-border bg-card hover:border-primary/50 hover:bg-muted/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          className="hidden"
          onChange={onInputChange}
          data-testid="input-file-upload"
        />
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center pointer-events-none">
          <motion.div
            animate={isDragging ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-16 h-16 mb-5 rounded-2xl bg-primary/10 flex items-center justify-center"
          >
            <UploadCloud className="w-8 h-8 text-primary" />
          </motion.div>
          <h3 className="text-xl font-semibold mb-2">
            {isDragging ? "Drop files to upload" : "Drag & drop files here"}
          </h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-xs leading-relaxed">
            Supports PDF, DOCX, TXT, and Markdown files up to 50 MB each. You can drop multiple files at once.
          </p>
          <div className="pointer-events-auto">
            <Button
              variant="outline"
              className="px-8 shadow-sm font-medium"
              data-testid="button-browse-files"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              Browse Files
            </Button>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-4">PDF · DOCX · TXT · MD</p>
        </div>
      </div>

      {/* Active uploads */}
      <AnimatePresence>
        {uploading.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Uploading</h3>
            {uploading.map((u) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                data-testid={`card-uploading-${u.id}`}
              >
                <Card className={`border ${u.status === "error" ? "border-red-200 bg-red-50/50" : "border-border"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{formatSize(u.size)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {u.status === "uploading" && (
                          <span className="text-xs font-medium text-primary tabular-nums">{u.progress}%</span>
                        )}
                        {u.status === "done" && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        )}
                        {u.status === "error" && (
                          <button
                            onClick={() => dismissError(u.id)}
                            className="text-muted-foreground hover:text-foreground"
                            data-testid={`button-dismiss-error-${u.id}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    {u.status === "uploading" && (
                      <Progress value={u.progress} className="h-1.5" />
                    )}
                    {u.status === "done" && (
                      <div className="h-1.5 rounded-full bg-emerald-100 overflow-hidden">
                        <div className="h-full w-full bg-emerald-500 rounded-full" />
                      </div>
                    )}
                    {u.status === "error" && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <p className="text-xs text-red-600">{u.errorMsg ?? "Upload failed"}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded files list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Uploaded Files</h3>
          {uploads && uploads.length > 0 && (
            <span className="text-sm text-muted-foreground">{uploads.length} file{uploads.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : !uploads || uploads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border rounded-2xl bg-muted/20 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No files uploaded yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Upload a PDF to get started</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid gap-3">
              {uploads.map((upload, i) => (
                <motion.div
                  key={upload.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04 }}
                  data-testid={`card-upload-${upload.id}`}
                >
                  <Card className="hover:shadow-md transition-shadow duration-200 border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-muted rounded-xl shrink-0">
                          {getFileIcon(upload.fileType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate" data-testid={`text-filename-${upload.id}`}>
                            {upload.fileName}
                          </h4>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <Badge
                              variant="outline"
                              className={`text-xs capitalize ${typeColor(upload.fileType)}`}
                              data-testid={`badge-filetype-${upload.id}`}
                            >
                              {upload.fileType}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{formatSize(upload.fileSize)}</span>
                            <span className="text-xs text-muted-foreground/50">
                              {new Date(upload.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {upload.status === "ready" && (
                            <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200 text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Ready
                            </Badge>
                          )}
                          {upload.status === "uploading" && (
                            <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 text-xs">
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Uploading
                            </Badge>
                          )}
                          {upload.status === "processing" && (
                            <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200 text-xs">
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Processing
                            </Badge>
                          )}
                          {upload.status === "error" && (
                            <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200 text-xs">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Error
                            </Badge>
                          )}
                          <Button
                            variant="default"
                            size="sm"
                            className="text-xs h-8 px-3"
                            onClick={() => handleStartProcessing(upload.id)}
                            disabled={upload.status !== "ready" || createProcessingJob.isPending}
                            data-testid={`button-process-${upload.id}`}
                          >
                            {createProcessingJob.isPending ? (
                              <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                            ) : (
                              <Cpu className="w-3 h-3 mr-1.5" />
                            )}
                            Process
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(upload.id)}
                            disabled={deleteUpload.isPending}
                            data-testid={`button-delete-${upload.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
