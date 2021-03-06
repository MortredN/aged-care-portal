import { QuerySnapshot } from '@angular/fire/firestore';

/** Capitalize every letter in a string */
export function capitalize(str: string) {
  let newStr = ''
  if(str.includes(" ")){
    let strArray = str.split(" ");
    for(let i = 0; i < strArray.length; i++) {
      strArray[i] = strArray[i].charAt(0).toUpperCase() + strArray[i].toLowerCase().slice(1);
      if(i == strArray.length - 1) {
        newStr += strArray[i];
      }
      else {
        newStr += strArray[i] + " ";
      }
    }
  }
  else {
    newStr = str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);
  }
  return newStr;
}

/** Get a random ID which is unique from all IDs in the firestore database */
export function randomUniqueID(idSnapshot: QuerySnapshot<any>) {
  let existedIDs: string[] = [];
  const idSnapshotArray = idSnapshot.docs;
  for(let i = 0; i < idSnapshotArray.length; i++) {
    existedIDs.push(idSnapshotArray[i].id);
  }
  // A character can be a digit (0-9) or a uppercase letter (A-Z)
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let newID = "";
  do {
    newID = "";
    // Length of 5
    for(let i = 0; i < 5; i++) {
      var randomChar = chars.charAt(Math.floor(Math.random() * 36));
      newID += randomChar;
    }
  } while (existedIDs.includes(newID)); // Find a new ID if there is a similar ID in the Firebase
  return newID;
}

/** Get a random 8-digit password */
export function randomPassword() {
  let password = "";
  for(let i = 0; i < 8; i++) {
    var randomDigit = Math.floor(Math.random() * 10);
    password += randomDigit.toString();
  }
  return password;
}

/** Check if a string is numerical */
export function isNumeric(string: string) {
  return (/^\d+$/).test(string);
}

/** Check if a string is an email */
export function isEmail(string: string) {
  return (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(string);
}

/** Check if array elements in an array with a number added (or removed) are consecutive by 1 */
export function arrayConsecutive(arr: number[], num: number, adding: boolean) {
  let array: number[] = [];
  array = array.concat(arr);
  let isConsecutive = true;
  // adding = true -> add to the array, adding = false -> remove from the array
  if(adding) {
    array.push(num);
    sortNumArray(array);
  }
  else {
    array = array.filter((value) => {return value != num});
  }
  for(let i = 0; i < (array.length - 1); i++) {
    if(!(array[i] == (array[i + 1] - 1))) {
      isConsecutive = false;
    }
  }
  return isConsecutive;
}

/** Sort number array in ascending order */
export function sortNumArray(arr: number[]) {
  arr.sort((a, b) => {return a - b});
  return arr;
}
