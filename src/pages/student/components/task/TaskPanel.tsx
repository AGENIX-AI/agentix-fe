import { memo, useMemo } from "react";

type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO or display string
  comments: number;
  attachments: number;
  assigneeAvatar?: string;
  tag: {
    label: string;
    color: "primary" | "success" | "accent";
  };
};

type Column = {
  id: "backlog" | "inProgress" | "done";
  title: string;
  tasks: Task[];
};

const Tag = memo(function Tag({
  label,
  color,
}: {
  label: string;
  color: Task["tag"]["color"];
}) {
  const colorClass = useMemo(() => {
    switch (color) {
      case "primary":
        return "bg-primary/15 text-primary";
      case "success":
        return "bg-success/15 text-success";
      default:
        return "bg-accent/20 text-accent-foreground";
    }
  }, [color]);

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold ${colorClass}`}
    >
      {label}
    </span>
  );
});

const TaskCard = memo(function TaskCard({ task }: { task: Task }) {
  return (
    <article className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <Tag label={task.tag.label} color={task.tag.color} />
          <button
            className="h-6 w-6 inline-flex items-center justify-center rounded-md hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="More actions"
          >
            <span className="sr-only">More</span>
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 opacity-70"
              aria-hidden="true"
            >
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </div>
        <p className="mt-4 text-sm text-foreground/90">{task.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="inline-flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 4v14h10V6H7z" />
              </svg>
              <span>{task.dueDate}</span>
            </div>
            <div className="inline-flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
              </svg>
              <span>{task.comments}</span>
            </div>
            <div className="inline-flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path d="M4 7l8-5 8 5v10l-8 5-8-5V7z" />
              </svg>
              <span>{task.attachments}</span>
            </div>
          </div>
          {task.assigneeAvatar ? (
            <img
              src={task.assigneeAvatar}
              alt="assignee"
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-muted" aria-hidden="true" />
          )}
        </div>
      </div>
    </article>
  );
});

function Column({ column }: { column: Column }) {
  return (
    <section aria-labelledby={`col-${column.id}-title`} className="space-y-3">
      <h3
        id={`col-${column.id}-title`}
        className="text-lg font-semibold text-foreground"
      >
        {column.title}
      </h3>
      <div className="space-y-3">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}

export default function TaskPanel() {
  const columns: Column[] = useMemo(
    () => [
      {
        id: "backlog",
        title: "Back-log",
        tasks: [
          {
            id: "t1",
            title: "Copywriting",
            description:
              "Sint ex excepteur proident adipisicing adipisicing occaecat pariatur.",
            dueDate: "Mar 14",
            comments: 2,
            attachments: 4,
            assigneeAvatar: "https://i.pravatar.cc/24?img=1",
            tag: { label: "Copywriting", color: "accent" },
          },
          {
            id: "t2",
            title: "Research",
            description:
              "Sint ex excepteur proident adipisicing occaecat pariatur.",
            dueDate: "Mar 14",
            comments: 2,
            attachments: 4,
            assigneeAvatar: "https://i.pravatar.cc/24?img=2",
            tag: { label: "Research", color: "success" },
          },
          {
            id: "t3",
            title: "Web Design",
            description: "Dolor duis ipsum nulla ipsum voluptate.",
            dueDate: "Mar 14",
            comments: 2,
            attachments: 4,
            assigneeAvatar: "https://i.pravatar.cc/24?img=3",
            tag: { label: "Web Design", color: "primary" },
          },
        ],
      },
      {
        id: "inProgress",
        title: "In Progress",
        tasks: [
          {
            id: "t4",
            title: "Copywriting",
            description:
              "Sint ex excepteur proident adipisicing adipisicing occaecat pariatur.",
            dueDate: "Mar 14",
            comments: 2,
            attachments: 4,
            assigneeAvatar: "https://i.pravatar.cc/24?img=4",
            tag: { label: "Copywriting", color: "accent" },
          },
          {
            id: "t5",
            title: "Web Design",
            description: "Dolor duis ipsum nulla ipsum voluptate.",
            dueDate: "Mar 14",
            comments: 2,
            attachments: 4,
            assigneeAvatar: "https://i.pravatar.cc/24?img=5",
            tag: { label: "Web Design", color: "primary" },
          },
        ],
      },
      {
        id: "done",
        title: "Done",
        tasks: [
          {
            id: "t6",
            title: "Copywriting",
            description:
              "Sint ex excepteur proident adipisicing adipisicing occaecat pariatur.",
            dueDate: "Mar 14",
            comments: 2,
            attachments: 4,
            assigneeAvatar: "https://i.pravatar.cc/24?img=6",
            tag: { label: "Copywriting", color: "accent" },
          },
          {
            id: "t7",
            title: "Research",
            description:
              "Sint ex excepteur proident adipisicing occaecat pariatur.",
            dueDate: "Mar 14",
            comments: 2,
            attachments: 4,
            assigneeAvatar: "https://i.pravatar.cc/24?img=7",
            tag: { label: "Research", color: "success" },
          },
          {
            id: "t8",
            title: "Web Design",
            description: "Dolor duis ipsum nulla ipsum voluptate.",
            dueDate: "Mar 14",
            comments: 2,
            attachments: 4,
            assigneeAvatar: "https://i.pravatar.cc/24?img=8",
            tag: { label: "Web Design", color: "primary" },
          },
        ],
      },
    ],
    []
  );

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-20 bg-background flex h-18 border-b p-4 items-center gap-3 w-full border-l">
        <h2 className="text-xl font-semibold">Tasks</h2>
      </header>
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {columns.map((col) => (
            <Column key={col.id} column={col} />
          ))}
        </div>
      </div>
    </div>
  );
}
