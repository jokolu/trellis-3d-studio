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

	const { prompt, image, mode, seed, no_texture, output_format, slat_cfg_scale, ss_cfg_scale, slat_sampling_steps, ss_sampling_steps } = body;

	if (!prompt && !image) {
		return json({ error: 'Either prompt or image is required' }, { status: 400 });
	}

	const payload: Record<string, unknown> = {};

	if (mode) {
		payload.mode = mode;
	} else if (image && !prompt) {
		payload.mode = 'image';
	} else {
		payload.mode = 'text';
	}

	if (prompt) {
		payload.prompt = prompt.slice(0, 77);
	}

	if (image) {
		payload.image = image;
	}

	if (seed !== undefined && seed !== null) {
		payload.seed = seed;
	}

	if (no_texture !== undefined) {
		payload.no_texture = no_texture;
	}

	if (output_format) {
		payload.output_format = output_format;
	}

	if (slat_cfg_scale !== undefined && slat_cfg_scale !== null) {
		payload.slat_cfg_scale = slat_cfg_scale;
	}

	if (ss_cfg_scale !== undefined && ss_cfg_scale !== null) {
		payload.ss_cfg_scale = ss_cfg_scale;
	}

	if (slat_sampling_steps !== undefined && slat_sampling_steps !== null) {
		payload.slat_sampling_steps = slat_sampling_steps;
	}

	if (ss_sampling_steps !== undefined && ss_sampling_steps !== null) {
		payload.ss_sampling_steps = ss_sampling_steps;
	}

	try {
		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('NVIDIA API error:', response.status, errorText);
			return json(
				{ error: `NVIDIA API returned ${response.status}: ${errorText}` },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return json(data);
	} catch (err) {
		console.error('NVIDIA API request failed:', err);
		return json({ error: 'Failed to connect to NVIDIA API' }, { status: 502 });
	}
};
