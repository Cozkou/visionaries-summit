import type { DataSourceRef, SourcedInsight } from "@/types";

interface DataSourcesPanelProps {
  sources: DataSourceRef[];
  insights?: SourcedInsight[];
  title?: string;
}

export function DataSourcesPanel({
  sources,
  insights,
  title = "Data sources",
}: DataSourcesPanelProps) {
  return (
    <section className="space-y-3 rounded-lg border bg-muted/30 p-4">
      <h2 className="text-sm font-medium">{title}</h2>
      <p className="text-xs text-muted-foreground">
        Metrics and tables are computed only from the Pretty Fly hackathon data
        pack (24 months). The data pack includes no product photography.
      </p>
      <ul className="space-y-2 text-sm">
        {sources.map((source) => (
          <li key={source.id}>
            <a
              href={source.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {source.label}
            </a>
            <span className="text-muted-foreground">
              {" "}
              — {source.description} (
              <code className="text-xs">{source.file}</code>)
            </span>
          </li>
        ))}
      </ul>
      {insights && insights.length > 0 && (
        <div className="space-y-1 border-t pt-3">
          <p className="text-xs font-medium text-muted-foreground">
            Insight citations
          </p>
          {insights.map((insight) => (
            <p key={insight.text} className="text-xs text-muted-foreground">
              [{insight.sourceIds.join(", ")}] {insight.text}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
