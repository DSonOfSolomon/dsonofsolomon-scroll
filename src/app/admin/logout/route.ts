import { logoutAdmin } from "@/app/admin/actions";

export async function GET() {
  await logoutAdmin();
}
