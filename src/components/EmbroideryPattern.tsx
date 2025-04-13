
import { cn } from "@/lib/utils";

interface EmbroideryPatternProps {
  className?: string;
  height?: string;
}

const EmbroideryPattern = ({ className, height = "h-2" }: EmbroideryPatternProps) => {
  return (
    <div className={cn("border-pattern", height, className)}></div>
  );
};

export default EmbroideryPattern;
