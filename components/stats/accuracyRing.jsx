'use client'

export default function AccuracyRing({ score }) {

    const fraction = score / 6
    const radius = 14
    const circumference = 2 * Math.PI * radius
    const visible = circumference * fraction
    const strokeDasharray = `${visible} ${circumference - visible}`
    const percent = Math.round(fraction * 100)

    return (
        <div className="w-[38] h-[38] relative block" >
            <svg viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" className="transform-rotate-90">
            <circle className="fill-none stroke-gray-300 transform-origin-[0px,0px]" cx="19" cy="19" r="14" strokeWidth="3"></circle>
            <circle className="fill-none" cx="19" cy="19" r="14" stroke="#1D9E75" strokeDasharray={strokeDasharray} strokeDashoffset={0} strokeWidth="3" strokeLinecap="round"></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[9px]">{percent}%</div>
        </div>
    )
}