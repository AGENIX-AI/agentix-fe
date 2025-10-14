import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Container } from "@/components/layout/container";
import { workspaceService } from "@/services/workspaces";
import type { CreateWorkspaceRequest } from "@/services/workspaces/types";

export default function WorkspaceOnboarding() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // If user already has a workspace, redirect to working page
  useEffect(() => {
    let isMounted = true;
    workspaceService
      .list()
      .then((res) => {
        if (!isMounted) return;
        const count = res.items?.length || 0;
        if (count > 0) {
          navigate("/working", { replace: true });
        }
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const isValidHttpUrl = (value: string): boolean => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmedImageUrl = imageUrl.trim();

    // Validate optional image URL: must be a valid http(s) URL if provided
    if (trimmedImageUrl && !isValidHttpUrl(trimmedImageUrl)) {
      setError("Image URL must be a valid http(s) URL");
      return;
    }

    setLoading(true);
    const payload: CreateWorkspaceRequest = {
      name,
      description: description || undefined,
      image_url: trimmedImageUrl || undefined,
      is_default: true,
    };
    try {
      await workspaceService.create(payload);
      navigate("/working", { replace: true });
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create your first workspace</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., My Team"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Image URL
              </label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... (optional)"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create workspace"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
