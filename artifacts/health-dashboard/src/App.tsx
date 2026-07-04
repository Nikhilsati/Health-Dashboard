import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";

// Pages
import Dashboard from "@/pages/dashboard";
import Trends from "@/pages/trends";
import Category from "@/pages/category";
import Reports from "@/pages/reports";
import Insights from "@/pages/insights";
import Compare from "@/pages/compare";
import Search from "@/pages/search";
import BodyPage from "@/pages/body";
import Copilot from "@/pages/copilot";
import Missions from "@/pages/missions";
import Tracking from "@/pages/tracking";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/copilot" component={Copilot} />
        <Route path="/missions" component={Missions} />
        <Route path="/tracking" component={Tracking} />
        <Route path="/trends" component={Trends} />
        <Route path="/category/:slug" component={Category} />
        <Route path="/reports" component={Reports} />
        <Route path="/insights" component={Insights} />
        <Route path="/compare" component={Compare} />
        <Route path="/search" component={Search} />
        <Route path="/body" component={BodyPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
