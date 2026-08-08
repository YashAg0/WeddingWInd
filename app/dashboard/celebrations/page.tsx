import { redirect } from "next/navigation";

/** Host wedding management lives at /dashboard/listings; keep this alias for nav links. */
export default function CelebrationsAliasPage() {
  redirect("/dashboard/listings");
}
