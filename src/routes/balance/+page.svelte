<script lang="ts">
	import { Activity, CircleAlert, Radio, Search, ShieldCheck } from '@lucide/svelte';
	import {
		lookupBalances,
		validateAddress,
		type BalanceLookupResult,
		type ChainKey
	} from '$lib/chain';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Spinner } from '$lib/components/ui/spinner';
	import { CHAINS, CHAIN_OPTIONS } from '$lib/config/chains';

	let chainKey = $state<ChainKey>('ethereum');
	let address = $state('');
	let loading = $state(false);
	let error = $state('');
	let result = $state<BalanceLookupResult | null>(null);
	let controller: AbortController | null = null;

	const selectedChain = $derived(CHAINS[chainKey]);

	function changeChain(event: Event) {
		controller?.abort();
		chainKey = (event.currentTarget as HTMLSelectElement).value as ChainKey;
		result = null;
		error = '';
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		controller?.abort();
		result = null;
		error = '';
		const normalized = address.trim();
		if (!validateAddress(selectedChain, normalized)) {
			error = `${selectedChain.name} 주소 형식을 확인하세요.`;
			return;
		}

		controller = new AbortController();
		loading = true;
		try {
			result = await lookupBalances(selectedChain, normalized, controller.signal);
			if (result.balances.length === 0) error = '모든 잔액 조회가 실패했습니다.';
		} catch (cause) {
			if (!controller.signal.aborted)
				error = cause instanceof Error ? cause.message : '조회에 실패했습니다.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head><title>잔액 조회 · Multichain Address Lab</title></svelte:head>

<main class="tool-shell">
	<section class="tool-heading">
		<div>
			<Badge variant="outline" class="eyebrow"><Radio /> LIVE RPC</Badge>
			<h1>주소 잔액 조회</h1>
			<p>
				주소 하나를 공개 RPC에 조회합니다. 입력한 주소와 IP는 RPC 제공자에게 전달될 수 있습니다.
			</p>
		</div>
		<Badge variant="secondary"><ShieldCheck /> 읽기 전용</Badge>
	</section>

	<div class="workspace-grid">
		<div class="stack">
			<Card.Root>
				<Card.Header>
					<Card.Title>조회 조건</Card.Title>
					<Card.Description>네트워크와 주소를 선택하세요.</Card.Description>
				</Card.Header>
				<Card.Content>
					<form class="form-stack" onsubmit={submit}>
						<div class="field">
							<label for="chain">네트워크</label>
							<select id="chain" class="native-select" value={chainKey} onchange={changeChain}>
								{#each CHAIN_OPTIONS as chain (chain.key)}
									<option value={chain.key}>{chain.name}</option>
								{/each}
							</select>
						</div>
						<div class="field">
							<label for="address">주소</label>
							<Input
								id="address"
								bind:value={address}
								placeholder={selectedChain.kind === 'evm' ? '0x…' : 'T…'}
								autocomplete="off"
								spellcheck="false"
								aria-invalid={Boolean(error)}
							/>
							{#if error}<p class="error-text" role="alert">{error}</p>{/if}
						</div>
						<Button type="submit" size="lg" disabled={loading}>
							{#if loading}<Spinner /> 조회 중{:else}<Search /> 잔액 조회{/if}
						</Button>
					</form>
				</Card.Content>
			</Card.Root>

			<Alert>
				<CircleAlert />
				<AlertTitle>공개 RPC 안내</AlertTitle>
				<AlertDescription
					>무료 endpoint의 속도 제한이나 일시 장애로 일부 자산만 표시될 수 있습니다.</AlertDescription
				>
			</Alert>
		</div>

		<Card.Root class="results-panel">
			<Card.Header>
				<div class="result-header">
					<div>
						<Card.Title>조회 결과</Card.Title>
						<Card.Description
							>{selectedChain.name} · {selectedChain.tokens.length + 1}개 자산</Card.Description
						>
					</div>
					{#if result}<Badge variant="outline">{result.balances.length} 성공</Badge>{/if}
				</div>
			</Card.Header>
			<Card.Content>
				{#if loading}
					<div class="empty-state">
						<div>
							<Spinner class="mx-auto mb-3 size-6" /><strong>블록체인 상태 확인 중</strong><span
								>최대 10초가 걸릴 수 있습니다.</span
							>
						</div>
					</div>
				{:else if result}
					<div class="balance-list">
						{#each result.balances as balance (balance.symbol)}
							<div class="balance-row">
								<div>
									<Badge variant="secondary">{balance.symbol}</Badge>
									<div class="balance-meta">{balance.name}</div>
								</div>
								<div class="balance-amount mono">{balance.formatted} {balance.symbol}</div>
							</div>
						{/each}
						{#each result.failures as failure (failure.symbol)}
							<Alert variant="destructive"
								><CircleAlert /><AlertTitle>{failure.symbol} 조회 실패</AlertTitle><AlertDescription
									>{failure.message}</AlertDescription
								></Alert
							>
						{/each}
					</div>
				{:else}
					<div class="empty-state">
						<div>
							<Activity class="mx-auto mb-3 size-8" /><strong>아직 조회하지 않았습니다</strong><span
								>왼쪽에서 네트워크와 주소를 입력하세요.</span
							>
						</div>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</main>

<style>
	.native-select {
		height: 2rem;
		width: 100%;
		border: 1px solid var(--input);
		border-radius: 0.5rem;
		background: transparent;
		padding: 0 0.65rem;
		color: var(--foreground);
		outline: none;
	}
	.native-select:focus {
		border-color: var(--ring);
		box-shadow: 0 0 0 3px oklch(0.78 0.16 190 / 20%);
	}
</style>
