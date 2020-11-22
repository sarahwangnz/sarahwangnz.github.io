// the answer is generated by a random number function between 1 and 100
let correctAnswer = Math.floor((Math.random() * 100) + 1);

// this array holds all the previous guesses 
let previousGuesses = []; 


// this function checks if the guess is right 
// it returns 0 when the guess is right
// if guess < answer, it returns positive and your guess is too low
// if guess > answer, it returns negative and your guess is too high
function check(guess){
  return correctAnswer - guess;
}


// caching the DOM elements
const result_div = document.querySelector('#result');
const userGuess_input = document.querySelector('#user-guess');
const hint_div = document.querySelector('#hint');
const answerBox_div = document.querySelector('#answer-box');
const guesses_div = document.querySelector('#guesses');
const reset_button = document.querySelector('#reset');
const checkGuess_button = document.querySelector('#check-guess');
const errorMessage_div = document.querySelector('#error-message');

// display warning message 
function warning(message){
  errorMessage_div.innerHTML = message;
  errorMessage_div.classList.remove('hide');
  // empty the input box 
  userGuess_input.value = '';

  //hide alert after 2s
  setTimeout(function(){
    errorMessage_div.classList.add('hide');
  }, 2000);
}

// this function is called when the user submits a guess
// e represents the click event 
function onSubmit(e){
  // this prevents the default behavior of submitting a form
  e.preventDefault();
  // refocus on the input 
  userGuess_input.focus();

  // check number of guesses in current game
  if (previousGuesses.length >= 10) {
    warning('Game Over!');
    resetGame();
    return;
  }

   // get the user's guess from the user-guess box
   const userGuess = userGuess_input.value;
   // all these conditions are not good
  
   if (userGuess === '' || !Number.isInteger(parseInt(userGuess)) || userGuess < 1 || userGuess > 100) {
     warning('Please enter a number between 1 and 100.');
     return; //exit function 
   } else {
    errorMessage_div.classList.add('hide');
   }

  // show the answer box by removing the hide class
  answerBox_div.classList.remove('hide');

  // empty the input box 
  userGuess_input.value = '';

  // save current guess into previousGuesses array to be displayed later 
  previousGuesses.push(userGuess);

  // print out previous guesses 
  // alternate version: guesses.innerHTML = "Previous guesses: " + previousGuesses.join(', ');
  guesses_div.innerHTML = `Previous guesses: ${previousGuesses.join(', ')}`;

  // call check function, if it returns 0, right is true, otherwise false 
  const right = check(userGuess) === 0;
  // if the answer is right, it will print congrats, if wrong, it will print sorry 
  result_div.innerHTML = right ? 'Congratulations! You got it right!' : 'Sorry! Please try again.';

  // checking user guess with an if/else statement 
  // if not right, change result color to red and show hint 
  if (!right) {
    // check if userGuess is too high or too low by passing it into the check function 
    // change hint content 
    hint_div.innerHTML = check(userGuess) > 0 ? "Last guess was too low!" : "Last guess was too high!";
    // show hint by removing hide class
    hint_div.classList.remove('hide');

    // change result color by swapping success to danger 
    result_div.classList.remove('alert-success');
    result_div.classList.add('alert-danger');

    // hide reset button 
    reset_button.classList.add('hide');
  } else {
    // if right, hide hint 
    hint_div.classList.add('hide');
    // change result from danger to success 
    result_div.classList.remove('alert-danger');
    result_div.classList.add('alert-success');
    // show reset button 
    reset_button.classList.remove('hide');
  }
} // end of function onSubmit 


// event handler that resets game is called when user clicks on reset button
function onReset(e){
  e.preventDefault();
  // when button is clicked, hide answer-box and clear previous array for a new game 
  resetGame();
}

// reset game 
function resetGame(){
  answerBox_div.classList.add('hide');
  previousGuesses = [];
  // reset answer otherwise there IS NO GAME
  correctAnswer = Math.floor((Math.random() * 100) + 1);
}


// when submit guess button is clicked, it calls the onSubmit function 
checkGuess_button.onclick = onSubmit;

// when start new game button is clicked, it calls the onReset function 
reset_button.addEventListener('click', onReset);