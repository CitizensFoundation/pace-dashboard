import { LitElement, html, css } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';

import '../../page-trends/page-trends.js';
import '../../list-of-grievances/list-of-grievances.js';
import '../../list-of-grievances/one-grievance.js';
import { templateAbout } from './templateAbout.js';
import '../../page-force-graph/page-force-graph.js'

import '@material/mwc-button';
import '@material/mwc-tab';
import '@material/mwc-tab-bar';
import '@material/mwc-icon';

export class YourGrievancesApp extends LitElement {
  static get properties() {
    return {
      currentGrievance: { type: Object }
    };
  }

  static get styles() {
    return css`
      :host {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        font-size: calc(10px + 2vmin);
        color: #1a2b42;
        max-width: 960px;
        margin: 0 auto;
      }

      header {
        width: 100%;
        background: #fff;
        border-bottom: 1px solid #ccc;
      }

      header ul {
        display: flex;
        justify-content: space-around;
        min-width: 400px;
        margin: 0 auto;
        padding: 0;
      }

      header ul li {
        display: flex;
      }

      header ul li a {
        color: #5a5c5e;
        text-decoration: none;
        font-size: 18px;
        line-height: 36px;
      }

      header ul li a:hover,
      header ul li a.active {
        color: blue;
      }

      main {
        flex-grow: 1;
      }

      .app-footer {
        margin-top: 16px;
      }

      .app-footer a {
      }

      [hidden] {
        display: none !important;
      }

      mwc-tab {
        color: #000;
      }

      .paceImage {
        margin-right: auto;
        margin-top: 26px;
        margin-left: 64px;
        margin-bottom: 16px;
      }

      .euFooterText {
        font-size: 12px;
        margin-top: 8px;
      }
    `;
  }

  constructor() {
    super();
    this.page = '0';
    this.addEventListener("open-grievance", this._openGrievance);
    this.addEventListener("close-grievance", this._closeGrievance);
  }

  _openGrievance(event) {
    this.currentGrievance = event.detail;
    this.page="grievance";
  }

  _closeGrievance() {
    this.currentGrievance = null;
    this.page="0";
  }

  render() {
    return html`
        <div class="paceImage">
          <img width="151" height="95" src="images/pacelogo.png"/>
        </div>
      <header ?hidden="${this.currentGrievance}">
        <mwc-tab-bar @MDCTabBar:activated="${this._tabSelected}">
          <mwc-tab label="Topics" icon="bar_chart" stacked></mwc-tab>
          <mwc-tab label="Distances" icon="blur_on" stacked></mwc-tab>
          <mwc-tab label="Connections" icon="format_size" stacked></mwc-tab>
        </mwc-tab-bar>
      </header>

      <main>
        ${this._renderPage()}
      </main>

      <p class="app-footer layout vertical center-center">
       <div>
         <img src="images/eu.jpeg"/>
       </div>
       <div class="euFooterText">
         This project has received funding from the European Union’s Horizon 2020 research and innovation programme under grant agreement No 822337. Any dissemination of results here presented reflects only the consortium’s view. The Agency is not responsible for any use that may be made of the information it contains.
       </div>
      </p>
    `;
  }

  _tabSelected(event) {
    this.page = event.detail.index.toString();
    this.requestUpdate();
  }

  _renderPage() {
    switch (this.page) {
      case 'grievance':
        return html`
          <one-grievance ?fullView="${true}" .grievanceData="${this.currentGrievance}"></one-grievance>
        `;
      case '0':
        return html`
          <list-of-grievances></list-of-grievances>
        `;
      case '1':
        return html`
            <page-force-graph></page-force-graph>
      `;
      case '2':
          return html`
            <page-force-graph></page-force-graph>
          `;
        default:
        return html`
          <p>Page not found try going to <a href="#main">Main</a></p>
        `;
    }
  }

  __onNavClicked(ev) {
    ev.preventDefault();
    this.page = ev.target.hash.substring(1);
  }

  __navClass(page) {
    return classMap({ active: this.page === page });
  }
}
