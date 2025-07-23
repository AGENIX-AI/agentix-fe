export default function DocumentGuidelines() {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center space-x-2">
        <div className="w-1 h-3 bg-muted-foreground/50 rounded-full"></div>
        <p className="text-xs font-medium">Document Guidelines</p>
      </div>

      <div className="flex flex-col space-y-2 md:flex-row md:space-x-4 md:space-y-0">
        <div className="p-3 border border-border/80 rounded-md flex-1 bg-accent/5 hover:bg-accent/10 transition-colors">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-1 h-2 bg-primary/70 rounded-full"></div>
            <p className="text-xs font-medium">Accepted File Types</p>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 pl-2">
            <li className="flex items-center space-x-1">
              <span className="w-1 h-1 bg-primary/50 rounded-full"></span>
              <span>Documents (PDF, DOC, DOCX)</span>
            </li>
            <li className="flex items-center space-x-1">
              <span className="w-1 h-1 bg-primary/50 rounded-full"></span>
              <span>Markdown (.md, .markdown)</span>
            </li>
          </ul>
        </div>

        <div className="p-3 border border-border/80 rounded-md flex-1 bg-accent/5 hover:bg-accent/10 transition-colors">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-1 h-2 bg-primary/70 rounded-full"></div>
            <p className="text-xs font-medium">Size Limits</p>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 pl-2">
            <li className="flex items-center space-x-1">
              <span className="w-1 h-1 bg-primary/50 rounded-full"></span>
              <span>Maximum file size: 10MB</span>
            </li>
            <li className="flex items-center space-x-1">
              <span className="w-1 h-1 bg-primary/50 rounded-full"></span>
              <span>Recommended image resolution: 1920×1080</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
