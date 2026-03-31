import { memo } from 'react'

export const CrossifyLogo = memo(function CrossifyLogo({
  size = 'md',
  withWordmark = false,
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg'
  withWordmark?: boolean
  className?: string
}) {
  const ringSize = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-24 w-24' : 'h-12 w-12'
  const outerRing = size === 'sm' ? 'border-[2.5px]' : size === 'lg' ? 'border-[5px]' : 'border-[3px]'
  const innerRing = size === 'sm' ? 'border-[2px]' : size === 'lg' ? 'border-[4px]' : 'border-[3px]'
  const markText = size === 'sm' ? 'text-[7px]' : size === 'lg' ? 'text-sm' : 'text-[9px]'
  const wordmarkSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg'
  const subtitleSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-xs' : 'text-[11px]'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${ringSize} flex-shrink-0`}>
        <div className={`absolute inset-0 rounded-full ${outerRing} border-blue-100`} />
        <div className={`absolute inset-[6%] rounded-full ${outerRing} border-transparent border-t-[#6FB6FF] border-r-[#2F6FE4] border-b-[#1F4E78]`} />
        <div className={`absolute inset-[24%] rounded-full bg-white shadow-sm ${innerRing} border-[#1F4E78]`} />
        <div className={`absolute inset-0 flex items-center justify-center font-black tracking-[0.18em] text-[#1F4E78] ${markText}`}>
          CX
        </div>
      </div>
      {withWordmark && (
        <div className="flex flex-col leading-none">
          <span className={`font-black tracking-[0.02em] text-white ${wordmarkSize}`}>Crossify</span>
          <span className={`mt-1 text-blue-200 ${subtitleSize}`}>SPSS Edition</span>
        </div>
      )}
    </div>
  )
})
