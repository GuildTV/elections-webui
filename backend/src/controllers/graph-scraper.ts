import { parseStringPromise } from 'xml2js'
import fs from 'fs/promises'

import { Election, ElectionRound } from '../models/Elections.js'

interface ScrapedData {
	sabbGraphId: string
	candidates: Record<string, any>
	results: Record<string, number | 'elim'>[]
}

export class GraphScraper {
	private _parseXML(xmlStr: string, _schemaFile: string) {
		// xsd.parseFile(schemaFile, function(err, schema){
		//   if (err){
		//     console.log("XSD load error:", err);
		//     return reject("XSD_LOAD_ERROR");
		//   }
		//   schema.validate(xmlStr, function(err, validationErrors){
		//     if (err){
		//       console.log("XML error:", err);
		//       return reject("XML_ERROR");
		//     }

		//     if (validationErrors){
		//       console.log("XML Validation errors:", validationErrors);
		//       return reject("XML_VALIDATION_ERROR");
		//     }

		return parseStringPromise(xmlStr).catch((err) => {
			console.log('XML Parse Error:', err)
			throw 'XML_PARSE_ERROR'
		})

		//   });
		// });
	}

	private _convertToJson(xml: any): ScrapedData {
		try {
			const sabbGraphId: string = xml.root.title

			const rawCandidates = xml.root.candidates[0].candidate
			const candidates: Record<string, any> = {}
			for (let cand of rawCandidates) {
				candidates[cand.$.id] = cand['_']
			}

			const rawRounds = xml.root.rounds[0].round
			const results = []
			for (let round of rawRounds || []) {
				const res: Record<string, number | 'elim'> = {}

				for (let result of round.results[0].result || []) {
					const id = result.$.candidate
					if (result.$.eliminated) res[id] = 'elim'
					else res[id] = parseInt(result.$.votes)
				}

				results.push(res)
			}

			return {
				sabbGraphId,
				candidates,
				results,
			}
		} catch (e) {
			return {
				sabbGraphId: '',
				candidates: [],
				results: [],
			}
		}
	}

	private async _findAndSaveElection(data: ScrapedData) {
		const [election] = await Election.findOrBuild({
			where: {
				positionName: data.sabbGraphId[0],
			},
			defaults: {
				positionName: data.sabbGraphId[0],
				candidates: '{}',
			},
		})

		election.candidates = JSON.stringify(data.candidates)

		const res = await election.save()
		console.log('Saved election #' + election.id)

		return res
	}

	private async _saveRounds(election: Election, data: ScrapedData) {
		await Promise.all(
			data.results.map(async (result, num) => {
				return ElectionRound.upsert({
					electionId: election.id,
					round: num,
					results: JSON.stringify(result),
				}).then(() => {
					console.log('Saved round #' + num + ' for election #' + election.id)
				})
			}),
		)
	}

	async ParseAndStash(xmlStr: string) {
		const xml = await this._parseXML(xmlStr, './schema.xsd')

		const data = this._convertToJson(xml)

		// log scrape to disk. just in case
		fs.writeFile('scrapes/' + data.sabbGraphId + '-' + Date.now() + '.xml', xmlStr).catch((e) => {
			console.error('Error writing scrape to disk:', e)
		})

		return this._findAndSaveElection(data).then(
			(election) => {
				return this._saveRounds(election, data)
			},
			(err) => console.log(err),
		)
	}
}
