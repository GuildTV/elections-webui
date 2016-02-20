export default function(Models, socket){
  let { Position } = Models;

  socket.on('savePosition', (data) => {
    console.log("Save Position: " + JSON.stringify(data));

    if(data.id)
      return Position.filter({id: data.id}).run().then(function(positions){
        if(positions.length == 0)
          return console.log("Error loading position: " + data.id);

        let position = positions[0]
        position.merge(data);

        position.save().then(function(doc) {
          // console.log("Position added to DB: ", doc);

          socket.emit('updatePosition', position);
        }).error(function(error){
          console.log("Error saving new position: ", error);
        });
      });

    return Position.save(data).then(function(doc) {
      // console.log("Position added to DB: ", doc);

      socket.emit('updatePosition', doc);
    }).error(function(error){
        console.log("Error saving new position: ", error);
    });
  });

  socket.on('getPositions', () => {
    Position.run().then(function(data) {
      socket.emit('getPositions', data);
    }).error(function(error) {
      console.log("Error getting positions: ", error)
    });
  });
}