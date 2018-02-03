const cors = require('cors');
import mapSeries from 'promise-map-series';

let purge_now = false;

export function setup(Models, app){
  const { TickerEntry } = Models;

  app.get('/api/ticker', cors(), (req, res) => {
    return TickerEntry.findAll({
      where: {
        enabled: true,
      },
      order: [
        [ "order", "ASC" ],
      ]
    }).then(items => {
      const text = items.map(v => v.text);
      res.send({
        purge: purge_now,
        data: text,
      });

      purge_now = false;
    }).catch(e => res.status(500).send(e));
  });

  app.post('/api/ticker/purge', (req, res) => {
    purge_now = true;
    return res.send("OK");
  });

  app.post('/api/ticker/save', (req, res) => {
    const newItems = [];
    const updated = [];

    let order = 0;

    for (let i of req.body.data){
      i.order = order++;

      if (i.id)
        updated.push(i);
      else
        newItems.push(i);
    }

    return mapSeries(updated, i => {
      return TickerEntry.update({
        text: i.text,
        enabled: i.enabled,
        order: i.order,
      }, {
        where: {
          id: i.id,
        }
      });
    }).then(() => {
      return TickerEntry.bulkCreate(newItems);
    }).then(() => {
      return TickerEntry.findAll({
        order: [
          [ "order", "ASC" ],
        ]
      }).then(items => {
        res.send({
          data: items,
        });

      });
    }).catch(e => {
      console.log(e);
      res.status(500).send(e);
    });
  });

  app.get('/api/ticker/full', (req, res) => {
    return TickerEntry.findAll({
      order: [
        [ "order", "ASC" ],
      ]
    }).then(items => {
      res.send({
        data: items,
      });

    }).catch(e => {
      console.log(e);
      res.status(500).send(e);
    });
  });

}
