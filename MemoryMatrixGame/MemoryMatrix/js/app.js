
var mainContainer;
var board;

function createBackground() {
    mainContainer = document.createElement('main');
    mainContainer.id = 'main-container';

    document.body.appendChild(mainContainer);
}
createBackground();


function createScoreBoard() {
    scoreBoard = document.createElement('div');
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
        scoreBoardList.appendChild(li);

        var sp = document.createElement('span');
        sp.className = 'score-board-value';
        sp.innerText = categories[i].val;
        li.appendChild(sp);
    }

}
var ScoreBoardElement = function (imgURL, content, val) {
    this.imgURL = imgURL;
    this.content = content;
    this.val = val;

}
createScoreBoard();


function createBoard() {
    board = document.createElement('div');
    board.id = 'board';
    mainContainer.appendChild(board);
}
createBoard();

function createInfoBox() {
    infobox = document.createElement('div');
    infobox.id = 'infobox';
    infobox.innerText = 'TEstTEstTEstTEstTEstTEstTEst TEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTEstTE stTEstTEstTEstTEstTEstTEstTEstTE stTEstTEstTEstTEstTEstTEstTEstTEstTEstTE stTEstTEstTEstTEstTEstTEst';
    mainContainer.appendChild(infobox);
}
createInfoBox();