'use client'

import { useState } from 'react'

export default function LastPlayed({ lastPlayed }) {
    const [now] = useState(() => Date.now())

    const daysAgo = Math.floor((now - lastPlayed) / (1000 * 60 * 60 * 24))    

    let label
    if (lastPlayed) {
        if (daysAgo === 0) {  
            label = 'today'
        } else if (daysAgo === 1) {
            label = 'yesterday'
        } else if (daysAgo > 1) {
            label = `${daysAgo} days ago`
        }
    } else {
        label = 'never trained'
    }

    return (
        <>            
            {<div className="text-gray-600">{label}</div>}
        </>
    )
}