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

export function Dashboard() {
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
        <LoadingState message="Loading dashboard data..." size="large" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <ProfileBanner />

      {/* Overview Section */}
      <div className="mx-6 p-3 space-y-6 overflow-y-auto pb-16">
        <section>
          <Small className="text-xl font-semibold mb-4 block">Overview</Small>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex justify-between items-center mb-2">
                <Small className="font-medium">Assistants Created</Small>
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Layout className="h-5 w-5" />
                </div>
              </div>
              <Small className="text-2xl font-bold block">
                {stats.assistantsCount}
              </Small>
              <ExtraSmall className="text-muted-foreground block">
                Total AI assistants you've created
              </ExtraSmall>
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <div className="flex justify-between items-center mb-2">
                <Small className="font-medium">Documents Uploaded</Small>
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <Small className="text-2xl font-bold block">
                {stats.documentsCount}
              </Small>
              <ExtraSmall className="text-muted-foreground block">
                Total documents in your library
              </ExtraSmall>
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <div className="flex justify-between items-center mb-2">
                <Small className="font-medium">Active Students</Small>
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <Small className="text-2xl font-bold block">
                {stats.activeStudentsCount}
              </Small>
              <ExtraSmall className="text-muted-foreground block">
                Students learning from your assistants
              </ExtraSmall>
            </div>
          </div>
        </section>

        {/* Assistant Activity Section */}
        <section className="mt-8">
          <Small className="text-xl font-semibold mb-4 block">
            Assistant Activity
          </Small>
          <div className="border rounded-lg bg-card overflow-hidden">
            <div className="p-4 border-b">
              <Small className="text-lg block">
                Top Assistants by Interaction
              </Small>
              <ExtraSmall className="text-muted-foreground block">
                Performance metrics for your AI assistants
              </ExtraSmall>
            </div>
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Small>Assistant Name</Small>
                    </TableHead>
                    <TableHead>
                      <Small>Total Interactions</Small>
                    </TableHead>
                    <TableHead>
                      <Small>Chat Count</Small>
                    </TableHead>
                    <TableHead>
                      <Small>Completion Rate</Small>
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
                Data based on interactions from the last 30 days
              </ExtraSmall>
              <ExtraSmall className="text-primary cursor-pointer block">
                View full report
              </ExtraSmall>
            </div>
          </div>
        </section>

        {/* Documents Section */}
        <section className="mt-8">
          <Small className="text-xl font-semibold mb-4 block">Documents</Small>
          <div className="border rounded-lg bg-card overflow-hidden">
            <div className="p-4 border-b">
              <Small className="text-lg block">Document Analytics</Small>
              <ExtraSmall className="text-muted-foreground block">
                View metrics for your uploaded documents
              </ExtraSmall>
            </div>
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Small>Document</Small>
                    </TableHead>
                    <TableHead>
                      <Small>Type</Small>
                    </TableHead>
                    <TableHead>
                      <Small>Views</Small>
                    </TableHead>
                    <TableHead>
                      <Small>Upload Date</Small>
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
                View all documents
              </ExtraSmall>
            </div>
          </div>
        </section>

        {/* Students Section */}
        <section className="mt-8">
          <Small className="text-xl font-semibold mb-4 block">Students</Small>
          <div className="border rounded-lg bg-card overflow-hidden">
            <div className="p-4 border-b">
              <Small className="text-lg block">Student Progress</Small>
              <ExtraSmall className="text-muted-foreground block">
                Current learning status of your students
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
                          Last active
                        </ExtraSmall>
                        <ExtraSmall className="font-medium">
                          {new Date(student.lastActive).toLocaleDateString()}
                        </ExtraSmall>
                      </div>
                      <Badge variant="outline">
                        <ExtraSmall>{student.progress}% Complete</ExtraSmall>
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t">
              <ExtraSmall className="text-primary cursor-pointer block">
                View all students
              </ExtraSmall>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
