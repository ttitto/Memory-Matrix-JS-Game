'use strict';
//GLOBALS
var mainContainer,
    board,
    currentLvl = 3, // 3 is the starting level
    tilesCounter = 1, //Counter to hold the revealed answers
    levelBonus = 5, //holds the points that will be added if the level succeeds
    cellSize = 50,
    wasLevelCleared = true,
    minRowsSize = 2, minCellsSize = 2, maxRowsSize = 6, maxCellsSize = 6,
    answers = "",
    trials = 15, //how many trials user has
    score = 0, //user score
    timeBeforeHideCells = 2000;

var boardDimArray = [[2, 2], [2, 2], [3, 3], [4, 3], [4, 4], [5, 4], [5, 5], [6, 5], [6, 6]];

var MESSAGES = {
        levelLost: 'Sorry, you missed!\nTry again with less tiles!',
        tileSucess: 'You hit it right! Guess the next tile!',
        levelSuccess: 'Congratulations! You won another level.\nTry with more tiles!',
        guess: 'Guess the next tile!'
    }


var ScoreBoardElement = function (imgURL, content, val) {
    this.imgURL = imgURL;
    this.content = content;
    this.val = val;
}

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

    var score = scoreSpan.innerText || scoreSpan.textContent;
    score = parseInt(score) + parseInt(tilePts) + parseInt(levelPts);
    scoreSpan.innerText = score;
    scoreSpan.textContent = score;
}
function updateLevelBonus(direction) {
    switch (direction) {
        case 'down':
            if (levelBonus <= 5) { break; }
            else { levelBonus /= 2; }
            break;
        case 'up':
            levelBonus *= 2;
            break;
    }
}
function getUserClick(event) {
    // This function handles the player click
    var selectedCellID = event.target.getAttribute('id');
    var element = event.target;
    if(event.target.getAttribute('data-is-true') && !event.target.getAttribute('data-is-ckicked')){
        var currLevel = getLvl();
        if(tilesCounter < currLevel){
            element.setAttribute('data-is-clicked','true');
            console.log('correct');
            tilesCounter++;
            addPoints(10);
            event.target.setAttribute('data-is-true', 'false');
        } else if(tilesCounter == currLevel) {
            element.setAttribute('data-is-clicked','true');
            updateInfobox('levelSuccess');
            wasLevelCleared = true;
            addPoints(10, levelBonus);
            updateLevelBonus('up');
            goToNextLvl();
            element.setAttribute('data-is-true','false');
        }
    } else {
        console.log('not correct');
        updateInfobox('levelLost');
        updateLevelBonus('down');
        wasLevelCleared = false;
        goToNextLvl();
    }
}

function goToNextLvl() {

    if (wasLevelCleared === true) {
        currentLvl++;
    } else if (currentLvl > 1) {
        currentLvl--;
    }


    if(trials) {
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
        // 2. Invoke "createBoard(cells, rows)" by giving in the correct number of cells and rows
        createBoard(boardDimArray[board][0], boardDimArray[board][1]);
        //createBoard((Math.random() * (6 - 3) + 3).toFixed(0), (Math.random() * (6 - 3) + 3).toFixed(0)); // This is just a sample
    } else {
        //GAME OVER - no more trials. Function for displaying GAME OVER Screen here        
        alert('GAME OVER!\n Your score is: ' + score + '!');
    }

    // TODO: Add this functionality        
    // 3. The minimum size is 2x2. - done!
    // 4. The maximum size is 6x6  - done! 
    // 5. Check for tiles = 1 as the lowest possible tiles count. 
}

function createBoard(cells, rows) {
    if (cells) {
        cells = ((cells) && (cells > 2)) ? ((cells < 6) ? cells : maxCellsSize) : minCellsSize;
    } else {
        cells = 3;
    }
    if (rows) {
        rows = ((rows) && (rows > 2)) ? ((rows < 6) ? rows : maxRowsSize) : minRowsSize;
    } else {
        rows = 3;
    }
    var boardId = 'board',
        board = document.getElementById(boardId);

    if (!board) {
        board = document.createElement('div');
        board.id = boardId;
        mainContainer.appendChild(board);
    }

    board.innerHTML = '';

    // Dynamic generation of the board sizes based on the number of cells
    board.style.width = (cells * cellSize) + 60 + 'px'; // 60 is the board padding
    board.style.height = (rows * cellSize) + 60 + 'px';

    setTimeout(function () {
        for (var i = 1; i <= rows; i++) {
            var row = document.createElement('div');
            row.setAttribute('id', 'row' + i);
            row.className = 'row';
            for (var j = 1; j <= cells; j++) {
                var cell = document.createElement('div');
                cell.setAttribute('id', 'cell' + i + j);
                cell.className = 'cell';
                // Detects the player click -  moved in showPatternToPlayer func.
                // cell.addEventListener('click', getUserClick.bind(this), false);
                row.appendChild(cell);
            }
            board.appendChild(row);
        }
        assignCorrectAnswers(getLvl());
    }, 600);
}

function createInfoBox() {
    var infobox = document.createElement('div');
    infobox.id = 'infobox';
    mainContainer.appendChild(infobox);
}

function updateInfobox(occasion) {
    var infobox = document.getElementById('infobox');
    infobox.innerText = MESSAGES[occasion];
    infobox.textContent = MESSAGES[occasion];
}


function assignCorrectAnswers(level) {

    var assignedIndexes = [],
        selectedCells = [],
        cellsArray = document.getElementsByClassName('cell'),
        canContinue = true;

    var getRandomNumber = function () {
        return Math.floor(Math.random() * cellsArray.length)
    }

    for (var i = 0; i < level; i++) {
        canContinue = true;

        while (canContinue) {
            var randomCellIndex = getRandomNumber();
            if (assignedIndexes.indexOf(randomCellIndex) == -1) {
                var cellElement = cellsArray[randomCellIndex];
                selectedCells.push(cellElement);
                cellElement.setAttribute('data-is-true', 'true');

                assignedIndexes.push(randomCellIndex);
                canContinue = false;
            }
        }
    }

    answers = (answers != "") ? answers : "";
    answers = assignedIndexes.toString();

    //show the pattern to player
    for(var i = 0; i < selectedCells.length; i++) {
        selectedCells[i].classList.add("openAnswer");
    }

    //hide the pattern and assign onClick event listener     
    setTimeout(function () {
        hidePattern(selectedCells);
    }, timeBeforeHideCells);
}

function hidePattern(selectedCellsPattern){
    for(var i = 0; i < selectedCellsPattern.length; i++) {
        selectedCellsPattern[i].classList.remove("openAnswer");
    }

    for (var i = 0; i < document.getElementsByClassName('cell').length; i++) {
        document.getElementsByClassName('cell')[i].addEventListener('click', getUserClick.bind(this), false);
    }
    updateInfobox('guess');
}

createBackground();
createScoreBoard();
createBoard();
createInfoBox();