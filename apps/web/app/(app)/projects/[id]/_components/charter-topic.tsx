import { Card, CardContent, CardHeader, CardTitle } from "@sigmafy/ui";
import type { TemplateTopic } from "@sigmafy/db";

export function CharterTopic({ topic }: { topic: TemplateTopic }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{topic.name}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm text-foreground">
        <p className="text-muted-foreground">{topic.description}</p>
        {topic.prompt && (
          <p className="rounded-md bg-muted p-4 text-muted-foreground">{topic.prompt}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Phase 0A surfaces the Charter as a read-only display. The editor lands in Phase 1.
        </p>
      </CardContent>
    </Card>
  );
}
