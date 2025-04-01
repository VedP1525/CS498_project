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
  const goToHighLow = () => {
    setBlackjack(false);
    setMatching(false);
    window.location.href = "./HigherOrLower/highLowMilestone.html";
  }
  return (
    <>
      {!matching && <button onClick={goToMatching} style={{padding: '1% 1%'}}>Matching Game</button>}
      {matching && <Matching />}
      {!blackjack && <button onClick={goToBlackjack} style={{padding: '1% 1%'}}>Blackjack Game</button>}
      {blackjack && <Blackjack />}
      <button onClick={goToHighLow} style={{padding: '1% 1%'}}>HigherOrLower Game</button>

    </>
  )
};