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
  const [name, setName] = useState('')
  const [title, setTitle] = useState<ProfessionalTitle>('Ing.')
  const [career, setCareer] = useState('Ingeniería Civil Constructora')
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const download = async () => {
    if (!name.trim()) {
      setFormError('Indique el nombre del profesional.')
      return
    }
    if (!career.trim()) {
      setFormError('Indique la carrera o especialidad.')
      return
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
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo generar el PDF.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-lg border border-[#0a2540] bg-white p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#0a2540]">Descargar cálculos</h2>
          <p className="mt-1 text-xs text-[#5a6a7e]">
            PDF profesional: datos de entrada, matrices y resultados. Sin texto didáctico.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="mb-1 block text-xs text-[#5a6a7e]">Cargo</label>
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

        <div className="sm:col-span-2 lg:col-span-1">
          <label className="mb-1 block text-xs text-[#5a6a7e]">Nombre</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre completo"
            autoComplete="name"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-[#5a6a7e]">Carrera / especialidad</label>
          <input
            className={inputClass}
            list="career-suggestions"
            value={career}
            onChange={(e) => setCareer(e.target.value)}
            placeholder="Ej. Ingeniería Civil Constructora"
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

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={download}
          disabled={busy}
          className="rounded-md bg-[#0a2540] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a3a5c] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Generando…' : 'Descargar PDF'}
        </button>
        <p className="text-xs text-[#5a6a7e]">
          Incluye KTG, K₁₁, K₁₁⁻¹, Fk, D, Fi y FR.
        </p>
      </div>
    </section>
  )
}
