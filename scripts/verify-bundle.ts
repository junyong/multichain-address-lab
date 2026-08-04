const forbidden = [
	'eth_sendRawTransaction',
	'sendTransaction',
	'signTransaction',
	'signMessage',
	'wallet_requestPermissions'
];

const glob = new Bun.Glob('**/*.{html,js,css,json}');
const failures: string[] = [];

for await (const file of glob.scan({ cwd: 'build', onlyFiles: true })) {
	const contents = await Bun.file(`build/${file}`).text();
	for (const token of forbidden) {
		if (contents.includes(token)) failures.push(`${file}: forbidden token ${token}`);
	}
}

if (failures.length > 0) {
	throw new Error(`Bundle verification failed:\n${failures.join('\n')}`);
}

process.stdout.write('Bundle verification passed.\n');
