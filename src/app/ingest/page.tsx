// src/app/ingest/page.tsx

'use client'

import { useState } from 'react'

import config from '@/lib/common/config'

export default function IngestPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageClasses, setMessageClasses] = useState('text-green-500')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!file) {
      setMessage('Please select a PDF')
      setMessageClasses('text-red-500')
      return
    }

    const isPdfMime = file.type === 'application/pdf'
    const hasPdfExtension = file.name
      .toLowerCase()
      .endsWith('.pdf')

    if (!isPdfMime && !hasPdfExtension) {
      setMessage('Please select a PDF file')
      setMessageClasses('text-red-500')
      return
    }

    setUploading(true)
    setMessage('')
    setMessageClasses('text-green-500')

    try {
      const formData = new FormData()

      // Must match formData.get('pdf') on server
      formData.append('pdf', file)

      const res = await fetch(`${config.app.apiUrl}/api/ingest`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          data.error || 'Upload failed'
        )
      }

      setMessage(data.message)
      setFile(null)

    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : 'Something went wrong'
      )
      setMessageClasses('text-red-500')
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Upload a PDF document
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) =>
              setFile(e.target.files?.[0] ?? null)
            }
          />

          {message && <div className={messageClasses}>{message}</div>}

          <button
            type="submit"
            disabled={uploading}
            className={`bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>

        </form>
      </div>
    </main>
  )
}