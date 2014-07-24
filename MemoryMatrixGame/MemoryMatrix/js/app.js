'use strict';

var mainContainer;
var board;
var currentLvl = 3; // 3 is the starting level

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

    var len = categories.length;
    for (var i = 0; i < len; i++) {
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
var ScoreBoardElement = function (imgURL, content, val) {
    this.imgURL = imgURL;
    this.content = content;
    this.val = val;

}

function getUserClick(event) {
    // This function handles the player click
    console.log(event.toElement);
    console.log(event);
    
    // TODO: Update the user score
    // TODO: Update the info msg at the bottom
}

function goToNextLvl(canGoToNextLvl) {
    canGoToNextLvl = (canGoToNextLvl === true) ? currentLvl++ :currentLvl--;
    // TODO: Add this functionality
    // 1. Chech which is the current level and calc the board cells and rows
    // 2. Invoke "createBoard(cells, rows)" by giving in the correct number of cells and rows
    // 3. The minimum cells AND rows numbers MUST BE 3x3.
    createBoard(5, 6); // This is just a sample
}

function createBoard(cells, rows) {
    cells = cells || 3;
    rows = rows || 3;
    var boardId = 'board'

    var board = document.getElementById(boardId);
    if(!board) {
        board = document.createElement('div');
        board.id = 'board';
        mainContainer.appendChild(board);
    }
    board.innerHTML = '';
    
    // Dynamic generation of the board sizes based on the number of cells
//    board.style.width = ;
//    board.style.height = ;
    
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
        board.appendChild(row)
    }
}

function createInfoBox() {
    var infobox = document.createElement('div');
    infobox.id = 'infobox';
    infobox.innerText = 'TEstTEstTEstTEstTEstTEstTEst TEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTE stTEstTEstTEstTEstTEstTEstTEstTE stTEstTEstTEstTEstTEstTEstTEstTEstTEstTE stTEstTEstTEstTEstTEstTEst';
	infobox.textContent='TEstTEstTEstTEstTEstTEstTEst TEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTE stTEstTEstTEstTEstTEstTEstTEstTE stTEstTEstTEstTEstTEstTEstTEstTEstTEstTE stTEstTEstTEstTEstTEstTEst';
    mainContainer.appendChild(infobox);
}

createBackground();
createScoreBoard();
createBoard();
createInfoBox();