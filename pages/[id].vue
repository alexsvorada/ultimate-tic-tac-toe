<script setup lang="ts">
	const route = useRoute()
	const roomId = route.params.id as string
	const copied = ref(false)

	if (!roomId || roomId.length !== 8) {
		useRouter().push('/')
	}

	async function shareRoom() {
		await navigator.clipboard.writeText(window.location.href)
		copied.value = true
		setTimeout(() => {
			copied.value = false
		}, 2000)
	}
</script>

<template>
	<div class="min-h-screen p-4">
		<div class="max-w-4xl mx-auto">
			<!-- Room info -->
			<div class="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
				<div class="flex flex-col sm:flex-row gap-4 items-center">
					<h2 class="text-xl text-indigo-100 font-semibold">
						Room:
						<span class="tracking-widest text-indigo-300 font-mono">{{ roomId }}</span>
					</h2>
					<button
						@click="shareRoom"
						class="px-4 py-2 bg-indigo-600/80 text-indigo-100 rounded-lg hover:bg-indigo-500 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900">
						<svg
							v-if="!copied"
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
						</svg>
						<svg
							v-else
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						{{ copied ? 'Copied!' : 'Share Room' }}
					</button>
				</div>
			</div>

			<!-- Game Board -->
			<TicTacToeBoard />
		</div>
	</div>
</template>

<style scoped>
	.min-h-screen {
		min-height: calc(100vh - 100px); /* Adjust based on your header height */
	}
</style>
