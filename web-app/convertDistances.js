'use strict';

const fs = require('fs');
const { values } = require('lodash');
const _ = require("lodash");

let rawdata = fs.readFileSync('2015distanceGraph.json');
let graph = JSON.parse(rawdata);

let newLinks = []

const average = elmt => {
  var sum = 0;
  for( var i = 0; i < elmt.length; i++ ){
      sum += parseInt( elmt[i], 10 ); //don't forget to add the base
  }

  return sum/elmt.length;
}

const topicLimits = {
  "Loss of religion": 429485,
  "Nanny state": 2762,
  "Qanon": 316,
  "Resentment of elite": 561790,
  "Income inequality": 36393,
  "False accusations of racism": 11096,
  "Call to vigilante action": 4062,
  "Family disintegration": 102134,
  "Citizen Engagement": 38798,
  "Dehumanization of opponents": 10021,
  "Feeling ignored": 2601,
  "Undeserving support": 26591,
  "Desire for strong man": 86757,
  "Left behind": 17484,
  "Evolving social mores": 92593,
  "Distrust of media": 173,
  "Technology and alienation": 50966,
  "Democratic Innovation": 1771,
  "Losing cultural identity": 5000,
  "Restrictions on free speech": 121733,
  "Loss of sovereignty": 58533
}

const TopicMinCutOff = 1700;

const topicsLinks = {};

Object.keys(topicLimits).forEach(topic => {
  let topicLinks = [];

  console.log("=== "+topic);

  graph.links.forEach( link => {
    if (link.source!="UKIP" && link.target!="UKIP") {
      if (link.source==topic || link.target==topic) {
        //console.log(`VALUE: ${link.value}`)
        if (topicLimits[link.source]>TopicMinCutOff && topicLimits[link.target]>TopicMinCutOff) {
          const normalizeBy = average([topicLimits[link.source], topicLimits[link.target]]);
          //console.log(`NormalizeBy: ${normalizeBy}`)
          const newLinkValue = (link.value/normalizeBy)*1000000000;
          console.log(`VALUE NEW: ${newLinkValue}`)
          if (newLinkValue>1.0) {
            topicLinks.push({target: link.target, source: link.source, value: newLinkValue });
          }
        }
      }
    }
    //console.log(topicLinks);
  });

  topicLinks = _.takeRight(_.sortBy(topicLinks, sortLink=>{
    console.log(`SortLink: ${JSON.stringify(sortLink)}`)
    return sortLink.value;
  }), 2);

  console.log(topicLinks);

  newLinks = newLinks.concat(topicLinks);

});



/*graph.links.forEach( link => {

  if (topicLimits[link.source] || topicLimits[link.target]) {
    const limit = Math.min(topicLimits[link.source], topicLimits[link.target])/100000;
    const newLinkValue = link.value*10000;
    if (newLinkValue>limit) {
      newLinks.push({target: link.target, source: link.source, value: newLinkValue })
      console.log(`Link: ${link.source} <-> ${link.target} limit: ${limit}`)
    }

  }
});*/

let data = JSON.stringify({
  nodes: graph.nodes,
  links: newLinks
});

fs.writeFileSync('2015distanceGraph-2.json', data);

