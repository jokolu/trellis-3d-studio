import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const apiKey = env.NVIDIA_API_KEY;
	const apiUrl = env.NVIDIA_API_URL || 'https://ai.api.nvidia.com/v1/genai/microsoft/trellis';

	if (!apiKey || apiKey === 'your-api-key-here') {
		return json({ error: 'NVIDIA API key not configured. Set NVIDIA_API_KEY in .env' }, { status: 500 });
	}

	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const { prompt, seed, no_texture, output_format, slat_cfg_scale, ss_cfg_scale, slat_sampling_steps, ss_sampling_steps } = body;

	if (!prompt) {
		return json({ error: 'Prompt is required' }, { status: 400 });
	}

	const payload: Record<string, unknown> = {
		mode: 'text',
		prompt: String(prompt),
		output_format: output_format === 'stl' ? 'stl' : 'glb'
	};

	if (seed !== undefined && seed !== null && seed !== 0) payload.seed = Number(seed);
	if (no_texture === true) payload.no_texture = true;
	if (slat_cfg_scale !== undefined && slat_cfg_scale !== null && slat_cfg_scale !== 3) payload.slat_cfg_scale = Number(slat_cfg_scale);
	if (ss_cfg_scale !== undefined && ss_cfg_scale !== null && ss_cfg_scale !== 7.5) payload.ss_cfg_scale = Number(ss_cfg_scale);
	if (slat_sampling_steps !== undefined && slat_sampling_steps !== null && slat_sampling_steps !== 12) payload.slat_sampling_steps = Number(slat_sampling_steps);
	if (ss_sampling_steps !== undefined && ss_sampling_steps !== null && ss_sampling_steps !== 12) payload.ss_sampling_steps = Number(ss_sampling_steps);

	console.log('NVIDIA API request:', JSON.stringify({ url: apiUrl, mode: payload.mode, prompt: payload.prompt, extraKeys: Object.keys(payload).filter(k => !['mode', 'prompt', 'output_format'].includes(k)) }));

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 300000);

	try {
		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload),
			signal: controller.signal
		});

		clearTimeout(timeout);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('NVIDIA API error:', response.status, errorText);
			return json(
				{ error: `NVIDIA API ${response.status}: ${errorText.slice(0, 500)}` },
				{ status: response.status }
			);
		}

		const data = await response.json();
		console.log('NVIDIA API success, artifacts:', data.artifacts?.length ?? 0);
		return json(data);
	} catch (err) {
		clearTimeout(timeout);
		const message = err instanceof Error ? err.message : String(err);
		console.error('NVIDIA API request failed:', message);
		if (message.includes('abort')) {
			return json({ error: 'Request timed out after 5 minutes' }, { status: 504 });
		}
		return json({ error: `Connection failed: ${message}` }, { status: 502 });
	}
};
