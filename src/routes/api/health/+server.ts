import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const apiKey = env.NVIDIA_API_KEY;
	const apiUrl = env.NVIDIA_API_URL || 'https://ai.api.nvidia.com/v1/genai/microsoft/trellis';

	if (!apiKey || apiKey === 'your-api-key-here') {
		return json({ status: 'error', message: 'API key not configured' }, { status: 500 });
	}

	return json({
		status: 'ok',
		apiUrl,
		keyConfigured: true,
		keyPrefix: apiKey.slice(0, 8) + '...'
	});
};
