'use strict';

const fs = require('fs');
const { values } = require('lodash');
const _ = require("lodash");

let rawdata = fs.readFileSync('2015distanceGraph.json');
let graph = JSON.parse(rawdata);

let newLinks = []

const topicLimits = {
  "Loss of religion": 900000,
  "Nanny state": 200000,
  "Qanon": 800000,
  "Resentment of elite": 1600000,
  "Income inequality": 140000,
  "False accusations of racism": 120000,
  "Call to vigilante action": 25000,
  "Family disintegration": 300000,
  "Citizen Engagement": 60000,
  "Dehumanization of opponents": 35000,
  "Feeling ignored": 14000,
  "Undeserving support": 80000,
  "Desire for strong man": 550000,
  "Left behind": 110000,
  "Evolving social mores": 400000,
  "Distrust of media": 120000,
  "Technology and alienation": 130000,
  "Democratic Innovation": 11000,
  "Losing cultural identity": 40000,
  "Restrictions on free speech": 600000,
  "Loss of sovereignty": 145000
}

const topicsLinks = {};

Object.keys(topicLimits).forEach(topic => {
  let topicLinks = [];

  console.log("=== "+topic);

  graph.links.forEach( link => {


    if (link.source!="UKIP" && link.target!="UKIP") {
      if (link.source==topic || link.target==topic) {
        const limit = Math.max(topicLimits[link.source], topicLimits[link.target])/1000000;
        const newLinkValue = link.value*10000;
        if (newLinkValue>limit) {
          topicLinks.push({target: link.target, source: link.source, value: newLinkValue });
        }

      }
    }
    //console.log(topicLinks);
  });

  topicLinks = _.takeRight(_.sortBy(topicLinks, sortLink=>{
    console.log(`SortLink: ${JSON.stringify(sortLink)}`)
    return sortLink.value;
  }), 3);

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

