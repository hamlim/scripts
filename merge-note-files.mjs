import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

/**
 * Recursively find all `.md` files in a directory.
 * @param {string} dir - The starting directory.
 * @returns {Promise<string[]>} - A list of file paths.
 */
async function findMarkdownFiles(dir) {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		entries.map((entry) => {
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				return findMarkdownFiles(fullPath);
			} else if (entry.isFile() && entry.name.endsWith(".md")) {
				return fullPath;
			}
			return null;
		}),
	);
	return files.flat().filter(Boolean);
}

/**
 * Combine all `.md` files into a single file with the specified template.
 * @param {string} outputFile - The output file path.
 * @param {string[]} files - List of `.md` file paths to process.
 */
async function combineMarkdownFiles(outputFile, files) {
	const output = [];

	for (const file of files) {
		const relativePath = path.relative(process.cwd(), file);
		const fileNameWithoutExt = path.basename(file, ".md");
		const content = await fs.readFile(file, "utf-8");

		output.push(`====`);
		output.push(`path: ${relativePath}`);
		output.push(`filename: ${fileNameWithoutExt}`);
		output.push("");
		output.push(content);
		output.push("");
	}

	await fs.writeFile(outputFile, output.join("\n"), "utf-8");
	console.log(`All .md files have been combined into ${outputFile}`);
}

/**
 * Main function to execute the script.
 */
async function main() {
	const outputFile = "all-contents.md";
	const startDir = `<path-to-vault>`;
	const markdownFiles = await findMarkdownFiles(startDir);

	if (markdownFiles.length === 0) {
		console.log("No .md files found.");
		return;
	}

	await combineMarkdownFiles(outputFile, markdownFiles);
}

main().catch((error) => {
	console.error("An error occurred:", error);
});
