import cors from 'cors'
// const md5 = require("md5");
// const request = require("request");
import builder from 'xmlbuilder'

import { Election, ElectionRound } from '../models/Elections.js'

// import { GraphScraper } from "./graph-scraper";

// import { sabbGraphAddress } from "../config";

let GRAPHROLE = {
	// When in manual mode
	id: null,
	round: null,
}
let SCRAPE_LAST_MD5 = ''
let SCRAPE_LAST_TIME = 0

export function setup(app: import('express').Express) {
	// DEV ONLY!!
	// GRAPHROLE.id = 1;

	app.get('/api/graph', cors(), (req, res) => {
		// DEV ONLY:
		// Position.run().then(function (positions){
		//   console.log(positions)
		//   if(!positions || positions.length == 0)
		//     return res.send("ERR GET POSITION");

		//   const i = Math.floor(Math.random() * positions.length);
		//   GRAPHROLE = positions[i];

		//   generateResponseXML(Models).then(str => res.send(str));
		// });

		if (GRAPHROLE.id) {
			// use hardcoded value
			generateResponseXML(GRAPHROLE.id, GRAPHROLE.round).then((str) => res.send(str))
		} else {
			// const time = Date.now();
			// request({
			//   method: "GET",
			//   uri: sabbGraphAddress,
			//   timeout: 2000, // 2s
			//   qs: {
			//     _time: time
			//   },
			//   encoding: "utf8",
			// }, function (error, response, body) {
			//   // if not in order, then discard
			//   if (SCRAPE_LAST_TIME > time)
			//     return res.send("OUT_OF_ORDER");

			//   SCRAPE_LAST_TIME = time;

			//   if (!error && response.statusCode == 200) {
			//     const md5sum = md5(body);
			//     res.set('Content-Type', 'text/plain');

			//     if (md5sum != SCRAPE_LAST_MD5){
			//       SCRAPE_LAST_MD5 = md5sum;
			//       console.log("Got new data from sabbgraph");

			//       const scraper = new GraphScraper(Models);
			//       scraper.ParseAndStash(body);
			//     }

			//     res.send(body);
			//   }
			// });
			res.status(404).send('')

			// TODO - add a scrape now feature, in case graph dies, we can still manually trigger a scrape
		}
	})

	app.get('/api/results/positions', (req, res) => {
		return Election.findAll()
			.then((elections) => {
				const roles = elections.map((e) => {
					return { name: e.positionName, id: e.id }
				})

				res.send(roles)
			})
			.catch((e) => res.status(500).send(e))
	})

	app.get('/api/results/position/:id', (req, res) => {
		return generateResponseXML(Number(req.params.id), null)
			.then((str) => res.send(str))
			.catch((e) => res.status(500).send(e))
	})

	app.get('/api/results/current', (req, res) => {
		res.send(GRAPHROLE)
	})
	app.post('/api/results/current', (req, res) => {
		console.log('Force results:', req.body)
		GRAPHROLE = req.body

		res.send(GRAPHROLE)
	})
}

async function generateResponseXML(pid: number, maxRound: number | null) {
	try {
		const election = await Election.findOne({
			where: {
				id: pid,
			},
		})
		if (!election) return 'BAD POSITION'

		const rootElm = builder.create('root')
		rootElm.ele('eventName', 'Guild Officer Elections 2025')
		rootElm.ele('subtitle', '')
		rootElm.ele('extra', 'Guild Officer Elections 2025')
		rootElm.ele('title', election.positionName)
		const candidates = rootElm.ele('candidates')
		const rounds = rootElm.ele('rounds')

		const rawCandidates = JSON.parse(election.candidates)
		Object.keys(rawCandidates).forEach((id) => {
			const cand = rawCandidates[id]
			candidates.ele('candidate', { id: id }, cand)
		})

		const dbRounds = await ElectionRound.findAll({
			where: {
				electionId: election.id,
				round: maxRound != null && maxRound >= 0 ? { $lte: maxRound } : undefined,
			},
			order: [['round', 'ASC']],
		})

		for (const dbRound of dbRounds) {
			const elm = rounds.ele('round', { number: dbRound.round })
			const innerElm = elm.ele('results')
			const results = JSON.parse(dbRound.results)

			Object.keys(results).forEach((id) => {
				const count = results[id]
				const elim = count == 'elim'

				const props = {
					candidate: id,
					eliminated: false,
					votes: count,
				}
				if (elim) {
					props.eliminated = true
					props.votes = 0
				} else {
					props.votes = count
				}

				innerElm.ele('result', props, undefined)
			})

			Object.keys(rawCandidates).forEach((id) => {
				if (results[id] !== undefined) return

				const props = { candidate: id }
				innerElm.ele('result', props, undefined)
			})
		}

		return rootElm.end({ pretty: true })
	} catch (e) {
		console.log('ERR:', e)
		return 'UNKNOWN ERROR'
	}
}
