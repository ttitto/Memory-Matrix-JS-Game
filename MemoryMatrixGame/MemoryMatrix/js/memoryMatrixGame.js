'use strict';
//GLOBALS
/**
 * The wrapper container
 */
var mainContainer,
    /**
     * The container that holds the table with the tiles
     */
        boardContainer,
    /**
     * The table with the tiles to guess
     */
        board,//the container of the tiles
//    boardId = 'board',
//    boardContainerID = 'boardCont',
    /**
     * Holds the current level number
     * @type {number}
     */
        currentLvl = 3,
    /**
     * Holds the revealed tiles count
     * @type {number}
     */
        tilesCounter = 1,
    /**
     * Holds the points that will be added additionally to the score if all tiles of the level are revealed
     * @type {number}
     */
        levelBonus = 5,
    /**
     * Holds the size of the tiles in px.
     * @type {number}
     */
        cellSize = 50,
    /**
     * Holds the points that will be added to the score if a single tile is revealed
     * @type {number}
     */
        pointsForCorrectAnswer = 10,
    /**
     * Holds the result of a level end: true if the level is successfully cleared, false if some tiles has left hidden.
     * @type {boolean}
     */
        wasLevelCleared = true,
    /**
     * Holds true if the player is allowed to click on tiles and files if not
     * @type {boolean}
     */
        playerCanClick = true,
    /**
     *Holds the minimum allowed cells' count per row
     * @type {number}
     */
        minRowsSize = 2,
    /**
     * Holds the minimum allowed cells' count per column
     * @type {number}
     */
        minCellsSize = 2,
    /**
     * Holds the cells' count per column at the start of the game
     * @type {number}
     */
        initCellsSize = 3,
    /**
     * Holds the cells' count per row at the start of the game
     * @type {number}
     */
        initRowsSize = 3,
    /**
     * Holds the maximum allowed cells'count per row
     * @type {number}
     */
        maxRowsSize = 6,
    /**
     *  Holds the maximum allowed cells'count per column
     * @type {number}
     */
        maxCellsSize = 6,
    /**
     *  Holds the padding of the table of the tiles
     * @type {number}
     */
        boardPadding = 60,

//  answers = '',
    /**
     * Holds the number of trials left
     * @type {number}
     */
        trials = 15, //how many trials user has
    /**
     * Holds the current score of the player
     * @type {number}
     */
        score = 0,
    /**
     * Holds the time to wait before the correct answers will hide
     * @type {number}
     */
        beforeHideCellsTimeout = 1500,
    /**
     * Holds the time to wait before the table is generated and the correct answers are assigned to its cells
     * @type {number}
     */
        correctAnswerTimeout = 500,
    /**
     *Holds the time to wait until the next level is prepared
     * @type {number}
     */
        infoBoxTimeout = 300,
    /**
     *Holds the time to wait before the next level is prepared
     * @type {number}
     */
        betweenLevelsTimeout = 2000,
    /**
     * Holds an instance of a div object that appears between the levels
     * @type {object}
     */
        popup = null,
    /**
     * If true the next level will wait a click on the board to start. If false the next level will start automatically.
     * @type {boolean}
     */
        canClickOnInfoBox = true,
    /**
     * Holds the current browser local storage.
     * @type {Storage}
     */
        storage = window.localStorage;

/**
 * Holds the sizes of the board depending on the current level
 */

var boardDimArray = [
    [2, 2],
    [2, 2],
    [3, 3],
    [4, 3],
    [4, 4],
    [5, 4],
    [5, 5],
    [6, 5],
    [6, 6]
];
/**
 * Holds the message texts that are use in different situations in the game
 * @type {{levelLost: string, tileSuccess: string, levelSuccess: string, guess: string, gameOver: string, scoreMessage: string, payAttention: string, bestResult: string, newGame: string, startGameMsg: string, startGame: string, teamName: string}}
 */
var MESSAGES = {
    levelLost: 'Sorry, you missed!\nTry again with less tiles!',
    tileSuccess: 'You hit it right! Guess the next tile!',
    levelSuccess: 'Congratulations! You won another level.\nTry with more tiles!',
    guess: 'Guess the next tile!',
    gameOver: 'GAME OVER!',
    scoreMessage: 'Your score is: ',
    payAttention: 'Remember the tiles positions!',
    bestResult: 'Your result will be stored as BEST RESULT.\nCongratulations!',
    newGame: 'New game',
    startGameMsg: 'Start Game',
    startGame: 'Memory Matrix',
    teamName: 'by Desert Planet'
};

/**
 * An element that is visualized in the title area of the game board container. It has a format key: value
 * @param content the name of the ScoreBoardElement
 * @param val the value of the ScoreBoardElement
 * @constructor
 */
var ScoreBoardElement = function (content, val) {
    this.content = content;
    this.val = val;
};
/**
 * Returns the current level number which corresponds to the number of the hidden tiles to be revealed
 * @returns {number} currentLvl global variable
 */
function getLvl() {
    return currentLvl;
}
/**
 * Creates the wrapper container of the game
 */
function createBackground() {
    mainContainer = document.createElement('main');
    mainContainer.id = 'main-container';

    document.body.appendChild(mainContainer);
}
/**
 * Creates a div element at the top of the wrapper container that holds usefull information about the current state of the game, ex. Tiles to find, left trials and current score
 */
function createScoreBoard() {
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
/**
 * Appends new earned points to the current score depending on that if the points are earned when a tile was revealed or they are bonus points at the end of the level
 * @param tilePts Points that are won from the right guess of a tile
 * @param levelPts [optional] Points that are won at the end of a level
 */
function addPoints(tilePts, levelPts) {
    levelPts = levelPts || 0;
    var scoreSpan = document.getElementById('Score');
    score = scoreSpan.innerText || scoreSpan.textContent;
    score = parseInt(score) + parseInt(tilePts) + parseInt(levelPts);
    scoreSpan.innerText = score;
    scoreSpan.textContent = score;

    blinkingScore();
}
/**
 * Appends a class to the score element that makes it blink when new points are added
 */
function blinkingScore() {
    var scoreBySpan = document.getElementById("Score");
    scoreBySpan.classList.add("blinkingScore");

    setTimeout(function () {
        $('#Score').removeClass('blinkingScore');
    }, 500);
}
/**
 * Increases or decreases the bonus points amount depending on the success of the level
 * @param direction Holds 'down' or 'up'
 */
function updateLevelBonus(direction) {
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
/**
 * Handles the user click and call other function depending on the situation when a right tile was clicked, a false tile was clicked, there are other tile to reveal, there aren't other tile to reveal
 * @param event
 */
function getUserClick(event) {
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
                updateInfobox(MESSAGES.tileSuccess);
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
/**
 * Prepares the game for a new level by:
 * 1. updating the trials count in the score board
 * 2. updating the tiles count in the score board
 * 3. generating the new level board
 * Or calls the game over logic
 */
function goToNextLvl() {
    playerCanClick = true;
    if (trials) {
        //update trials in scoreboard
        trials--;
        document.getElementById('Trials').innerHTML = trials.toString();

        //update Tiles in scoreboard
        document.getElementById('Tiles').innerHTML = getLvl().toString();

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
/**
 * Defines the styles about sizing of the popup that shows the current level result between the levels
 * @param width Width of the popup window
 * @param height Height of the poput window
 */
function updatePopupSize(width, height) {
    if (popup) {
        width = width || board.offsetWidth;
        height = height || board.offsetHeight;

        popup.style.width = width + 'px';
        popup.style.height = height + 'px';
        popup.style.left = -(width / 2) + 'px';
    }
}
/**
 * Updates the board size and calls the logic to update the popup size
 * @param cells Count of the columns in the board
 * @param rows Count of the rows in the board
 */
function updateBoardAndPopupSizes(cells, rows) {

    var boardWidth = (cells * cellSize) + boardPadding;
    var boardHeight = (rows * cellSize) + boardPadding;

    $("#board").animate({width: boardWidth, height: boardHeight}, 100);

    updatePopupSize(boardWidth, boardHeight);
}
/**
 * Creates the table with the tiles
 * @param cells Count of the columns in the board
 * @param rows Count of the rows in the board
 */
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

    if (!board) {
        board = document.createElement('div');
        board.id = 'board';
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
/**
 * Creates an info box for user advices during the game
 */
function createInfoBox() {
    var infobox = document.createElement('div');
    infobox.id = 'infobox';
    mainContainer.appendChild(infobox);
}
/**
 * Changes the content of the infobox depending on the passed as argument situation
 * @param occasion String holding the message to be shown in the infobox
 */
function updateInfobox(occasion) {
    var infobox = document.getElementById('infobox');
    infobox.innerText = occasion;
    infobox.textContent = occasion;
}
/**
 * Assigns randomly attributes to mark the necessary tiles as correct
 */
function assignCorrectAnswers() {
    var level = getLvl();
    var assignedIndexes = [],
        selectedCells = [],
        cellsArray = document.getElementsByClassName('cell'),
        canContinue = true;
    /**
     * Random generator from 0 to the cells count in the board
     * @returns {number}
     */
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

    // answers = assignedIndexes.toString();

    //show the pattern to player
    for (var j = 0; j < selectedCells.length; j++) {
        selectedCells[j].classList.add('openAnswer');
    }

    setTimeout(function () {
        hidePattern(selectedCells);
    }, beforeHideCellsTimeout);
}
/**
 * Hides the correct tiles' pattern and assigns onClick event listener to the cells
 * @param selectedCellsPattern
 */
function hidePattern(selectedCellsPattern) {
    for (var k = 0; k < selectedCellsPattern.length; k++) {
        selectedCellsPattern[k].classList.remove('openAnswer');
    }

    for (var i = 0; i < document.getElementsByClassName('cell').length; i++) {
        document.getElementsByClassName('cell')[i].addEventListener('click', getUserClick.bind(this), false);
    }
    updateInfobox(MESSAGES.guess);
}
/**
 * Closes the popup with level end information and call the logic to prepare the next level
 */
function closePopup() {
    popup.classList.remove('opened');
    goToNextLvl();
}
/**
 * Changes the current level number depending on the previous level result
 */
function updateCurrentLvl() {
    if (wasLevelCleared === true) {
        currentLvl++;
    } else if (currentLvl > 1) {
        currentLvl--;
    }
}
/**
 * Prepares and renders the information to be shown in the popup window between the levels
 */
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
/**
 * Checks if the local storage of the browser has already key for the maximal score and compares its value with the current game ending score.
 * Updates the score if the current one is better.
 * @param currentScore The current game score
 * @returns {boolean} Returns true if the current value is bigger than the saved one in the local storage, otherwise returns false.
 */
function storeMaxScore(currentScore) {
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
/**
 * Shows a game over popup with points information about the ended game and a link to a new game
 */
function endGame() {

    if (!storeMaxScore(score)) {
        $('#boardCont').html("").append("<div class='gameOver'><h2>" + MESSAGES.gameOver + "</h2>\n<p>" + MESSAGES.scoreMessage + score + "</p>\n<a href=\"javascript:window.location = window.location;\">" + MESSAGES.newGame + "</a></div>");
    } else {
        $('#boardCont').html("").append("<div class='gameOver'><h2>" + MESSAGES.gameOver + "</h2>\n<p>" + MESSAGES.scoreMessage + score + "</p>\n" + MESSAGES.bestResult + "</br><a href=\"javascript:window.location = window.location;\">" + MESSAGES.newGame + "</a></div>");
    }
}
/**
 * Creates a container with information for new game start that starts the game on click
 */
function startGame() {
    if (!boardContainer) {
        boardContainer = document.createElement('div');
        boardContainer.id = 'boardCont';
        mainContainer.appendChild(boardContainer);
    }

    $('#boardCont').html("").append("<div class='gameOver'><h2>" + MESSAGES.startGame + "</h2>\n<h4>by Desert Planet</h4><a href=\"javascript:;\" onclick=\"createBoard()\">" + MESSAGES.startGameMsg + "</a></div>");
}
/**
 * Calls the functions responsible for the game initiation
 */
function initGame() {
    createBackground();
    createScoreBoard();
    startGame();
    createInfoBox();
}
/**
 * Calls the game initiation logic
 */
$(document).ready(function () {
    initGame();
});