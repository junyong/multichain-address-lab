<script lang="ts">
	import './layout.css';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import {
		ArrowLeftRight,
		FlaskConical,
		LayoutDashboard,
		ScanSearch,
		ShieldCheck
	} from '@lucide/svelte';
	import favicon from '$lib/assets/favicon.png';
	import logo from '$lib/assets/logo.png';

	let { children } = $props();

	const menuItems = [
		{ label: '홈', href: `${base}/`, routeId: '/', icon: LayoutDashboard },
		{ label: '잔액 조회', href: `${base}/balance/`, routeId: '/balance', icon: ScanSearch },
		{ label: 'HD 파생', href: `${base}/derive/`, routeId: '/derive', icon: FlaskConical },
		{ label: '주소 변환', href: `${base}/convert/`, routeId: '/convert', icon: ArrowLeftRight }
	];
</script>

<svelte:head>
	<link rel="icon" type="image/png" href={favicon} />
	<meta
		name="description"
		content="Ethereum, BSC, TRON 주소의 잔액과 HD 파생 결과를 확인하는 읽기 전용 도구"
	/>
</svelte:head>

<div class="app-shell">
	<aside class="sidebar">
		<a class="sidebar-brand" href={`${base}/`} data-sveltekit-reload>
			<img src={logo} alt="Multichain Address Lab Logo" class="brand-logo-img" />
			<span>
				<strong>Multichain</strong>
				<small>Address Lab</small>
			</span>
		</a>

		<nav class="sidebar-nav" aria-label="주요 메뉴">
			<p class="sidebar-label">MENU</p>
			{#each menuItems as item (item.routeId)}
				{@const Icon = item.icon}
				<a
					class="sidebar-link"
					class:active={page.route.id === item.routeId}
					href={item.href}
					aria-current={page.route.id === item.routeId ? 'page' : undefined}
					data-sveltekit-reload
				>
					<Icon />
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>

		<div class="sidebar-status">
			<ShieldCheck />
			<div>
				<strong>Read-only</strong>
				<span>송금·서명 기능 없음</span>
			</div>
		</div>
	</aside>

	<div class="app-content">{@render children()}</div>
</div>
