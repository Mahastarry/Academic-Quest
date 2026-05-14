import React, { useState } from "react";
import { useListNotes } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, BookOpen, Check, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function Notes() {
  const [search, setSearch] = useState("");
  const { data: notes, isLoading } = useListNotes({ search });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Study Notes</h2>
          <p className="text-muted-foreground mt-2">AI-generated structured notes from your materials.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search notes..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-96 w-full rounded-2xl" />)}
        </div>
      ) : notes?.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium">No notes found</h3>
          <p className="text-muted-foreground">Upload documents to generate study notes.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {notes?.map((note, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={note.id}
            >
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                {/* Header with gradient */}
                <div className="bg-gradient-to-br from-primary/5 to-transparent p-6 border-b border-border/50">
                  <div className="text-sm font-semibold text-primary mb-2 flex items-center uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {note.chapter}
                  </div>
                  <h3 className="text-xl font-bold leading-tight">{note.title}</h3>
                </div>

                <div className="p-6 flex-1 space-y-6 overflow-y-auto max-h-[600px] custom-scrollbar">
                  
                  {/* Definitions */}
                  {note.definitions && note.definitions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Key Definitions</h4>
                      <div className="space-y-2">
                        {note.definitions.map((def, i) => (
                          <div key={i} className="text-sm leading-relaxed">
                            <span className="bg-yellow-100 text-yellow-900 px-1.5 py-0.5 rounded font-medium mr-2 border border-yellow-200">{def.split(':')[0]}</span>
                            <span className="text-muted-foreground">{def.split(':').slice(1).join(':')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Formula Blocks */}
                  {note.formulaBlocks && note.formulaBlocks.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Formulas & Code</h4>
                      {note.formulaBlocks.map((formula, i) => (
                        <div key={i} className="bg-muted p-4 rounded-lg border border-border/50 overflow-x-auto">
                          <code className="text-sm font-mono text-foreground whitespace-pre-wrap">{formula}</code>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Main Content */}
                  {note.content && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Overview</h4>
                      <div className="prose prose-sm prose-gray max-w-none">
                        {note.content}
                      </div>
                    </div>
                  )}

                  {/* Key Takeaways */}
                  {note.keyTakeaways && note.keyTakeaways.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-border/50">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Takeaways</h4>
                      <ul className="space-y-2">
                        {note.keyTakeaways.map((takeaway, i) => (
                          <li key={i} className="flex items-start text-sm">
                            <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                            <span>{takeaway}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
