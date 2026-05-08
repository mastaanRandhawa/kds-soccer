import { useQuery } from '@tanstack/react-query'
import { resolvePublicPath } from '@/lib/public-path'
import { SoccerHero } from '@/components/ui/soccer-hero'
import { Footer } from '@/components/ui/footer'

const PDF_URL = resolvePublicPath('kids-schedule/kids.pdf')

/** True only if URL returns real PDF bytes — not SPA / 404 HTML (GitHub Pages serves HTML when the file isn’t deployed). */
function isPdfMagic(buf: Uint8Array): boolean {
  return buf.length >= 4 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46
}

async function pdfActuallyExists(): Promise<boolean> {
  try {
    const res = await fetch(PDF_URL, {
      headers: { Range: 'bytes=0-7' },
      cache: 'no-store',
    })
    if (!(res.ok || res.status === 206)) return false
    const buf = new Uint8Array(await res.arrayBuffer())
    if (!isPdfMagic(buf)) return false
    const ct = (res.headers.get('content-type') || '').toLowerCase()
    if (ct.includes('text/html')) return false
    return true
  } catch {
    return false
  }
}

export default function KidsSchedulePage() {
  const { data: exists, isLoading } = useQuery({
    queryKey: ['kids-schedule-pdf', PDF_URL],
    queryFn: pdfActuallyExists,
    staleTime: 60_000,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <SoccerHero
        title="Kids Schedule"
        subtitle="PDF supplied with the site — replaced when you redeploy."
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-14">
        {isLoading ? (
          <div className="text-center py-24">
            <div className="inline-block w-8 h-8 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
            <p className="mt-3 text-sm text-gray-400">Checking schedule…</p>
          </div>
        ) : !exists ? (
          <div className="text-center py-24 space-y-4">
            <p className="text-lg font-bold text-gray-800">No PDF yet</p>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              The file must live under the <strong className="text-gray-700">public</strong> folder (so the build copies it):
              <br />
              <code className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded text-xs mt-2 inline-block">
                frontend/public/kids-schedule/kids.pdf
              </code>
              <br />
              <span className="text-gray-400 text-xs mt-2 block">
                Not next to <code className="text-gray-500">src/</code> and not <code className="text-gray-500">kids-schdule/</code> (typo) — only <code className="text-gray-500">public/kids-schedule/</code>.
              </span>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
              <span className="text-sm font-medium text-gray-700">kids.pdf</span>
              <a
                href={PDF_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Open in new tab
              </a>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <iframe
                title="Kids schedule PDF"
                src={PDF_URL}
                className="w-full border-0"
                style={{ minHeight: '75vh', height: '800px', maxHeight: '90vh' }}
              />
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
