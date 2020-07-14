<script lang="typescript">
	import { IControl } from "./IControl";
	export let controls: IControl[] = [];
	export let component;
	export let props;
	let controlName;
	
	const update = (newControlName: string) => {
		console.log(newControlName);
		controls.some((control) => {
			if (newControlName === control.name)
			{
				controlName = newControlName;
				component = control.component;
				props = control.props;
				return true;
			}
		});
	}

	const updateControlsProps = () => {
		const tempControls = controls;
		controls.some((control, index) => {
			if (controlName === control.name)
			{
				tempControls[index].props = control.props;
				console.log(controls);
				return true;
			}
		});
		return tempControls;
	}

	$: {
		props = updateControlsProps();
		console.log("UPdatyeding")
	}

	const onControlClick = (event, controlName) => {
		event.preventDefault();
		update(controlName);
	}

	
</script>

<nav>
	{#each controls as {name} }
		<a href="#" on:click="{event => onControlClick(event, name)}">{name}</a>
	{:else}
		<h1>nothing to see there</h1>
	{/each}
</nav>

<svelte:component this={component} {...props}></svelte:component>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>