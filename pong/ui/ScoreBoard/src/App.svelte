<script>
	export let playerOneScore = 0;
	export let playerTwoScore = 0;
</script>

<div class="grid-container">
	<h1 class="left">{playerOneScore}</h1>
	<h1 class="center">|</h1>
	<h1 class="right">{playerTwoScore}</h1>
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