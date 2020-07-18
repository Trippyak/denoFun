<script>
	export let winner;
</script>

<div class="grid-container">
	<h1>Player {winner} Wins!</h1>
</div>

<style>
	.grid-container
	{
		position: absolute;
		display: grid;
		margin: 0;
		padding: 0;
		width: 100%;
		height: 100%;
		justify-content: center;
		align-content: center;
	}

	h1 {
		margin: 0;
		padding: 0;
		color: white;
		font-size: 52px;
	}

</style>