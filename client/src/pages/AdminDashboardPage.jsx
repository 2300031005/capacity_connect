import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

const AdminDashboardPage = () => {
  return (
    <PageContainer
      title="Admin Dashboard"
      subtitle="System administrator control panel"
    >
      <div className="bg-white border border-slate-200 rounded p-8 text-center">
        <div className="w-12 h-12 rounded bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Admin Dashboard</h2>
        <p className="text-sm font-semibold text-emerald-600 mt-2">Phase 1 Foundation</p>
        <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
          Organization settings, role assignments, user access audits, and system configuration will be established in subsequent phases.
        </p>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};

export default AdminDashboardPage;
