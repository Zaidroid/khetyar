
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import EmbroideryPattern from "@/components/EmbroideryPattern";

const NotFound = () => {
  return (
    <div className="flex flex-col h-screen max-h-screen bg-background">
      <EmbroideryPattern className="from-khetyar-red" />
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <div className="w-20 h-20 bg-khetyar-red bg-opacity-10 rounded-full flex items-center justify-center mb-4">
          <span className="text-khetyar-red font-bold text-3xl">404</span>
        </div>
        <h1 className="text-3xl font-bold mb-2 font-english">Page Not Found</h1>
        <p className="text-muted-foreground mb-6 font-english">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button asChild>
          <Link to="/" className="font-english">
            Return to Khetyar
          </Link>
        </Button>
      </div>
      <EmbroideryPattern className="from-khetyar-olive" />
    </div>
  );
};

export default NotFound;
