import React from "react";
import { 
  useGetAnalyticsSummary, 
  useGetBloomDistribution, 
  useGetDifficultyDistribution, 
  useGetTopicCoverage 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function Analytics() {
  const { data: summary, isLoading: loadingSummary } = useGetAnalyticsSummary();
  const { data: bloomDist, isLoading: loadingBloom } = useGetBloomDistribution();
  const { data: diffDist, isLoading: loadingDiff } = useGetDifficultyDistribution();
  const { data: topicCov, isLoading: loadingTopics } = useGetTopicCoverage();

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground mt-2">Insights into your learning materials and coverage.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loadingSummary ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <StatCard label="Total Uploads" value={summary?.totalUploads} />
            <StatCard label="Notes Generated" value={summary?.totalNotes} />
            <StatCard label="Questions Available" value={summary?.totalQuestions} />
            <StatCard label="Avg Difficulty" value={summary?.avgDifficulty} isText />
          </>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Bloom Distribution */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Cognitive Levels (Bloom's Taxonomy)</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingBloom ? <Skeleton className="h-[300px] w-full" /> : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bloomDist} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} fontSize={12} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} />
                    <RechartsTooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Difficulty Distribution */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Difficulty Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDiff ? <Skeleton className="h-[300px] w-full" /> : (
              <div className="h-[300px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={diffDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="label"
                    >
                      {diffDist?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Topic Coverage Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Topic Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTopics ? <Skeleton className="h-64 w-full" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 rounded-t-lg">
                  <tr>
                    <th className="px-6 py-4 font-semibold rounded-tl-lg">Topic / Chapter</th>
                    <th className="px-6 py-4 font-semibold text-right">Notes</th>
                    <th className="px-6 py-4 font-semibold text-right">Questions</th>
                    <th className="px-6 py-4 font-semibold text-right rounded-tr-lg">Coverage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topicCov?.map((topic, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{topic.topic}</td>
                      <td className="px-6 py-4 text-right">{topic.notesCount}</td>
                      <td className="px-6 py-4 text-right">{topic.questionsCount}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${topic.coveragePercent}%` }}
                            />
                          </div>
                          <span className="w-10 font-medium">{topic.coveragePercent}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, isText = false }: { label: string, value: any, isText?: boolean }) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-6">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <h3 className={`text-3xl font-bold mt-2 ${isText ? 'capitalize text-primary' : ''}`}>
          {value || (isText ? 'N/A' : 0)}
        </h3>
      </CardContent>
    </Card>
  );
}
