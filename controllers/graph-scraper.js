import xsd from 'libxml-xsd';
import { parseString } from 'xml2js';
import mapSeries from 'promise-map-series';
import fs from 'fs';

export class GraphScraper {
  constructor(Models){
    this.Models = Models;
  }

  _parseXML(xmlStr, schemaFile){
    return new Promise((resolve, reject) => {
      xsd.parseFile(schemaFile, function(err, schema){
        if (err){
          console.log("XSD load error:", err);
          return reject("XSD_LOAD_ERROR");
        }
        schema.validate(xmlStr, function(err, validationErrors){
          if (err){
            console.log("XML error:", err);
            return reject("XML_ERROR");
          }

          if (validationErrors){
            console.log("XML Validation errors:", validationErrors);
            return reject("XML_VALIDATION_ERROR");
          }

          parseString(xmlStr, (err, xml) => {
            // process and cache
            if (err) {
              console.log("XML Parse Error:", err);
            return reject("XML_PARSE_ERROR");
            }

            return resolve(xml);
          });
        });
      });
    });
  }

  _convertToJson(xml){
    const position = xml.root.position;
    const sabbGraphId = position[0].$.id;

    const rawCandidates = xml.root.candidates[0].candidate;
    const candidates = {};
    for (let cand of rawCandidates) {
      candidates[cand.$.id] = cand['_'];
    }

    const rawRounds = xml.root.rounds[0].round;
    const results = [];
    for (let round of rawRounds){
      const res = {};

      for (let result of round.result) {
        const id = result.$.candidate;
        if (result.$.eliminated)
          res[id] = "elim";
        else
          res[id] = parseInt(result['_']);
      }

      results.push(res);
    }

    return {
      sabbGraphId,
      candidates,
      results
    };
  }

  _findAndSaveElection(data){
    let { Position, Election } = this.Models;

    return Position.findOne({
      where: {
        sabbGraphId: data.sabbGraphId
      }
    }).then(position => {
      return Election.findOrInitialize({
        where: {
          positionId: position.id
        }, 
        defaults: {
          positionId: position.id,
          candidates: "{}"
        }
      }).spread(election => {
        election.candidates = JSON.stringify(data.candidates);
        return election.save().then(res => {
          console.log("Saved election #" + election.id);

          return res;
        });
      });
    });
  }

  _saveRounds(election, data){
    let { ElectionRound } = this.Models;

    return mapSeries(data.results, (result, num) => {
      return ElectionRound.upsert({
          electionId: election.id,
          round: num, 
          results: JSON.stringify(result)
        }).then(() => {
          console.log("Saved round #"+num+" for election #" + election.id);
        });
    });
  }

  ParseAndStash(xmlStr){
    return this._parseXML(xmlStr, "./schema.xsd").then(xml => {
      const data = this._convertToJson(xml);

      // log scrape to disk. just in case
      fs.writeFile("scrapes/" + data.sabbGraphId + "-" + Date.now() + ".xml", xmlStr);

      return this._findAndSaveElection(data).then(election => {
        return this._saveRounds(election, data);
      }, err => console.log(err));
    }, err => Promise.reject(err));
  }
}