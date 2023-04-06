export interface IBasePacket {
	id: number;
	timestamp: number;
	data: {
		name: string;
		legacyName: string;
		id: string;
		data: any;
	};
}

interface IDescriptionPart {
	general: string;
	wikiVgNotes?: string;
}

export type IDescription = IDescriptionPart & {
	[key in Exclude<string, keyof IDescriptionPart>]: string;
}