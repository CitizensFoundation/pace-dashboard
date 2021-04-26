import { html, css, LitElement } from 'lit-element';
import { Data } from '../../your-grievances-app/src/data.js';

import './Grievance.js'
import { BaseElement } from '../../your-grievances-app/src/baseElement.js';

export class ListOfGrievances extends BaseElement {
  static get styles() {
    return css`
      :host {
        --page-one-text-color: #000;

        padding: 25px;
        color: var(--page-one-text-color);
      }

      .container {
        display: flex;
        flex-direction: column;
        flex-basis: auto;
        width: 100%;
      }
    `;
  }

  static get properties() {
    return {
    };
  }

  constructor() {
    super();
  }

  renderIntro() {
    return html`
     <div class="mdc-card shadow-animation shadow-elevation-3dp" @click="${this._openGrievance}">
        <div class="mdc-card__primary-action">
          <div class="mdc-card__media mdc-card__media--16-9 my-media"></div>
          <div class="content">
            <h2 class="mdc-typography--title contentTitle">Introduction</h2>
            <div class="mdc-typography--body1 subtext contentText">
              Here you see relative trends between different topics connected to populism, nativism and civic engagment.
              We use <a href="https://commoncrawl.org/" target="_blank">CommonCrawl</a>, where we scan crawls from every year from 2013
              for hundreds of keywords that are then filtered through BERT based AI algorithms that have been trained
              to recognize the different topics. There is <a targer="_blank"
              href="https://docs.google.com/document/d/1-C6GJAy3GCl7nO_HUyaKKk07x5ydMAMMLMGESwIdtpk">more detailed information here.</a>
            </div>
          </div>
        </div>
      </div>
    `
  }

  renderCitizensEngagment() {
    return html``
  }

  render() {
    return html`
    <div class="container">
      ${ this.renderIntro() }
      ${ Data.map((item) => item.topic=="Citizen engagment" ? html`
        ${ this.renderCitizensEngagment() }
        <one-grievance .grievanceData="${item}"></one-grievance>

      ` : html`
        <one-grievance .grievanceData="${item}"></one-grievance>
      `)}
    </div>
    `;
  }
}
