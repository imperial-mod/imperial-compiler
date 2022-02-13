import fs from "fs";
import path from "path";
import ts from "typescript";
import bytenode from "bytenode";
import { Config } from "./types/Config";

export class Compiler {
	public async compile(filePath: string, config: Config) {
		const outDir = config.compilerOptions.outDir || path.dirname(filePath);

		if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

		const file = fs.readFileSync(filePath, "utf8");
		const transpiled = ts.transpileModule(file, {
			compilerOptions: config.compilerOptions
		}).outputText.replace("Object.defineProperty(exports, \"__esModule\", { value: true });", "");
		const outPath = this.getOutDir(filePath, config);

		if (!outPath) return;

		const fileDir = path.dirname(outPath);
		const tempFilePath = path.join(fileDir, "_" + path.basename(outPath, ".ts") + ".js");
		const compiledFilePath = path.join(fileDir, path.basename(outPath, ".ts") + ".jsc")

		if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });

		fs.writeFileSync(tempFilePath, transpiled);
		await bytenode.compileFile({
			compileAsModule: true,
			createLoader: false,
			output: compiledFilePath,
			filename: tempFilePath
		});
		fs.unlinkSync(tempFilePath);
	}

	private getOutDir(filePath: string, config: Config) {
		for (const dir of config.include) {
			if (filePath.replace(dir, "") != filePath) {
				return filePath.replace(dir, config.compilerOptions.outDir || dir);
			}
		}
	}
}