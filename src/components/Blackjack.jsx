import React, { useState } from 'react';

function Blackjack() {
  const [deckId, setDeckId] = useState(null);
  const [dealerCards, setDealerCards] = useState([]);
  const [playerCards, setPlayerCards] = useState([]);
  const [gameOver, setGameOver] = useState(true);
  const [playerStand, setPlayerStand] = useState(false);
  const [message, setMessage] = useState('');
  const [playerWins, setPlayerWins] = useState(0);
  const [dealerWins, setDealerWins] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);

  // Calculate hand value with Ace handling.
  const calculateHand = (cards) => {
    let total = 0;
    let aces = 0;
    cards.forEach(card => {
      if (card.value === "ACE") {
        total += 11;
        aces++;
      } else if (["KING", "QUEEN", "JACK"].includes(card.value)) {
        total += 10;
      } else {
        total += parseInt(card.value);
      }
    });
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    const soft = cards.some(card => card.value === "ACE") &&
                 total <= 21 &&
                 (total - cards.filter(c => c.value === "ACE").length * 1) < total;
    return { total, soft };
  };

  // Fetch a new deck.
  const fetchNewDeck = async () => {
    const res = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
    const data = await res.json();
    return data.deck_id;
  };

  // Draw cards from a given deck.
  const drawCards = async (deck, count) => {
    const res = await fetch(`https://deckofcardsapi.com/api/deck/${deck}/draw/?count=${count}`);
    const data = await res.json();
    return data.cards;
  };

  // New Deal: Reset game and deal initial cards.
  const handleNewDeal = async () => {
    setMessage('');
    let currentDeckId = deckId;
    if (!currentDeckId) {
      currentDeckId = await fetchNewDeck();
      setDeckId(currentDeckId);
    } else {
      // Reshuffle the existing deck.
      await fetch(`https://deckofcardsapi.com/api/deck/${currentDeckId}/shuffle/`);
    }
    const dealerDraw = await drawCards(currentDeckId, 2);
    const dealerWithFace = dealerDraw.map((card, index) => ({
      ...card,
      facedown: index === 1
    }));
    const playerDraw = await drawCards(currentDeckId, 2);
    setDealerCards(dealerWithFace);
    setPlayerCards(playerDraw);
    setGameOver(false);
    setPlayerStand(false);
  };

  // Player "Hit": Draw a card.
  const handleHit = async () => {
    if (gameOver) return;
    const newCard = await drawCards(deckId, 1);
    const newPlayerCards = [...playerCards, ...newCard];
    setPlayerCards(newPlayerCards);
    const { total } = calculateHand(newPlayerCards);
    if (total > 21) {
      setMessage('Player Busts! Dealer wins.');
      setGameOver(true);
    }
  };

  // Player "Stand": Reveal dealer card and let dealer draw.
  const handleStand = async () => {
    setPlayerStand(true);
    const revealedDealer = dealerCards.map(card => ({ ...card, facedown: false }));
    setDealerCards(revealedDealer);

    let currentDealerCards = [...revealedDealer];
    let { total, soft } = calculateHand(currentDealerCards);
    while (total < 17 || (total === 17 && soft)) {
      const newCard = await drawCards(deckId, 1);
      currentDealerCards = [...currentDealerCards, ...newCard];
      ({ total, soft } = calculateHand(currentDealerCards));
      setDealerCards([...currentDealerCards]);
    }
    determineWinner(currentDealerCards, playerCards);
    setGameOver(true);
  };

  // Determine the winner and update scoreboard stats.
  const determineWinner = (dealerHand, playerHand) => {
    const playerValue = calculateHand(playerHand).total;
    const dealerValue = calculateHand(dealerHand).total;
    const totalCards = dealerHand.length + playerHand.length;
    let outcome = '';
    if (dealerValue > 21) {
      outcome = 'Dealer Busts! Player wins.';
      setPlayerWins(prev => prev + 1);
      setPlayerScore(prev => prev + totalCards);
    } else if (playerValue > 21) {
      outcome = 'Player Busts! Dealer wins.';
      setDealerWins(prev => prev + 1);
      setDealerScore(prev => prev + totalCards);
    } else if (playerValue > dealerValue) {
      outcome = 'Player wins!';
      setPlayerWins(prev => prev + 1);
      setPlayerScore(prev => prev + totalCards);
    } else if (dealerValue > playerValue) {
      outcome = 'Dealer wins!';
      setDealerWins(prev => prev + 1);
      setDealerScore(prev => prev + totalCards);
    } else {
      outcome = 'Push (tie)!';
    }
    setMessage(outcome);
  };

  // Reset Hands Won stats.
  const resetHands = () => {
    setPlayerWins(0);
    setDealerWins(0);
  };

  // Reset Score stats.
  const resetScore = () => {
    setPlayerScore(0);
    setDealerScore(0);
  };

  // Render a card image or card back if facedown.
  const renderCard = (card, index) => {
    if (card.facedown) {
      return (
        <img
          key={index}
          src="https://deckofcardsapi.com/static/img/back.png"
          alt="card back"
          className="bj-card"
        />
      );
    }
    return (
      <img
        key={index}
        src={card.image}
        alt={card.code}
        className="bj-card"
      />
    );
  };

  const dealerHandValue = playerStand ? calculateHand(dealerCards).total : '?';
  const playerHandValue = calculateHand(playerCards).total;

  return (
    <div className="game-container">
      <h1 className="title">Blackjack</h1>
      <div className="content">
        <div className="section">
          <h2>Dealer</h2>
          <div className="card-container">
            {dealerCards.map((card, index) => renderCard(card, index))}
          </div>
          <div className="hand-value">
            Dealer Hand Value: {playerStand ? dealerHandValue : ''}
          </div>
        </div>

        <div className="section">
          <h2>Player</h2>
          <div className="card-container">
            {playerCards.map((card, index) => renderCard(card, index))}
          </div>
          <div className="hand-value">
            Player Hand Value: {playerHandValue}
          </div>
        </div>

        <div className="button-container">
          <button onClick={handleHit} disabled={gameOver || playerCards.length === 0}>
            Hit
          </button>
          <button onClick={handleStand} disabled={gameOver || playerCards.length === 0}>
            Stand
          </button>
          <button onClick={handleNewDeal} disabled={!gameOver && playerCards.length > 0}>
            New Deal
          </button>
        </div>

        {message && <div className="message">{message}</div>}

        <div className="scoreboard">
          <div className="scoreboard-column">
            <h3>Player Stats</h3>
            <p>Hands Won: {playerWins}</p>
            <p>Score: {playerScore}</p>
          </div>
          <div className="scoreboard-column">
            <h3>Dealer Stats</h3>
            <p>Hands Won: {dealerWins}</p>
            <p>Score: {dealerScore}</p>
          </div>
          <div className="scoreboard-column">
            <button className="reset-hands" onClick={resetHands}>Reset Hands</button>
            <button className="reset-score" onClick={resetScore}>Reset Score</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Blackjack;
