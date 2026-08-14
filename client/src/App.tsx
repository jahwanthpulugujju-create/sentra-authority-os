import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CheckCircle2, CircleAlert, Info, TriangleAlert } from "lucide-react";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import MobileReview from "./pages/MobileReview";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/review" component={MobileReview} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" closeButton icons={{ success: <CheckCircle2 className="h-4 w-4" />, error: <CircleAlert className="h-4 w-4" />, warning: <TriangleAlert className="h-4 w-4" />, info: <Info className="h-4 w-4" /> }} toastOptions={{ classNames: { toast: "sentra-toast", success: "sentra-toast-success", error: "sentra-toast-error", warning: "sentra-toast-warning", info: "sentra-toast-info" } }} />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
