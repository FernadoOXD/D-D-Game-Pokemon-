const highScoreElement = document.getElementById('high-score');
const scoreElement = document.getElementById('current-score');
const roundsElement = document.getElementById('current-round');
const livesElement = document.getElementById('lives');
const CARDS = 5;
const MAX_LIVES = 3;

let score = parseInt(localStorage.getItem('currentScore')) || 0;
let highScore = parseInt(localStorage.getItem('highScore')) || 0;
let currentRound = parseInt(localStorage.getItem('currentRound')) || 0;
let lives = MAX_LIVES;
let isGameActive = true; 


livesElement.innerText = `Vidas: ${lives}💖`;
roundsElement.innerText = `Ronda: ${currentRound}`


scoreElement.innerText = score;
highScoreElement.innerText = highScore;

function resetGame() {
    localStorage.removeItem('currentScore');
    localStorage.setItem('currentScore', 0);
    score = 0;
    currentRound = 0
    lives = MAX_LIVES;
    scoreElement.innerText = score;
    livesElement.innerText = `Vidas: ${lives}💖`;
    roundsElement.innerText = `Ronda: ${currentRound}`
    startNewRound();
}


function startNewRound() {
    let pokemonNames = [];
    let pokemonSearched = [];
    isGameActive = true
    currentRound++
    roundsElement.innerText = `Ronda: ${currentRound}`

    document.querySelector('.draggable-elements').innerHTML = '';
    document.querySelector('.droppable-elements').innerHTML = '';

    for (let i = 0; i < CARDS; i++) {
        let id = getRandomid(150);
        searchPokemonById(id, pokemonNames, pokemonSearched);
    }
}


function getRandomid(max) {
    return Math.floor(Math.random() * max) + 1;
}


startNewRound();

async function searchPokemonById(id, pokemonNames, pokemonSearched) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
    const data = await res.json();

    pokemonSearched.push(data);
    pokemonNames.push(data.name);

    // Mezclar los nombres de los pokemones
    if (pokemonSearched.length === CARDS) {
        pokemonNames = pokemonNames.sort(() => Math.random() - 0.5);
        
        // Dibujar los pokemones en la pantalla
        const draggableElements = document.querySelector('.draggable-elements');
        pokemonSearched.forEach(pokemon => {
            draggableElements.innerHTML += `
                <div class="pokemon">
                    <img id="${pokemon.name}" draggable="true" class="image" src="${pokemon.sprites.other['official-artwork'].front_default}" alt="pokemon">
                </div>`;
        });

        const droppableElements = document.querySelector('.droppable-elements');
        droppableElements.innerHTML = '';
        pokemonNames.forEach(name => {
            droppableElements.innerHTML += `
            <div class="names">
                <p>${name}</p>
            </div>`;
        });

        initializeDragAndDrop();
    }


    function initializeDragAndDrop() {
        if (!isGameActive) return;
    
        let pokemons = document.querySelectorAll('.image');
        pokemons = [...pokemons];
    
        pokemons.forEach(pokemon => {
            pokemon.addEventListener('dragstart', event => {
                event.dataTransfer.setData('text', event.target.id);
            });
        });
    
        let names = document.querySelectorAll('.names');
        let wrongmsg = document.querySelector('.error-message');
        let points = 0;
    
        names = [...names];
    
        names.forEach(name => {
            name.addEventListener('dragover', event => {
                event.preventDefault();
            });
    
            function showErrorMessage(message) {
                const errorMessage = document.createElement('div');
                errorMessage.classList.add('error-message');
                errorMessage.innerText = message;
                document.body.appendChild(errorMessage);

                setTimeout(() => {
                    errorMessage.remove();
                }, 2000);
            }

            function showCorrectMessage(message) {
                const correctMessage = document.createElement('div');
                correctMessage.classList.add('win-message');
                correctMessage.innerText = message;
                document.body.appendChild(correctMessage);

                setTimeout(() => {
                    correctMessage.remove();
                }, 2000);
            }

            
            
            name.addEventListener('drop', event => {
                const draggableElementData = event.dataTransfer.getData('text');
                let pokemonElement = document.querySelector(`#${draggableElementData}`);
            
                if (event.target.innerText == draggableElementData) {
                    points++;
                    showCorrectMessage('Correcto! Felicitaciones sigue asi🎉')
                    score++;
                    scoreElement.innerText = score;
                    
                    event.target.innerHTML = ''; 
                    event.target.appendChild(pokemonElement); 
                    wrongmsg.innerText = '';
            
                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem('highScore', highScore);
                        highScoreElement.innerText = highScore;
                    }
            
                    if (points == CARDS) {
                        draggableElementData.innerHTML = `<p class="win">¡Ganaste!</p>`;
                        localStorage.setItem('currentScore', score);
                        setTimeout(startNewRound, 1500);
                    }
                } else {
                    showErrorMessage('¡Ups! ¡Eso no era el Pokémon correcto!😥');
            
                    lives--;
                    livesElement.innerText = `Vidas: ${lives}💖`;
            
                    if (lives <= 0) {
                        isGameActive = false;
                        setTimeout(() => {
                            document.querySelector('.draggable-elements').innerHTML = `<p class="game-over">¡Game Over! Tu puntuación final fue ${score}</p>`;
                            setTimeout(resetGame, 1500);
                        }, 500);
                    }
                }
            });
            
        });
    }
    
    
}
