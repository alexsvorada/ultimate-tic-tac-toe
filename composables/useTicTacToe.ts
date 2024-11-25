import { ref, computed } from 'vue'
import type { GameState, GameMessage, Symbol } from '~/types/ticTacToe'
import { getDefaultGameState, serialize } from '~/utils/gameUtils'
import { useWebSocket } from '#build/imports'

export function useTicTacToe() {
	const gameState = ref<GameState>(getDefaultGameState())
	const playerCount = ref(0)
	const isGameFull = ref(false)
	const playerSymbol = ref<Symbol | null>(null)

	const currentPlayer = computed(() => ({
		symbol: gameState.value.currentPlayerIndex === 0 ? 'X' : 'O',
	}))

	const gameOver = computed(() => gameState.value.winner !== null || gameState.value.isDraw)

	const isPlayerTurn = computed(() => playerSymbol.value === currentPlayer.value.symbol)

	const { send } = useWebSocket(`wss://${window.location.host}/api/websocket`, {
		autoReconnect: {
			retries: 3,
			delay: 1000,
			onFailed() {
				console.error('Failed to connect to game server after 3 retries')
			},
		},
		onConnected() {
			console.log('Connected to game server')
		},
		onDisconnected(_, event) {
			console.log('Disconnected from game server:', event.reason)
		},
		onError(_, event) {
			console.error('WebSocket error:', event)
		},
		onMessage(_, event) {
			const data = JSON.parse(event.data) as GameMessage

			switch (data.type) {
				case 'GAME_STATE_UPDATE':
					gameState.value = data.payload as GameState
					break
				case 'GAME_FULL':
					isGameFull.value = true
					break
				case 'PLAYERS_CONNECTED':
					playerCount.value = data.payload as number
					isGameFull.value = playerCount.value >= 2
					break
				case 'PLAYER_ASSIGNED':
					const { symbol, gameState: initialState } = data.payload as {
						symbol: Symbol
						gameState: GameState
					}
					playerSymbol.value = symbol
					gameState.value = initialState
					break
			}
		},
	})

	function makeMove(boardId: number, squareId: number) {
		if (!isPlayerTurn.value) return

		send(
			serialize({
				type: 'MAKE_MOVE',
				payload: {
					boardId,
					squareId,
					player: playerSymbol.value,
				},
			})
		)
	}

	function hoverMove(boardId: number, squareId: number) {
		if (!canMakeMove(boardId, squareId)) return

		gameState.value.board[boardId].squares[squareId].hovered = true
		updatePreviewNextBoard(squareId)
	}

	function unhoverMove(boardId: number, squareId: number) {
		gameState.value.board[boardId].squares[squareId].hovered = false
		gameState.value.previewNextBoard = []
	}

	function canMakeMove(boardId: number, squareId: number): boolean {
		if (gameOver.value) return false

		const subBoard = gameState.value.board[boardId]
		const isValidBoard = gameState.value.activeBoard === null || gameState.value.activeBoard === boardId

		return isValidBoard && !subBoard.winner && !subBoard.isDraw && subBoard.squares[squareId].owner === null
	}

	function updatePreviewNextBoard(squareId: number) {
		gameState.value.previewNextBoard = !gameState.value.availableBoards.includes(squareId)
			? [...gameState.value.availableBoards]
			: [squareId]
	}

	return {
		gameState,
		currentPlayer,
		gameOver,
		makeMove,
		hoverMove,
		unhoverMove,
		playerCount,
		isGameFull,
		playerSymbol,
		isPlayerTurn,
	}
}
