import Link from 'next/link'


export default function Home() {

  return (
      <div>
        <h1>Welcome to the Backgammon Gym</h1>
        <Link href='/board'>Go to the Training Center</Link>
        <hr />
        <Link href='/parser'>Save a position</Link>
      </div>
  )
}
