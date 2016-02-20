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

        position.save(function(error, doc) {
          if (error) {
            console.log("Error saving new position: " + JSON.stringify(error));
          }
          else {
            console.log("Position added to DB: "+ JSON.stringify(doc));

            socket.emit('updatePosition', position);
          }
        });
      });

    return Position.save(data).then(function(error, doc) {
      if (error) {
        console.log("Error saving new position: " + JSON.stringify(error));
      }
      else {
        console.log("Position added to DB: "+ JSON.stringify(doc));

        socket.emit('updatePosition', position);
      }
    });

  });
}