import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-2">Manage your account preferences and AI settings.</p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>AI Model Preferences</CardTitle>
          <CardDescription>Configure how MSCQuest generates content.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="model-select">Primary Engine</Label>
            <Select defaultValue="gpt-4">
              <SelectTrigger id="model-select" className="w-full md:w-[300px]">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4 (Most Accurate)</SelectItem>
                <SelectItem value="gpt-3.5">GPT-3.5 (Faster)</SelectItem>
                <SelectItem value="claude">Claude 3 Opus</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Higher accuracy models may take longer to process large textbooks.</p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Aggressive Chunking</Label>
              <p className="text-sm text-muted-foreground">Break documents into smaller pieces for deeper analysis.</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Auto-generate MCQs</Label>
              <p className="text-sm text-muted-foreground">Automatically queue MCQ generation after study notes complete.</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Control when and how you receive alerts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Processing Complete</Label>
              <p className="text-sm text-muted-foreground">Notify when a document finishes processing.</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Email Summaries</Label>
              <p className="text-sm text-muted-foreground">Weekly report of study progress and analytics.</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Cancel</Button>
        <Button>Save Preferences</Button>
      </div>
    </div>
  );
}
