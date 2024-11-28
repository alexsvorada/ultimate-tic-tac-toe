<script setup lang="ts">
	const router = useRouter()

	function generateRoomId() {
		return Math.random().toString(36).substring(2, 10)
	}

	async function createRoom() {
		const roomId = generateRoomId()
		await router.push(`/${roomId}`)
	}
</script>

<template>
	<button
		@click="createRoom"
		class="px-4 py-2 bg-indigo-600/80 text-indigo-100 rounded-lg hover:bg-indigo-500 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900">
		Create New Game
	</button>
</template>
