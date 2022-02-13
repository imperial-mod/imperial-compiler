import { CompilerOptions, ModuleKind } from "typescript";

export type Config = {
	compilerOptions: CompilerOptions;
	exclude: string[];
	include: string[];
	files: string[];
}