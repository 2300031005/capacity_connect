import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import { UserCheck, ArrowLeft } from 'lucide-react';

const TrainerDashboardPage = () => {
  return (
    <PageContainer
      title="Trainer Dashboard"
      subtitle="Instructor cohort and training management"
    >
      <div className="bg-white border border-slate-200 rounded p-8 text-center">
        <div className="w-12 h-12 rounded bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-4">
          <UserCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Trainer Dashboard</h2>
        <p className="text-sm font-semibold text-emerald-600 mt-2">Phase 1 Foundation</p>
        <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
          Curriculum builder, resource uploader, live cohort metrics, and assessment evaluation modules will be added in upcoming phases.
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

export default TrainerDashboardPage;
