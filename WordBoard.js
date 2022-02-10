import { Trie } from "./Trie.js";

const MIN_WORD_LENGTH = 4;

class WordBoard {
  constructor(numOneLetters, numTwoLetters, numThreeLetters) {    
    //create a trie from a pre-built dictionary file
    this.trie = new Trie();

    //the results indexed by length of the words in the group
    this.results = [];

    //pick the requested number of letters from each group randomly
    let letters = [
      ...this.pickRandomLetters(this.trie.oneLetterGroups, numOneLetters), 
      ...this.pickRandomLetters(this.trie.twoLetterGroups, numTwoLetters), 
      ...this.pickRandomLetters(this.trie.threeLetterGroups, numThreeLetters)
    ];

    //set the initial dimension of board
    this.dimension = Math.floor(Math.sqrt(numOneLetters + numTwoLetters + numThreeLetters));
    
    //fill the board with the letter groups
    this.board = [];
    for(let row = 0;row < this.dimension;row++) {
      this.board.push([]);
      for(let col = 0;col < this.dimension;col++) {
        const randPos = Math.floor(Math.random() * letters.length);
        const letterGroup = letters[randPos];
        letters.splice(randPos, 1);
        this.board[row].push({
          letterGroup: letterGroup,
          visited: false
        });
      }
    }
  }

  pickRandomLetters(letterGroup, numLetters) {
    let letters = [];
    for(let i = 0;i < numLetters;i++) {
      const randPos = Math.floor(Math.random() * letterGroup.length);
      letters.push(letterGroup[randPos]);
      letterGroup.splice(randPos, 1);
    }
    return letters;
  }

  solve() {
    //clear out the previous visited data
    this.results = [];
    for(let row = 0;row < this.board.length;row++) {
      for(let col = 0;col < this.board.length;col++) {
        this.board[row][col].visited = false;
      }
    }
    //go through each starting position and find words
    for(let row = 0;row < this.board.length;row++) {
      for(let col = 0;col < this.board.length;col++) {
        const traversalInfo = [];
        this.solveHelper("", row, col, traversalInfo);
      }
    }
  }

  solveHelper(wordSoFar, row, col, traversalInfo) {
    //check to see if we are in the bounds of the board
    if(row >= 0 && row < this.dimension && col >= 0 && col < this.dimension) {
      //if this letter group hasn't been used yet
      if(this.board[row][col].visited === false) {
        //this letter group is now being used
        this.board[row][col].visited = true;
        //create a more complete word and search for it
        const updatedWord = wordSoFar + this.board[row][col].letterGroup;
        const searchResult = this.trie.search(updatedWord);

        //if the new word is in the trie
        if(searchResult === "FOUND" || searchResult === "PARTIAL") {
          const traversal = {
            row: row,
            column: col,
            direction: null
          };
          //add info about where the latest grouping was found
          traversalInfo.push(traversal);

          //if it is a complete word store it in the results
          if(searchResult === "FOUND" && updatedWord.length >= MIN_WORD_LENGTH) {
            const foundWordLength = updatedWord.length;
            if(!this.results[foundWordLength]) {
              this.results[foundWordLength] = [];
            }
            const completeWord = {
              word: updatedWord,
              traversalInfo: traversalInfo.map(info => {
                return {
                  row: info.row,
                  column: info.column,
                  direction: info.direction
                };
              })
            };
            this.results[foundWordLength].push(completeWord);
          }
          traversal.direction = "northWest";
          this.solveHelper(updatedWord, row - 1, col - 1, traversalInfo);
          traversal.direction = "north";
          this.solveHelper(updatedWord, row - 1, col, traversalInfo);
          traversal.direction = "northEast";
          this.solveHelper(updatedWord, row - 1, col + 1, traversalInfo);
          traversal.direction = "west";
          this.solveHelper(updatedWord, row, col - 1, traversalInfo);
          traversal.direction = "east";
          this.solveHelper(updatedWord, row, col + 1, traversalInfo);
          traversal.direction = "southWest";
          this.solveHelper(updatedWord, row + 1, col - 1, traversalInfo);
          traversal.direction = "south";
          this.solveHelper(updatedWord, row + 1, col, traversalInfo);
          traversal.direction = "southEast";
          this.solveHelper(updatedWord, row + 1, col + 1, traversalInfo);

          //we are on the way back from the recursion so remove the latest traversal info
          traversalInfo.pop();
        }
        //this wasn't used so mark it as usable in other searches
        this.board[row][col].visited = false;
      }
    }
  }

  clear(row, col) {
    //change the text in a letter group so that the letter group is never found in a word again
    this.board[row][col].letterGroup = "xxx";
  }

  toString() {
    let retVal = [];
    for(let row = 0;row < this.board.length;row++) {
      for(let col = 0;col < this.board.length;col++) {
        retVal.push(`${this.board[row][col].letterGroup}  `.substring(0, 3));
      }
      retVal.push("\n");
    }
    return ` ${retVal.join(" ")}`;
  }
}

export { WordBoard };