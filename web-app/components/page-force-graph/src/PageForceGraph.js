import { html, css, LitElement, supportsAdoptingStyleSheets } from 'lit-element';
import { BaseElement } from '../../your-grievances-app/src/baseElement';

import { takeRight, sortBy } from 'lodash-es';
import '@material/mwc-slider';
import { ShadowStyles } from '../../your-grievances-app/src/shadow-styles';

import { Data } from '../../your-grievances-app/src/data.js'

//const ForceGraph3D = require('3d-force-graph');

export class PageForceGraph extends BaseElement {
  static get styles() {
    return [
      ShadowStyles,
      css`
      :host {
        display: block;
        margin: 28px;
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

      mwc-slider {
        width: 350px;
        margin: 8px;
      }

      .infoBox {
        position: absolute;
        left: 16px;
        text-align: center;
        padding: 16px;
        z-index: 1000;
        width: 400px;
        top: 0;
        background-color: transparent;
        color: #FFF;
        opacity: 0;
        -webkit-transition: opacity 1s ease-in;
          -moz-transition: opacity 1s ease-in;
            -ms-transition: opacity 1s ease-in;
            -o-transition: opacity 1s ease-in;
                transition: opacity 1s ease-in;
      }

      .infoBox[is-active] {
        opacity: 1 !important;
      }

      .descriptionBox {
        position: absolute;
        right: 16px;
        text-align: center;
        z-index: 1000;
        width: 400px;
        top: 42px;
        font-size: 12px;
        color: #FFF;
        background-color: transparent;
        opacity: 0;
        -webkit-transition: opacity 1s ease-in;
          -moz-transition: opacity 1s ease-in;
            -ms-transition: opacity 1s ease-in;
            -o-transition: opacity 1s ease-in;
                transition: opacity 1s ease-in;
      }

      .descriptionBox[is-active] {
        opacity: 1  !important;
      }

      .containerMain {
        position: relative;
      }

     canvas {
        width: 95vw !important;
      }
    `];
  }

  static get properties() {
    return {
      title: { type: String },
      logo: { type: String },
      graphData: { type: Object },
      currentGraphData: { type: Object },
      topicCounts: { type: Object },
      currentYear: { type: Number },
      allGraphs: { type: Number },
      infoBoxesActive: { type: Number }
    };
  }

  fetchAllYears() {
    const yearsToFetch = [2014, 2015, 2016, 2017, 2018, 2019, 2020];
    for (let i = 0; i < yearsToFetch.length; i++) {
      fetch(`./${yearsToFetch[i]}.json`, { credentials: 'same-origin' })
        .then(res => res.json())
        .then(response => {
          if (!response.nodata) {
            this.allGraphs[yearsToFetch[i]] = response;

            if (this.currentYear == yearsToFetch[i]) {
              this.setGraphData();
            }
          }
        })
        .catch(error => {
          this.fire('app-error', error);
        });
    }
  }

  getTopicColor(topicName) {
    for (let i=0;i<Data.length;i++) {
      if (Data[i].topicName==topicName) {
        return Data[i].dataSet.borderColor;
        break;
      }
    }
  }

  setGraphData() {
    if (this.allGraphs[this.currentYear]) {
      if (!this.graph) {
        this.graph = ForceGraph3D({ controlType: 'orbit' })(this.shadowRoot.getElementById('3d-graph'))
          .showNavInfo(false)
          .graphData(this.allGraphs[this.currentYear])
          .nodeThreeObject(node => {
            const sprite = new SpriteText(node.id);
            sprite.material.depthWrite = false; // make sprite background transparent
            sprite.color = this.getTopicColor(node.id); //node.color;
            sprite.textHeight = 8;
            return sprite;
          });
          this.firstNodes = this.allGraphs[this.currentYear].nodes;
        //Graph.d3Force('link').strength(link => { return link.value });
        this.graph.d3Force('charge').strength(-350);
      } else {
        debugger;
        this.graph.graphData({
          nodes: this.firstNodes,
          links: this.allGraphs[this.currentYear].links,
        });
      }

      /*setTimeout(() => {
        this.currentYear = Math.min(this.currentYear + 1, 2020);
        this.setGraphData();
        console.error(this.currentYear);
      }, 5000);*/

      return;

      this.waitingOnData = false;

      let newLinks = [];

      const average = elmt => {
        var sum = 0;
        for (var i = 0; i < elmt.length; i++) {
          sum += parseInt(elmt[i], 10); //don't forget to add the base
        }

        return sum / elmt.length;
      };

      const TopicMinCutOff = 2770;

      const topicsLinks = {};

      Object.keys(this.counts).forEach(topic => {
        let topicLinks = [];

        console.log('=== ' + topic);

        graph.links.forEach(link => {
          if (link.source != 'UKIP' && link.target != 'UKIP') {
            if (link.source == topic || link.target == topic) {
              //console.log(`VALUE: ${link.value}`)
              if (
                topicLimits[link.source] > TopicMinCutOff &&
                topicLimits[link.target] > TopicMinCutOff
              ) {
                //const normalizeBy = average([topicLimits[link.source], topicLimits[link.target]]);

                const sourceCount = this.counts[topicLimits[link.source]][this.currentYear];
                const targetCount = this.counts[topicLimits[link.target]][this.currentYear];

                console.log(`Counts: ${sourceCount} ${targetCount}`);

                const normalizeBy = Math.max(sourceCount, targetCount);
                //console.log(`NormalizeBy: ${normalizeBy}`)
                const newLinkValue = (link.value / normalizeBy) * 1000000000;
                console.log(`VALUE NEW: ${newLinkValue}`);
                if (newLinkValue > 0.0) {
                  topicLinks.push({
                    target: link.target,
                    source: link.source,
                    value: newLinkValue,
                  });
                }
              } else {
                console.warn('Skipping');
              }
            }
          }
          //console.log(topicLinks);
        });

        topicLinks = takeRight(
          sortBy(topicLinks, sortLink => {
            console.log(`SortLink: ${JSON.stringify(sortLink)}`);
            return sortLink.value;
          }),
          3,
        );

        console.log(topicLinks);

        newLinks = newLinks.concat(topicLinks);
      });

      this.graphData = {
        nodes: graph.nodes,
        links: newLinks,
      };

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
    this.currentYear = 2014;
    this.allGraphs = {};
    this.fetchAllYears();
    this.graphData = {
      nodes: [],
      links: [],
    };
    this.infoBoxesActive = false;
    setTimeout(()=>{
      this.infoBoxesActive = true;
    }, 250);
  }

  firstUpdated() {
    super.firstUpdated();
    setTimeout(() => {});
  }

  _sliderChanged(event) {
    this.currentYear = event.detail.value+2000;
    this.setGraphData();
  }

  render() {
    return html`
      <div class="containerMain">
        <div class="infoBox shadow-animation shadow-elevation-3dp" ?is-active="${this.infoBoxesActive}">
          <mwc-slider step="1" pin markers min="14" max="20" @input="${this._sliderChanged}" value="14"> </mwc-slider>
          <div>Top connected: ${this.currentYear}</div>
        </div>
        <div class="descriptionBox shadow-animation shadow-elevation-3dp" ?is-active="${this.infoBoxesActive}">
          Connection strength is calculated by comparing all paragraphs from all found domain names and the top 2 strongest links between topics are displayed in this graph for each year.
        </div>

        <div id="3d-graph"></div>
      </div>
    `;
  }
}
