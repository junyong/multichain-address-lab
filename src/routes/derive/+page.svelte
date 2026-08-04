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
	let activeTab = $state('generate');

	function generate() {
		reset();
		mnemonic = createMnemonic();
		evmRows = deriveEvmAccounts(mnemonic, 0);
		activeTab = 'generate';
	}

	function deriveEvm() {
		error = '';
		try {
			evmRows = deriveEvmAccounts(mnemonic, parseMaxIndex(maxIndex));
			activeTab = 'evm';
		} catch (cause) {
			error = cause instanceof Error ? cause.message : '파생에 실패했습니다.';
			evmRows = [];
		}
	}

	function deriveTron() {
		error = '';
		try {
			tronRows = deriveTronAccounts(mnemonic, parseMaxIndex(maxIndex));
			activeTab = 'tron';
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
		activeTab = 'generate';
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

	<div class="workspace-grid">
		<div class="stack">
			<Card.Root>
				<Card.Header>
					<Card.Title>파생 조건</Card.Title>
					<Card.Description>Mnemonic과 파생 범위를 설정하세요.</Card.Description>
				</Card.Header>
				<Card.Content class="stack">
					<div class="field">
						<label for="derive-mnemonic">영어 BIP-39 mnemonic</label>
						<Textarea
							id="derive-mnemonic"
							bind:value={mnemonic}
							rows={3}
							placeholder="12단어 mnemonic 입력"
							autocomplete="off"
							autocapitalize="off"
							spellcheck="false"
						/>
						<Button size="sm" variant="secondary" onclick={generate}>
							<Sparkles class="size-4 mr-1" /> 새 mnemonic 생성
						</Button>
					</div>

					<div class="field">
						<label for="derive-index">maxIndex</label>
						<Input
							id="derive-index"
							bind:value={maxIndex}
							inputmode="numeric"
						/>
					</div>

					{#if error}<p class="error-text" role="alert">{error}</p>{/if}

					<div class="grid grid-cols-2 gap-2 pt-1">
						<Button onclick={deriveEvm}>EVM 파생</Button>
						<Button onclick={deriveTron} variant="outline">TRON 파생</Button>
					</div>
				</Card.Content>
			</Card.Root>

			<Alert variant="destructive" class="security-strip">
				<CircleAlert />
				<AlertTitle>실제 자산 mnemonic 금지</AlertTitle>
				<AlertDescription
					>이 문서는 외부 연결을 차단하지만, 오프라인 환경에서 수행하는 것을 권장합니다.</AlertDescription
				>
			</Alert>
		</div>

		<Card.Root class="results-panel">
			<Card.Header>
				<Tabs.Root bind:value={activeTab} class="w-full">
					<Tabs.List class="grid w-full grid-cols-3">
						<Tabs.Trigger value="generate">랜덤 생성</Tabs.Trigger>
						<Tabs.Trigger value="evm">
							EVM 주소·키
							{#if evmRows.length}<Badge variant="secondary" class="ml-1.5">{evmRows.length}</Badge>{/if}
						</Tabs.Trigger>
						<Tabs.Trigger value="tron">
							TRON 주소
							{#if tronRows.length}<Badge variant="secondary" class="ml-1.5">{tronRows.length}</Badge>{/if}
						</Tabs.Trigger>
					</Tabs.List>

					<Tabs.Content value="generate" class="mt-4">
						<div class="stack">
							<div>
								<Card.Title class="text-base">12단어 mnemonic 생성 결과</Card.Title>
								<Card.Description>브라우저 보안 난수에서 128-bit entropy를 생성합니다.</Card.Description>
							</div>
							{#if mnemonic}
								<div class="mnemonic-output" data-mnemonic-output>{mnemonic}</div>
								<div class="balance-row">
									<div>
										<Badge variant="secondary">EVM #0</Badge>
										<div class="balance-meta">m/44'/60'/0'/0/0</div>
									</div>
									<code class="mono">{evmRows[0]?.address}</code>
								</div>
							{:else}
								<div class="empty-state">
									<div>
										<ShieldCheck class="mx-auto mb-3 size-8" />
										<strong>아직 생성하지 않았습니다</strong>
										<span>좌측 사이드바에서 [새 mnemonic 생성] 버튼을 누르세요.</span>
									</div>
								</div>
							{/if}
						</div>
					</Tabs.Content>

					<Tabs.Content value="evm" class="mt-4">
						<div class="stack">
							<div class="result-header">
								<div>
									<Card.Title class="text-base">EVM HD 주소와 private key</Card.Title>
									<Card.Description>m/44'/60'/0'/0/{'{index}'} · maxIndex 포함</Card.Description>
								</div>
								{#if evmRows.length}<Badge variant="outline">{evmRows.length}개 결과</Badge>{/if}
							</div>
							{#if evmRows.length}
								<div class="table-wrap">
									<Table.Root>
										<Table.Header>
											<Table.Row>
												<Table.Head>#</Table.Head>
												<Table.Head>경로</Table.Head>
												<Table.Head>주소</Table.Head>
												<Table.Head>private key</Table.Head>
											</Table.Row>
										</Table.Header>
										<Table.Body>
											{#each evmRows as row (row.path)}
												<Table.Row>
													<Table.Cell>{row.index}</Table.Cell>
													<Table.Cell class="path-cell mono">{row.path}</Table.Cell>
													<Table.Cell class="address-cell mono">{row.address}</Table.Cell>
													<Table.Cell class="key-cell">
														<SensitiveValue
															value={row.privateKey}
															label={`index ${row.index} private key`}
														/>
													</Table.Cell>
												</Table.Row>
											{/each}
										</Table.Body>
									</Table.Root>
								</div>
							{:else}
								<div class="empty-state">
									<div>
										<ShieldCheck class="mx-auto mb-3 size-8" />
										<strong>EVM 파생 결과가 없습니다</strong>
										<span>좌측 사이드바에 Mnemonic을 입력하고 [EVM 파생] 버튼을 누르세요.</span>
									</div>
								</div>
							{/if}
						</div>
					</Tabs.Content>

					<Tabs.Content value="tron" class="mt-4">
						<div class="stack">
							<div class="result-header">
								<div>
									<Card.Title class="text-base">TRON 표준 주소</Card.Title>
									<Card.Description>m/44'/195'/0'/0/{'{index}'} · Base58Check</Card.Description>
								</div>
								{#if tronRows.length}<Badge variant="outline">{tronRows.length}개 결과</Badge>{/if}
							</div>
							{#if tronRows.length}
								<div class="table-wrap">
									<Table.Root>
										<Table.Header>
											<Table.Row>
												<Table.Head>#</Table.Head>
												<Table.Head>경로</Table.Head>
												<Table.Head>TRON 주소</Table.Head>
												<Table.Head>같은 키의 EVM 주소</Table.Head>
											</Table.Row>
										</Table.Header>
										<Table.Body>
											{#each tronRows as row (row.path)}
												<Table.Row>
													<Table.Cell>{row.index}</Table.Cell>
													<Table.Cell class="path-cell mono">{row.path}</Table.Cell>
													<Table.Cell class="address-cell mono">{row.address}</Table.Cell>
													<Table.Cell class="address-cell mono">{row.evmAddress}</Table.Cell>
												</Table.Row>
											{/each}
										</Table.Body>
									</Table.Root>
								</div>
							{:else}
								<div class="empty-state">
									<div>
										<ShieldCheck class="mx-auto mb-3 size-8" />
										<strong>TRON 파생 결과가 없습니다</strong>
										<span>좌측 사이드바에 Mnemonic을 입력하고 [TRON 파생] 버튼을 누르세요.</span>
									</div>
								</div>
							{/if}
						</div>
					</Tabs.Content>
				</Tabs.Root>
			</Card.Header>
		</Card.Root>
	</div>
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

