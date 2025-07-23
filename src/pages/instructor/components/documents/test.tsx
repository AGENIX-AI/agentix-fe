import { DocumentsLayout } from "./index";

export default function DocumentsTest() {
  return (
    <div className="h-screen w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Documents Test Page</h1>
      <div className="h-[calc(100vh-120px)] border border-border rounded-lg overflow-hidden">
        <DocumentsLayout />
      </div>
    </div>
  );
}
