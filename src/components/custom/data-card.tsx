import { type ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * DataCard props interface
 */
interface DataCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: number;
  icon?: ReactNode;
  className?: string;
}

/**
 * DataCard component
 *
 * A specialized card component for displaying metrics and data points
 * with optional trends and icons. Built on top of the base Card component.
 *
 * @example
 * ```tsx
 * <DataCard
 *   title="Total Users"
 *   value="2,543"
 *   description="Active users in the past month"
 *   trend={12.5}
 *   icon={<Users className="h-5 w-5" />}
 * />
 * ```
 */
export function DataCard({
  title,
  value,
  description,
  trend,
  icon,
  className,
}: DataCardProps) {
  const showTrend = trend !== undefined;
  const isPositive = trend && trend > 0;
  const formattedTrend = trend ? Math.abs(trend).toFixed(1) : "0";

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {icon && <div className="rounded-full bg-muted p-2">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}

        {showTrend && (
          <div className="flex items-center mt-4">
            <Badge>
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{formattedTrend}%</span>
            </Badge>
            <span className="text-xs text-muted-foreground ml-2">
              from previous period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
