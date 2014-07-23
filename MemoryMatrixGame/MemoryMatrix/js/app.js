
var mainContainer;
var board;

function createBackground() {
    mainContainer = document.createElement('main');
    mainContainer.id = 'main-container';

    document.body.appendChild(mainContainer);
}

function createBoard() {
    board = document.createElement('div');
    board.id = 'board';
    mainContainer.appendChild(board);
}
createBackground(640, 480);
createBoard();