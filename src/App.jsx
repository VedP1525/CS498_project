import { useState } from 'react';
import Matching from './components/Matching'
import './App.css';

export default function App() {
  const [matching, setMatching] = useState(false);
  const goToMatching = () => {
    setMatching(true);
  }
  return (
    <>
      <button onClick={goToMatching} style={{padding: '1% 1%'}}>Matching Game</button>
      {matching && <Matching />}
    </>
  )
};