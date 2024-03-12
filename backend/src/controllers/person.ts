import { Position, Person } from '../models/People.js'

export function setup(app: import('express').Express, io: import('socket.io').Server) {
	app.get('/api/peoplelist', (req, res) => {
		Person.findAll({
			include: [Position],
			attributes: {
				exclude: ['createdAt', 'updatedAt'],
			},
		})
			.then((people) => {
				const transformedData = people.map((person) => {
					return {
						...person.toJSON(),
						hasPhoto: person.photo != '',
						photo: undefined,
					}
				})

				res.send(transformedData)
			})
			.catch((error) => {
				res.status(500).send('Error getting people list: ' + error)
			})
	})

	app.get('/api/person/:id', (req, res) => {
		const id = req.params.id
		Person.findByPk(id)
			.then((data) => {
				res.send(data)
			})
			.catch((error) => {
				res.status(500).send('Error getting person: ' + error)
			})
	})

	app.delete('/api/person/:id', (req, res) => {
		const id = req.params.id
		Person.destroy({
			where: {
				id: id,
			},
		})
			.then(() => {
				io.emit('people.reload')
				res.send('OK')
			})
			.catch((error) => {
				res.status(500).send('Error deleting person: ' + error)
			})
	})

	app.post('/api/person/:id', (req, res) => {
		const id = req.params.id

		Person.findByPk(id)
			.then((per) => {
				if (!per) throw new Error('Person not found')

				Object.assign(per, req.body)

				return per.save().then((p) => {
					io.emit('people.reload')
					res.send(p)
				})
			})
			.catch((error) => {
				res.status(500).send('Error saving person: ' + error)
			})
	})

	app.put('/api/person', (req, res) => {
		Person.create(req.body)
			.then((p) => {
				io.emit('people.reload')
				res.send(p)
			})
			.catch((error) => {
				res.status(500).send('Error creating person: ' + error)
			})
	})

	app.post('/api/person/:id/win', (req, res) => {
		return clearWinner(Number(req.params.id))
			.then((person) => {
				if (!person) throw new Error('Person not found')

				person.elected = true
				person.save().then(() => {
					console.log('Set winner:', (person.firstName + ' ' + person.lastName).trim())

					io.emit('people.reload')
					res.send('OK')
				})
			})
			.catch((error) => {
				res.status(500).send('Error setting winner: ' + error)
			})
	})

	app.post('/api/person/:id/lose', (req, res) => {
		return clearWinner(Number(req.params.id))
			.then((person) => {
				if (!person) throw new Error('Person not found')

				console.log('Cleared winner:', (person.firstName + ' ' + person.lastName).trim())

				io.emit('people.reload')
				res.send('OK')
			})
			.catch((error) => {
				res.status(500).send('Error clearing winner: ' + error)
			})
	})

	async function clearWinner(id: number) {
		const per = await Person.findByPk(id, {
			include: [Position],
		})
		if (!per) throw new Error('Person not found')

		await Person.update(
			{
				elected: false,
			},
			{
				where: {
					positionId: per.Position.id,
					elected: true,
				},
			},
		)

		return per
	}
}
