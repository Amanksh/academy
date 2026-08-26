import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react'
import { api } from '../lib/api'

interface FileUploadZoneProps {
  value: string
  onChange: (url: string) => void
  accept: 'image' | 'video' | 'both'
  entity: 'events' | 'classes' | 'teachers'
  label?: string
}

const IMAGE_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.gif'
const VIDEO_EXTENSIONS = '.mp4,.webm,.mov'

function getAcceptString(accept: 'image' | 'video' | 'both') {
  if (accept === 'image') return IMAGE_EXTENSIONS
  if (accept === 'video') return VIDEO_EXTENSIONS
  return `${IMAGE_EXTENSIONS},${VIDEO_EXTENSIONS}`
}

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUploadZone({
  value,
  onChange,
  accept,
  entity,
  label,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [uploadedFileSize, setUploadedFileSize] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null)
      setIsUploading(true)
      setProgress(0)
      setUploadedFileName(file.name)
      setUploadedFileSize(file.size)

      try {
        const result = await api.upload(file, entity, (pct) => {
          setProgress(pct)
        })
        onChange(result.url)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        setError(message)
        setUploadedFileName(null)
        setUploadedFileSize(null)
      } finally {
        setIsUploading(false)
      }
    },
    [entity, onChange],
  )

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const file = e.dataTransfer.files?.[0]
      if (file) handleUpload(file)
    },
    [handleUpload],
  )

  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleUpload(file)
    },
    [handleUpload],
  )

  const handleRemove = useCallback(() => {
    onChange('')
    setUploadedFileName(null)
    setUploadedFileSize(null)
    setProgress(0)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [onChange])

  const acceptLabel =
    accept === 'image' ? 'Images' : accept === 'video' ? 'Videos' : 'Images & Videos'
  const maxSizeLabel = accept === 'video' ? '100 MB' : accept === 'image' ? '10 MB' : '10 MB images · 100 MB videos'

  // ── Has a URL already (either uploaded or pre-existing) ──
  if (value && !isUploading) {
    const isVideo = isVideoUrl(value)

    return (
      <div>
        {label && (
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
            {label}
          </label>
        )}
        <div className="relative rounded-xl overflow-hidden border border-slate-700/60 bg-slate-900/80">
          {/* Preview */}
          <div className="relative w-full" style={{ maxHeight: '200px' }}>
            {isVideo ? (
              <video
                src={value}
                controls
                className="w-full max-h-[200px] object-contain bg-black"
              />
            ) : (
              <img
                src={value}
                alt="Preview"
                className="w-full max-h-[200px] object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120"><rect fill="%23111827" width="200" height="120"/><text fill="%236366F1" font-size="12" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">Preview unavailable</text></svg>'
                }}
              />
            )}
          </div>

          {/* File info bar */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-800/90">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: '16px' }}>
                check_circle
              </span>
              <span className="text-xs text-slate-300 truncate max-w-[180px]">
                {uploadedFileName || (isVideo ? 'Video' : 'Image')}
              </span>
              {uploadedFileSize && (
                <span className="text-[10px] text-slate-500 shrink-0">
                  {formatFileSize(uploadedFileSize)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.click()
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 rounded-lg hover:bg-slate-700/50"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-lg hover:bg-slate-700/50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptString(accept)}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    )
  }

  // ── URL input mode ──
  if (showUrlInput) {
    return (
      <div>
        {label && (
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
            {label}
          </label>
        )}
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs"
        />
        <button
          type="button"
          onClick={() => setShowUrlInput(false)}
          className="text-[10px] text-indigo-400 hover:text-indigo-300 mt-1.5 transition-colors"
        >
          ← Back to file upload
        </button>
      </div>
    )
  }

  // ── Upload zone (drag & drop / click) ──
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
          {label}
        </label>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`
          relative w-full rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
          ${
            isUploading
              ? 'border-indigo-500/60 bg-indigo-950/20 cursor-wait'
              : isDragging
                ? 'border-indigo-400 bg-indigo-950/30 scale-[1.01] shadow-lg shadow-indigo-600/10'
                : 'border-slate-700/60 bg-slate-900/40 hover:border-indigo-500/50 hover:bg-slate-900/60'
          }
        `}
      >
        <div className="flex flex-col items-center justify-center py-6 px-4">
          {isUploading ? (
            <>
              {/* Upload progress */}
              <div className="w-10 h-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin mb-3" />
              <p className="text-xs font-semibold text-indigo-300 mb-2">
                Uploading... {progress}%
              </p>
              <div className="w-full max-w-[200px] h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {uploadedFileName && (
                <p className="text-[10px] text-slate-500 mt-2 truncate max-w-[220px]">
                  {uploadedFileName}
                </p>
              )}
            </>
          ) : (
            <>
              {/* Drop zone prompt */}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                  isDragging ? 'bg-indigo-600/20' : 'bg-slate-800/80'
                }`}
              >
                <span
                  className={`material-symbols-outlined transition-colors ${
                    isDragging ? 'text-indigo-400' : 'text-slate-500'
                  }`}
                  style={{ fontSize: '24px' }}
                >
                  cloud_upload
                </span>
              </div>
              <p className="text-xs font-medium text-slate-300 mb-0.5">
                {isDragging ? 'Drop file here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-[10px] text-slate-500">
                {acceptLabel} · max {maxSizeLabel}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-1.5 mt-2 text-red-400">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            error
          </span>
          <p className="text-[11px]">{error}</p>
        </div>
      )}

      {/* URL fallback link */}
      {!isUploading && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setShowUrlInput(true)
          }}
          className="text-[10px] text-slate-500 hover:text-indigo-400 mt-1.5 transition-colors"
        >
          Or paste image URL instead
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptString(accept)}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
