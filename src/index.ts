import {Board} from "./common/rooms/schema/Board";
import {queryByRowAndColumn} from "./common/rooms/schema/mutations";
import {VoiceBlock} from "./common/rooms/schema/VoiceBlock";
import {Position} from "./common/rooms/schema/Position";
import {Client, Room} from "colyseus.js";
import {GameState} from "./common/rooms/schema/GameState";
import {DOWN, LEFT, RIGHT} from "./common/messages/movement";

// may need to build config.ts with exported const
// set VOICEBLOCK_SERVER in confif.ts to url of backend colyseus server
// else ws://localhost:2567 will be used
import {VOICEBLOCK_SERVER} from "./config"; 

const queryBoardElement = () => <HTMLDivElement>document.querySelector("#board");
const queryPreviewElement = () => <HTMLDivElement>document.querySelector("#preview");
const queryLevelElement = () => <HTMLDivElement>document.querySelector("#level");
const queryScoreElement = () => <HTMLDivElement>document.querySelector("#score");

const clearBoard = () => {
    const boardElement = queryBoardElement();
    removeChildren(boardElement);
}
const clearPreview = () => {
    const previewElement = queryPreviewElement();
    removeChildren(previewElement);
}

const removeChildren = (parentElement: HTMLElement): void => {
    while (parentElement.childNodes.length) {
        parentElement.removeChild(parentElement.lastChild);
    }
}

const drawBoard = (board: Board): void => {
    const boardElement = queryBoardElement();
    const elementRect = boardElement.getBoundingClientRect();
    const blockHeight = Math.floor((elementRect.height - 32) / board.rows);
    boardElement.style.gridTemplateColumns = `repeat(${board.cols}, ${blockHeight}px)`;
    boardElement.style.gridTemplateRows = `repeat(${board.rows}, ${blockHeight}px)`;
    boardElement.style.height = "fit-content";
    boardElement.style.width = "fit-content";

    const boardPosition = queryByRowAndColumn(board);

    for (let row = 0; row < board.rows; ++row) {
        for (let col = 0; col < board.cols; ++col) {
            const cellDiv = document.createElement("div");
            cellDiv.id = `cell-r${row}-c${col}`
            cellDiv.style.background = `#${boardPosition(row, col).toString(16)}`;
            boardElement.append(cellDiv);
        }
    }
}

const drawPreview = (preview: VoiceBlock): void => {
    const previewElement = queryPreviewElement();
    previewElement.style.gridTemplateColumns = `repeat(5, 20px)`;
    previewElement.style.gridTemplateRows = `repeat(5, 20px)`;
    previewElement.style.height = "fit-content";
    previewElement.style.width = "fit-content";

    const blockPosition = queryByRowAndColumn(preview);

    for (let row = 0; row < 5 ; ++row) {
        for (let col = 0; col < 5; ++col) {
            const cellDiv = document.createElement("div");
            cellDiv.id = `preview-r${row}-c${col}`
            previewElement.append(cellDiv);
        }
    }

    for (let row = 0; row < preview.rows; ++row) {
        for (let col = 0; col < preview.cols; ++col) {
            if (blockPosition(row, col) !== 0) {
                const boardSquare = <HTMLDivElement>document.querySelector(`#preview-r${row+1}-c${col+1}`);
                boardSquare.style.background = `#${preview.color.toString(16)}`;
                boardSquare.style.border = `1px solid black`;
            }
        }
    }
}

const drawVoiceBlock = (currentBlock: VoiceBlock, currentPosition: Position) => {
    const blockPosition = queryByRowAndColumn(currentBlock);

    for (let row = currentPosition.row; row < currentPosition.row + currentBlock.rows; ++row) {
        for (let col = currentPosition.col; col < currentPosition.col + currentBlock.cols; ++col) {
            if (blockPosition(row - currentPosition.row, col - currentPosition.col) !== 0) {
                const boardSquare = <HTMLDivElement>document.querySelector(`#cell-r${row}-c${col}`);
                boardSquare.style.background = `#${currentBlock.color.toString(16)}`;
                boardSquare.style.border = `1px solid black`;
            }
        }
    }
}

const drawLevel = (level: number) => {
    const levelElement = queryLevelElement();
    levelElement.textContent = `${level}`;
}
const drawScore = (score: number) => {
    const scoreElement = queryScoreElement();
    scoreElement.textContent = `${score}`;
}

document.addEventListener('DOMContentLoaded', async () => {
    const client = new Client(VOICEBLOCK_SERVER !=='' ? VOICEBLOCK_SERVER : 'ws://localhost:2567');

    const room: Room<GameState> = await client.joinOrCreate<GameState>("voiceblock").then(room => {
        document.addEventListener('keydown', (ev: KeyboardEvent) => {
            if (ev.code === "Space") {
                room.send("rotate", {});
            } else if (ev.code === "ArrowLeft") {
                room.send("move", LEFT);
            } else if (ev.code === "ArrowRight") {
                room.send("move", RIGHT);
            } else if (ev.code === "ArrowDown") {
                room.send("move", DOWN);
            }
        })
        return room;
    });
    room.onStateChange((newState: GameState) => {
        clearBoard();
        clearPreview();
        drawBoard(newState.board);
        drawPreview(newState.nextBlock);
        drawVoiceBlock(newState.currentBlock, newState.currentPosition);
        drawScore(newState.totalPoints);
        drawLevel(newState.level);
    });
});
