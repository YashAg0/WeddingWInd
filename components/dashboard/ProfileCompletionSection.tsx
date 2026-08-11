import { getProfileCompletion } from "@/lib/actions/profile-completion";
import { ProfileCompletionWidget } from "@/components/dashboard/ProfileCompletionWidget";

/**
 * Server component that fetches profile completion from the DB
 * and renders the client widget. Silently fails if unauthenticated.
 */
export async function ProfileCompletionSection() {
  let completion = null;
  try {
    completion = await getProfileCompletion();
  } catch {
    // Not authenticated or admin — skip
    return null;
  }

  if (!completion || completion.percent === 100) return null;

  return <ProfileCompletionWidget completion={completion} />;
}
