import type { GameState, Player, Symbol, SubBoard } from '~/types/ticTacToe'
import { checkWinner, checkDraw, getDefaultGameState, serialize } from '~/utils/gameUtils'

type GamePeer = {
	send: (message: string) => void
	id: string
}

export default class Room {
	private _gameState: GameState
	private clients: Map<GamePeer, Symbol>
	private readonly MAX_CLIENTS = 2
	public readonly roomId: string

	constructor(roomId: string) {
		if (!roomId) {
			throw new Error('Room ID is required')
		}

		this.roomId = roomId
		this._gameState = getDefaultGameState()
		this.clients = new Map()
	}

	isGameFull(): boolean {
		return this.clients.size >= this.MAX_CLIENTS
	}

	addClient(peer: GamePeer): Symbol | null {
		if (!peer?.send || !peer?.id) {
			throw new Error('Invalid peer provided')
		}

		if (this.isGameFull()) {
			return null
		}

		const symbol = this.assignPlayerSymbol()
		this.clients.set(peer, symbol)
		return symbol
	}

	removeClient(peer: GamePeer): void {
		if (!peer?.id) {
			throw new Error('Invalid peer provided')
		}

		this.clients.delete(peer)
		if (this.clients.size < 2) {
			this._gameState = getDefaultGameState()
		}
	}

	broadcastPlayerCount(): void {
		this.broadcast({
			type: 'PLAYERS_CONNECTED',
			payload: this.clients.size,
		})
	}

	broadcastGameState(): void {
		this.broadcast({
			type: 'GAME_STATE_UPDATE',
			payload: this._gameState,
		})
	}

	isValidMove(peer: GamePeer, boardId: number, squareId: number, player: Symbol): boolean {
		if (player !== this.clients.get(peer)) return false
		if (this._gameState.winner || this._gameState.isDraw) return false
		if (this._gameState.activeBoard !== null && this._gameState.activeBoard !== boardId) return false

		const subBoard = this._gameState.board[boardId]
		return !subBoard.winner && !subBoard.isDraw && subBoard.squares[squareId].owner === null
	}

	executeMove(boardId: number, squareId: number, player: Symbol): void {
		const subBoard = this._gameState.board[boardId]
		const currentPlayer = { symbol: player }

		subBoard.squares[squareId].owner = currentPlayer

		if (checkWinner(subBoard.squares)) {
			this.handleSubBoardWinner(boardId, subBoard, currentPlayer)
		} else if (checkDraw(subBoard.squares)) {
			this.handleSubBoardDraw(boardId, subBoard)
		}

		this.updateGameState(squareId)
	}

	private assignPlayerSymbol(): Symbol {
		if (this.clients.size === 0) return 'X'
		const existingSymbol = this.clients.values().next().value
		return existingSymbol === 'X' ? 'O' : 'X'
	}

	private broadcast(message: unknown): void {
		const serializedMessage = serialize(message)
		this.clients.forEach((_, client) => client.send(serializedMessage))
	}

	private handleSubBoardWinner(boardId: number, subBoard: SubBoard, winner: Player): void {
		subBoard.winner = winner
		this.removeFromAvailable(boardId)

		const mainBoardSquares = this._gameState.board.map((b) => ({
			id: b.id,
			owner: b.winner,
			hovered: false,
		}))

		if (checkWinner(mainBoardSquares)) {
			this._gameState.winner = winner
			this._gameState.activeBoard = null
		}
	}

	private handleSubBoardDraw(boardId: number, subBoard: SubBoard): void {
		subBoard.isDraw = true
		this.removeFromAvailable(boardId)

		if (this._gameState.board.every((b) => b.winner !== null || b.isDraw)) {
			this._gameState.isDraw = true
			this._gameState.activeBoard = null
		}
	}

	private updateGameState(squareId: number): void {
		this._gameState.activeBoard = this._gameState.availableBoards.includes(squareId) ? squareId : null
		this._gameState.currentPlayerIndex = (this._gameState.currentPlayerIndex + 1) % 2
	}

	private removeFromAvailable(boardId: number): void {
		this._gameState.availableBoards = this._gameState.availableBoards.filter((id) => id !== boardId)
	}

	get gameState(): GameState {
		return this._gameState
	}

	get clientCount(): number {
		return this.clients.size
	}
}
