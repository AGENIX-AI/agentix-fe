import { useState, useEffect } from "react";
import type { Assistant } from "@/api/assistants";
import {
  getAssistantStats,
  type AssistantStatsResponse,
} from "@/api/assistants";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, MessageSquare, FileText, AlertCircle } from "lucide-react";

interface AssistantDashboardProps {
  assistant: Assistant;
}

export function AssistantDashboard({ assistant }: AssistantDashboardProps) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AssistantStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const statsData = await getAssistantStats(assistant.id);
        setStats(statsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching assistant stats:", err);
        setError(
          t("assistant.dashboard.error", "Failed to load assistant statistics")
        );
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [assistant.id, t]);

  // Calculate total conversations
  const totalConversations = stats?.conversation_counts_by_type
    ? Object.values(stats.conversation_counts_by_type).reduce(
        (sum, count) => sum + count,
        0
      )
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">
          {t("assistant.dashboard.title", "Assistant Dashboard")}
        </h3>
        <p className="text-muted-foreground">
          {t(
            "assistant.dashboard.description",
            "Performance overview and statistics for this assistant."
          )}
        </p>
      </div>

      {loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Skeleton className="h-5 w-5 mr-2" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Skeleton className="h-2 w-2 rounded-full mr-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t(
                    "assistant.dashboard.total_conversations",
                    "Total Conversations"
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">
                    {totalConversations}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("assistant.dashboard.students", "Students")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">
                    {stats.students_count}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("assistant.dashboard.documents", "Documents")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">
                    {stats.documents_count}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {Object.keys(stats.conversation_counts_by_type).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t(
                    "assistant.dashboard.conversation_types",
                    "Conversation Types"
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.conversation_counts_by_type).map(
                    ([type, count]) => (
                      <div
                        key={type}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                          <span>{type}</span>
                        </div>
                        <span className="font-medium">{count}</span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Card>
        <CardContent className="pt-6">
          <p className="font-medium">{assistant.name}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {assistant.tagline}
          </p>
          {assistant.speciality && (
            <p className="text-sm mt-2">
              <span className="font-medium">
                {t("assistant.speciality", "Speciality")}:
              </span>{" "}
              {assistant.speciality}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
