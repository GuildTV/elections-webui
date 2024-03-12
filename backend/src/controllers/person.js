export function setup(Models, app, io){
  let { Position, Person } = Models;

  app.get('/api/peoplelist', (req, res) => {
    Person.findAll({
      include: [ Position ],
      attributes: {
        exclude: [ "createdAt", "updatedAt" ]
      }
    }).then(data => {
      for (let i in data) {
        data[i] = data[i].toJSON();
        data[i].hasPhoto = data[i].photo != "";
        data[i].photo = undefined;
      }

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
      io.emit('people.reload');
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
        io.emit('people.reload');
        res.send(p);
      });
    }).error(error => {
      res.status(500).send("Error saving person: " + error);
    });
  });

  app.put('/api/person', (req, res) => {
    Person.create(req.body).then(p => {
      io.emit('people.reload');
      res.send(p);
    }).error(error => {
      res.status(500).send("Error creating person: " + error);
    });
  });

  app.post('/api/person/:id/win', (req, res) => {
    return clearWinner(req.params.id).then(person => {
      person.elected = true;
      person.save().then(() => {
        console.log("Set winner:", (person.firstName + " " + person.lastName).trim());
        
        io.emit('people.reload');
        res.send("OK");
      });
    }).error(error => {
      res.status(500).send("Error setting winner: " + error);
    });
  });

  app.post('/api/person/:id/lose', (req, res) => {
    return clearWinner(req.params.id).then(person => {
      console.log("Cleared winner:", (person.firstName + " " + person.lastName).trim());

      io.emit('people.reload');
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
      }).then(() => per);
    });
  }
}