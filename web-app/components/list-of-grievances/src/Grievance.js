import { LitElement, html, css } from 'lit-element';
import '../../your-grievances-app/src/shadow-styles.js'
import { ShadowStyles } from '../../your-grievances-app/src/shadow-styles.js';
import { BaseElement } from '../../your-grievances-app/src/baseElement.js';
import '@material/mwc-textarea';
import '@material/mwc-icon';
import { FlexLayout } from '../../your-grievances-app/src/flex-layout.js';
import { Data, DataLabels } from '../../your-grievances-app/src/data.js';

export class Grievance extends BaseElement {
  static get styles() {
    return [
      FlexLayout,
      ShadowStyles,
      css`
        :host {
          display: inline-block;
          background-color: #FFF;
          margin-bottom: 16px;
        }

        .mdc-card {
          max-width: 850px;
          padding: 16px;
          cursor: pointer;
        }
        .content {
          padding: 1rem;
        }
        .subtext {
          color: rgba(0, 0, 0, 0.54);
        }

        .group-spaced {
          justify-content: space-around;
        }

        .group-spaced > * {
          margin: 0 8px;
        }

        mwc-textarea {
          width: 300px;
        }

        mwc-icon  {
          position: absolute;
          right: 16px;
          top: 16px;
        }

        .contentText {
          font-size: 16px !important;
        }

        .contentTitle {
          font-size: 20px;
          margin-top: 0;
        }

        .quote {
          font-size: 14px;
          font-style: italic;
          padding: 16px;
          padding-top: 0;
        }

        mwc-button {
          margin-top: 24px;
          margin-left: 85px;
          margin-bottom: 32px;
        }

        mwc-textarea {
          line-height: 1;
        }
      `,
    ];
  }

  static get properties() {
    return {
      grievanceData: { type: Object },
      fullView: { type: Boolean },
      responses: { type: Array }
    };
  }

  render() {
    return html`
      <div class="mdc-card shadow-animation shadow-elevation-3dp" @click="${this._openGrievance}">
        <div class="mdc-card__primary-action">
          <div class="mdc-card__media mdc-card__media--16-9 my-media"></div>
          <div class="content">
            <h2 class="mdc-typography--title contentTitle">${this.grievanceData.title}</h2>
            <div class="mdc-typography--body1 subtext contentText">${this.grievanceData.description}</div>
          </div>
          <canvas id="line-chart" width="800" height="350"></canvas>
          <mdc-ripple></mdc-ripple>
        </div>
        ${ this.fullView ? html`
          <div class="laysout vertical">
            <mwc-icon icon="exit" @click="${()=>{this.fire('close-grievance')}}"></mwc-icon>
            <div class="group-spsaced layout horizontal center-center" style="margin-left:auto;margin-right:auto;width:100%;margin-top:16px;">
              <div style="width: 300px;margin-left:32px;margin-right: 174px; ">
                <mwc-textarea outlined="" label="Your story"
                    helper="Share your story anonymously" helperpersistent=""
                    maxlength="500"
                    charcounter="">
                </mwc-textarea>
                <mwc-button raised="" label="Add story"></mwc-button>
              </div>
              <div class="flex"></div>
              <div style="width: 300px">
                <mwc-textarea outlined="" label="Solution?"
                    helper="Can you think of a solution for the grievance" helperpersistent=""
                    maxlength="500"
                    charcounter="">
                </mwc-textarea>
                <mwc-button raised="" label="Add solution"></mwc-button>
              </div>
            </div>
          </div>
        ` : null}
      </div>
    `;
  }

  _openGrievance() {
    if (!this.fullView) {
      this.fire("open-grievance", this.grievanceData);
      this._getAndSetupChart();
    }
  }

  firstUpdated() {
    super.firstUpdated();
    const lineChartElement = this.shadowRoot.getElementById("line-chart");

    fetch(`/api/trends/getTopicTrends?topic=${this.grievanceData.topicName}`, {
      headers: {
        'Content-Type': 'application/json'
      },
    }).then( response => response.json()).
    then( (responses) => {
      this.responses = responses;
      const yearLabels = [];
      const counts = [];

      for (let i=0;i<responses.length;i++) {
        yearLabels.push(responses[i].key_as_string.split("-")[0]);
        const docCount = responses[i].doc_count;
        counts.push(docCount)
      }

      new Chart(lineChartElement, {
        type: 'line',
        data: {
          labels: yearLabels,
          datasets: [{
            data: counts,
            label: this.grievanceData.topicName,
            borderColor: this.grievanceData.dataSet.borderColor,
            fill: false
          }]
        },
        options: {
          title: {
            display: false,
            text: 'Trends'
          }
        }
      })
    });
  }

  updated(changedProps) {
    super.updated(changedProps);
    if (changedProps.has('responses')) {
      setTimeout(()=>{
        //this._setupChart();
      }, 200)
    }
  }
}

