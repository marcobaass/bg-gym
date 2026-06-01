'use client'

export default function RatingDots({ rating }) {

  const sessions = rating ?? []
  const dotsColors = sessions.map((session) => session.scorePerPosition * 20)

  return (
    <div className="flex items-center mb-1 mt-1">
      {Array.from({ length: 10 }).map((_, index) => (
        <div
            key={index}
            className="w-2 h-2 rounded-full mx-0.5 border-1 border-gray-300"
            style={{
                backgroundColor: `hsl(${dotsColors[index]}, 100%, 50%)`
            }}
        >
        </div>
      ))}
    </div>
  )
}