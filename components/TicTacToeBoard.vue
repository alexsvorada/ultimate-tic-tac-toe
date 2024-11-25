<script setup lang="ts">
	import { computed } from 'vue'
	import { useTicTacToe } from '../composables/useTicTacToe'
	import TicTacToeSquare from './TicTacToeSquare.vue'
	import type { SubBoard } from '~/types/ticTacToe'

	const { gameState, currentPlayer, makeMove, hoverMove, unhoverMove, playerCount, isGameFull, playerSymbol, isPlayerTurn } =
		useTicTacToe()

	const gameStatusMessage = computed(() => {
		if (isGameFull.value && !playerSymbol.value) return 'Game is full, please try again later'
		if (playerCount.value < 2) return `Waiting for opponent... (${playerCount.value}/2 players)`
		if (gameState.value.isDraw) return "It's a draw!"
		if (gameState.value.winner) return `Player ${gameState.value.winner.symbol} has won the game!`

		return isPlayerTurn.value
			? `It's your turn! You are ${playerSymbol.value}`
			: `Waiting for opponent's move... (You are ${playerSymbol.value})`
	})

	const isGameEnded = computed(() => gameState.value.winner || gameState.value.isDraw)

	const shouldBeActive = (boardId: number) => {
		const isValidBoard = computed(
			() =>
				(gameState.value.activeBoard === null && gameState.value.availableBoards.includes(boardId)) ||
				gameState.value.activeBoard === boardId
		)

		return !isGameEnded.value && isValidBoard.value && isPlayerTurn.value
	}

	const isSquareInActiveBoard = (boardId: number) =>
		(gameState.value.activeBoard === null || gameState.value.activeBoard === boardId) && isPlayerTurn.value

	const getBoardClasses = (subBoard: SubBoard) => ({
		active: shouldBeActive(subBoard.id),
		completed: subBoard.winner || subBoard.isDraw,
		'preview-active': gameState.value.previewNextBoard.includes(subBoard.id),
	})
</script>

<template>
	<div class="container">
		<h1>Ultimate Tic-Tac-Toe</h1>
		<h2>{{ gameStatusMessage }}</h2>

		<div v-if="playerCount === 2" class="board">
			<div v-for="subBoard in gameState.board" :key="subBoard.id" class="sub-board" :class="getBoardClasses(subBoard)">
				<div v-if="subBoard.winner" class="overlay">
					{{ subBoard.winner.symbol }}
				</div>
				<div v-else class="grid">
					<TicTacToeSquare
						v-for="square in subBoard.squares"
						:key="square.id"
						:owner="square.owner"
						:hovered="square.hovered"
						:current-player-symbol="currentPlayer.symbol"
						:is-in-active-board="isSquareInActiveBoard(subBoard.id)"
						@click="makeMove(subBoard.id, square.id)"
						@hover="hoverMove(subBoard.id, square.id)"
						@unhover="unhoverMove(subBoard.id, square.id)" />
				</div>
			</div>
		</div>
		<div v-else class="waiting">
			<div class="spinner" />
		</div>
	</div>
</template>

<style scoped>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
		min-height: 100vh;
		padding-top: 24px;
	}

	h1 {
		font-size: 2.5rem;
		margin: 0;
	}

	h2 {
		font-size: 1.5rem;
		margin: 0;
	}

	.board {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
		padding-top: 10px;
		border-radius: 8px;
	}

	.sub-board {
		position: relative;
		padding: 5px;
		opacity: 0.5;
		transition: opacity 0.3s ease;
		border-radius: 10%;
		border: 2px solid transparent;
	}

	.sub-board.active {
		opacity: 1;
		border-color: whitesmoke;
	}

	.sub-board.preview-active {
		opacity: 0.8;
		border-style: dashed;
		border-color: whitesmoke;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2px;
	}

	.overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 72px;
	}

	.reset {
		padding: 0.6em 1.2em;
		font-size: 1em;
		background-color: #333;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.reset:hover {
		background-color: white;
		color: #333;
	}

	.waiting {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 400px;
	}

	.spinner {
		width: 50px;
		height: 50px;
		border: 5px solid #f3f3f3;
		border-top: 5px solid #333;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
