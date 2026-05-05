import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { schema, withWorkspace } from "@sigmafy/db";
import { requireAuthContext } from "@/lib/auth";
import { getAppDb } from "@/lib/db";
import { renderCertificatePdf, type CertificateData } from "@/lib/certificate";

/**
 * GET /api/certificates/[projectId]
 *
 * Streams a PDF certificate for the given project. Workspace-scoped via
 * withWorkspace — RLS rejects requests for projects outside the active
 * workspace.
 *
 * Phase 1 Slice D.1: any workspace member can download. Phase 1 Slice
 * polish will gate to the project owner + sponsor + admins.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ projectId: string }> },
) {
  const auth = await requireAuthContext();
  const { projectId } = await ctx.params;
  const db = getAppDb();

  const data = await withWorkspace(db, auth.workspace.id, async (tx) => {
    const projectRows = await tx
      .select({
        id: schema.projects.id,
        name: schema.projects.name,
        description: schema.projects.description,
        status: schema.projects.status,
        roiCents: schema.projects.roiEstimatedZarCents,
        ownerEmail: schema.users.email,
        ownerFullName: schema.users.fullName,
      })
      .from(schema.projects)
      .innerJoin(schema.users, eq(schema.projects.ownerUserId, schema.users.id))
      .where(
        and(
          eq(schema.projects.id, projectId),
          eq(schema.projects.workspaceId, auth.workspace.id),
        ),
      )
      .limit(1);
    const project = projectRows[0];
    if (!project) return null;

    // Optional: enrolment ↔ class link, picks the most recent class.
    const enrolments = await tx
      .select({
        className: schema.classes.name,
      })
      .from(schema.classEnrolments)
      .innerJoin(schema.classes, eq(schema.classEnrolments.classId, schema.classes.id))
      .where(eq(schema.classEnrolments.projectId, project.id))
      .limit(1);

    return {
      project,
      className: enrolments[0]?.className ?? null,
    };
  });

  if (!data) {
    return new NextResponse("not found", { status: 404 });
  }

  const cert: CertificateData = {
    workspaceName: auth.workspace.name,
    delegateName: data.project.ownerFullName ?? data.project.ownerEmail,
    delegateEmail: data.project.ownerEmail,
    projectName: data.project.name,
    projectDescription: data.project.description,
    completedAt: new Date(),
    roiZarRands:
      data.project.roiCents !== null && data.project.roiCents !== undefined
        ? data.project.roiCents / 100
        : null,
    awardedByName: auth.workspace.name,
    className: data.className,
  };

  const pdf = await renderCertificatePdf(cert);
  const safeName = data.project.name.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/-+/g, "-");
  const filename = `sigmafy-certificate-${safeName || "project"}.pdf`;
  // NextResponse expects BodyInit; coerce Node Buffer → Uint8Array.
  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "private, no-store",
    },
  });
}
