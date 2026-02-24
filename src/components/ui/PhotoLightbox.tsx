'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { Database } from '@/lib/supabase/types';

type AssessmentPhoto = Database['public']['Tables']['assessment_photos']['Row'];
type Clinician = Database['public']['Tables']['clinicians']['Row'];

interface PhotoLightboxProps {
  photo: AssessmentPhoto;
  url: string;
  uploadedBy?: Clinician | null;
  onClose: () => void;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PhotoLightbox({ photo, url, uploadedBy, onClose }: PhotoLightboxProps) {
  const t = useTranslations();

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Extract EXIF metadata if available
  const raw = photo.metadata as Record<string, unknown> | null;
  const m = (key: string): string | undefined => {
    const v = raw?.[key];
    return v != null ? String(v) : undefined;
  };
  const hasMeta = raw != null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full
                     bg-black/40 text-white hover:bg-black/60 transition-colors text-sm"
          aria-label={t('patientDetail.photoClose')}
        >
          ✕
        </button>

        {/* Image */}
        <div className="flex-1 min-h-0 bg-[#1a1a1a] flex items-center justify-center p-4 overflow-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={photo.caption || photo.file_name}
            className="max-w-full max-h-[60vh] object-contain rounded"
          />
        </div>

        {/* Metadata */}
        <div className="p-4 border-t border-[#e8e8e0] space-y-2 overflow-y-auto max-h-[35vh]">
          {photo.caption && (
            <div>
              <span className="text-[10px] font-semibold text-[#999] uppercase tracking-wide">
                {t('patientDetail.photoCaption')}
              </span>
              <p className="text-sm text-[#333]">{photo.caption}</p>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[#999]">{t('patientDetail.photoFileName')}</span>
              <p className="font-medium text-[#555] truncate">{photo.file_name}</p>
            </div>
            <div>
              <span className="text-[#999]">{t('patientDetail.photoFileSize')}</span>
              <p className="font-medium text-[#555]">{formatFileSize(photo.file_size)}</p>
            </div>
            <div>
              <span className="text-[#999]">{t('patientDetail.photoUploadedBy')}</span>
              <p className="font-medium text-[#555]">{uploadedBy?.full_name ?? '—'}</p>
            </div>
            <div>
              <span className="text-[#999]">{t('patientDetail.photoDate')}</span>
              <p className="font-medium text-[#555]">
                {new Date(photo.created_at).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* EXIF / Camera metadata */}
          {hasMeta && (
            <>
              <div className="border-t border-[#e8e8e0] pt-2 mt-2">
                <span className="text-[10px] font-semibold text-[#999] uppercase tracking-wide">
                  {t('patientDetail.photoCameraInfo')}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {(m('cameraMake') || m('cameraModel')) && (
                  <div>
                    <span className="text-[#999]">{t('patientDetail.photoCamera')}</span>
                    <p className="font-medium text-[#555]">
                      {[m('cameraMake'), m('cameraModel')].filter(Boolean).join(' ')}
                    </p>
                  </div>
                )}
                {m('dateTaken') && (
                  <div>
                    <span className="text-[#999]">{t('patientDetail.photoDateTaken')}</span>
                    <p className="font-medium text-[#555]">
                      {new Date(m('dateTaken')!).toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
                {(m('width') || m('height')) && (
                  <div>
                    <span className="text-[#999]">{t('patientDetail.photoDimensions')}</span>
                    <p className="font-medium text-[#555]">
                      {m('width')} × {m('height')}
                    </p>
                  </div>
                )}
                {m('focalLength') && (
                  <div>
                    <span className="text-[#999]">{t('patientDetail.photoFocalLength')}</span>
                    <p className="font-medium text-[#555]">{m('focalLength')} mm</p>
                  </div>
                )}
                {m('fNumber') && (
                  <div>
                    <span className="text-[#999]">{t('patientDetail.photoAperture')}</span>
                    <p className="font-medium text-[#555]">f/{m('fNumber')}</p>
                  </div>
                )}
                {m('exposureTime') && (
                  <div>
                    <span className="text-[#999]">{t('patientDetail.photoExposure')}</span>
                    <p className="font-medium text-[#555]">{m('exposureTime')} s</p>
                  </div>
                )}
                {m('iso') && (
                  <div>
                    <span className="text-[#999]">{t('patientDetail.photoISO')}</span>
                    <p className="font-medium text-[#555]">ISO {m('iso')}</p>
                  </div>
                )}
                {m('flash') && (
                  <div>
                    <span className="text-[#999]">{t('patientDetail.photoFlash')}</span>
                    <p className="font-medium text-[#555]">{m('flash')}</p>
                  </div>
                )}
                {m('software') && (
                  <div>
                    <span className="text-[#999]">{t('patientDetail.photoSoftware')}</span>
                    <p className="font-medium text-[#555]">{m('software')}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
