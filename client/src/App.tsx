import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Stores from "./pages/Stores";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Purchases from "./pages/Purchases";
import Transfers from "./pages/Transfers";
import DailyCuts from "./pages/DailyCuts";
import { Login } from "./pages/Login";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";
import Customers from "./pages/Customers";
import Commissions from "./pages/Commissions";
import MovementHistory from "./pages/MovementHistory";
import StockAlerts from "./pages/StockAlerts";
import InventoryDashboard from "./pages/InventoryDashboard";



function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/login"} component={Login} />
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/stores"} component={Stores} />
      <Route path={"/products"} component={Products} />
      <Route path={"/suppliers"} component={Suppliers} />
      <Route path={"/inventory"} component={Inventory} />
      <Route path={"/sales"} component={Sales} />
      <Route path={"/purchases"} component={Purchases} />
      <Route path={"/transfers"} component={Transfers} />
      <Route path={"/daily-cuts"} component={DailyCuts} />
      <Route path={"/users"} component={Users} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/customers"} component={Customers} />
      <Route path={"/commissions"} component={Commissions} />
      <Route path={"/movement-history"} component={MovementHistory} />
      <Route path={"/stock-alerts"} component={StockAlerts} />
      <Route path={"/inventory-dashboard"} component={InventoryDashboard} />


      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
