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
		background-color: rgba(99, 102, 241, 0.1); /* Light indigo background */
		color: rgb(199, 210, 254); /* Light indigo text */
		font-weight: 600;
		font-size: 1.5rem;
		transition: all 0.3s ease;
		cursor: default;

		-webkit-tap-highlight-color: transparent;
		-webkit-touch-callout: none;
		user-select: none;
		@apply border border-solid border-indigo-300;
	}

	.clickable {
		cursor: pointer;
	}

	.clickable:hover {
		background-color: rgba(99, 102, 241, 0.2); /* Slightly darker on hover */
		border-color: rgba(99, 102, 241, 0.3);
	}

	.preview {
		opacity: 0.5;
		color: rgb(165, 180, 252); /* Lighter color for preview */
	}

	/* You can keep your media queries as is */
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
			font-size: 1.25rem;
		}
	}

	@media (max-width: 380px) {
		.square {
			width: 24px;
			height: 24px;
			font-size: 1rem;
		}
	}
</style>
