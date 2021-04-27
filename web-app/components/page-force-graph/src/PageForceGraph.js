import { html, css, LitElement, supportsAdoptingStyleSheets } from 'lit-element';
import { BaseElement } from '../../your-grievances-app/src/baseElement';

//const ForceGraph3D = require('3d-force-graph');

export class PageForceGraph extends BaseElement {
  static get styles() {
    return css`
      :host {
        display: block;
        padding: 25px;
        text-align: center;
      }

      svg {
        animation: app-logo-spin infinite 20s linear;
      }

      @keyframes app-logo-spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `;
  }

  static get properties() {
    return {
      title: { type: String },
      logo: { type: String },
      graphData: { type: Object },
      currentGraphData: { type: Object },
      topicCounts: { type: Object },
      currentYear: { type: Number },
      allGraphs: { type: Number }
    };
  }

  fetchAllYears() {
    const yearsToFetch = [2013,2014,2015,2016,2017,2018,2019,2020];
    for (let i=0;i<yearsToFetch.length;i++) {
      fetch(`./${yearsToFetch[i]}.json`, { credentials: 'same-origin' })
      .then(res => this.handleNetworkErrors(res))
      .then(res => res.json())
      .then(response => {
        if (!response.nodata) {
          this.allGraphs[yearsToFetch[i]] = response;
          this.setGraphData();
        }
      })
      .catch(error => {
        this.fire('app-error', error);
      });
    }
  }

  setGraphData() {
    if (this.allGraphs[this.currentYear]) {
      this.waitingOnData = false;

      let newLinks = []

      const average = elmt => {
        var sum = 0;
        for( var i = 0; i < elmt.length; i++ ){
            sum += parseInt( elmt[i], 10 ); //don't forget to add the base
        }

        return sum/elmt.length;
      }

      const TopicMinCutOff = 2770;

      const topicsLinks = {};

      Object.keys(topicLimits).forEach(topic => {
        let topicLinks = [];

        console.log("=== "+topic);

        graph.links.forEach( link => {
          if (link.source!="UKIP" && link.target!="UKIP") {
            if (link.source==topic || link.target==topic) {
              //console.log(`VALUE: ${link.value}`)
              if (topicLimits[link.source]>TopicMinCutOff && topicLimits[link.target]>TopicMinCutOff) {
                //const normalizeBy = average([topicLimits[link.source], topicLimits[link.target]]);

                const sourceCount = this.counts[topicLimits[link.source]][this.currentYear];
                const targetCount = this.counts[topicLimits[link.target]][this.currentYear];

                console.log(`Counts: ${sourceCount} ${targetCount}`);

                const normalizeBy = Math.max(sourceCount, targetCount);
                //console.log(`NormalizeBy: ${normalizeBy}`)
                const newLinkValue = (link.value/normalizeBy)*1000000000;
                console.log(`VALUE NEW: ${newLinkValue}`)
                if (newLinkValue>0.0) {
                  topicLinks.push({target: link.target, source: link.source, value: newLinkValue });
                }
              } else {
                console.warn("Skipping")
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

      this.graph.graphData({
        nodes:  graph.nodes,
        links: newLinks
      });

      /*const links = [];
      this.nodesLinkCounts = {};

      const nodeIds = {};
      for (let i=0; i<this.currentGraphData.nodes.length;i++) {
        nodeIds[parseInt(this.currentGraphData.nodes[i].id)] = true;
      }

      for (let i=0; i<this.currentGraphData.links.length;i++) {
        const sourceId = parseInt(this.currentGraphData.links[i].source);
        const targetId = parseInt(this.currentGraphData.links[i].target);

        if (nodeIds[sourceId] && nodeIds[targetId]) {
          if (!this.nodesLinkCounts[sourceId]) {
            this.nodesLinkCounts[sourceId] = 0;
          }

          if (!this.nodesLinkCounts[targetId]) {
            this.nodesLinkCounts[targetId] = 0;
          }

          if (this.currentGraphData.links[i].value>this.weightsFilter) {
            links.push({...this.currentGraphData.links[i]});
            this.nodesLinkCounts[sourceId] += 1;
            this.nodesLinkCounts[targetId] += 1;
          }
        } else {
          console.warn(`Cant find node id for sourceId: ${sourceId} targetId: ${targetId}`);
        }
      }
      */


    }
  }

  constructor() {
    super();
    this.title = 'Hello open-wc world!';
    this.logo = html``;
    this.graph = new ForceGraph3D().showNavInfo(false);
    this.currentYear = 2013;
    this.allGraphs = {};
    this.fetchAllYears();
  }

  firstUpdated() {
    super.firstUpdated();

    const Graph = ForceGraph3D()
      (this.shadowRoot.getElementById('3d-graph'))
        .graphData(this.graphData)
        .nodeAutoColorBy('target')
        .nodeThreeObject(node => {
          const sprite = new SpriteText(node.id);
          sprite.material.depthWrite = false; // make sprite background transparent
          sprite.color = node.color;
          sprite.textHeight = 8;
          return sprite;
        });

    //Graph.d3Force('link').strength(link => { return link.value });
    Graph.d3Force('charge').strength(-990);

  }

  render() {
    return html`
      <div id="3d-graph"></div>
    `;
  }
}
