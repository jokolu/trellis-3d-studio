export interface GenerateRequest {
	prompt?: string;
	image?: string;
	mode?: 'text' | 'image';
	seed?: number;
	no_texture?: boolean;
	output_format?: 'glb' | 'stl';
	slat_cfg_scale?: number;
	ss_cfg_scale?: number;
	slat_sampling_steps?: number;
	ss_sampling_steps?: number;
}

export interface GenerateResponse {
	artifacts: Array<{
		base64: string;
	}>;
	status: {
		message: string;
		type: string;
	};
}

export type TaskStatus = 'idle' | 'uploading' | 'generating' | 'done' | 'error';
