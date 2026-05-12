import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const apiKey = env.NVIDIA_API_KEY;
	const apiUrl = env.NVIDIA_API_URL || 'https://ai.api.nvidia.com/v1/genai/microsoft/trellis';

	if (!apiKey || apiKey === 'your-api-key-here') {
		return json({ status: 'error', message: 'API key not configured' }, { status: 500 });
	}

	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 10000);

		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ prompt: 'test', mode: 'text', seed: 0 }),
			signal: controller.signal
		});

		clearTimeout(timeout);

		return json({
			status: response.ok ? 'ok' : 'error',
			apiStatus: response.status,
			apiUrl,
			keyConfigured: true,
			keyPrefix: apiKey.slice(0, 8) + '...'
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return json({
			status: 'connection_failed',
			error: message,
			apiUrl,
			keyConfigured: true,
			keyPrefix: apiKey.slice(0, 8) + '...'
		}, { status: 502 });
	}
};
