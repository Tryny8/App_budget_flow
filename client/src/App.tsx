import { Switch, Route, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BudgetDashboard from "@/pages/budget-dashboard";
import NotFound from "@/pages/not-found";
import { useLocation } from "wouter";
const [location] = useLocation();
console.log("Current location:", location);

function Router() {
  return (
    <WouterRouter hook={useHashLocation}> {/* <= AJOUT DU HOOK */}
      <Switch>
        <Route path="/" component={BudgetDashboard} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
