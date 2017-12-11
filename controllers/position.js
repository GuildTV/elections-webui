export function setup(Models, app){
  let { Position, Person } = Models;

  app.get('/api/positions', (req, res) => {
    Position.findAll({
      order: [
        [ "type", "ASC" ],
        [ "order", "ASC" ],
      ]
    }).then(data => {
      res.send(data);
    }).error(error => {
      res.status(500).send("Error getting positions: " + error);
    });
  });

  app.get('/api/position/:id', (req, res) => {
    const id = req.params.id;
    Position.findById(id, {
      include: [{
        model: Person,
        include: [ Position ],
        order: [[ "order", "ASC" ], [ "lastName", "ASC" ]],
        attributes: {
          exclude: [ "photo" ]
        }
      }]
    }).then(data => {
      res.send(data);
    }).error(error => {
      res.status(500).send("Error getting position: " + error);
    });
  });


  app.delete('/api/position/:id', (req, res) => {
    const id = req.params.id;
    Position.destroy({
      where: {
        id: id
      }
    }).then(() => {
      res.send("OK");
    }).error(error => {
      res.sendStatus(500).send("Error deleting position: " + error);
    });
  });

  app.post('/api/position/:id', (req, res) => {
    const id = req.params.id;

    Position.findById(id).then(per => {
      Object.assign(per, req.body);

      return per.save().then((p) => {
        res.send(p);
      });
    }).error(error => {
      res.sendStatus(500).send("Error saving position: " + error);
    });
  });

  app.put('/api/position', (req, res) => {
    Position.create(req.body).then(p => {
      res.send(p);
    }).error(error => {
      res.sendStatus(500).send("Error creating position: " + error);
    });
  });

}