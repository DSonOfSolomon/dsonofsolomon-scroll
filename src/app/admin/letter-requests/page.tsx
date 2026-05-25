import {
  deleteLetterRequest,
  updateLetterRequestStatus,
} from "@/app/admin/actions";
import AdminSubmitButton from "@/components/admin/AdminSubmitButton";
import {
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  StatusPill,
} from "@/components/admin/AdminUI";
import BackToDashboardLink from "@/components/admin/BackToDashboardLink";
import { prisma } from "@/lib/prisma";

export default async function AdminLetterRequestsPage() {
  const requests = await prisma.letterRequest.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <BackToDashboardLink />
      </div>

      <AdminPageHeader
        eyebrow="Letter requests"
        title="Personal letter queue"
        description="Review premium member requests, move each request through delivery, and close completed work."
      />

      <AdminPanel>
        <AdminPanelHeader title="Requests" />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold uppercase text-gray-500">
                <th className="px-4 py-3">Requester</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm text-gray-700">
              {requests.map((request) => (
                <tr key={request.id} className="transition-colors hover:bg-gray-50/70">
                  <td className="px-4 py-4 align-top">
                    <p className="font-medium text-gray-950">{request.name}</p>
                    <p className="text-gray-500">{request.email}</p>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <StatusPill>{request.tier}</StatusPill>
                  </td>
                  <td className="max-w-md px-4 py-4 align-top text-gray-600">
                    {request.message}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <StatusPill
                      tone={
                        request.status === "completed"
                          ? "success"
                          : request.status === "in_progress"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {request.status.replace("_", " ")}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-4 align-top">
                    {request.createdAt.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-3">
                      <form action={updateLetterRequestStatus}>
                        <input type="hidden" name="id" value={request.id} />
                        <input type="hidden" name="status" value="in_progress" />
                        <AdminSubmitButton
                          className="cursor-pointer text-[#0a192f] hover:text-[#13294b]"
                          pendingLabel="Starting..."
                        >
                          Start
                        </AdminSubmitButton>
                      </form>

                      <form action={updateLetterRequestStatus}>
                        <input type="hidden" name="id" value={request.id} />
                        <input type="hidden" name="status" value="completed" />
                        <AdminSubmitButton
                          className="cursor-pointer text-gray-600 hover:text-gray-950"
                          pendingLabel="Completing..."
                        >
                          Complete
                        </AdminSubmitButton>
                      </form>

                      <form action={deleteLetterRequest}>
                        <input type="hidden" name="id" value={request.id} />
                        <AdminSubmitButton
                          className="cursor-pointer text-red-600 hover:text-red-700"
                          pendingLabel="Deleting..."
                        >
                          Delete
                        </AdminSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}
