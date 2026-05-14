import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

// Pages
import Dashboard from "@/pages/Dashboard";
import Upload from "@/pages/Upload";
import Processing from "@/pages/Processing";
import Notes from "@/pages/Notes";
import Questions from "@/pages/Questions";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

import AppLayout from "@/components/layout/AppLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AnimatedSwitch() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        <Switch location={location}>
          <Route path="/" component={Dashboard} />
          <Route path="/upload" component={Upload} />
          <Route path="/processing" component={Processing} />
          <Route path="/notes" component={Notes} />
          <Route path="/questions" component={Questions} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppLayout>
            <AnimatedSwitch />
          </AppLayout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
