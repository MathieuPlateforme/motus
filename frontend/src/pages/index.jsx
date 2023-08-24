import { useEffect, useState, useRef } from 'react'
import Grid from '../components/Grid';

export default function Index() {
  const [word, setWord] = useState('');
  const [wordLength, setWordLength] = useState(6);
  const [userInput, setUserInput] = useState(Array(wordLength).fill(''));
  const [feedback, setFeedback] = useState(Array(wordLength).fill(0));
  const [attempts, setAttempts] = useState(0);
  const [history, setHistory] = useState([]);
  const [text, setText] = useState('');
  const [restart, setRestart] = useState(false);

  const MAX_ATTEMPTS = 7;

  const getWord = async (wordLength) => {
    const response = await fetch(`https://trouve-mot.fr/api/size/${wordLength}`);
    const data = await response.json();
    const normalizedWord = data[0].name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    setWord(normalizedWord.toUpperCase());
  }

  const checkUserInput = async () => {
    const word = userInput.join('');
    const response = await fetch(`https://trouve-mot.fr/api/startwith/${word}`);
    const data = await response.json();
    if(data.length) {
      return true;
    } else {
      return false
    }
  }

  const addUserInput = (letter) => {
    setUserInput((prevInput) => {
      const updatedInput = [...prevInput];
      const emptyIndex = updatedInput.findIndex((input) => input === '');
      if (emptyIndex !== -1) {
        updatedInput[emptyIndex] = letter;
      }
      return updatedInput;
    });
  };

  const removeUserInput = () => {
    setUserInput((prevInput) => {
      const reversedInput = [...prevInput].reverse();
      const lastFilledIndex = reversedInput.findIndex((letter) => letter !== '');

      if (lastFilledIndex !== -1) {
        reversedInput[lastFilledIndex] = '';
      }

      return reversedInput.reverse();
    });
  };

  const handleRestart = () => {
    setAttempts(0);
    setFeedback([]);
    setUserInput(Array(wordLength).fill(''));
    setHistory([]);
    setRestart(false);
    setText('');
    getWord(wordLength);
  };

  const handleWordLengthChange = (event) => {
    setWordLength(parseInt(event.target.value));
    handleRestart();
  };


  const handleKeyPress = (event) => {
    if(attempts === MAX_ATTEMPTS) {
      return;
    }
    const key = event.key.toUpperCase();

    if (key === 'BACKSPACE') {
      removeUserInput();
    } else if (/^[A-Z]$/.test(key)) {
      addUserInput(key);
    } else if (key === 'ENTER' && userInput.join('').length === wordLength) {
      setText('')
      checkUserInput().then((result) => {
        if(result){
          setAttempts(attempts + 1)
          const updatedFeedback = userInput.map((letter, index) => {
            if (letter === word[index]) {
              return 2;
            } else if (word.includes(letter)) {
              return 1;
            } else {
              return 3;
            }
          });
          setHistory((prevHistory) => [
            ...prevHistory,
            {
              row: attempts,
              word: userInput,
              feedback: updatedFeedback
            }
          ]);
          setFeedback((prevFeedback) => {
            const updated = [...prevFeedback];
            updated[attempts] = updatedFeedback;
            return updated;
          });
          setUserInput(Array(wordLength).fill(''));
          if (updatedFeedback.every(feedbackValue => feedbackValue === 2)) {
            setText('Vous avez gagné !');
            setRestart(true);
          }
        }
        else{
          setText('Ce mot n\'est pas dans le dictionnaire')
        }
      })
    }
  };
  console.log(word)

  useEffect(() => {
    getWord(wordLength);
    setUserInput(Array(wordLength).fill(''));
    setFeedback(Array(wordLength).fill(0));
  }, [wordLength]);

  useEffect(() => {
    if (attempts === MAX_ATTEMPTS) {
      setRestart(true);
      setText(`Vous avez perdu ! Le mot était ${word}`);
    }
  }, [attempts]);

  return (
    <div className='container' onKeyDown={(e) => handleKeyPress(e)} tabIndex={0}>
    <div className='word'>
      <Grid width={wordLength} currentRow={attempts} feedback={feedback} history={history} userInput={userInput} text={text}/>
      <div className='second-container'>
        <div className="select-container">
          <label>Longueur du mot:</label>
          <select value={wordLength} onChange={handleWordLengthChange}>
            {Array.from({ length: 8 }, (_, index) => index + 5).map(length => (
              <option key={length} value={length}>{length} lettres</option>
            ))}
          </select>
        </div>
        {restart &&
        <button onClick={handleRestart} className='restart'>Rejouer</button>
        }
      </div>    
    </div>
  </div>
  );
}