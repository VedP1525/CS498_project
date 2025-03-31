import { useState } from 'react';
import Matching from './components/Matching'
import Blackjack from './components/Blackjack'
import './App.css';

export default function App() {
  const [matching, setMatching] = useState(false);
  const goToMatching = () => {
    setMatching(true);
    setBlackjack(false);
  }
  const [blackjack, setBlackjack] = useState(false);
  const goToBlackjack = () => {
    setBlackjack(true);
    setMatching(false);
  }
  return (
    <>
      <button onClick={goToMatching} style={{padding: '1% 1%'}}>Matching Game</button>
      {matching && <Matching />}
      <button onClick={goToBlackjack} style={{padding: '1% 1%'}}>Blackjack Game</button>
      {blackjack && <Blackjack />}
    </>
  )
};