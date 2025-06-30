import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  Bot,
  GraduationCap,
  Users,
  Check,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  adminApi,
  type CountStatsResponse,
  type WaitlistEntry,
} from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AdminDashboard() {
  const [stats, setStats] = useState<CountStatsResponse | null>(null);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [waitlistLoading, setWaitlistLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setWaitlistLoading(true);
        setError(null);

        const [statsData, waitlistData] = await Promise.all([
          adminApi.getCountStats(),
          adminApi.getWaitlist(),
        ]);

        setStats(statsData);
        setWaitlist(waitlistData.filter((entry) => !entry.approved));
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
        setWaitlistLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApproveWaitlist = async (userId: string) => {
    try {
      setApprovingIds((prev) => new Set([...prev, userId]));
      await adminApi.approveWaitlist(userId);

      // Remove from waitlist and update stats
      setWaitlist((prev) => prev.filter((entry) => entry.user_id !== userId));
      setStats((prev) =>
        prev
          ? {
              ...prev,
              waitlist_false_count: prev.waitlist_false_count - 1,
            }
          : null
      );
    } catch (err) {
      console.error("Failed to approve waitlist:", err);
    } finally {
      setApprovingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const dashboardStats = [
    {
      title: "Total Assistants",
      value: loading ? "..." : stats?.assistants_count.toString() || "0",
      icon: Bot,
      description: "Active AI assistants",
    },
    {
      title: "Total Users",
      value: loading ? "..." : stats?.users_count.toString() || "0",
      icon: Users,
      description: "Registered users",
    },
    {
      title: "Active Conversations",
      value: loading ? "..." : stats?.conversations_count.toString() || "0",
      icon: LayoutDashboard,
      description: "Current chat sessions",
    },
    {
      title: "Pending Approvals",
      value: loading ? "..." : stats?.waitlist_false_count.toString() || "0",
      icon: GraduationCap,
      description: "Waitlist applications",
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm underline"
              >
                Try again
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Waitlist Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-medium">
            Waitlist Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {waitlistLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-xs">Loading waitlist...</div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium text-muted-foreground">
                      User ID
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">
                      Role
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">
                      Field
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">
                      Business
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitlist.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-xs text-muted-foreground"
                      >
                        No pending approvals
                      </TableCell>
                    </TableRow>
                  ) : (
                    waitlist.map((entry) => (
                      <TableRow
                        key={entry.user_id}
                        className="hover:bg-muted/50"
                      >
                        <TableCell className="text-xs">
                          <span className="font-mono text-muted-foreground">
                            {entry.user_id.slice(0, 8)}...
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge
                            variant="secondary"
                            className="text-xs h-5 px-2 capitalize font-medium"
                          >
                            {entry.metadata.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {entry.metadata.field}
                        </TableCell>
                        <TableCell className="text-xs">
                          {entry.metadata.business}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 hover:border-green-300"
                              onClick={() =>
                                handleApproveWaitlist(entry.user_id)
                              }
                              disabled={approvingIds.has(entry.user_id)}
                            >
                              {approvingIds.has(entry.user_id) ? (
                                <span className="text-xs">...</span>
                              ) : (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  <span className="text-xs">Approve</span>
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                              disabled={approvingIds.has(entry.user_id)}
                            >
                              <X className="h-3 w-3 mr-1" />
                              <span className="text-xs">Reject</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
