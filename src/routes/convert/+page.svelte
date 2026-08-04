<script lang="ts">
	import { ArrowLeftRight, Check, Copy, Info, Sparkles, ShieldCheck } from '@lucide/svelte';
	import { convertAddress, type AddressConversionResult } from '$lib/crypto/converter';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';

	let inputAddress = $state('');
	let result = $state<AddressConversionResult | null>(null);
	let error = $state('');
	let copiedField = $state<string | null>(null);

	const SAMPLE_EVM = '0x410C42220e8d538eB811B55bfC45B8BAacFc400A';
	const SAMPLE_TRON = 'T4v94jK96238bV1vW71iE4RkMv3Z5x7x8y';

	function handleConvert(event?: SubmitEvent) {
		if (event) event.preventDefault();
		error = '';
		result = null;

		try {
			result = convertAddress(inputAddress);
		} catch (cause) {
			error = cause instanceof Error ? cause.message : '주소 변환에 실패했습니다.';
		}
	}

	function loadSample(sample: string) {
		inputAddress = sample;
		handleConvert();
	}

	async function copyToClipboard(text: string, fieldName: string) {
		try {
			await navigator.clipboard.writeText(text);
			copiedField = fieldName;
			setTimeout(() => {
				if (copiedField === fieldName) copiedField = null;
			}, 2000);
		} catch {
			// ignore copy error
		}
	}
</script>

<svelte:head>
	<title>주소 변환 · Multichain Address Lab</title>
</svelte:head>

<main class="tool-shell">
	<section class="tool-heading">
		<div>
			<Badge variant="outline" class="eyebrow"><ArrowLeftRight /> ENCODING CONVERTER</Badge>
			<h1>EVM ↔ TRON 주소 변환</h1>
			<p>EVM 헥스 주소와 TRON Base58Check/Hex 주소 간의 인코딩을 오프라인으로 변환합니다.</p>
		</div>
	</section>

	<div class="workspace-grid">
		<div class="stack">
			<Card.Root>
				<Card.Header>
					<Card.Title>변환 입력</Card.Title>
					<Card.Description
						>EVM 주소(0x…), TRON 주소(T…), 또는 TRON Hex(41…)를 입력하세요.</Card.Description
					>
				</Card.Header>
				<Card.Content class="stack">
					<form onsubmit={handleConvert} class="form-stack">
						<div class="field">
							<label for="convert-address">주소 입력</label>
							<Input
								id="convert-address"
								bind:value={inputAddress}
								placeholder="0x… 또는 T… 주소 입력"
								autocomplete="off"
								spellcheck="false"
							/>
							{#if error}<p class="error-text" role="alert">{error}</p>{/if}
						</div>

						<div class="flex items-center gap-2">
							<Button type="submit" class="flex-1">
								<ArrowLeftRight /> 변환 실행
							</Button>
						</div>

						<div class="border-t border-border pt-2">
							<span class="mb-2 block text-xs font-medium text-muted-foreground">샘플 입력하기</span
							>
							<div class="flex flex-wrap gap-2">
								<Button
									variant="outline"
									size="sm"
									type="button"
									onclick={() => loadSample(SAMPLE_EVM)}
								>
									<Sparkles class="mr-1 size-3" /> EVM 주소 예시
								</Button>
								<Button
									variant="outline"
									size="sm"
									type="button"
									onclick={() => loadSample(SAMPLE_TRON)}
								>
									<Sparkles class="mr-1 size-3" /> TRON 주소 예시
								</Button>
							</div>
						</div>
					</form>
				</Card.Content>
			</Card.Root>

			<Alert>
				<Info />
				<AlertTitle>fromHex() 인코딩 관련 안내</AlertTitle>
				<AlertDescription>
					<code>TronWeb.address.fromHex(evmAddress)</code>는 20바이트 주소에 <code>0x41</code> 헤더를
					붙여 Base58Check로 변환한 것입니다. 니모닉 HD 파생(`coin_type 195`) 주소와는 다릅니다.
				</AlertDescription>
			</Alert>
		</div>

		<Card.Root class="results-panel">
			<Card.Header>
				<div class="result-header">
					<div>
						<Card.Title>변환 결과</Card.Title>
						<Card.Description>상호 인코딩 변환된 주소 포맷 목록입니다.</Card.Description>
					</div>
					{#if result}
						<Badge variant="secondary">
							{#if result.inputType === 'evm'}EVM Hex 입력 감지
							{:else if result.inputType === 'tron_base58'}TRON Base58Check 입력 감지
							{:else}TRON Hex (41…) 입력 감지
							{/if}
						</Badge>
					{/if}
				</div>
			</Card.Header>
			<Card.Content>
				{#if result}
					<div class="stack">
						<!-- TRON Base58Check -->
						<div class="balance-row">
							<div>
								<div class="mb-1 flex items-center gap-2">
									<Badge variant="outline">TRON Base58Check</Badge>
									<span class="text-xs text-muted-foreground">TronWeb.address.fromHex() 결과</span>
								</div>
								<code class="mono block text-sm font-semibold text-primary select-all"
									>{result.tronBase58Address}</code
								>
							</div>
							<Button
								variant="ghost"
								size="icon"
								aria-label="TRON 주소 복사"
								onclick={() => copyToClipboard(result!.tronBase58Address, 'tronBase58')}
							>
								{#if copiedField === 'tronBase58'}<Check
										class="size-4 text-emerald-500"
									/>{:else}<Copy class="size-4" />{/if}
							</Button>
						</div>

						<!-- EVM Checksum -->
						<div class="balance-row">
							<div>
								<div class="mb-1 flex items-center gap-2">
									<Badge variant="outline">EVM Checksum (EIP-55)</Badge>
									<span class="text-xs text-muted-foreground">대소문자 혼용 체크섬</span>
								</div>
								<code class="mono block text-sm font-semibold select-all"
									>{result.evmChecksumAddress}</code
								>
							</div>
							<Button
								variant="ghost"
								size="icon"
								aria-label="EVM Checksum 주소 복사"
								onclick={() => copyToClipboard(result!.evmChecksumAddress, 'evmChecksum')}
							>
								{#if copiedField === 'evmChecksum'}<Check
										class="size-4 text-emerald-500"
									/>{:else}<Copy class="size-4" />{/if}
							</Button>
						</div>

						<!-- TRON Hex -->
						<div class="balance-row">
							<div>
								<div class="mb-1 flex items-center gap-2">
									<Badge variant="outline">TRON Hex (41…)</Badge>
									<span class="text-xs text-muted-foreground">41 접두사 21바이트 헥스</span>
								</div>
								<code class="mono block text-xs text-muted-foreground select-all"
									>{result.tronHexAddress}</code
								>
							</div>
							<Button
								variant="ghost"
								size="icon"
								aria-label="TRON Hex 주소 복사"
								onclick={() => copyToClipboard(result!.tronHexAddress, 'tronHex')}
							>
								{#if copiedField === 'tronHex'}<Check class="size-4 text-emerald-500" />{:else}<Copy
										class="size-4"
									/>{/if}
							</Button>
						</div>

						<!-- ABI Word -->
						<div class="balance-row">
							<div>
								<div class="mb-1 flex items-center gap-2">
									<Badge variant="outline">ABI 32-Byte Word</Badge>
									<span class="text-xs text-muted-foreground">컨트랙트 파라미터 패딩 (64자)</span>
								</div>
								<code class="mono block text-xs break-all text-muted-foreground select-all"
									>{result.abiWord}</code
								>
							</div>
							<Button
								variant="ghost"
								size="icon"
								aria-label="ABI Word 복사"
								onclick={() => copyToClipboard(result!.abiWord, 'abiWord')}
							>
								{#if copiedField === 'abiWord'}<Check class="size-4 text-emerald-500" />{:else}<Copy
										class="size-4"
									/>{/if}
							</Button>
						</div>
					</div>
				{:else}
					<div class="empty-state">
						<div>
							<ShieldCheck class="mx-auto mb-3 size-8" />
							<strong>아직 주소를 변환하지 않았습니다</strong>
							<span>왼쪽에서 EVM 또는 TRON 주소를 입력하거나 샘플 버튼을 누르세요.</span>
						</div>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</main>
