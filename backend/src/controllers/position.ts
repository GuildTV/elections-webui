import { Position, Person } from '../models/People.js'

export function setup(app: import('express').Express) {
	app.get('/api/positions', (req, res) => {
		Position.findAll({
			include: [
				{
					model: Person,
					order: [
						['order', 'ASC'],
						['lastName', 'ASC'],
					],
					attributes: {
						exclude: ['photo'],
					},
				},
			],
			order: [
				['type', 'ASC'],
				['order', 'ASC'],
			],
		})
			.then((data) => {
				res.send(data)
			})
			.catch((error) => {
				res.status(500).send('Error getting positions: ' + error)
			})
	})

	app.get('/api/position/:id', (req, res) => {
		const id = req.params.id
		Position.findByPk(id, {
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
			.then((data) => {
				res.send(data)
			})
			.catch((error) => {
				res.status(500).send('Error getting position: ' + error)
			})
	})

	app.delete('/api/position/:id', (req, res) => {
		const id = req.params.id
		Position.destroy({
			where: {
				id: id,
			},
		})
			.then(() => {
				res.send('OK')
			})
			.catch((error) => {
				res.status(500).send('Error deleting position: ' + error)
			})
	})

	app.post('/api/position/:id', (req, res) => {
		const id = req.params.id

		Position.findByPk(id)
			.then((pos) => {
				if (!pos) throw new Error('Position not found')

				Object.assign(pos, req.body)

				return pos.save().then((p) => {
					res.send(p)
				})
			})
			.catch((error) => {
				res.status(500).send('Error saving position: ' + error)
			})
	})

	app.put('/api/position', (req, res) => {
		Position.create(req.body)
			.then((p) => {
				res.send(p)
			})
			.catch((error) => {
				res.status(500).send('Error creating position: ' + error)
			})
	})
}
