import { useState } from 'react'
import {
  CAREER_SUGGESTIONS,
  PROFESSIONAL_TITLES,
  type ProfessionalTitle,
  type ReportAuthor,
} from '../types/report'
import type { AnalysisResult, StructureModel } from '../types/structure'

interface DownloadReportProps {
  model: StructureModel
  result: AnalysisResult
}

const inputClass =
  'w-full rounded-md border border-[#d0d7e2] bg-white px-3 py-2 text-sm text-[#0a2540] outline-none focus:border-[#0a2540] focus:ring-1 focus:ring-[#0a2540]'

export function DownloadReport({ model, result }: DownloadReportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [title, setTitle] = useState<ProfessionalTitle>('Ing.')
  const [career, setCareer] = useState('Ingeniería Civil Constructora')
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const download = async (): Promise<boolean> => {
    if (!name.trim()) {
      setFormError('Indique el nombre del profesional.')
      return false
    }
    if (!career.trim()) {
      setFormError('Indique la carrera o especialidad.')
      return false
    }

    setFormError(null)
    setBusy(true)

    const author: ReportAuthor = {
      name: name.trim(),
      title,
      career: career.trim(),
    }

    try {
      const { generateAnalysisPdf } = await import('../lib/pdf/generateAnalysisPdf')
      generateAnalysisPdf(model, result, author)
      return true
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo generar el PDF.')
      return false
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-[#0a2540] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a3a5c] transition flex items-center gap-2 shadow-sm"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Descargar reporte PDF
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Fondo desenfocado */}
          <div
            className="fixed inset-0 bg-[#0a2540]/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Caja del Modal */}
          <div className="relative w-full max-w-lg rounded-xl border border-[#d0d7e2] bg-white p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-[#5a6a7e] hover:text-[#0a2540] text-2xl font-semibold leading-none p-1 transition"
              aria-label="Cerrar modal"
            >
              &times;
            </button>

            <h3 className="text-lg font-bold text-[#0a2540]">Descargar cálculos</h3>
            <p className="mt-1 text-xs text-[#5a6a7e] mb-4">
              Complete los datos del profesional para incluirlos en la portada del PDF.
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#5a6a7e]">Cargo</label>
                <select
                  className={inputClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value as ProfessionalTitle)}
                >
                  {PROFESSIONAL_TITLES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#5a6a7e]">Nombre del Profesional</label>
                <input
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre completo"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#5a6a7e]">Carrera / Especialidad</label>
                <input
                  className={inputClass}
                  list="career-suggestions"
                  value={career}
                  onChange={(e) => setCareer(e.target.value)}
                  placeholder="Ej. Ingeniería Civil"
                />
                <datalist id="career-suggestions">
                  {CAREER_SUGGESTIONS.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>
            </div>

            {formError && (
              <p className="mt-3 text-sm text-red-700">{formError}</p>
            )}

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#e2e8f0] pt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-[#d0d7e2] bg-white px-4 py-2 text-sm font-semibold text-[#5a6a7e] hover:bg-[#f4f6f9] transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const success = await download()
                  if (success) {
                    setIsOpen(false)
                  }
                }}
                disabled={busy}
                className="rounded-md bg-[#0a2540] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a3a5c] disabled:cursor-not-allowed disabled:opacity-50 transition"
              >
                {busy ? 'Generando…' : 'Descargar PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
