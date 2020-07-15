<script>
	let firstPlayerScore = 0;
	let secondPlayerScore = 0;

	export const updateScore = (data) => {
		const { playerScored } = data;
		if (playerScored === 1)
			firstPlayerScore += 1;
		else if (playerScored === 2)
			secondPlayerScore += 1;
	}
</script>

<div class="grid-container">
	<h1 class="left">{firstPlayerScore}</h1>
	<h1 class="center">|</h1>
	<h1 class="right">{secondPlayerScore}</h1>
</div>

<style>
	.left {
		text-align: right;
	}

	.center {
		text-align: center;
	}

	.right {
		text-align: left;
	}

	.grid-container
	{
		position: absolute;
		display: grid;
		grid-template: "left center right";
		grid-template-columns: auto 2% auto;
		z-index: 1;
		margin: 0;
		padding: 0;
		width: 100%;
	}

	h1 {
		margin: 0;
		padding: 0;
		color: white;
		font-size: 52px;
	}

</style>