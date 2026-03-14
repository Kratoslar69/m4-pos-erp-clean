import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && user) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="max-w-md w-full mx-auto p-8 text-center space-y-8">
        <div className="space-y-4">
          <img src="/logo-m4.png" alt="M4" className="h-24 w-auto mx-auto" />
          <h1 className="text-4xl font-bold m4-text-gradient">M4 POS</h1>
          <p className="text-xl text-muted-foreground">Sistema ERP</p>
        </div>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Sistema de gestión para tiendas de telefonía móvil
          </p>
          <Button
            size="lg"
            className="w-full bg-orange-500 hover:bg-orange-600"
            onClick={() => setLocation("/login")}
          >
            Iniciar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
