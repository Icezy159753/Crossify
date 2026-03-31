import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileSpreadsheet } from 'lucide-react'

interface DropZoneProps {
  onFile: (file: File) => void
  fileName?: string
}

export function DropZone({ onFile, fileName }: DropZoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFile(accepted[0])
    },
    [onFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: false,
  })

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
        ${isDragActive
          ? 'border-blue-500 bg-blue-50 scale-[1.01]'
          : fileName
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {fileName ? (
          <>
            <FileSpreadsheet className="w-12 h-12 text-green-500" />
            <p className="text-green-700 font-semibold text-lg">{fileName}</p>
            <p className="text-gray-500 text-sm">คลิกหรือลากไฟล์ใหม่เพื่อเปลี่ยน</p>
          </>
        ) : (
          <>
            <UploadCloud className={`w-12 h-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
            <p className="text-gray-700 font-semibold text-lg">
              {isDragActive ? 'วางไฟล์ที่นี่...' : 'ลากและวางไฟล์ หรือคลิกเพื่อเลือก'}
            </p>
            <p className="text-gray-400 text-sm">รองรับ .xlsx, .xls, .csv</p>
          </>
        )}
      </div>
    </div>
  )
}
