<script lang="ts">
	import { Beaker, CircleAlert, RefreshCw, ShieldCheck, Sparkles } from '@lucide/svelte';
	import SensitiveValue from '$lib/components/SensitiveValue.svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Textarea } from '$lib/components/ui/textarea';
	import { deriveEvmAccounts, type EvmDerivedAccount } from '$lib/wallet/evm-hd';
	import { createMnemonic, parseMaxIndex } from '$lib/wallet/mnemonic';
	import { deriveTronAccounts, type TronDerivedAccount } from '$lib/wallet/tron-address';

	let mnemonic = $state('');
	let maxIndex = $state('10');
	let error = $state('');
	let evmRows = $state<EvmDerivedAccount[]>([]);
	let tronRows = $state<TronDerivedAccount[]>([]);

	function generate() {
		reset();
		mnemonic = createMnemonic();
		evmRows = deriveEvmAccounts(mnemonic, 0);
	}

	function deriveEvm() {
		error = '';
		try {
			evmRows = deriveEvmAccounts(mnemonic, parseMaxIndex(maxIndex));
		} catch (cause) {
			error = cause instanceof Error ? cause.message : '파생에 실패했습니다.';
			evmRows = [];
		}
	}

	function deriveTron() {
		error = '';
		try {
			tronRows = deriveTronAccounts(mnemonic, parseMaxIndex(maxIndex));
		} catch (cause) {
			error = cause instanceof Error ? cause.message : '파생에 실패했습니다.';
			tronRows = [];
		}
	}

	function reset() {
		mnemonic = '';
		maxIndex = '10';
		error = '';
		evmRows = [];
		tronRows = [];
	}
</script>

<svelte:head>
	<title>HD 파생 · Multichain Address Lab</title>
	<meta http-equiv="content-security-policy" content="connect-src 'none'" />
</svelte:head>

<main class="tool-shell">
	<section class="tool-heading">
		<div>
			<Badge variant="outline" class="eyebrow"><Beaker /> OFFLINE DERIVATION</Badge>
			<h1>HD 주소 파생</h1>
			<p>영어 BIP-39 mnemonic에서 EVM과 TRON 표준 경로를 로컬로 계산합니다.</p>
		</div>
		<Button variant="outline" onclick={reset}><RefreshCw /> 전체 초기화</Button>
	</section>

	<Alert variant="destructive" class="security-strip">
		<CircleAlert />
		<AlertTitle>실제 자산이 있는 mnemonic을 입력하지 마세요</AlertTitle>
		<AlertDescription
			>이 문서는 외부 연결을 차단하지만, 브라우저 확장 프로그램과 감염된 기기는 통제할 수 없습니다.
			오프라인 환경을 권장합니다.</AlertDescription
		>
	</Alert>

	<Tabs.Root value="generate" class="tabs-shell">
		<Tabs.List class="grid w-full grid-cols-3">
			<Tabs.Trigger value="generate">랜덤 생성</Tabs.Trigger>
			<Tabs.Trigger value="evm">EVM 주소·키</Tabs.Trigger>
			<Tabs.Trigger value="tron">TRON 주소</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="generate">
			<Card.Root>
				<Card.Header
					><Card.Title>12단어 mnemonic 생성</Card.Title><Card.Description
						>브라우저 보안 난수에서 128-bit entropy를 생성합니다.</Card.Description
					></Card.Header
				>
				<Card.Content class="stack">
					<Button onclick={generate}><Sparkles /> 새 mnemonic 생성</Button>
					{#if mnemonic}
						<div class="mnemonic-output" data-mnemonic-output>{mnemonic}</div>
						<div class="balance-row">
							<div>
								<Badge variant="secondary">EVM #0</Badge>
								<div class="balance-meta">m/44'/60'/0'/0/0</div>
							</div>
							<code>{evmRows[0]?.address}</code>
						</div>
					{:else}
						<div class="empty-state">
							<div>
								<ShieldCheck class="mx-auto mb-3 size-8" /><strong>아직 생성하지 않았습니다</strong
								><span>생성 결과는 이 문서의 메모리에만 유지됩니다.</span>
							</div>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="evm">
			<Card.Root>
				<Card.Header
					><Card.Title>EVM HD 주소와 private key</Card.Title><Card.Description
						>m/44'/60'/0'/0/{'{index}'} · maxIndex 포함</Card.Description
					></Card.Header
				>
				<Card.Content class="stack">
					<div class="derive-form-grid">
						<div class="field">
							<label for="evm-mnemonic">영어 BIP-39 mnemonic</label><Textarea
								id="evm-mnemonic"
								bind:value={mnemonic}
								rows={3}
								autocomplete="off"
								autocapitalize="off"
								spellcheck="false"
							/>
						</div>
						<div class="field">
							<label for="evm-index">maxIndex</label><Input
								id="evm-index"
								bind:value={maxIndex}
								inputmode="numeric"
							/>
						</div>
						<Button onclick={deriveEvm}>EVM 파생</Button>
					</div>
					{#if error}<p class="error-text" role="alert">{error}</p>{/if}
					{#if evmRows.length}
						<div class="table-wrap">
							<Table.Root
								><Table.Header
									><Table.Row
										><Table.Head>#</Table.Head><Table.Head>경로</Table.Head><Table.Head
											>주소</Table.Head
										><Table.Head>private key</Table.Head></Table.Row
									></Table.Header
								><Table.Body>
									{#each evmRows as row (row.path)}<Table.Row
											><Table.Cell>{row.index}</Table.Cell><Table.Cell class="path-cell mono"
												>{row.path}</Table.Cell
											><Table.Cell class="address-cell mono">{row.address}</Table.Cell><Table.Cell
												class="key-cell"
												><SensitiveValue
													value={row.privateKey}
													label={`index ${row.index} private key`}
												/></Table.Cell
											></Table.Row
										>{/each}
								</Table.Body></Table.Root
							>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="tron">
			<Card.Root>
				<Card.Header
					><Card.Title>TRON 표준 주소</Card.Title><Card.Description
						>m/44'/195'/0'/0/{'{index}'} · Base58Check</Card.Description
					></Card.Header
				>
				<Card.Content class="stack">
					<div class="derive-form-grid">
						<div class="field">
							<label for="tron-mnemonic">영어 BIP-39 mnemonic</label><Textarea
								id="tron-mnemonic"
								bind:value={mnemonic}
								rows={3}
								autocomplete="off"
								autocapitalize="off"
								spellcheck="false"
							/>
						</div>
						<div class="field">
							<label for="tron-index">maxIndex</label><Input
								id="tron-index"
								bind:value={maxIndex}
								inputmode="numeric"
							/>
						</div>
						<Button onclick={deriveTron}>TRON 파생</Button>
					</div>
					{#if error}<p class="error-text" role="alert">{error}</p>{/if}
					{#if tronRows.length}
						<div class="table-wrap">
							<Table.Root
								><Table.Header
									><Table.Row
										><Table.Head>#</Table.Head><Table.Head>경로</Table.Head><Table.Head
											>TRON 주소</Table.Head
										><Table.Head>같은 키의 EVM 주소</Table.Head></Table.Row
									></Table.Header
								><Table.Body>
									{#each tronRows as row (row.path)}<Table.Row
											><Table.Cell>{row.index}</Table.Cell><Table.Cell class="path-cell mono"
												>{row.path}</Table.Cell
											><Table.Cell class="address-cell mono">{row.address}</Table.Cell><Table.Cell
												class="address-cell mono">{row.evmAddress}</Table.Cell
											></Table.Row
										>{/each}
								</Table.Body></Table.Root
							>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</main>

<style>
	.mnemonic-output {
		padding: 1.25rem;
		border: 1px solid oklch(0.75 0.14 190 / 35%);
		border-radius: 1rem;
		background: oklch(0.18 0.03 230 / 85%);
		font-family: 'SFMono-Regular', Consolas, monospace;
		font-size: 1rem;
		line-height: 1.9;
		word-spacing: 0.4em;
		color: oklch(0.86 0.1 190);
	}
</style>
