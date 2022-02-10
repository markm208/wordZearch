const path = require("path");
const fs = require("fs");

//
const TOP_NUMBER_OF_ONE_LETTER_GROUPS = 26;
const TOP_NUMBER_OF_TWO_LETTER_GROUPS = 20;
const TOP_NUMBER_OF_THREE_LETTER_GROUPS = 10;

class BuildTrie {
  constructor(dictFilePath) {
    //the path to a dictionary
    this.dictionaryFilePath = dictFilePath;
    
    //partial and complete words
    this.wordMap = {};
    //the most frequent letter groupings from words in the dictionary
    this.oneLetterGroupings = [];
    this.twoLetterGroupings = [];
    this.threeLetterGroupings = [];

    //read and process words in dictionary
    this.readDictionaryFile(this.dictionaryFilePath);

    //for debugging to look at the trie data
    fs.writeFileSync("trieData.json", JSON.stringify(this.wordMap, null, 4), "utf-8");

    //add the computed data to the template classes and write them
    let trieCode = fs.readFileSync("./TrieTemplate.txt", "utf-8");
    trieCode = trieCode.replace("/*REPLACE_WORD_MAP*/", JSON.stringify(this.wordMap, null, 0));
    trieCode = trieCode.replace("/*ONE_LETTER_GROUPS*/", JSON.stringify(this.oneLetterGroupings));
    trieCode = trieCode.replace("/*TWO_LETTER_GROUPS*/", JSON.stringify(this.twoLetterGroupings));
    trieCode = trieCode.replace("/*THREE_LETTER_GROUPS*/", JSON.stringify(this.threeLetterGroupings));
    fs.writeFileSync("../Trie.js", trieCode);
  }

  readDictionaryFile(filePath) {
    //counts all frequencies of letter groups
    const oneLetterFrequencies = {};
    const twoLetterFrequencies = {};
    const threeLetterFrequencies = {};

    //read all of the words from the dictionary file and process each one
    const words = fs.readFileSync(filePath, "utf-8").split(/\s/);
    words.forEach(word => {
      //ensure all the letters are lowercase
      word = word.toLowerCase();
      
      //add the word to the trie object
      this.addWordToObject(word, this.wordMap);

      //find the most frequent groupings of letters
      this.addToFrequencies(word, oneLetterFrequencies, 1);
      this.addToFrequencies(word, twoLetterFrequencies, 2);
      this.addToFrequencies(word, threeLetterFrequencies, 3);
    });
    
    //get relative groups of letter combos
    this.oneLetterGroupings = this.sortByFrequency(oneLetterFrequencies, TOP_NUMBER_OF_ONE_LETTER_GROUPS);
    this.twoLetterGroupings = this.sortByFrequency(twoLetterFrequencies, TOP_NUMBER_OF_TWO_LETTER_GROUPS);
    this.threeLetterGroupings = this.sortByFrequency(threeLetterFrequencies, TOP_NUMBER_OF_THREE_LETTER_GROUPS);
  }

  addWordToObject(word, wordMap) {
    //go through each letter of the word
    for(let i = 0;i < word.length;i++) {
      const letter = word.at(i);
      
      //if there is not an entry in the wordMap for the 
      //current letter, then add a new one with the 
      //letter as the key
      if(!wordMap[letter]) {
        wordMap[letter] = {
          wordMap: {}
        };
      }

      //if its the last letter of the word
      if(i === word.length - 1) {
        //add a property to indicate its a full word
        wordMap[letter].completeWord = true;
      } else { //its not the last letter of the word
        //move down the tree to the next letter's map
        wordMap = wordMap[letter].wordMap;
      }
    }
  }

  addToFrequencies(word, frequencyObject, comboLength) {
    //go through combos of letters
    for(let i = 0;i <= word.length - comboLength;i++) {
      const letterCombo = word.substring(i, i + comboLength);
      //if the combo exists
      if(frequencyObject[letterCombo]) {
        //increase the freq
        frequencyObject[letterCombo]++;
      } else {
        //init the freq on the first occurrence
        frequencyObject[letterCombo] = 1;
      }
    }
  }

  sortByFrequency(letterFrequencies, topX) {
    //get all the frequencies from the object 
    //[[letterCombo, frequency], [letterCombo, frequency], ...]
    let entries = Object.entries(letterFrequencies);

    //execute topX times
    let numToSort = topX > entries.length ? entries.length: topX;
    for(let i = 0;i < numToSort;i++) {
      //swap so that the largest frequencies bubble to the front
      for(let j = entries.length - 1;j > 0;j--) {
        //compare frequencies in the entries
        if(entries[j][1] > entries[j - 1][1]) {
          let temp = entries[j];
          entries[j] = entries[j - 1];
          entries[j - 1] = temp;
        }
      }
    }

    //create copies of the letter groupings based on their relative frequency
    const topFrequencies = entries.slice(0, numToSort);
    const smallestFreq = topFrequencies[topFrequencies.length - 1][1];
    const relativeLetterGroups = [];

    topFrequencies.forEach(freq => {
      const numOccurrences = Math.floor(freq[1] / smallestFreq);
      for(let i = 0;i < numOccurrences;i++) {
        relativeLetterGroups.push(freq[0]);
      }
    });
    return relativeLetterGroups;
  }
}

module.exports = BuildTrie; 