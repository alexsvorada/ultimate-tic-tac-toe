export type Symbol = 'X' | 'O'

export interface Player {
	symbol: Symbol
}

export interface Square {
	id: number
	owner: Player | null
	hovered: boolean
}

export interface SubBoard {
	id: number
	squares: Square[]
	winner: Player | null
	isDraw: boolean
}

export interface GameState {
	currentPlayerIndex: number
	winner: Player | null
	isDraw: boolean
	activeBoard: number | null
	availableBoards: number[]
	previewNextBoard: number[]
	board: SubBoard[]
}

export type GameMessageType = 'GAME_STATE_UPDATE' | 'MAKE_MOVE' | 'GAME_FULL' | 'PLAYERS_CONNECTED' | 'PLAYER_ASSIGNED'

export interface GameMessage {
	type: GameMessageType
	payload: unknown
}

export interface MovePayload {
	boardId: number
	squareId: number
	player: Symbol
}
