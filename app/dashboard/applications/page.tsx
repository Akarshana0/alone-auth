import ApplicationsTable from '@/components/dashboard/ApplicationsTable';

export default function ApplicationsPage() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Applications</h1>
        <p className="text-gray-400">Manage API keys and access for your client applications.</p>
      </div>

      <ApplicationsTable />
    </>
  );
}
