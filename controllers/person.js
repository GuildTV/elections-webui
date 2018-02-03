export function setup(Models, app){
  let { Position, Person } = Models;

  app.get('/api/peoplelist', (req, res) => {
    Person.findAll({
      include: [ Position ],
      attributes: {
        exclude: [ "photo" ]
      }
    }).then(data => {
      res.send(data);
    }).error(error => {
      res.status(500).send("Error getting people list: " + error);
    });
  });

  app.get('/api/person/:id', (req, res) => {
    const id = req.params.id;
    Person.findById(id).then(data => {
      res.send(data);
    }).error(error => {
      res.status(500).send("Error getting person: " + error);
    });
  });

  app.delete('/api/person/:id', (req, res) => {
    const id = req.params.id;
    Person.destroy({
      where: {
        id: id
      }
    }).then(() => {
      res.send("OK");
    }).error(error => {
      res.status(500).send("Error deleting person: " + error);
    });
  });

  app.post('/api/person/:id', (req, res) => {
    const id = req.params.id;

    Person.findById(id).then(per => {
      Object.assign(per, req.body);

      return per.save().then((p) => {
        res.send(p);
      });
    }).error(error => {
      res.status(500).send("Error saving person: " + error);
    });
  });

  app.put('/api/person', (req, res) => {
    Person.create(req.body).then(p => {
      res.send(p);
    }).error(error => {
      res.status(500).send("Error creating person: " + error);
    });
  });

  app.post('/api/person/:id/win', (req, res) => {
    return clearWinner(req.params.id).then(person => {
      person.elected = true;
      person.save().then(() => {
        console.log("Set winner:", person.uid);
        
        res.send("OK");
      });
    }).error(error => {
      res.status(500).send("Error setting winner: " + error);
    });
  });

  app.post('/api/person/:id/lose', (req, res) => {
    return clearWinner(req.params.id).then(person => {
      console.log("Cleared winner:", person.uid);

      res.send("OK");
    }).error(error => {
      res.status(500).send("Error clearing winner: " + error);
    });
  });

  function clearWinner(id){
    return Person.findById(id, {
      include: [ Position ]
    }).then(per => {
      return Person.update({
        elected: false
      }, {
        where: {
          positionId: per.Position.id,
          elected: true
        }
      });
    });
  }
}