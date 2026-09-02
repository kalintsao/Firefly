import fs from "node:fs";
import path from "node:path";

/**
 * 构建时读取 src/content/dynamic/*.md 的原始 frontmatter，
 * 提取 published 字段的原文文本（如 "2026-09-02 10:12:02 +0800"）。
 *
 * 用途：动态页直接展示 published 原文，不做任何时区换算。
 * （构建机/浏览器时区不一致时，Date 间接格式化会导致显示偏移 8 小时）
 */

const DYNAMIC_DIR = path.resolve("src/content/dynamic");

let cache: Map<string, string> | null = null;

function loadPublishedTextMap(): Map<string, string> {
	if (cache) return cache;
	cache = new Map();
	try {
		for (const file of fs.readdirSync(DYNAMIC_DIR)) {
			if (!file.endsWith(".md")) continue;
			const raw = fs.readFileSync(path.join(DYNAMIC_DIR, file), "utf-8");
			const match = raw.match(/^published:\s*(.+?)\s*$/m);
			if (!match) continue;
			const value = match[1].trim().replace(/^["']|["']$/g, "");
			if (value) cache.set(file.replace(/\.md$/i, ""), value);
		}
	} catch {
		// 构建环境读不到目录时保持空 Map，调用方回退到原有格式化逻辑
	}
	return cache;
}

export function getPublishedText(id: string): string | undefined {
	return loadPublishedTextMap().get(id);
}
