<script lang="ts">
	import { Eye, EyeOff } from '@lucide/svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';

	let { value, label = 'private key' }: { value: string; label?: string } = $props();
	let visible = $state(false);
	let warningOpen = $state(false);

	function requestReveal() {
		warningOpen = true;
	}

	function reveal() {
		visible = true;
	}
</script>

<div class="sensitive-value">
	{#if visible}
		<code data-sensitive-value>{value}</code>
		<Button
			size="xs"
			variant="ghost"
			aria-label={`${label} 숨기기`}
			onclick={() => (visible = false)}
		>
			<EyeOff /> 숨기기
		</Button>
	{:else}
		<span class="masked" aria-label={`${label} 숨김`}>••••••••••••••••</span>
		<Button size="xs" variant="outline" aria-label={`${label} 보기`} onclick={requestReveal}>
			<Eye /> 보기
		</Button>
	{/if}
</div>

<AlertDialog.Root bind:open={warningOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>민감한 값을 표시할까요?</AlertDialog.Title>
			<AlertDialog.Description>
				화면 공유, 브라우저 확장 프로그램, 주변 사람에게 private key가 노출될 수 있습니다. 실제
				자산에 사용하는 키라면 취소하세요.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>취소</AlertDialog.Cancel>
			<AlertDialog.Action onclick={reveal}>위험을 이해하고 보기</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<style>
	.sensitive-value {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.sensitive-value code {
		max-width: 30rem;
		word-break: break-all;
		font-size: 0.74rem;
		color: oklch(0.83 0.12 190);
	}

	.masked {
		letter-spacing: 0.08em;
		color: var(--muted-foreground);
	}
</style>
