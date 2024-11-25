<script setup lang="ts">
	import type { Player } from '../types/ticTacToe'
	import { computed } from 'vue'

	const { owner, currentPlayerSymbol, hovered, isInActiveBoard } = defineProps<{
		owner: Player | null
		currentPlayerSymbol: string
		hovered: boolean
		isInActiveBoard: boolean
	}>()

	defineEmits<{
		(e: 'click'): void
		(e: 'hover'): void
		(e: 'unhover'): void
	}>()

	const displaySymbol = computed(() => owner?.symbol || (hovered ? currentPlayerSymbol : ''))
	const canInteract = computed(() => !owner && isInActiveBoard)
</script>

<template>
	<button
		:class="['square', { clickable: isInActiveBoard }]"
		@click="canInteract && $emit('click')"
		@mouseenter="canInteract && $emit('hover')"
		@mouseleave="$emit('unhover')">
		<span :class="{ preview: hovered }">
			{{ displaySymbol }}
		</span>
	</button>
</template>

<style scoped>
	.square {
		width: 48px;
		height: 48px;
		display: grid;
		place-items: center;
		background-color: #333;
		border: 1px solid black;
		transition: background-color 0.3s ease;
		cursor: default;

		-webkit-tap-highlight-color: transparent;
		-webkit-touch-callout: none;
		user-select: none;
	}

	@media (max-width: 800px) {
		.square {
			width: 40px;
			height: 40px;
		}
	}

	@media (max-width: 450px) {
		.square {
			width: 28px;
			height: 28px;
		}
	}

	@media (max-width: 380px) {
		.square {
			width: 24px;
			height: 24px;
		}
	}

	.clickable {
		cursor: pointer;
	}

	.preview {
		opacity: 0.5;
	}
</style>
