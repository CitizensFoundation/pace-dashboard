'use strict';

const fs = require('fs');
const { values } = require('lodash');
const _ = require('lodash');

const fetch = require('node-fetch');

const currentYear = process.argv[2];

let rawdata = fs.readFileSync(`originalDistanceGraphs/${currentYear}distanceGraph.json`);
let graph = JSON.parse(rawdata);

let newLinks = [];


const topicLimits = {
  'Loss of religion': 429485,
  'Nanny state': 2762,
  Qanon: 316,
  'Resentment of elite': 561790,
  'Income inequality': 36393,
  'False accusations of racism': 11096,
  'Call to vigilante action': 4062,
  'Family disintegration': 102134,
  'Citizen Engagement': 38798,
  'Dehumanization of opponents': 10021,
  'Feeling ignored': 2601,
  'Undeserving support': 26591,
  'Desire for strong man': 86757,
  'Left behind': 17484,
  'Evolving social mores': 92593,
  'Distrust of media': 173,
  'Technology and alienation': 50966,
  'Democratic Innovation': 2971,
  'Losing cultural identity': 5000,
  'Restrictions on free speech': 121733,
  'Loss of sovereignty': 58533,
};

const TopicMinCutOff = 2770;


const average = elmt => {
  var sum = 0;
  for (var i = 0; i < elmt.length; i++) {
    sum += parseInt(elmt[i], 10); //don't forget to add the base
  }

  return sum / elmt.length;
};

const topicCounts = {};

const getAllCounts = async () => {
  const keys = Object.keys(topicLimits);
  for (let i=0;i<keys.length;i++) {
    await setupCounts(keys[i])
  }
}

const setupCounts = async (topicName) => {
  const responsesObj = await fetch(`http://localhost:8000/api/trends/getTopicTrends?topic=${topicName}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  let responses = await responsesObj.json()

  responses.shift();
  this.responses = responses;
  const yearLabels = [];
  const counts = [];
  const years = {};

  for (let i = 0; i < responses.length; i++) {
    yearLabels.push(responses[i].key_as_string.split('-')[0]);
    const docCount = responses[i].doc_count;
    years[responses[i].key_as_string.split('-')[0]] = docCount;
    counts.push(docCount);
  }

  topicCounts[topicName] = years;
  console.log(topicCounts);
};

(async function() {

  const topicsLinks = {};

  await getAllCounts();

  Object.keys(topicLimits).forEach(topic => {
    let topicLinks = [];

    console.log('=== ' + topic);

    graph.links.forEach(link => {
      if (link.source != 'UKIP' && link.target != 'UKIP') {
        if (link.source == topic || link.target == topic) {
          //console.log(`VALUE: ${link.value}`)
          console.log(link.source);
          console.log(currentYear);

          const sourceTopicCount = topicCounts[link.source][currentYear.toString()];
          const targetTopicCount = topicCounts[link.target][currentYear.toString()];
          console.log(sourceTopicCount);
          console.log(targetTopicCount);
          if (
            sourceTopicCount> TopicMinCutOff &&
            targetTopicCount > TopicMinCutOff
          ) {
            //const normalizeBy = average([topicLimits[link.source], topicLimits[link.target]]);
            const normalizeBy = Math.max(sourceTopicCount, targetTopicCount);
            //console.log(`NormalizeBy: ${normalizeBy}`)
            const newLinkValue = (link.value / normalizeBy) * 1000000000;
            console.log(`VALUE NEW: ${newLinkValue}`);
            if (newLinkValue > 0.0) {
              topicLinks.push({ target: link.target, source: link.source, value: newLinkValue });
            }
          } else {
            console.warn('Skipping');
          }
        }
      }
      //console.log(topicLinks);
    });

    topicLinks = _.takeRight(
      _.sortBy(topicLinks, sortLink => {
        console.log(`SortLink: ${JSON.stringify(sortLink)}`);
        return sortLink.value;
      }),
      3,
    );

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
    links: newLinks,
  });

  fs.writeFileSync(`distanceGraphs/${currentYear}.json`, data);


})();

