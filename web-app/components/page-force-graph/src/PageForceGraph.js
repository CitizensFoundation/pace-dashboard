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
    };
  }

  constructor() {
    super();
    this.title = 'Hello open-wc world!';
    this.logo = html``;
    this.graph = new ForceGraph3D().showNavInfo(false);
  }

  firstUpdated() {
    super.firstUpdated();

    const Graph = ForceGraph3D()
      (this.shadowRoot.getElementById('3d-graph'))
      .jsonUrl('/2015distanceGraph.json')
        .nodeAutoColorBy('target')
        .nodeThreeObject(node => {
          const sprite = new SpriteText(node.id);
          sprite.material.depthWrite = false; // make sprite background transparent
          sprite.color = node.color;
          sprite.textHeight = 8;
          return sprite;
        });

    //Graph.d3Force('link').strength(link => { return link.value });
    Graph.d3Force('charge').strength(-1200);

  }

  render() {
    return html`
      <div id="3d-graph"></div>
    `;
  }
}
