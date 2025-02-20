export interface ModelProviderMetadata {
  readonly vendor: string;
	readonly name: string;
	readonly family: string;
  readonly version: string;
  readonly maxInputTokens: number;
  readonly maxOutputTokens: number;
  auth?: true | { label: string };
  readonly isDefault?: boolean;
	readonly isUserSelectable?: boolean;
	readonly capabilities?: {
		readonly vision?: boolean;
		readonly toolCalling?: boolean;
	};
}