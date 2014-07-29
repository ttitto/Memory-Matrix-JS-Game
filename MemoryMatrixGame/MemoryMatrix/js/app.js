'use strict';
//GLOBALS
var mainContainer,
    boardContainer,
    board,
    boardId = 'board',
    boardContainerID = 'boardCont',
    currentLvl = 3, // 3 is the starting level
    tilesCounter = 1, //Counter to hold the revealed answers
    levelBonus = 5, //holds the points that will be added if the level succeeds
    cellSize = 50,
    pointsForCorrectAnswer = 10,
    wasLevelCleared = true,
    playerCanClick = true,
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
    infoboxTimeout = 300,
    betweenLevelsTimeout = 2000,
    board = null,
    popup = null,
    canClickOnInfoBox = true, // if "false" the next level will start automatically
    storage = window.localStorage;//holds the browsers local storage

var boardDimArray = [[2, 2], [2, 2], [3, 3], [4, 3], [4, 4], [5, 4], [5, 5], [6, 5], [6, 6]];

var MESSAGES = {
    levelLost: 'Sorry, you missed!\nTry again with less tiles!',
    tileSucess: 'You hit it right! Guess the next tile!',
    levelSuccess: 'Congratulations! You won another level.\nTry with more tiles!',
    guess: 'Guess the next tile!',
    gameOver: 'GAME OVER!',
    scoreMessage: 'Your score is: ',
    payAttention: 'Remember the tiles positions!',
    bestResult: 'Your result will be stored as BEST RESULT.\nCongratulations!'
};


var ScoreBoardElement = function (imgURL, content, val) {
    this.imgURL = imgURL;
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
    var scoreBoard = document.createElement('div');
    scoreBoard.id = 'score-board';
    mainContainer.appendChild(scoreBoard);
    var scoreBoardList = document.createElement('ul');
    scoreBoard.appendChild(scoreBoardList);

    var categories = [new ScoreBoardElement('', 'Tiles', getLvl()),
        new ScoreBoardElement('', 'Trials', trials),
        new ScoreBoardElement('', 'Score', score)];

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
        var scoreBySpan = document.getElementById("Score");
        scoreBySpan.classList.add("blinkingScore");
    }

    blinkingScore();
}

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
function getUserClick(event) {
    if(playerCanClick === true) {


        // This function handles the player click
        var element = event.target;
        // var selectedCellID = element.getAttribute('id');
        var isClicked = (element.getAttribute('data-is-clicked')) ? true : false;
        if (element.getAttribute('data-is-true') && !isClicked) {
            var currLevel = getLvl();
            if (tilesCounter < currLevel) {
                element.setAttribute('data-is-clicked', 'true');
                tilesCounter++;
                addPoints(pointsForCorrectAnswer);
                element.setAttribute('data-is-true', 'false');

            } else if (tilesCounter === currLevel) {
                element.setAttribute('data-is-clicked', 'true');
                wasLevelCleared = true;
                updateLevelBonus('up');
                addPoints(pointsForCorrectAnswer, levelBonus);
                element.setAttribute('data-is-true', 'false');

                setTimeout(function () {
                    updateInfobox(MESSAGES.levelSuccess);
                    prepAndShowInfoForNextLvl();
                }, infoboxTimeout);
            }
        } else if (isClicked) {
            return;
        } else {
            element.classList.add('incorrectAnswer');
            updateLevelBonus('down');
            playerCanClick = false;
            wasLevelCleared = false;
            setTimeout(function () {
                updateInfobox(MESSAGES.levelLost);
                prepAndShowInfoForNextLvl();
            }, infoboxTimeout);
        }
    }
}

function goToNextLvl() {
    playerCanClick = true;
    if (trials) {
        //update trials in scoreboard
        trials--;
        document.getElementById('Trials').innerHTML = trials;

        //update Tiles in scoreboard
        document.getElementById('Tiles').innerHTML = getLvl();

        //clear counter
        tilesCounter = 1;

        //generate new board => Chech which is the current level and calc the board cells and rows
        var currLvl = getLvl();
        var board = (currLvl <= boardDimArray.length) ? (currLvl - 1) : (boardDimArray.length - 1);

        // Invokes "createBoard(cells, rows)" by giving in the correct number of cells and rows
        createBoard(boardDimArray[board][0], boardDimArray[board][1]);
        updateInfobox(MESSAGES.payAttention);
    } else {
        //GAME OVER - no more trials. Function for displaying GAME OVER Screen here        
        endGame();
    }
}

function updatePopupSize(width, height) {
    if (popup) {
        width = width || board.offsetWidth;
        height = height || board.offsetHeight;

        popup.style.width = width + 'px';
        popup.style.height = height + 'px';
        popup.style.left = -(width / 2) + 'px';
    }
}

function updateBoardAndPopupSizes(cells, rows) {
    var width = (cells * cellSize) + boardPadding;
    var height = (rows * cellSize) + boardPadding;
    board.style.width = width + 'px';
    board.style.height = height + 'px';

    updatePopupSize(width, height);
}

function createBoard(cells, rows) {
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
        boardContainer = document.createElement('div');
        boardContainer.id = boardContainerID;
        mainContainer.appendChild(boardContainer);

        board = document.createElement('div');
        board.id = boardId;
        boardContainer.appendChild(board);
    }

    board.innerHTML = '';

    updateBoardAndPopupSizes(cells, rows);

    setTimeout(function () {
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
        assignCorrectAnswers(getLvl());
    }, correctAnswerTimeout);
}

function createInfoBox() {
    var infobox = document.createElement('div');
    infobox.id = 'infobox';
    mainContainer.appendChild(infobox);
}

function updateInfobox(occasion) {
    var infobox = document.getElementById('infobox');
    infobox.innerText = occasion;
    infobox.textContent = occasion;
}

function assignCorrectAnswers(level) {

    var assignedIndexes = [],
        selectedCells = [],
        cellsArray = document.getElementsByClassName('cell'),
        canContinue = true;

    var getRandomNumber = function () {
        return Math.floor(Math.random() * cellsArray.length);
    };

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

    answers = (answers !== '') ? answers : '';
    answers = assignedIndexes.toString();

    //show the pattern to player
    for (var j = 0; j < selectedCells.length; j++) {
        selectedCells[j].classList.add('openAnswer');
    }

    //hide the pattern and assign onClick event listener     
    setTimeout(function () {
        hidePattern(selectedCells);
    }, beforeHideCellsTimeout);
}

function hidePattern(selectedCellsPattern) {
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
    if (!storeMaxScore(score)) {
        $('#main-container').html("").append("<div class='gameOver'><h2>" + MESSAGES.gameOver + "</h2>\n<p>" + MESSAGES.scoreMessage + score + "</p>\n<a href=\"javascript:window.location = window.location;\">New game?</a></div>");
    } else {
        $('#main-container').html("").append("<div class='gameOver'><h2>" + MESSAGES.gameOver + "</h2>\n<p>" + MESSAGES.scoreMessage + score + "</p>\n" + MESSAGES.bestResult + "</br><a href=\"javascript:window.location = window.location;\">New game?</a></div>");
    }
}

createBackground();
createScoreBoard();
createBoard();
createInfoBox();