import { WordBoard } from "./WordBoard.js";

//main word board object
let wordBoard;
//total number of words found so far
let numFoundWords;
//timestamps
let startTime;
let lastSolveTime;

//when the page has been loaded
document.addEventListener("DOMContentLoaded", event => {
  //fill the board and begin play
  loadBoard();
  
  //for bootstrap popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
  const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl)
  });
});

function loadBoard() {
  numFoundWords = 0;
  startTime = new Date();
  lastSolveTime = startTime;
  //create a board with the specified number of 1, 2, and 3 letter groups
  wordBoard = new WordBoard(33, 11, 5);

  //fill the board container with letters
  for(let row = 0;row < wordBoard.board.length;row++) {
    for(let col = 0; col < wordBoard.board[row].length;col++) {
      //get a td and set its text and register a button handler
      const td = document.getElementById(`row${row}:column${col}`);
      td.innerHTML = wordBoard.board[row][col].letterGroup;
      //clear out any old classes
      td.classList = "";
      td.classList.add("boardPiece");
      td.addEventListener("click", letterGroupClicked);
    }
  }

  //clear out any existing list items and congrats message
  const longestWordList = document.getElementById("longestWordList");
  longestWordList.innerHTML = "";

  const congratsMessage = document.getElementById("congratsMessage");
  congratsMessage.innerHTML = "";

  const solvedWords = document.getElementById("solvedWords");
  solvedWords.innerHTML = ""; 

  //display the words that can be made from the current board
  displayPossibleWords();
}

function displayPossibleWords() {
  //add the longest words to a list
  //get the latest and longest words that can be made
  wordBoard.solve();
  const completeWords = wordBoard.results[wordBoard.results.length - 1];

  //update the list and number of groups being used
  const longestWordList = document.getElementById("longestWordList");
  longestWordList.innerHTML = "";
  const numCompleted = document.getElementById("numCompleted");
  numCompleted.innerHTML = `${document.getElementsByClassName("solved").length}/49 squares`;

  //if there are any words left to be found
  if(completeWords && completeWords.length > 0) {
    //don't show duplicates even though the same word may show up 
    //multiple times on the board
    const uniqueWords = new Set();

    //add only unique words to the list
    completeWords.forEach(completeWord => {
      if(!uniqueWords.has(completeWord.word)) {
        uniqueWords.add(completeWord.word);
        const wordSpan = document.createElement("li");
        wordSpan.classList.add("solvableWord");
        wordSpan.innerHTML = completeWord.word;
        longestWordList.appendChild(wordSpan)
      }
    });
  } else { //no more words can be found
    //let the user know the game is over
    const endGame = document.createElement("div");
    const gameEndTime = new Date();
    const gameDuration = ((gameEndTime.getTime() - startTime.getTime()) / 1000).toFixed(0);
    endGame.innerHTML = `Congratulations! <br/>You solved it in ${gameDuration} seconds.`;

    //add a button to play another game
    const newGameButton = document.createElement("button");
    newGameButton.classList.add("btn");
    newGameButton.classList.add("btn-dark");
    newGameButton.innerHTML = "New Game";
    newGameButton.addEventListener("click", event => {
      loadBoard();
    });

    const congratsMessage = document.getElementById("congratsMessage");
    congratsMessage.innerHTML = "";
    congratsMessage.appendChild(endGame);
    congratsMessage.appendChild(newGameButton);  
  }
}

function letterGroupClicked(event) {
  //get the clicked letter group
  const clickedLetterGroup = event.target;

  //if already clicked
  if(clickedLetterGroup.classList.contains("clicked")) {
    //deactivate
    clickedLetterGroup.classList.remove("clicked");
  } else { //not already clicked
    //if it is not solved then mark it as clicked
    if(clickedLetterGroup.classList.contains("solved") === false) {
      clickedLetterGroup.classList.add("clicked");
    }
  }
  //check to see if a word has been found
  checkForResult();
}

function checkForResult() {
  //if there are some results remaining
  const longestCompleteWords = wordBoard.results[wordBoard.results.length - 1];
  if(longestCompleteWords && longestCompleteWords.length > 0) {
    //get all of the selected letter groups
    let recentSelections = document.getElementsByClassName("clicked");

    //go through each complete word
    for(let i = 0;i < longestCompleteWords.length;i++) {
      const completeWord = longestCompleteWords[i];
      //if the selection is the same length as the current word
      if(recentSelections.length === completeWord.traversalInfo.length) {
        //if all of the selected letter groups are in a result word
        if(compareSelectionToCompleteWords(recentSelections, completeWord)) {
          //get a color to turn the letter group into
          const solvedColor = `solved${numFoundWords % 20}`;
          
          //update the class on the recent selections
          while(recentSelections.length > 0) {
            const selection = recentSelections[0];
            selection.classList.remove("clicked");
            selection.classList.add(solvedColor);
            selection.classList.add("solved");
            //get the location of the selected letter group
            const row = Number(selection.getAttribute("boardRow"));
            const column = Number(selection.getAttribute("boardColumn"));
            //clear out those letters so that they can't be used again
            wordBoard.clear(row, column);
          }

          //display the new list of words that can be made
          displayPossibleWords();
          //display the words discovered so far
          addWordToResults(completeWord.word, solvedColor);
          //increase the number of words found
          numFoundWords++;
        }
      }
    }
  } else {
    console.log("No more words left");
  }
}

function compareSelectionToCompleteWords(recentSelections, completeWord) {
  let retVal = false;

  //map of location info to traversal objects
  const traversalInfoObjects = {};
  //collect all of the traversal info for the complete word
  for(let i = 0;i < completeWord.traversalInfo.length;i++) {
    const traversal = completeWord.traversalInfo[i];
    const traversalLocationInfo = `row:${traversal.row},column:${traversal.column}`;
    traversalInfoObjects[traversalLocationInfo] = traversal;
  }

  //see if there is an exact match in the selected letter groups and this word's traversal info
  let numMatches = 0;
  for(let i = 0;i < recentSelections.length;i++) {
    const selectedLetterGroup = recentSelections[i];
    const selectedRow = Number(selectedLetterGroup.getAttribute("boardRow"));
    const selectedColumn = Number(selectedLetterGroup.getAttribute("boardColumn"));
    const selectedLocationInfo = `row:${selectedRow},column:${selectedColumn}`;
    //count the number of matches
    if(traversalInfoObjects[selectedLocationInfo]) {
      numMatches++;
    }
  }

  //if the selected letter groups are the same as the letter groups in the 
  //complete word then a word has been found
  if(numMatches === completeWord.traversalInfo.length) {
    //go through all of the selected letter groups
    for(let i = 0;i < recentSelections.length;i++) {
      const selectedLetterGroup = recentSelections[i];
      const selectedRow = Number(selectedLetterGroup.getAttribute("boardRow"));
      const selectedColumn = Number(selectedLetterGroup.getAttribute("boardColumn"));
      //get the move direction from the complete word 
      const selectedLocationInfo = `row:${selectedRow},column:${selectedColumn}`;
      if(traversalInfoObjects[selectedLocationInfo].direction) {
        //add the direction class to the selected letter group
        selectedLetterGroup.classList.add(traversalInfoObjects[selectedLocationInfo].direction);
      }

      //if this is the first selected letter group of a word
      if(completeWord.traversalInfo[0].row === selectedRow && completeWord.traversalInfo[0].column === selectedColumn) {
        selectedLetterGroup.classList.add("firstLetter");
      }

      //if it is the last selected letter group of a word
      if(completeWord.traversalInfo[completeWord.traversalInfo.length - 1].row === selectedRow && completeWord.traversalInfo[completeWord.traversalInfo.length - 1].column === selectedColumn) {
        selectedLetterGroup.classList.add("lastLetter");
      }
    }
    //indicate that a match has been found
    retVal = true;
  }
  return retVal;
}

function addWordToResults(word, solvedColor) {
  //get the list of solved words and add a new entry
  const solvedWords = document.getElementById("solvedWords");
  const wordLi = document.createElement("li");

  //add a color swatch
  const wordColor = document.createElement("span");
  wordColor.classList.add(solvedColor);
  wordColor.classList.add("swatch");
  wordColor.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";  
  wordLi.appendChild(wordColor);

  //add the word to the list
  const wordText = document.createElement("span");
  wordText.innerHTML = word;
  //add the word to the list
  wordLi.appendChild(wordText);

  //add a time
  const endTime = new Date();
  const diff = (endTime.getTime() - lastSolveTime.getTime()) / 1000;
  const lengthOfTime = document.createElement("span");
  lengthOfTime.innerHTML = ` (${diff.toFixed(1)} seconds) `;
  wordLi.appendChild(lengthOfTime);
  lastSolveTime = endTime;

  //add a link to look up the word
  const defineLink = document.createElement("a");
  defineLink.setAttribute("href", `https://www.google.com/search?q=define+${word}`);
  defineLink.setAttribute("target", "_blank");
  defineLink.classList.add("text-muted");
  defineLink.innerHTML = `<small>Define '${word}'</small>`;
  wordLi.appendChild(defineLink);

  //make a mouse over highlight the word
  wordLi.addEventListener("mouseover", event => {
    const elements = document.getElementsByClassName(solvedColor);
    for(let i = 0;i < elements.length;i++) {
      elements[i].classList.add("highlight");
    }
  });
  wordLi.addEventListener("mouseout", event => {
    const elements = document.getElementsByClassName(solvedColor);
    for(let i = 0;i < elements.length;i++) {
      elements[i].classList.remove("highlight");
    }
  });

  //for mobile, use touch events
  wordLi.addEventListener("touchstart", event => {
    const elements = document.getElementsByClassName(solvedColor);
    for(let i = 0;i < elements.length;i++) {
      elements[i].classList.add("highlight");
    }
  });
  wordLi.addEventListener("touchend", event => {
    const elements = document.getElementsByClassName(solvedColor);
    for(let i = 0;i < elements.length;i++) {
      elements[i].classList.remove("highlight");
    }
  });
  
  solvedWords.appendChild(wordLi);
}
