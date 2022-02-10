export default class Trie {
  constructor() {
    //this is a tree of partial and complete words

    //these are the proportional letter groups from a dictionary file
    this.oneLetterGroups = ["e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","e","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","i","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","s","s","s","s","s","s","s","s","s","s","s","s","s","s","s","s","s","s","s","s","s","s","s","s","s","s","l","l","l","l","l","l","l","l","l","l","l","l","l","l","l","l","l","l","l","l","l","l","l","l","l","l","c","c","c","c","c","c","c","c","c","c","c","c","c","c","c","c","c","c","c","c","c","u","u","u","u","u","u","u","u","u","u","u","u","u","u","u","u","u","m","m","m","m","m","m","m","m","m","m","m","m","m","m","m","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","p","p","p","p","p","p","p","p","p","p","p","p","p","p","h","h","h","h","h","h","h","h","h","h","h","h","h","g","g","g","g","g","g","g","g","g","g","g","b","b","b","b","b","b","b","b","b","b","y","y","y","y","y","y","y","y","y","f","f","f","f","f","f","f","w","w","w","w","w","k","k","k","k","k","v","v","v","v","x","z","j","q"];
    this.twoLetterGroups = ["er","er","in","an","on","te","le","en","at","re","ar","ra","ti","st","al","or","ri","nt","ic","ro","co"];
    this.threeLetterGroups = ["ate","ate","ent","ion","ter","ble","ing","ous","ant","tio","con"];
  }

  search(word) {
    let retVal = "";
    word = word.toLowerCase();
    
    //get a (changeable) reference to the top level object
    let wordMap = this.wordMap;
    
    //go through each letter in the search word
    for(let i = 0;i < word.length;i++) {
      const letter = word[i];

      //if the current letter is in the map
      if(wordMap[letter]) {
        //if this is the last letter in the passed in word
        if(i === word.length - 1) {
          //if it is a complete word
          if(wordMap[letter].completeWord) {
            retVal = "FOUND";
          } else { //partial word
            retVal = "PARTIAL";
          }
        } else { //not the last letter of the passed in word
          //move the reference down the tree to the next letter
          wordMap = wordMap[letter].wordMap;
        }
      } else { //the current letter is not in the map
        retVal = "NOT FOUND";
        break;
      }
    }

    return retVal;
  }
}

export { Trie };