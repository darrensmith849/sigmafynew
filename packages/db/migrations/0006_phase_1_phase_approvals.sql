CREATE TABLE "phase_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"phase_slug" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitted_by_user_id" uuid NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_by_user_id" uuid,
	"decided_at" timestamp with time zone,
	"note" text
);
--> statement-breakpoint
ALTER TABLE "phase_approvals" ADD CONSTRAINT "phase_approvals_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phase_approvals" ADD CONSTRAINT "phase_approvals_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phase_approvals" ADD CONSTRAINT "phase_approvals_submitted_by_user_id_users_id_fk" FOREIGN KEY ("submitted_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phase_approvals" ADD CONSTRAINT "phase_approvals_decided_by_user_id_users_id_fk" FOREIGN KEY ("decided_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "phase_approvals_project_phase_unique" ON "phase_approvals" USING btree ("project_id","phase_slug");--> statement-breakpoint
CREATE INDEX "phase_approvals_workspace_status_idx" ON "phase_approvals" USING btree ("workspace_id","status");