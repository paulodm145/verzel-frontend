import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { parseSessionUser, type Role } from "@/server/session";

const HOME_BY_ROLE: Record<Role, string> = {
  CUSTOMER: "/events",
  ORGANIZER: "/dashboard",
  GATE: "/check-in",
};

export default async function HomePage() {
  const user = parseSessionUser((await cookies()).get("vz_user")?.value);
  redirect(user ? HOME_BY_ROLE[user.role] : "/login");
}
