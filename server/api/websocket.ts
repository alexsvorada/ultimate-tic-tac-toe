import type { GameState, GameMessage, SubBoard, Player, MovePayload } from '~/types/ticTacToe'
import { checkWinner, checkDraw, getDefaultGameState, serialize } from '~/utils/gameUtils'

const MAX_CLIENTS = 2
const gameState: GameState = getDefaultGameState()
const clients = new Map<any, 'X' | 'O'>()

function isGameFull(): boolean {
	return clients.size >= MAX_CLIENTS
}

function handleRejectConnection(peer: any): void {
	peer.send(
		serialize({
			type: 'GAME_FULL',
			payload: 'Game is full, please try again later',
		})
	)
	peer.close()
}

function assignPlayerSymbol(): 'X' | 'O' {
	if (clients.size === 0) return 'X'
	const existingSymbol = clients.values().next().value
	return existingSymbol === 'X' ? 'O' : 'X'
}

function sendInitialState(peer: any, symbol: 'X' | 'O'): void {
	peer.send(
		serialize({
			type: 'PLAYER_ASSIGNED',
			payload: {
				symbol,
				gameState,
			},
		})
	)
}

function broadcastPlayerCount(): void {
	broadcast({
		type: 'PLAYERS_CONNECTED',
		payload: clients.size,
	})
}

function isValidMove(peer: any, boardId: number, squareId: number, player: 'X' | 'O'): boolean {
	if (player !== clients.get(peer)) return false
	if (gameState.winner || gameState.isDraw) return false
	if (gameState.activeBoard !== null && gameState.activeBoard !== boardId) return false

	const subBoard = gameState.board[boardId]
	return !subBoard.winner && !subBoard.isDraw && subBoard.squares[squareId].owner === null
}

function executeMove(boardId: number, squareId: number, player: 'X' | 'O'): void {
	const subBoard = gameState.board[boardId]
	const currentPlayer = { symbol: player }

	subBoard.squares[squareId].owner = currentPlayer

	if (checkWinner(subBoard.squares)) {
		handleSubBoardWinner(boardId, subBoard, currentPlayer)
	} else if (checkDraw(subBoard.squares)) {
		handleSubBoardDraw(boardId, subBoard)
	}

	updateGameState(squareId)
}

function handleSubBoardWinner(boardId: number, subBoard: SubBoard, winner: Player): void {
	subBoard.winner = winner
	removeFromAvailable(boardId)

	const mainBoardSquares = gameState.board.map((b) => ({
		id: b.id,
		owner: b.winner,
		hovered: false,
	}))

	if (checkWinner(mainBoardSquares)) {
		gameState.winner = winner
		gameState.activeBoard = null
	}
}

function handleSubBoardDraw(boardId: number, subBoard: SubBoard): void {
	subBoard.isDraw = true
	removeFromAvailable(boardId)

	if (gameState.board.every((b) => b.winner !== null || b.isDraw)) {
		gameState.isDraw = true
		gameState.activeBoard = null
	}
}

function updateGameState(squareId: number): void {
	gameState.activeBoard = gameState.availableBoards.includes(squareId) ? squareId : null
	gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % 2
}

function removeFromAvailable(boardId: number): void {
	gameState.availableBoards = gameState.availableBoards.filter((id) => id !== boardId)
}

function resetGameIfNeeded(): void {
	if (clients.size < 2) {
		Object.assign(gameState, getDefaultGameState())
	}
}

function broadcast(message: unknown): void {
	const serializedMessage = serialize(message)
	clients.forEach((_, client) => client.send(serializedMessage))
}

function broadcastGameState(): void {
	broadcast({
		type: 'GAME_STATE_UPDATE',
		payload: gameState,
	})
}

export default defineWebSocketHandler({
	open(peer) {
		console.log('Client connected:', peer.id)

		if (isGameFull()) {
			handleRejectConnection(peer)
			return
		}

		const symbol = assignPlayerSymbol()
		clients.set(peer, symbol)
		sendInitialState(peer, symbol)
		broadcastPlayerCount()
	},

	message(peer, message) {
		const parsedMessage = JSON.parse(message as unknown as string) as GameMessage

		if (parsedMessage.type === 'MAKE_MOVE') {
			const { boardId, squareId, player } = parsedMessage.payload as MovePayload

			if (!isValidMove(peer, boardId, squareId, player)) {
				return
			}

			executeMove(boardId, squareId, player)
			broadcastGameState()
		}
	},

	close(peer) {
		console.log('Client disconnected:', peer.id)
		clients.delete(peer)
		resetGameIfNeeded()
		broadcastPlayerCount()
	},
})
