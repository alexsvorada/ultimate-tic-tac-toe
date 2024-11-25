import type { GameState, Square, SubBoard } from '../types/ticTacToe'

export const WINNING_COMBINATIONS = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
]

export function checkWinner(squares: Square[]): boolean {
	return WINNING_COMBINATIONS.some((combination) => {
		const [a, b, c] = combination
		return (
			squares[a].owner &&
			squares[b].owner &&
			squares[c].owner &&
			squares[a].owner.symbol === squares[b].owner.symbol &&
			squares[a].owner.symbol === squares[c].owner.symbol
		)
	})
}

export function checkDraw(squares: Square[]): boolean {
	return squares.every((square) => square.owner !== null)
}

function createInitialBoard(): SubBoard[] {
	return Array(9)
		.fill(null)
		.map((_, boardId) => ({
			id: boardId,
			squares: Array(9)
				.fill(null)
				.map((_, squareId) => ({
					id: squareId,
					owner: null,
					hovered: false,
				})),
			winner: null,
			isDraw: false,
		}))
}

export function getDefaultGameState(): GameState {
	return {
		currentPlayerIndex: 0,
		winner: null,
		isDraw: false,
		activeBoard: null,
		availableBoards: [0, 1, 2, 3, 4, 5, 6, 7, 8],
		previewNextBoard: [],
		board: createInitialBoard(),
	}
}

export function serialize(message: any): string {
	return JSON.stringify(message)
}
