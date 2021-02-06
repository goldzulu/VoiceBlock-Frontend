import {Board} from "./Board";
import {VoiceBlock} from "./VoiceBlock";
import {Position} from "./Position";

export const queryByRowAndColumn = (board: Board) => (row: number, col: number): number => {
    return board.values[row * board.cols + col];
}

export const setValueAtRowAndColumn = (board: Board) => (row: number, col: number, value: number): void => {
    board.values[row * board.cols + col] = value;
}

export const addEmptyRowToBoard = (board: Board): void => {
    const emptyRow = new Array(board.cols).fill(0);
    addRowToBoard(board, emptyRow);
}

const addRowToBoard = (board: Board, newRow: number[]) => {
    board.values.unshift(...newRow);
}

export const deleteRowsFromBoard = (board: Board, rowToDelete: number, amountOfRowsToDelete: number = 1) => {
    board.values.splice(rowToDelete * board.cols, board.cols * amountOfRowsToDelete);
}

export const freezeCurrentVoiceBlock = (board: Board, voiceblock: VoiceBlock, position: Position) => {
    const setBoardValue = setValueAtRowAndColumn(board);
    const voiceblockElement = queryByRowAndColumn(voiceblock);

    for (let voiceblockRow = 0; voiceblockRow < voiceblock.rows; ++voiceblockRow) {
        for (let voiceblockCol = 0; voiceblockCol < voiceblock.cols; ++voiceblockCol) {
            if (voiceblockElement(voiceblockRow, voiceblockCol) !== 0) {
                setBoardValue(position.row + voiceblockRow, position.col + voiceblockCol, voiceblock.color);
            }
        }
    }
}
