export default function(Models, socket){
  let { Person } = Models;


  socket.on('savePerson', (data) => {
    console.log("Save Person: " + JSON.stringify(data));

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
            socket.emit('updatePerson', people);
          });
        }).error(function(error){
          console.log("Error saving new person: ", error);
        });
      });

    return Person.save(data).then(function(doc) {
      // console.log("Person added to DB: ", doc);

      // we need to send the position too, so data needs reloading
      Person.getJoin({position: true}).filter({id: doc.id}).run().then(function(people){
        socket.emit('updatePerson', people);
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

  });

  socket.on('clearWinner', data => {

  });
}