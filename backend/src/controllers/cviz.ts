import net from 'net'
import { v4 as uuidv4 } from 'uuid'
import equal from 'deep-equal'
import _ from 'underscore'

import { PersonAttributesWithPosition, generateRon } from './ron.js'
import { cvizHost, cvizPort } from '../config.js'
import { Person, PersonAttributes, Position, PositionAttributes, PositionType } from '../models/People.js'

interface CvizState {
	timelineSlot: string
	state: string
	stateMessage: string
	timelineFile: string
}

interface CvizAdjustment {
	id: string
	key: string
	parameters: Record<string, any>
}

class CvizSlot {
	readonly slot: string
	lastState: CvizState | null = null
	templateName: string | null = null
	adjustmentList: CvizAdjustment[] = []

	constructor(slot: string) {
		this.slot = slot
	}

	isRunningTemplate(name: string) {
		if (!this.lastState || !this.lastState.timelineFile) return false

		return this.lastState.timelineFile == name
	}

	isRunningAnything() {
		if (!this.lastState || !this.lastState.state) return false

		return this.lastState.state.toLowerCase() != 'clear'
	}

	buildClientState() {
		if (!this.lastState || !this.lastState.state) return this.lastState

		if (this.lastState.timelineFile != this.templateName && this.lastState.state.toLowerCase() != 'clear') {
			this.adjustmentList = []
			this.templateName = this.lastState.timelineFile
		}

		if (this.lastState.state.toLowerCase() == 'cueorchild') {
			if (this.adjustmentList.length > 0)
				return Object.assign({}, this.lastState, {
					state: 'cue',
					stateMessage: 'Load adjustment: ' + this.adjustmentList[0].key,
				})
			else
				return Object.assign({}, this.lastState, {
					state: 'cue',
				})
		}

		return this.lastState
	}
}

const slots: Record<string, CvizSlot | undefined> = {
	default: new CvizSlot('default'),
	lowerthird: new CvizSlot('lowerthird'),
}

let pingInterval: NodeJS.Timeout | null = null

const websocketHandlers: Array<(slot: string) => void> = []

const client = new net.Socket()
client.setNoDelay(true)
client.setTimeout(500)

client.on('error', () => {
	console.log('lost connection to cviz')

	client.destroy()
	client.unref()
	client.connect(cvizPort, cvizHost, () => {
		console.log('reconnected')
	})
})

client.connect(cvizPort, cvizHost, function () {
	console.log('Connected to cviz')

	pingInterval = setInterval(() => {
		client.write('{}\n')
	}, 300)
})

client.on('data', (data) => {
	try {
		const dataStr = data.toString('utf8')
		if (dataStr == '{}') return

		const blob = JSON.parse(dataStr)
		const state = slots[blob.timelineSlot]
		if (!state) return // Not a slot we care about

		if (equal(blob, state.lastState)) return

		console.log('new cviz state', blob)
		state.lastState = blob

		// emit to all handlers
		for (let handler of websocketHandlers) handler(blob.timelineSlot)

		// if lt and nothing loaded, then load next
		if (blob.timelineSlot == 'lowerthird' && !state.isRunningAnything() && state.adjustmentList.length > 0) {
			const first = state.adjustmentList.shift()
			if (first) {
				client.write(
					JSON.stringify({
						timelineSlot: 'lowerthird',
						type: 'LOAD',
						timelineFile: 'lowerthird',
						parameters: first.parameters,
						instanceName: first.key,
					}) + '\n',
				)
			}
		}
	} catch (e) {
		// console.log("Error", e);
	}
})

client.on('close', () => {
	console.log('Server has gone away!')
	if (pingInterval != null) {
		clearInterval(pingInterval)
		pingInterval = null
	}
})

async function getWinnersOfType(type: PositionType): Promise<PersonAttributesWithPosition[]> {
	const positions = await Position.findAll({
		where: {
			type: type,
		},
		order: [['winnerOrder', 'ASC']],
		include: [
			{
				model: Person,
				include: [Position],
				where: {
					elected: true,
				},
				required: false,
			},
		],
	})

	return positions.map((v) => {
		if (v.People && v.People[0])
			return {
				...v.People[0].toJSON(),
				Position: v,
			}

		return generateRon(v)
	})
}

function compileName(data: PersonAttributes | Person) {
	let f0 = data.firstName
	if (data.lastName) f0 += ' ' + data.lastName
	if (data.firstName2) {
		f0 += ' & ' + data.firstName2
		if (data.lastName2) f0 += ' ' + data.lastName2
	}

	return f0
}

export function bind(socket: import('socket.io').Socket, io: import('socket.io').Server) {
	function emitStatus(slot: string) {
		const state = slots[slot]
		if (!state) return

		socket.emit('cviz.status', {
			slot: slot,
			data: {
				state: state.buildClientState(),
				adjustments: state.adjustmentList,
			},
		})
	}

	websocketHandlers.push(emitStatus)
	socket.on('disconnect', () => {
		const index = websocketHandlers.indexOf(emitStatus)
		if (index > -1) websocketHandlers.splice(index, 1)
	})

	socket.on('cviz.status', (r) => emitStatus(r.slot))
}

export function setup(app: import('express').Express) {
	app.delete('/api/cviz/:slot/adjustment/:id', (req, res) => {
		const state = slots[req.params.slot]
		if (!state) return res.status(500).send('')

		state.adjustmentList = state.adjustmentList.filter((a) => a.id != req.params.id)

		res.send('OK')
	})

	app.post('/api/cviz/:slot/adjustment/clear', (req, res) => {
		const state = slots[req.params.slot]
		if (!state) return res.status(500).send('')

		state.adjustmentList = []

		res.send('OK')
	})

	app.post('/api/cviz/:slot/adjustment/next/:id', (req, res) => {
		const state = slots[req.params.slot]
		if (!state) return res.status(500).send('')

		const entry = state.adjustmentList.find((a) => a.id == req.params.id)
		if (!entry) {
			res.status(500).send('Failed to find')
			return
		}

		state.adjustmentList = state.adjustmentList.filter((a) => a.id != req.params.id)
		state.adjustmentList.unshift(entry)

		res.send('OK')
	})

	app.post('/api/cviz/:slot/cue', (req, res) => {
		const state = slots[req.params.slot]
		if (!state) return res.status(500).send('')

		console.log('templateGo')

		if (state.lastState && state.lastState.state.toLowerCase() == 'cueorchild' && state.adjustmentList.length > 0) {
			const adjust = state.adjustmentList.shift()
			if (adjust) {
				client.write(
					JSON.stringify({
						timelineSlot: req.params.slot,
						type: 'RUNCHILD',
						parameters: adjust.parameters,
						instanceName: adjust.key,
					}) + '\n',
				)
			}
			res.send('OK')

			return
		}

		client.write(
			JSON.stringify({
				timelineSlot: req.params.slot,
				type: 'CUE',
			}) + '\n',
		)
		res.send('OK')
	})

	app.post('/api/cviz/:slot/cue/direct', (req, res) => {
		const state = slots[req.params.slot]
		if (!state) return res.status(500).send('')

		console.log('templateGo-direct')

		client.write(
			JSON.stringify({
				timelineSlot: req.params.slot,
				type: 'CUE',
			}) + '\n',
		)
		res.send('OK')
	})

	app.post('/api/cviz/:slot/kill', (req, res) => {
		const state = slots[req.params.slot]
		if (!state) return res.status(500).send('')

		console.log('templateKill')

		state.templateName = null
		state.adjustmentList = []

		client.write(
			JSON.stringify({
				timelineSlot: req.params.slot,
				type: 'KILL',
			}) + '\n',
		)
		res.send('OK')
	})

	app.post('/api/run/lowerthird', (req, res) => {
		console.log('Run template for data', req.body)

		const state = slots['lowerthird']
		if (!state) return res.status(500).send('')

		if (!state.isRunningTemplate('lowerthird') && state.isRunningAnything()) return res.send('RUNNING_OTHER')
		if (!state.isRunningTemplate('lowerthird')) state.adjustmentList = []

		const type = req.body.headline ? 'GE2018/LT-ANI-HEADLINE' : 'GE2018/LT-ANI-GREY'

		const v = {
			f0: req.body.f0 || 'GUILD ELECTIONS 2023',
			f1: req.body.f1 || '',
		}

		state.templateName = 'lowerthird'
		state.adjustmentList.push({
			id: uuidv4(),
			key: (v.f0 + ' ' + v.f1).trim().toUpperCase(),
			parameters: {
				data: JSON.stringify(v),
				type: type,
			},
		})

		if (!state.isRunningAnything()) {
			const first = state.adjustmentList.shift()
			if (first) {
				client.write(
					JSON.stringify({
						timelineSlot: 'lowerthird',
						type: 'LOAD',
						timelineFile: 'lowerthird',
						parameters: first.parameters,
						instanceName: first.key,
					}) + '\n',
				)
			}
		}

		res.send('OK')
	})

	app.post('/api/run/lowerthird/:id', (req, res) => {
		console.log('Run template for person', req.params)

		const state = slots['lowerthird']
		if (!state) return res.status(500).send('')

		return Person.findByPk(req.params.id, {
			include: [Position],
		})
			.then((data) => {
				if (!data) throw new Error('Person not found')

				if (!state.isRunningTemplate('lowerthird') && state.isRunningAnything()) return res.send('RUNNING_OTHER')
				if (!state.isRunningTemplate('lowerthird')) state.adjustmentList = []

				const suffix = data.Position.type.indexOf('candidate') == 0 ? (data.elected ? ' Elect' : ' Candidate') : ''

				const v = {
					f0: compileName(data),
					f1: data.Position.fullName + suffix,
				}

				state.templateName = 'lowerthird'
				state.adjustmentList.push({
					id: uuidv4(),
					key: (data.firstName + ' ' + data.lastName).trim().toUpperCase(),
					parameters: {
						data: JSON.stringify(v),
						type: 'GE2018/LT-ANI-GREY',
					},
				})

				if (!state.isRunningAnything()) {
					const first = state.adjustmentList.shift()
					if (first) {
						client.write(
							JSON.stringify({
								timelineSlot: 'lowerthird',
								type: 'LOAD',
								timelineFile: 'lowerthird',
								parameters: first.parameters,
								instanceName: first.key,
							}) + '\n',
						)
					}
				}

				res.send('OK')
			})
			.catch((error) => {
				res.status(500).send('Failed to load person: ' + error)
			})
	})

	app.post('/api/run/person/:id/:template', (req, res) => {
		console.log('Run template for person', req.params)

		const state = slots['default']
		if (!state) return res.status(500).send('')

		return Person.findByPk(req.params.id, {
			include: [Position],
		})
			.then((data) => {
				if (!data) throw new Error('Person not found')

				let type = req.params.template
				if (type.toLowerCase() == 'sidebarphoto' || type.toLowerCase() == 'sidebartext') type = 'sidebar'

				if (!state.isRunningTemplate(type) && state.isRunningAnything()) return res.send('RUNNING_OTHER')
				if (!state.isRunningTemplate(type)) state.adjustmentList = []

				if (req.params.template.toLowerCase() == 'sidebartext') data.photo = ''

				const v = { sidebar_data: JSON.stringify(data) }

				state.templateName = type
				state.adjustmentList.push({
					id: uuidv4(),
					key: (data.firstName + ' ' + data.lastName).trim().toUpperCase(),
					parameters: {
						data: JSON.stringify(v),
					},
				})

				if (!state.isRunningAnything()) {
					const first = state.adjustmentList.shift()
					if (first) {
						client.write(
							JSON.stringify({
								timelineSlot: 'default',
								type: 'LOAD',
								timelineFile: type,
								parameters: first.parameters,
								instanceName: first.key,
							}) + '\n',
						)
					}
				}

				res.send('OK')
			})
			.catch((error) => {
				res.status(500).send('Failed to load person: ' + error)
			})
	})

	app.post('/api/run/board/:template/:key', (req, res) => {
		console.log('Run board template', req.params)

		const state0 = slots['default']
		if (!state0) return res.status(500).send('')
		const state = state0

		function queueBoard(type: 'winners' | 'candidates', data: Array<[string, WinnersPageData | PositionCandidates]>) {
			if (!state.isRunningTemplate(type) && state.isRunningAnything()) return 'RUNNING_OTHER'
			if (!state.isRunningTemplate(type)) state.adjustmentList = []

			state.templateName = type
			for (let k of data) {
				state.adjustmentList.push({
					id: uuidv4(),
					key: k[0],
					parameters: {
						data: JSON.stringify(k[1]),
						name: JSON.stringify({ f1: k[0] }),
					},
				})
			}

			if (!state.isRunningAnything()) {
				const first = state.adjustmentList.shift()
				if (first) {
					client.write(
						JSON.stringify({
							timelineSlot: 'default',
							type: 'LOAD',
							timelineFile: type,
							parameters: first.parameters,
							instanceName: first.key,
						}) + '\n',
					)
				}
			}
			return 'OK'
		}

		function splitWinnersIntoPages(prefix: string, data: PersonAttributesWithPosition[]) {
			const page_count = Math.ceil(data.length / 4)
			const num_4_pages = data.length - page_count * 3

			const res_data: Array<[string, WinnersPageData]> = []
			let offset = 0

			for (let i = 1; i <= page_count; i++) {
				const count = num_4_pages >= i ? 4 : 3
				const cands = data.slice(offset, offset + count)
				offset += count

				console.log(data.length, cands.length, offset)

				const page_data: WinnersPageData = {
					position: prefix,
				}

				if (cands.length > 0) {
					const c = cands[0]
					page_data.win1_name = compileName(c)
					page_data.win1_position = c.Position.fullName
					if (c.photo) page_data.win1_photo = trimPhoto(c.photo)
				}
				if (cands.length > 1) {
					const c = cands[1]
					page_data.win2_name = compileName(c)
					page_data.win2_position = c.Position.fullName
					if (c.photo) page_data.win2_photo = trimPhoto(c.photo)
				}
				if (cands.length > 2) {
					const c = cands[2]
					page_data.win3_name = compileName(c)
					page_data.win3_position = c.Position.fullName
					if (c.photo) page_data.win3_photo = trimPhoto(c.photo)
				}
				if (cands.length > 3) {
					const c = cands[3]
					page_data.win4_show = true
					page_data.win4_name = compileName(c)
					page_data.win4_position = c.Position.fullName
					if (c.photo) page_data.win4_photo = trimPhoto(c.photo)
				} else {
					page_data.win4_show = false
				}

				res_data.push([prefix + ' ' + i, page_data])
			}

			return res_data
		}

		function trimPhoto(photo: string) {
			if (photo.indexOf('data:image/png;base64,') == 0) return photo.substring('data:image/png;base64,'.length)
			return photo
		}

		switch (req.params.template.toLowerCase()) {
			case 'winnersall':
				return getWinnersOfType(PositionType.CandidateSabb)
					.then(function (sabbs) {
						return getWinnersOfType(PositionType.CandidateNonSabb).then(function (nonsabbs) {
							const data = splitWinnersIntoPages('Part-time Officer Elects', nonsabbs)
							const data2 = splitWinnersIntoPages('Full-time Officer Elects', sabbs)
							const comb = data.concat(data2)

							res.send(queueBoard('winners', comb))
						})
					})
					.catch((error) => {
						res.status(500).send('Failed to run: ' + error)
					})

			case 'winnersnonsabbs':
				return getWinnersOfType(PositionType.CandidateNonSabb)
					.then(function (nonsabbs) {
						const data = splitWinnersIntoPages('Part-time Officer Elects', nonsabbs)

						res.send(queueBoard('winners', data))
					})
					.catch((error) => {
						res.status(500).send('Failed to run: ' + error)
					})

			case 'winnerssabbs':
				return getWinnersOfType(PositionType.CandidateSabb)
					.then(function (people) {
						const data = splitWinnersIntoPages('Full-time Officer Elects', people)

						res.send(queueBoard('winners', data))
					})
					.catch((error) => {
						res.status(500).send('Failed to run: ' + error)
					})

			case 'candidateboard':
				return Position.findByPk(req.params.key, {
					include: [
						{
							model: Person,
							order: [
								['order', 'ASC'],
								['lastName', 'ASC'],
							],
						},
					],
				})
					.then(function (position) {
						if (!position) throw new Error('Position not found')

						const data: Array<[string, PositionCandidates]> = []

						const people = _.sortBy([...position.People], (a) => a.order)
						if (people.length > 8) {
							while (people.length > 0) {
								const boardsLeft = Math.ceil(people.length / 8)
								const thisCount = Math.ceil(people.length / boardsLeft)
								const removed = people.splice(0, thisCount)
								data.push([position.fullName, buildCandidateForPosition(position, removed)])
							}
						} else {
							data.push([position.fullName, buildCandidateForPosition(position, people)])
						}

						res.send(queueBoard('candidates', data))
					})
					.catch((error) => {
						res.status(500).send('Failed to run: ' + error)
					})

			case 'candidateall':
				return candidatesForType(null)
					.then((data) => res.send(queueBoard('candidates', data)))
					.catch((error) => {
						res.status(500).send('Failed to run: ' + error)
					})

			case 'candidatesabbs':
				return candidatesForType(PositionType.CandidateSabb)
					.then((data) => res.send(queueBoard('candidates', data)))
					.catch((error) => {
						res.status(500).send('Failed to run: ' + error)
					})

			case 'candidatenonsabbs':
				return candidatesForType(PositionType.CandidateNonSabb)
					.then((data) => res.send(queueBoard('candidates', data)))
					.catch((error) => {
						res.status(500).send('Failed to run: ' + error)
					})
		}

		res.send('OK')
	})
}

async function candidatesForType(type: PositionType | null) {
	const candType = type ? [type] : ['candidateSabb', 'candidateNonSabb']
	const positions = await Position.findAll({
		order: [
			['type', 'DESC'],
			['order', 'ASC'],
		],
		where: {
			type: {
				$in: candType,
			},
		},
		include: [
			{
				model: Person,
				include: [Position],
				order: [
					['order', 'ASC'],
					['lastName', 'ASC'],
				],
			},
		],
	})

	const data: Array<[string, PositionCandidates]> = []

	positions.forEach((p) => {
		const people = _.sortBy([...p.People], (a) => a.order)
		if (people.length > 8) {
			while (people.length > 0) {
				const boardsLeft = Math.ceil(people.length / 8)
				const thisCount = Math.ceil(people.length / boardsLeft)
				const removed = people.splice(0, thisCount)
				data.push([p.fullName, buildCandidateForPosition(p, removed)])
			}
		} else {
			data.push([p.fullName, buildCandidateForPosition(p, people)])
		}
	})

	// console.log(JSON.stringify(data[0], undefined, 4))

	return data
}

function buildCandidateForPosition(pos: Position, ppl: Person[]): PositionCandidates {
	const compiledData = {
		candidates: ppl.map((c) => c.toJSON()),
		position: pos.toJSON(),
	}
	// compiledData.position.People = []

	if (compiledData.candidates.length == 0) {
		compiledData.candidates = [generateRon(pos)]
	}

	return compiledData
}

interface PositionCandidates {
	candidates: PersonAttributes[]
	position: PositionAttributes
}

interface WinnersPageData {
	position: string
	win1_name?: string
	win1_position?: string
	win1_photo?: string
	win2_name?: string
	win2_position?: string
	win2_photo?: string
	win3_name?: string
	win3_position?: string
	win3_photo?: string
	win4_show?: boolean
	win4_name?: string
	win4_position?: string
	win4_photo?: string
}
