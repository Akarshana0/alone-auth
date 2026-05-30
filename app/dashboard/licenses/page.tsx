import LicenseGenerator from '@/components/dashboard/LicenseGenerator';
import LicenseTable from '@/components/dashboard/LicenseTable';

export default function LicensesPage() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">License Management</h1>
        <p className="text-gray-400">Generate, view, and manage application license keys.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <LicenseGenerator />
        </div>
        <div className="lg:col-span-2">
          <LicenseTable />
        </div>
      </div>
    </>
  );
}
