<script lang="ts">
	import { base } from '$app/paths';
	import { Activity, ArrowUpRight, KeyRound, Plus, ShieldCheck, Wifi } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
</script>

<svelte:head><title>홈 · Multichain Address Lab</title></svelte:head>

<main class="dashboard-shell">
	<header class="dashboard-heading">
		<div>
			<p class="section-kicker">OVERVIEW</p>
			<h1>홈</h1>
		</div>
		<Badge variant="outline"><ShieldCheck /> Read-only</Badge>
	</header>

	<section class="widget-grid" aria-label="메뉴 위젯">
		<a class="widget-link" href={`${base}/balance/`} data-sveltekit-reload>
			<Card.Root class="menu-widget balance-widget">
				<Card.Header>
					<div class="widget-topline">
						<div class="widget-icon"><Activity /></div>
						<ArrowUpRight class="widget-arrow" />
					</div>
					<Card.Title>잔액 조회</Card.Title>
					<Card.Description>Ethereum · BSC · TRON</Card.Description>
				</Card.Header>
				<Card.Footer class="widget-footer">
					<span><Wifi /> Public RPC</span>
					<Badge variant="secondary">LIVE</Badge>
				</Card.Footer>
			</Card.Root>
		</a>

		<a class="widget-link" href={`${base}/derive/`} data-sveltekit-reload>
			<Card.Root class="menu-widget derive-widget">
				<Card.Header>
					<div class="widget-topline">
						<div class="widget-icon"><KeyRound /></div>
						<ArrowUpRight class="widget-arrow" />
					</div>
					<Card.Title>HD 파생</Card.Title>
					<Card.Description>EVM coin type 60 · TRON coin type 195</Card.Description>
				</Card.Header>
				<Card.Footer class="widget-footer">
					<span><ShieldCheck /> Network blocked</span>
					<Badge variant="secondary">OFFLINE</Badge>
				</Card.Footer>
			</Card.Root>
		</a>

		<Card.Root class="menu-widget placeholder-widget">
			<Card.Content class="placeholder-content">
				<div class="widget-icon muted"><Plus /></div>
				<div>
					<strong>위젯 추가 예정</strong>
					<p>새 도구가 이 영역에 추가됩니다.</p>
				</div>
			</Card.Content>
		</Card.Root>
	</section>
</main>
