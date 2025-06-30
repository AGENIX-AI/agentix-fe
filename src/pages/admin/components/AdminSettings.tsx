import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function AdminSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-medium">System Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-assistants" className="text-xs">
                Max Assistants per Instructor
              </Label>
              <Input
                id="max-assistants"
                defaultValue="10"
                className="text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-timeout" className="text-xs">
                Session Timeout (minutes)
              </Label>
              <Input
                id="session-timeout"
                defaultValue="30"
                className="text-xs"
              />
            </div>
          </div>
          <Button className="text-xs">Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-medium">
            API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-xs">
              OpenAI API Key
            </Label>
            <Input
              id="api-key"
              type="password"
              defaultValue="sk-..."
              className="text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-limit" className="text-xs">
              Daily API Request Limit
            </Label>
            <Input id="api-limit" defaultValue="10000" className="text-xs" />
          </div>
          <Button className="text-xs">Update API Settings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-medium">Maintenance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">System Status</p>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Button variant="outline" className="text-xs w-full">
              Clear Cache
            </Button>
            <Button variant="outline" className="text-xs w-full">
              Generate System Report
            </Button>
            <Button variant="destructive" className="text-xs w-full">
              Restart Services
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
