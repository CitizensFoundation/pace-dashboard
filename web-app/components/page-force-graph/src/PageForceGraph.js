import { html, css, LitElement, supportsAdoptingStyleSheets } from 'lit-element';

//const ForceGraph3D = require('3d-force-graph');

export class PageForceGraph extends LitElement {
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
      fetch(`${yearsToFetch[i]}.json`, { credentials: 'same-origin' })
      .then(res => this.handleNetworkErrors(res))
      .then(res => res.json())
      .then(response => {
        if (!response.nodata) {
          this.allGraphs[yearsToFetch[i]] = response;
          this.setGraphData();
          this.fire('set-similarities-data', this.originalGraphData);
        }
        this.waitingOnData = false;
      })
      .catch(error => {
        this.fire('app-error', error);
      });
    }
  }

  setGraphData() {
    const links = [];
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

    this.graph.graphData({
      nodes: this.currentGraphData.nodes,
      links
    });
  }


  constructor() {
    super();
    this.title = 'Hello open-wc world!';
    this.logo = html``;
    this.graph = new ForceGraph3D().showNavInfo(false);
    this.currentYear = 2013;
    this.allGraphs = {};
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
