import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Small, ExtraSmall } from "@/components/typography";
import { FileText, Layout, Users } from "lucide-react";
import { useInstructor } from "@/contexts/InstructorContext";
import { LoadingState } from "@/components/loading-state";
import {
  fetchDashboardData,
  type DashboardStats,
  type AssistantStats,
  type DocumentStats,
  type StudentStats,
} from "@/services/dashboardService";
import { ProfileBanner } from "../instructorProfile";
import { useTranslation } from "react-i18next";

export function Dashboard() {
  const { t } = useTranslation();
  const { instructorId } = useInstructor();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    assistantsCount: 0,
    documentsCount: 0,
    activeStudentsCount: 0,
  });
  const [assistants, setAssistants] = useState<AssistantStats[]>([]);
  const [documents, setDocuments] = useState<DocumentStats[]>([]);
  const [students, setStudents] = useState<StudentStats[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        if (instructorId) {
          // Fetch dashboard data from service
          const dashboardData = await fetchDashboardData(instructorId);

          // Update state with fetched data
          setStats(dashboardData.stats);
          setAssistants(dashboardData.assistants);
          setDocuments(dashboardData.documents);
          setStudents(dashboardData.students);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Handle error state
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [instructorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingState message={t('dashboard.loadingMessage')} size="large" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <ProfileBanner />

      {/* Overview Section */}
      <div className="mx-6 p-3 space-y-6 overflow-y-auto pb-16">
        <section>
          <Small className="text-xl font-semibold mb-4 block">{t('dashboard.overview')}</Small>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex justify-between items-center mb-2">
                <Small className="font-medium">{t('dashboard.assistantsCreated')}</Small>
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Layout className="h-5 w-5" />
                </div>
              </div>
              <Small className="text-2xl font-bold block">
                {stats.assistantsCount}
              </Small>
              <ExtraSmall className="text-muted-foreground block">
                {t('dashboard.totalAIAssistants')}
              </ExtraSmall>
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <div className="flex justify-between items-center mb-2">
                <Small className="font-medium">{t('dashboard.documentsUploaded')}</Small>
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <Small className="text-2xl font-bold block">
                {stats.documentsCount}
              </Small>
              <ExtraSmall className="text-muted-foreground block">
                {t('dashboard.totalDocuments')}
              </ExtraSmall>
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <div className="flex justify-between items-center mb-2">
                <Small className="font-medium">{t('dashboard.activeStudents')}</Small>
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <Small className="text-2xl font-bold block">
                {stats.activeStudentsCount}
              </Small>
              <ExtraSmall className="text-muted-foreground block">
                {t('dashboard.studentsLearning')}
              </ExtraSmall>
            </div>
          </div>
        </section>

        {/* Assistant Activity Section */}
        <section className="mt-8">
          <Small className="text-xl font-semibold mb-4 block">
            {t('dashboard.assistantActivity')}
          </Small>
          <div className="border rounded-lg bg-card overflow-hidden">
            <div className="p-4 border-b">
              <Small className="text-lg block">
                {t('dashboard.topAssistants')}
              </Small>
              <ExtraSmall className="text-muted-foreground block">
                {t('dashboard.performanceMetrics')}
              </ExtraSmall>
            </div>
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Small>{t('dashboard.assistantName')}</Small>
                    </TableHead>
                    <TableHead>
                      <Small>{t('dashboard.totalInteractions')}</Small>
                    </TableHead>
                    <TableHead>
                      <Small>{t('dashboard.chatCount')}</Small>
                    </TableHead>
                    <TableHead>
                      <Small>{t('dashboard.completionRate')}</Small>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assistants.map((assistant) => (
                    <TableRow key={assistant.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {assistant.avatar ? (
                              <AvatarImage
                                src={assistant.avatar}
                                alt={assistant.name}
                              />
                            ) : (
                              <AvatarFallback>
                                {assistant.name[0].toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <ExtraSmall>{assistant.name}</ExtraSmall>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ExtraSmall>{assistant.interactions}</ExtraSmall>
                      </TableCell>
                      <TableCell>
                        <ExtraSmall>{assistant.chatCount}</ExtraSmall>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={assistant.completionRate}
                            className="w-24"
                          />
                          <ExtraSmall>{assistant.completionRate}%</ExtraSmall>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 border-t flex justify-between">
              <ExtraSmall className="text-muted-foreground block">
                {t('dashboard.dataBasedOn30Days')}
              </ExtraSmall>
              <ExtraSmall className="text-primary cursor-pointer block">
                {t('dashboard.viewFullReport')}
              </ExtraSmall>
            </div>
          </div>
        </section>

        {/* Documents Section */}
        <section className="mt-8">
          <Small className="text-xl font-semibold mb-4 block">{t('dashboard.documents')}</Small>
          <div className="border rounded-lg bg-card overflow-hidden">
            <div className="p-4 border-b">
              <Small className="text-lg block">{t('dashboard.documentAnalytics')}</Small>
              <ExtraSmall className="text-muted-foreground block">
                {t('dashboard.viewMetrics')}
              </ExtraSmall>
            </div>
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Small>{t('dashboard.document')}</Small>
                    </TableHead>
                    <TableHead>
                      <Small>{t('dashboard.type')}</Small>
                    </TableHead>
                    <TableHead>
                      <Small>{t('dashboard.views')}</Small>
                    </TableHead>
                    <TableHead>
                      <Small>{t('dashboard.uploadDate')}</Small>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <ExtraSmall>{doc.title}</ExtraSmall>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          <ExtraSmall>{doc.type}</ExtraSmall>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ExtraSmall>{doc.views}</ExtraSmall>
                      </TableCell>
                      <TableCell>
                        <ExtraSmall>
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </ExtraSmall>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 border-t">
              <ExtraSmall className="text-primary cursor-pointer block">
                {t('dashboard.viewAllDocuments')}
              </ExtraSmall>
            </div>
          </div>
        </section>

        {/* Students Section */}
        <section className="mt-8">
          <Small className="text-xl font-semibold mb-4 block">{t('dashboard.students')}</Small>
          <div className="border rounded-lg bg-card overflow-hidden">
            <div className="p-4 border-b">
              <Small className="text-lg block">{t('dashboard.studentProgress')}</Small>
              <ExtraSmall className="text-muted-foreground block">
                {t('dashboard.currentLearningStatus')}
              </ExtraSmall>
            </div>
            <div className="p-4">
              <div className="space-y-8">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center gap-4">
                    <Avatar>
                      {student.avatar ? (
                        <AvatarImage src={student.avatar} alt={student.name} />
                      ) : (
                        <AvatarFallback>
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <ExtraSmall className="font-medium">
                            {student.name}
                          </ExtraSmall>
                          <ExtraSmall className="text-xs text-muted-foreground">
                            {student.currentTopic}
                          </ExtraSmall>
                        </div>
                      </div>
                      <Progress value={student.progress} className="h-2" />
                    </div>

                    <div className="text-right">
                      <div>
                        <ExtraSmall className="text-xs text-muted-foreground">
                          {t('dashboard.lastActive')}
                        </ExtraSmall>
                        <ExtraSmall className="font-medium">
                          {new Date(student.lastActive).toLocaleDateString()}
                        </ExtraSmall>
                      </div>
                      <Badge variant="outline">
                        <ExtraSmall>{student.progress}% {t('dashboard.complete')}</ExtraSmall>
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t">
              <ExtraSmall className="text-primary cursor-pointer block">
                {t('dashboard.viewAllStudents')}
              </ExtraSmall>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
