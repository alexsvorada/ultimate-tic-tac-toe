<!-- app.vue -->
<script setup lang="ts">
	useHead({
		title: 'Ultimate Tic-Tac-Toe',
		meta: [{ name: 'description', content: 'Play Ultimate Tic-Tac-Toe with friends online' }],
	})
</script>

<template>
	<main class="flex flex-col items-center text-center gap-6 min-h-screen pt-6 bg-gray-950">
		<h1 class="text-4xl text-indigo-100 m-[0]">Ultimate Tic-Tac-Toe</h1>
		<NuxtPage />
	</main>
</template>
