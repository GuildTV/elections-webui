export default function(Models, socket){
  let { Position } = Models;

  socket.on('savePosition', (data) => {
    console.log("Save Position: " + JSON.stringify(data));

    if (data.id){
      return Position.findById(data.id).then(pos => {
        if (!pos)
          return console.log("Failed to find position to update: ", data);

        Object.assign(pos, data);

        return pos.save().then((p) => socket.emit('updatePosition', p));
      }).catch(e => console.log("Error saving new position: ", error));
    }

    return Position.create(data).then(p => {
      socket.emit('updatePosition', p);
    }).error(function(error){
        console.log("Error saving new position: ", error);
    });
  });

  socket.on('getPositions', () => {
    Position.findAll().then(data => {
      socket.emit('getPositions', data);
    }).error(error => {
      console.log("Error getting positions: ", error)
    });
  });
}
