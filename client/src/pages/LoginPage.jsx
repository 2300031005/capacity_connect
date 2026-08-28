import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import { LogIn, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  return (
    <PageContainer>
      <div className="max-w-md mx-auto bg-white border border-slate-200 rounded p-8 text-center">
        <div className="w-12 h-12 rounded bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Login</h1>
        <p className="text-sm font-semibold text-emerald-600 mt-2">Phase 1 Foundation</p>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Authentication and user credential verification will be implemented in Phase 2.
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

export default LoginPage;
