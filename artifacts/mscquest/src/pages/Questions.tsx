import React, { useState } from "react";
import { useListQuestions } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Quote, Brain, Check, X, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Questions() {
  const { data: questions, isLoading } = useListQuestions();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  const handleOptionClick = (questionId: number, optionIndex: number) => {
    if (selectedAnswers[questionId] !== undefined) return; // Prevent changing answer
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 border-green-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getBloomColor = (level: string) => {
    switch (level) {
      case "remember": return "bg-slate-100 text-slate-800";
      case "understand": return "bg-blue-100 text-blue-800";
      case "apply": return "bg-indigo-100 text-indigo-800";
      case "analyze": return "bg-purple-100 text-purple-800";
      case "evaluate": return "bg-fuchsia-100 text-fuchsia-800";
      case "create": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Review Questions</h2>
          <p className="text-muted-foreground mt-2">Test your understanding with adaptive MCQs.</p>
        </div>
        <Button variant="outline" className="w-fit">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
        </div>
      ) : questions?.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border">
          <Brain className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium">No questions yet</h3>
          <p className="text-muted-foreground">Process documents to generate questions.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {questions?.map((q, qIndex) => {
            const isAnswered = selectedAnswers[q.id] !== undefined;
            const isCorrect = selectedAnswers[q.id] === q.correctAnswer;

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qIndex * 0.1 }}
                key={q.id}
              >
                <Card className="overflow-hidden hover-elevate transition-shadow border-border">
                  <CardContent className="p-0">
                    <div className="p-6 md:p-8">
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Badge variant="outline" className="uppercase font-semibold tracking-wider text-[10px]">
                          {q.chapter}
                        </Badge>
                        <Badge variant="outline" className={`uppercase font-semibold tracking-wider text-[10px] ${getDifficultyColor(q.difficulty)}`}>
                          {q.difficulty}
                        </Badge>
                        <Badge variant="outline" className={`uppercase font-semibold tracking-wider text-[10px] ${getBloomColor(q.bloomLevel)}`}>
                          {q.bloomLevel}
                        </Badge>
                      </div>

                      <h3 className="text-xl font-medium mb-6 leading-relaxed">
                        {q.question}
                      </h3>

                      <div className="space-y-3">
                        {q.options.map((option, oIndex) => {
                          const isSelected = selectedAnswers[q.id] === oIndex;
                          const isCorrectOption = q.correctAnswer === oIndex;
                          
                          let optionClass = "border-border hover:bg-accent/50 hover:border-primary/50 text-foreground cursor-pointer";
                          let icon = null;

                          if (isAnswered) {
                            optionClass = "border-border opacity-60 cursor-default"; // Default state after answering
                            if (isCorrectOption) {
                              optionClass = "border-green-500 bg-green-50 text-green-900 shadow-sm opacity-100 z-10 relative";
                              icon = <Check className="w-5 h-5 text-green-600 ml-auto" />;
                            } else if (isSelected && !isCorrectOption) {
                              optionClass = "border-red-500 bg-red-50 text-red-900 opacity-100";
                              icon = <X className="w-5 h-5 text-red-600 ml-auto" />;
                            }
                          }

                          return (
                            <div
                              key={oIndex}
                              onClick={() => handleOptionClick(q.id, oIndex)}
                              className={`p-4 rounded-xl border transition-all flex items-center ${optionClass}`}
                            >
                              <div className={`w-6 h-6 rounded-md flex items-center justify-center text-sm font-bold mr-4 shrink-0 
                                ${isAnswered && isCorrectOption ? "bg-green-200 text-green-800" : 
                                  isAnswered && isSelected ? "bg-red-200 text-red-800" : 
                                  "bg-muted text-muted-foreground"}`}
                              >
                                {String.fromCharCode(65 + oIndex)}
                              </div>
                              <span className="flex-1">{option}</span>
                              {icon}
                            </div>
                          );
                        })}
                      </div>

                      <AnimatePresence>
                        {isAnswered && q.evidenceQuote && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                            className="bg-muted/50 p-4 rounded-xl border border-border/50 text-sm"
                          >
                            <div className="flex items-start">
                              <Quote className="w-4 h-4 text-primary mr-2 mt-0.5 shrink-0" />
                              <div className="text-muted-foreground italic">
                                "{q.evidenceQuote}"
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
