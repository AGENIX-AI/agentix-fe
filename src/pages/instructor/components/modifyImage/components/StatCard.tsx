import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number;
}

export function StatCard({ title, value }: StatCardProps) {
  return (
    <Card className="p-3 text-center">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </Card>
  );
}
