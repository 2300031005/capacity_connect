import React from 'react';
import { X, Award, Download, Calendar, User, BookOpen, CheckCircle } from 'lucide-react';
import Button from './Button';

const CertificateModal = ({ isOpen, onClose, certificate }) => {
  if (!isOpen || !certificate) return null;

  const fileUrl = certificate.filePath
    ? `http://localhost:5002/${certificate.filePath.replace(/\\/g, '/')}`
    : '';

  const formattedDate = new Date(certificate.issuedAt || certificate.createdAt).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Certificate of Completion</h2>
              <p className="text-xs font-mono text-emerald-700 font-bold">
                {certificate.certificateId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Preview Card */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="border-4 border-double border-emerald-800/80 rounded-xl p-6 sm:p-8 bg-linear-to-b from-white to-slate-50 text-center space-y-4 shadow-sm relative overflow-hidden">
            {/* Top Logo & Badge */}
            <div className="flex flex-col items-center gap-2">
              <img
                src="/logo.svg"
                alt="Capacity Connect Logo"
                className="w-12 h-12 object-contain mx-auto"
              />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold uppercase tracking-wider">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                <span>Official Verification</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-800 block">
                CAPACITY CONNECT
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                CERTIFICATE OF COMPLETION
              </h3>
              <p className="text-xs text-slate-500">This certifies that</p>
            </div>

            {/* Trainee Name */}
            <div className="py-2 border-b border-slate-200 max-w-sm mx-auto relative">
              <h4 className="text-xl font-bold text-slate-900">
                {certificate.trainee?.name || 'Trainee'}
              </h4>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-emerald-800" />
            </div>

            {/* Course & Score Details */}
            <div className="space-y-1.5 text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              <p>has successfully completed the comprehensive curriculum and passed the assessment for</p>
              <strong className="text-sm font-bold text-emerald-800 block">
                {certificate.course?.title || 'Course'}
              </strong>
              <p>
                with a final assessment grade of{' '}
                <strong className="text-slate-900">{certificate.percentage}%</strong>.
              </p>
            </div>

            {/* Verification Seal */}
            <div className="pt-2">
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-emerald-600 bg-emerald-50 text-emerald-900 flex flex-col items-center justify-center mx-auto shadow-xs">
                <Award className="w-5 h-5 text-emerald-700" />
                <span className="text-[7px] font-bold uppercase tracking-tighter">Verified</span>
              </div>
            </div>

            {/* Footer Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-200 text-xs text-slate-500 text-left">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                  Course Instructor
                </span>
                <strong className="text-slate-800 text-[11px]">
                  {certificate.trainer?.name || 'Instructor'}
                </strong>
              </div>
              <div className="sm:text-center">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                  Certificate ID
                </span>
                <strong className="text-slate-800 text-[11px] font-mono">
                  {certificate.certificateId}
                </strong>
              </div>
              <div className="sm:text-right">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                  Issued Date
                </span>
                <strong className="text-slate-800 text-[11px]">{formattedDate}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 bg-white hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>

          {fileUrl && (
            <a
              href={fileUrl}
              download={`${certificate.certificateId}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
