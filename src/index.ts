import fs from 'fs/promises'

import { join } from 'path'

import { commons } from './common.js'

type LangFun = (...args: any) => string
type CommandFile = Record<string, string | LangFun>
type LangMap = Map<string, CommandFile>

interface CommandImport {
	default: CommandFile
}

const { __dirname } = commons(import.meta.url)
const langPath = join(__dirname, '.', 'lang')
const commandsMap = new Map<string, LangMap>()

async function main() {
	const files = await fs.readdir(langPath, { withFileTypes: true })

	for (const file of files) {
		if (file.isDirectory()) {
			let langMap = commandsMap.get(file.name)

			if (!langMap) {
				langMap = new Map<string, CommandFile>()
				commandsMap.set(file.name, langMap)
			}

			const langFiles = await fs.readdir(join(langPath, file.name), {
				withFileTypes: true
			})

			for (const lFile of langFiles) {
				const name = lFile.name.split('.')[0]!
				const { default: langFile }: CommandImport = await import(
					join('file://', langPath, file.name, lFile.name)
				)
				if (!langFile) continue

				langMap.set(name, langFile)
			}
		}
	}
}

async function client() {
	const pingLangs = commandsMap.get('ping')!
	const pingEs = pingLangs.get('es')!
	const pingEn = pingLangs.get('en')!

	const ping = 100

	// msg.reply(pingEs.wsPing(ping))
	console.log((pingEs.wsPing as LangFun)(ping))

	// msg.reply(pingEn.wsPing(ping))
	console.log((pingEn.wsPing as LangFun)(ping))
}

main().then(() => client())
