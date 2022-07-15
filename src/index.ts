import fs from 'fs/promises'

import { join } from 'path'

import { commons } from './common.js'

type LangFile = Record<string, string | (() => string)>
type LangMap = Map<string, LangFile>

interface LangImport {
	default: LangFile
}

const { __dirname } = commons(import.meta.url)
const langPath = join(__dirname, '.', 'lang')
const langsMap = new Map<string, LangMap>()

async function main() {
	const files = await fs.readdir(langPath, { withFileTypes: true })

	for (const file of files) {
		if (file.isDirectory()) {
			let langMap = langsMap.get(file.name)

			if (!langMap) {
				langMap = new Map<string, LangFile>()
				langsMap.set(file.name, langMap)
			}

			const langFiles = await fs.readdir(join(langPath, file.name), {
				withFileTypes: true
			})

			for (const lFile of langFiles) {
				const name = lFile.name.split('.')[0]!
				const { default: langFile }: LangImport = await import(
					join('file://', langPath, file.name, lFile.name)
				)
				if (!langFile) continue

				langMap.set(name, langFile)
			}
		}
	}

	console.log(langsMap)
}

main()
