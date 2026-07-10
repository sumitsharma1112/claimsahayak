/**
 * Admin Portal scaffold landing (Milestone 1). Roles, 4-eyes workflow,
 * editors, versioned publish/rollback, audit log, and the analytics
 * dashboard are implemented in Milestones 10–11 per the approved roadmap.
 * This origin must never be linked from the public site (V3 §3.4).
 */
export default function AdminHome() {
  return (
    <article>
      <h1 style={{ fontSize: 28, lineHeight: "34px" }}>ClaimSahayak Admin Portal</h1>
      <p>
        Application scaffold (Milestone 1). Authentication, content editors,
        rule-pack versioning, and analytics land in Milestones 10–11.
      </p>
      <p>
        Environment: <code>ADMIN_PORT</code> (default 3100). This deployment is
        auth-gated at the edge until Milestone 10 ships application-level auth.
      </p>
    </article>
  );
}
