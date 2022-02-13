import fs from "fs";
import path from "path";
import glob from "glob";
import chokidar from "chokidar";
import { Config } from "./types/Config";
import { Compiler } from "./Compiler";

export class Watch {
	private watcher: chokidar.FSWatcher;
	private config: Config;
	private compiler: Compiler;

	constructor() {
		this.config = JSON.parse(fs.readFileSync(path.join(process.cwd(), "tsconfig.json"), "utf8"));
		this.compiler = new Compiler();

		this.compileExistingFiles();
		this.listen();
	}

	private listen() {
		const dirs = this.config.include

		this.watcher = chokidar.watch(dirs, {
			awaitWriteFinish: true,
			alwaysStat: true,
			interval: 100
		});

		this.watcher.on("change", (path: string) => {
			if (path.endsWith(".ts")) {
				console.log(`Detected changes. Recompiling...`);
				this.compiler.compile(path, this.config);
			}
		});
	}

	private compileExistingFiles() {
		const dirs = this.config.include;

		for (const dir of dirs) {
			const files = glob.sync(path.join(dir, "**/*.ts"));

			for (const file of files) {
				console.log(`Compiling ${file}...`);
				this.compiler.compile(file, this.config);
			}
		}
	}
}