export default function(Models, socket){
  let { Person, Position } = Models;

  socket.on('savePerson', (data) => {
    console.log("Save Person: ", data.uid);

    if (data.id){
      return Person.findById(data.id).then(per => {
        if (!per)
          return console.log("Failed to find person to update: ", data);

        Object.assign(per, data);

        return per.save().then((p) => {
          return p.getPosition().then(pos => {
            p.Position = pos;
            socket.emit('updatePeople', p);
          });
        });
      }).catch(e => console.log("Error saving new position: ", e));
    }

    return Person.create(data).then(p => {
      return p.getPosition().then(pos => {
        p.Position = pos;
        socket.emit('updatePeople', p);
      });
    }).error(function(error){
        console.log("Error saving new person: ", error);
    });
  });

  socket.on('getPeople', () => {
    Person.findAll({
      include: [ Position ]
    }).then(data => {
      socket.emit('getPeople', data);
    }).error(error => {
      console.log("Error getting people: ", error);
    });
  });

  socket.on('setWinner', data => {
    return clearWinner(data).then(({ person, changed }) => {

      person.elected = true;
      person.save().then(() => {
        console.log("Set winner:", person.uid);

        return person.getPosition().then(pos => {
          person.Position = pos;
          changed.push(person);

          socket.emit('updatePeople', changed);
        });

      }).error(error => {
        console.log("Failed to set winner:", error);
      });
    });
  });

  socket.on('clearWinner', data => {
    return clearWinner(data).then(({ person, changed }) => {
      console.log("Clear winner:", person.uid);

      socket.emit('updatePeople', changed);
    });
  });


  function clearWinner(data){
    return Person.findById(data.id, {
      include: [ Position ]
    }).then(per => {
      return Person.update({
        elected: false
      }, {
        where: {
          positionId: per.Position.id,
          elected: true
        }
      }).then(() => {
        return Person.findAll({
          where: {
            positionId: per.Position.id
          },
          include: [ Position ]
        }).then(changed => {
          return {
            person: per,
            changed: changed
          };
        });
      });
    });
  }
}
