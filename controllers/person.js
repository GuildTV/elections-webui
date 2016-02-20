export default function(Models, socket){
  let { Person } = Models;


  socket.on('savePerson', (data) => {
    console.log("Save Person: ", data.uid);

    if(data.id)
      return Person.filter({id: data.id}).run().then(function(people){
        if(people.length == 0)
          return console.log("Error loading person: " + data.id);

        let person = people[0]
        person.merge(data);

        person.save().then(function(doc) {
          // console.log("Person added to DB: ", doc);

          // we need to send the position too, so data needs reloading
          Person.getJoin({position: true}).filter({id: doc.id}).run().then(function(people){
            socket.emit('updatePeople', people);
          });
        }).error(function(error){
          console.log("Error saving new person: ", error);
        });
      });

    return Person.save(data).then(function(doc) {
      // console.log("Person added to DB: ", doc);

      // we need to send the position too, so data needs reloading
      Person.getJoin({position: true}).filter({id: doc.id}).run().then(function(people){
        socket.emit('updatePeople', people);
      });

    }).error(function(error){
        console.log("Error saving new person: ", error);
    });
  });

  socket.on('getPeople', () => {
    Person.getJoin({position: true}).run().then(function(data) {
      socket.emit('getPeople', data);
    }).error(function(error) {
      console.log("Error getting people: ", error)
    });
  });

  socket.on('setWinner', data => {
    return clearWinner(data).then(({ person, changed }) => {

      person.elected = true;
      person.save().then(() => {
        console.log("Set winner:", person.uid);

        changed.push(person);

        socket.emit('updatePeople', changed);

      }).error(err => {
        console.log("Failed to set winner:", error);
      })
    });
  });

  socket.on('clearWinner', data => {
    return clearWinner(data).then(({ person, changed }) => {
      console.log("Clear winner:", person.uid);

      socket.emit('updatePeople', changed);
    });
  });


  function clearWinner(data){
    return Person.filter({ id: data.id }).run().then(people => {
      let person = people[0];
      //clear existing winner
      return Person.filter({ 
        positionId: person.positionId,
        elected: true
      }).update({ elected: false }).run().then((changed)=>{
        return { 
          person,
          changed
        };
      });
    });
  }
}
