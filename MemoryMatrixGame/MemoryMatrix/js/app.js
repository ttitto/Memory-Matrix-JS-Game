'use strict';

var mainContainer;
var board;
var currentLvl = 3; // 3 is the starting level
var levelBonus = 5; //holds the points that will be added if the level succeeds
var cellSize = 50;
var wasLevelCleared = true;
var minRowsSize = 3;
var minCellsSize = 3;
var answers = "";
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

    var categories = [new ScoreBoardElement('', 'Tiles', '0'),
        new ScoreBoardElement('', 'Trials', '0'),
        new ScoreBoardElement('', 'Score', '0')];

    var categoriesSize = categories.length;
    for (var i = 0; i < categoriesSize; i++) {
        var li = document.createElement('li');
        li.className = 'score-board-element';
        li.innerText = categories[i].content;
        li.textContent = categories[i].content;
        scoreBoardList.appendChild(li);

        var sp = document.createElement('span');
        sp.className = 'score-board-value';
        sp.innerText = categories[i].val;
        sp.textContent = categories[i].val;
        li.appendChild(sp);
    }

}

function addPoints(tilePts, levelPts) {
    //increases the score by given amount of points passed as parameters
    levelPts = levelPts || 0;
    var scoreSpan = document.getElementsByClassName('score-board-value')[2];
    console.log(scoreSpan);
    var score = scoreSpan.innerText || scoreSpan.textContent;
    score = parseInt(score) + parseInt(tilePts) + parseInt(levelPts);
    scoreSpan.innerText = score;
    scoreSpan.textContent = score;
}

function getUserClick(event) {
    // This function handles the player click
    var selectedCellID = event.target.getAttribute('id');        
    if(event.target.getAttribute('data-is-true')){
        console.log('correct'); 
    }else{
        console.log('not correct');
    }
    

    // TODO: Update the user score
    // TODO: Update the info msg at the bottom
}

function goToNextLvl() {
    (wasLevelCleared === true) ? currentLvl++ :currentLvl--;
    

    // TODO: Add this functionality
    // 1. Chech which is the current level and calc the board cells and rows
    // 2. Invoke "createBoard(cells, rows)" by giving in the correct number of cells and rows
    // 3. The minimum size is 2x2.
    // 4. The maximum size is 6x6
    createBoard((Math.random() * (6 - 3) + 3).toFixed(0), (Math.random() * (6 - 3) + 3).toFixed(0)); // This is just a sample
}

function createBoard(cells, rows) {
    cells = cells || minCellsSize;
    rows = rows || minRowsSize;
    var boardId = 'board';

    var board = document.getElementById(boardId);
    if (!board) {
        board = document.createElement('div');
        board.id = boardId;
        mainContainer.appendChild(board);
    }
    board.innerHTML = '';

    // Dynamic generation of the board sizes based on the number of cells
    board.style.width = (cells * cellSize) + 60 + 'px'; // 60 is the board padding
    board.style.height = (rows * cellSize) + 60 + 'px';

    setTimeout(function(){
        for(var i = 1;i <= rows; i++){
            var row = document.createElement('div');
            row.setAttribute('id', 'row'+i);
            row.className = 'row';
            for(var j = 1; j <= cells; j++) {
                var cell = document.createElement('div');
                cell.setAttribute('id', 'cell'+i+j);
                cell.className = 'cell';
                // Detects the player click
                cell.addEventListener('click', getUserClick.bind(this), false);
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
    infobox.innerText = 'TEstTEstTEstTEstTEstTEstTEst TEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTE stTEstTEstTEstTEstTEstTEstTEstTE stTEstTEstTEstTEstTEstTEstTEstTEstTEstTE stTEstTEstTEstTEstTEstTEst';
    infobox.textContent = 'TEstTEstTEstTEstTEstTEstTEst TEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTE stTEstTEstTEstTEstTEstTEstTEstTE stTEstTEstTEstTEstTEstTEstTEstTEstTEstTE stTEstTEstTEstTEstTEstTEst';
    mainContainer.appendChild(infobox);
}

function assignCorrectAnswers(level) {

    var assignedIndexes = [];

    var cellsArray = document.getElementsByClassName('cell');
    console.log(cellsArray.length);
    var getRandomNumber = function () {
        return Math.floor(Math.random() * cellsArray.length)
    }

    var canContinue = true;

    for (var i = 0; i < level; i++) {
        canContinue = true;

        while (canContinue) {
            var randomCellIndex = getRandomNumber();
            if (assignedIndexes.indexOf(randomCellIndex) == -1) {
                //-1 означава , че дадена клетка не се намира в списъка с вече избраните клетки
                var cellElement = cellsArray[randomCellIndex];
                cellElement.setAttribute('data-is-true', 'true');
                assignedIndexes.push(randomCellIndex);
                canContinue = false;
            }
        }
    }
    answers = (answers != "")? answers : "";
    answers = assignedIndexes.toString();
    //document.getElementById('indexes').innerHTML = answers;    
}

createBackground();
createScoreBoard();
createBoard();
createInfoBox();
addPoints(10);