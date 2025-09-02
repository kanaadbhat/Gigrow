import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {Button} from './components/ui/button.jsx';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <p className="bg-red-500">
       Click on the Vite and React logos to learn more
     </p>
     <Button onClick={() => setCount(count + 1)}>
       Count is {count}
     </Button>
    </>
  )
}

export default App
