import React from 'react';

export default function Grid({ width, currentRow, userInput, feedback, history, text}) {
  const cells = [];

  for (let row = 0; row < 7; row++) {
    const rowCells = [];

    for (let col = 0; col < width; col++) {
      const isCurrentRow = row === currentRow;

      const cellData = history.find(item => item.row === row);
      const letter = isCurrentRow ? userInput[col] : cellData?.word[col] || '';
      const letterFeedback = isCurrentRow ? feedback[col] : cellData?.feedback[col] || 0;

      const cellClass = `grid-cell feedback-${letterFeedback}`;
      rowCells.push(
        <div key={`${row}-${col}`} className={cellClass}>
          {letter}
        </div>
      );
    }
    cells.push(
      <div key={row} className="grid-row">
        {rowCells}
      </div>
    );
  }

  return (
    <div className="grid">
      <h1>Motus</h1>
      {cells}
      <h2>{text}</h2>
    </div>
  );
}