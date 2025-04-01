import { useState, useEffect } from 'react';

function Matching() {
    const [mode, setMode] = useState(null);
    const [cards, setCards] = useState([]);
    const [deckId, setDeckId] = useState(null);
    const [flippedIndices, setFlippedIndices] = useState([]); 
    const [matchedCards, setMatchedCards] = useState([]); 
    const [isFlipping, setIsFlipping] = useState(false);
    const [lives, setLives] = useState([]);

    // Fetch new deck from the API
    useEffect(() => {
        const fetchDeck = async () => {
            const response = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
            const data = await response.json();
            setDeckId(data.deck_id);
        };
        fetchDeck();
    }, []);

    // Fetch cards based on mode
    useEffect(() => {
        if (!deckId) return;
        const fetchCards = async () => {
            const numCards = mode === 5 ? 5 : mode === 7 ? 7 : 10; 
            const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${numCards}`);
            const data = await response.json();
            const drawnCards = data.cards.map(card => ({
                ...card,
                isFaceUp: false, 
                id: card.code, 
            }));

            const duplicateCards = [...drawnCards, ...drawnCards];
            shuffleArray(duplicateCards);
            setCards(duplicateCards);
            setLives(mode === 5 ? 10 : mode === 7 ? 5 : 3); // Set lives based on mode, 10 for easy, 5 for medium, 3 for hard.
        };
        fetchCards();
    }, [deckId, mode]);
    
    // Check for win condition
    useEffect(() => {
        if (matchedCards.length === cards.length / 2) {
            alert("Congratulations! You've matched all the cards!");
            setFlippedIndices([]);
            setMatchedCards([]);
            setCards([]);
            setMode(null);
            setDeckId(null);
        }
    }, [matchedCards, cards]);

    // Check lives for game over condition (lives reduced to 0)
    useEffect(() => {
        if (lives === 0) {
            alert("Game Over! You ran out of lives!");
            setFlippedIndices([]);
            setMatchedCards([]);
            setCards([]);
            setMode(null); // Reset mode
            setDeckId(null); // Reset deck ID
        }
    }, [lives]);
    
    // Shuffle the cards randomly
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; 
        }
    };

    // Logic for handling card flip
    const handleCardClick = (index) => {
        if (
            flippedIndices.includes(index) || 
            matchedCards.includes(cards[index].id) || 
            flippedIndices.length === 2 || 
            isFlipping 
        ) {
            return;
        }

        // Flip the cards
        const newFlippedIndices = [...flippedIndices, index];
        setFlippedIndices(newFlippedIndices);

        // Compare the cards
        if (newFlippedIndices.length === 2) {
            setIsFlipping(true); 
            setTimeout(() => {
                const [firstIndex, secondIndex] = newFlippedIndices;
                if (cards[firstIndex].id === cards[secondIndex].id) {
                    setMatchedCards([...matchedCards, cards[firstIndex].id]); 
                }
                setFlippedIndices([]); 
                setIsFlipping(false); 
            }, 1000); 
        }
    };

    const setEasy = () => {
        setMode(5);
    };

    const setMedium = () => {
        setMode(7);
    };

    const setHard = () => {
        setMode(10);
    };

    return (
        <div className="buttonLevels">
            <button onClick={setEasy} id="easy">Easy Mode</button>
            <button onClick={setMedium} id="medium">Medium Mode</button>
            <button onClick={setHard} id="hard">Hard Mode</button>
            {mode === 5 && <Easy mode={mode} cards={cards} handleCardClick={handleCardClick} flippedIndices={flippedIndices} matchedCards={matchedCards} />}
            {mode === 7 && <Medium mode={mode} cards={cards} handleCardClick={handleCardClick} flippedIndices={flippedIndices} matchedCards={matchedCards} />}
            {mode === 10 && <Hard mode={mode} cards={cards} handleCardClick={handleCardClick} flippedIndices={flippedIndices} matchedCards={matchedCards} />}
        </div>
    );
}

function Easy({ mode, cards, handleCardClick, flippedIndices, matchedCards }) {
    return (
        <>
            <h3>Easy Mode ({mode} Cards)</h3>
            <div id="card-container-easy">
                {cards.map((card, index) => (
                    <Card
                        key={index}
                        card={card}
                        index={index}
                        isFlipped={flippedIndices.includes(index)}
                        isMatched={matchedCards.includes(card.id)}
                        handleCardClick={handleCardClick}
                    />
                ))}
            </div>
        </>
    );
}

function Medium({ mode, cards, handleCardClick, flippedIndices, matchedCards }) {
    return (
        <>
            <h3>Medium Mode ({mode} Cards)</h3>
            <div id="card-container-medium">
                {cards.map((card, index) => (
                    <Card
                        key={index}
                        card={card}
                        index={index}
                        isFlipped={flippedIndices.includes(index)}
                        isMatched={matchedCards.includes(card.id)}
                        handleCardClick={handleCardClick}
                    />
                ))}
            </div>
        </>
    );
}

function Hard({ mode, cards, handleCardClick, flippedIndices, matchedCards }) {
    return (
        <>
            <h3>Hard Mode ({mode} Cards)</h3>
            <div id="card-container-hard">
                {cards.map((card, index) => (
                    <Card
                        key={index}
                        card={card}
                        index={index}
                        isFlipped={flippedIndices.includes(index)}
                        isMatched={matchedCards.includes(card.id)}
                        handleCardClick={handleCardClick}
                    />
                ))}
            </div>
        </>
    );
}

function Card({ card, index, isFlipped, isMatched, handleCardClick }) {
    const handleClick = () => {
        if (!isFlipped && !isMatched) {
            handleCardClick(index); 
        }
    };
    return (
        <div className="card" onClick={handleClick}>
            <img
                src={isFlipped || isMatched ? card.image : 'https://deckofcardsapi.com/static/img/back.png'}
                alt={card.code}
                className="card-img"
            />
        </div>
    );
}

export default Matching;
