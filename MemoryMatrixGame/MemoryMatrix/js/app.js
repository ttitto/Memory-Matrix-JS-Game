'use strict';
//GLOBALS
var mainContainer, //the container of the game, like wrapper
    boardContainer,
    board,//the container of the tiles
    boardId = 'board',
    boardContainerID = 'boardCont',
    currentLvl = 3, // 3 is the starting level
    tilesCounter = 1, //Counter to hold the revealed answers
    levelBonus = 5, //holds the points that will be added if the level succeeds
    cellSize = 50, //the size of the tiles
    pointsForCorrectAnswer = 10, // the points that a click on a correct tile gives
    wasLevelCleared = true, //holds the result of the level end
    playerCanClick = true, //holds if a player can click on the fields
    minRowsSize = 2,
    minCellsSize = 2,
    initCellsSize = 3,
    initRowsSize = 3,
    maxRowsSize = 6,
    maxCellsSize = 6,
    boardPadding = 60,
    answers = '',
    trials = 15, //how many trials user has
    score = 0, //user score
    beforeHideCellsTimeout = 1500,
    correctAnswerTimeout = 500,
    infoBoxTimeout = 300,
    betweenLevelsTimeout = 2000,
    popup = null,
    canClickOnInfoBox = true, // if "false" the next level will start automatically
    storage = window.localStorage; //holds the browsers local storage

//holds the sizes of the board depending on the current level
var boardDimArray = [[2, 2], [2, 2], [3, 3], [4, 3], [4, 4], [5, 4], [5, 5], [6, 5], [6, 6]];

var MESSAGES = {
    //holds the messages that appear below the game board
    levelLost: 'Sorry, you missed!\nTry again with less tiles!',
    tileSucess: 'You hit it right! Guess the next tile!',
    levelSuccess: 'Congratulations! You won another level.\nTry with more tiles!',
    guess: 'Guess the next tile!',
    gameOver: 'GAME OVER!',
    scoreMessage: 'Your score is: ',
    payAttention: 'Remember the tiles positions!',
    bestResult: 'Your result will be stored as BEST RESULT.\nCongratulations!',
    newGame: 'New game?',
    startGameMsg: 'Start Game',
    startGame: 'Memory Matrix',
    teamName: 'by Desert Planet'
};


var ScoreBoardElement = function (content, val) {
    this.content = content;
    this.val = val;
};

function getLvl() {
    return currentLvl;
}

function createBackground() {
    mainContainer = document.createElement('main');
    mainContainer.id = 'main-container';

    document.body.appendChild(mainContainer);
}

function createScoreBoard() {
    //creates the score board at the top of the main container and fills it with elements
    var scoreBoard = document.createElement('div');
    scoreBoard.id = 'score-board';
    mainContainer.appendChild(scoreBoard);
    var scoreBoardList = document.createElement('ul');
    scoreBoard.appendChild(scoreBoardList);

    var categories = [new ScoreBoardElement('Tiles', getLvl()),
        new ScoreBoardElement('Trials', trials),
        new ScoreBoardElement('Score', score)];

    var categoriesSize = categories.length;
    for (var i = 0; i < categoriesSize; i++) {
        var li = document.createElement('li');
        li.className = 'score-board-element';
        li.innerText = categories[i].content;
        li.textContent = categories[i].content;
        scoreBoardList.appendChild(li);

        var sp = document.createElement('span');
        sp.className = 'score-board-value';
        sp.id = categories[i].content;
        sp.innerText = categories[i].val;
        sp.textContent = categories[i].val;
        li.appendChild(sp);
    }
}

function addPoints(tilePts, levelPts) {
    //increases the score by given amount of points passed as parameters
    levelPts = levelPts || 0;
    var scoreSpan = document.getElementById('Score');
    score = scoreSpan.innerText || scoreSpan.textContent;
    score = parseInt(score) + parseInt(tilePts) + parseInt(levelPts);
    scoreSpan.innerText = score;
    scoreSpan.textContent = score;

    function blinkingScore() {
        //appends a class to the score element that makes it blink when new points are added
        var scoreBySpan = document.getElementById("Score");
        scoreBySpan.classList.add("blinkingScore");

        setTimeout(function () {
            $('#Score').removeClass('blinkingScore');
        }, 500);
    }

    blinkingScore();
}

function updateLevelBonus(direction) {
    //increases or decreases the bonus points amount depending on the success of the level
    switch (direction) {
        case 'down':
            if (levelBonus > 5) {
                levelBonus /= 2;
            }
            break;
        case 'up':
            levelBonus *= 2;
            break;
    }
}
function getUserClick(event) {
    // This function handles the player click
    if (playerCanClick === true) {
        var element = event.target;
        var isClicked = (element.getAttribute('data-is-clicked')) ? true : false;
        if (element.getAttribute('data-is-true') && !isClicked) {
            //if the right tile was clicked
            var currLevel = getLvl();
            if (tilesCounter < currLevel) {
                //if there are other hidden tile to reveal
                element.setAttribute('data-is-clicked', 'true');
                tilesCounter++;
                addPoints(pointsForCorrectAnswer);
                updateInfobox(MESSAGES.tileSucess);
                element.setAttribute('data-is-true', 'false');

            } else if (tilesCounter === currLevel) {
                //if last tile was revealed
                element.setAttribute('data-is-clicked', 'true');
                wasLevelCleared = true;
                updateLevelBonus('up');
                addPoints(pointsForCorrectAnswer, levelBonus);
                element.setAttribute('data-is-true', 'false');

                setTimeout(function () {
                    updateInfobox(MESSAGES.levelSuccess);
                    prepAndShowInfoForNextLvl();
                }, infoBoxTimeout);
            }
        } else if (isClicked) {
            // Intentionally left blank
        } else {
            //if an incorrect tile was clicked
            element.classList.add('incorrectAnswer');
            updateLevelBonus('down');
            playerCanClick = false;
            wasLevelCleared = false;

            updateInfobox(MESSAGES.levelLost);
            prepAndShowInfoForNextLvl();
        }
    }
}

function goToNextLvl() {
    playerCanClick = true;
    if (trials) {
        //update trials in scoreboard
        trials--;
        document.getElementById('Trials').innerHTML = trials.toString();

        //update Tiles in scoreboard
        document.getElementById('Tiles').innerHTML = getLvl();

        //clear counter
        tilesCounter = 1;

        //generate new board => Check which is the current level and calc the board cells and rows
        var currLvl = getLvl();
        var board = (currLvl <= boardDimArray.length) ? (currLvl - 1) : (boardDimArray.length - 1);

        // Invokes "createBoard(cells, rows)" by giving in the correct number of cells and rows
        createBoard(boardDimArray[board][0], boardDimArray[board][1]);
        updateInfobox(MESSAGES.payAttention);
    } else {
        //GAME OVER - no more trials. Function for displaying GAME OVER Screen     
        endGame();
    }
}

function updatePopupSize(width, height) {
    //defines the styles about sizing of the popup that shows the current level result between the levels
    if (popup) {
        width = width || board.offsetWidth;
        height = height || board.offsetHeight;

        popup.style.width = width + 'px';
        popup.style.height = height + 'px';
        popup.style.left = -(width / 2) + 'px';
    }
}

function updateBoardAndPopupSizes(cells, rows) {

    var boardWidth = (cells * cellSize) + boardPadding;
    var boardHeight = (rows * cellSize) + boardPadding;

    $("#board").animate({width: boardWidth, height: boardHeight}, 100);

    updatePopupSize(boardWidth, boardHeight);
}

function createBoard(cells, rows) {
    //creates the board with given rows and columns arguments
    if (cells) {
        cells = ((cells) && (cells > minCellsSize)) ? ((cells < maxCellsSize) ? cells : maxCellsSize) : minCellsSize;
    } else {
        cells = initCellsSize;
    }
    if (rows) {
        rows = ((rows) && (rows > minRowsSize)) ? ((rows < maxRowsSize) ? rows : maxRowsSize) : minRowsSize;
    } else {
        rows = initRowsSize;
    }

    if(!board) {
        board = document.createElement('div');
        board.id = boardId;
        boardContainer.innerHTML = '';
        boardContainer.appendChild(board);
    }

    board.innerHTML = '';

    updateBoardAndPopupSizes(cells, rows);

    setTimeout(function () {
        //generates the tile fields in the board
        for (var i = 1; i <= rows; i++) {
            var row = document.createElement('div');
            row.setAttribute('id', 'row' + i);
            row.className = 'row';
            for (var j = 1; j <= cells; j++) {
                var cell = document.createElement('div');
                cell.setAttribute('id', 'cell' + i + j);
                cell.className = 'cell';
                row.appendChild(cell);
            }
            board.appendChild(row);
        }
        assignCorrectAnswers();
    }, correctAnswerTimeout);
}

function createInfoBox() {
    //creates an info box for user advices during the game
    var infobox = document.createElement('div');
    infobox.id = 'infobox';
    mainContainer.appendChild(infobox);
}

function updateInfobox(occasion) {
    //changes the content of the infobox depending on the passed as argument situation
    var infobox = document.getElementById('infobox');
    infobox.innerText = occasion;
    infobox.textContent = occasion;
}

function assignCorrectAnswers() {
    var level = getLvl();
    var assignedIndexes = [],
        selectedCells = [],
        cellsArray = document.getElementsByClassName('cell'),
        canContinue = true;

    var getRandomNumber = function () {
        return Math.floor(Math.random() * cellsArray.length);
    };
    //assigns attributes until the necessary count of busy tiles has been reached
    for (var i = 0; i < level; i++) {
        canContinue = true;

        while (canContinue) {
            var randomCellIndex = getRandomNumber();
            if (assignedIndexes.indexOf(randomCellIndex) === -1) {
                var cellElement = cellsArray[randomCellIndex];
                selectedCells.push(cellElement);
                cellElement.setAttribute('data-is-true', 'true');
                assignedIndexes.push(randomCellIndex);
                canContinue = false;
            }
        }
    }

    answers = assignedIndexes.toString();

    //show the pattern to player
    for (var j = 0; j < selectedCells.length; j++) {
        selectedCells[j].classList.add('openAnswer');
    }

    setTimeout(function () {
        hidePattern(selectedCells);
    }, beforeHideCellsTimeout);
}

function hidePattern(selectedCellsPattern) {
    //hides the pattern and assigns onClick event listener     
    for (var k = 0; k < selectedCellsPattern.length; k++) {
        selectedCellsPattern[k].classList.remove('openAnswer');
    }

    for (var i = 0; i < document.getElementsByClassName('cell').length; i++) {
        document.getElementsByClassName('cell')[i].addEventListener('click', getUserClick.bind(this), false);
    }
    updateInfobox(MESSAGES.guess);
}

function closePopup() {
    popup.classList.remove('opened');
    goToNextLvl();
}

function updateCurrentLvl() {
    //changes the current level depending on the previous level result
    if (wasLevelCleared === true) {
        currentLvl++;
    } else if (currentLvl > 1) {
        currentLvl--;
    }
}

function prepAndShowInfoForNextLvl() {

    var msg = document.getElementById('infoDialogTxt');
    if (!popup) {
        popup = document.createElement('div');
        msg = document.createElement('p');
        msg.id = 'infoDialogTxt';

        popup.setAttribute('id', 'popup');
        if (canClickOnInfoBox === true) {
            popup.addEventListener('click', closePopup, false);
        }
        boardContainer.appendChild(popup);
        popup.appendChild(msg);
    }

    updateCurrentLvl();

    var msgText = '';
    if (wasLevelCleared) {
        msgText += 'Bonus Points: <span class="green">+' + levelBonus + '</span><br />';
    }
    msgText += 'Next: <span class="red">' + getLvl() + '</span> tiles';
    msg.innerHTML = msgText;

    popup.classList.add('opened');
    updatePopupSize();

    if (canClickOnInfoBox !== true) {
        setTimeout(function () {
            closePopup();
        }, betweenLevelsTimeout);
    }
}

function storeMaxScore(currentScore) {
    //creates a local storage if it doesnt exist and saves the current result if any bigger score hasn't been saved
    //returns true if the current score is the maximal until the moment
    if (typeof (storage) !== 'undefined') {
        if (typeof (storage.maxScore) !== 'undefined') {
            if (parseInt(storage.maxScore) < currentScore) {
                storage.setItem('maxScore', currentScore);
                return true;
            }
        } else {
            storage.setItem('maxScore', currentScore);
            return true;
        }
    }
    return false;
}

function endGame() {
    //shows a game over popup with points information about the ended game and a link to a new game
    
    if (!storeMaxScore(score)) {
        $('#boardCont').html("").append("<div class='gameOver'><h2>" + MESSAGES.gameOver + "</h2>\n<p>" + MESSAGES.scoreMessage + score + "</p>\n<a href=\"javascript:window.location = window.location;\">" + MESSAGES.newGame + "</a></div>");
    } else {
        $('#boardCont').html("").append("<div class='gameOver'><h2>" + MESSAGES.gameOver + "</h2>\n<p>" + MESSAGES.scoreMessage + score + "</p>\n" + MESSAGES.bestResult + "</br><a href=\"javascript:window.location = window.location;\">" + MESSAGES.newGame + "</a></div>");
    }
}

function startGame() {
    if (!boardContainer) {
        boardContainer = document.createElement('div');
        boardContainer.id = boardContainerID;
        mainContainer.appendChild(boardContainer);
    }

        $('#boardCont').html("").append("<div class='gameOver'><h2>" + MESSAGES.startGame + "</h2>\n<h4>by Desert Planet</h4><a href=\"javascript:;\" onclick=\"resetGame()\">" + MESSAGES.startGameMsg + "</a></div>");
}

function resetGame() {
    score = 0;
    trials = 3;
    createBoard();
}

function initGame() {
    createBackground();
    createScoreBoard();
    startGame();
    createInfoBox();
}

$(document).ready(function() {
    initGame();
});