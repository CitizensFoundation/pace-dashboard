import { LitElement, html, css } from 'lit-element';
import '../../your-grievances-app/src/shadow-styles.js';
import { ShadowStyles } from '../../your-grievances-app/src/shadow-styles.js';
import { BaseElement } from '../../your-grievances-app/src/baseElement.js';
import '@material/mwc-textarea';
import '@material/mwc-icon';
import '@material/mwc-button';
import '@material/mwc-linear-progress';
import { FlexLayout } from '../../your-grievances-app/src/flex-layout.js';
import { Data, DataLabels } from '../../your-grievances-app/src/data.js';

export class Grievance extends BaseElement {
  static get styles() {
    return [
      FlexLayout,
      ShadowStyles,
      css`
        :host {
          display: block;
          background-color: #fff;
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

        mwc-icon {
          position: absolute;
          left: 16px;
          top: 16px;
          height: 96px;
          width: 96px;
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

        .quotesTitle {
          padding: 16px;
          margin-top: 8px;
          margin-bottom: 8px;
          font-size: 20px;
          text-align: center;
        }

        .quoteHeader {
          padding: 16px;
          margin-top: 8px;
          margin-bottom: 8px;
          background-color: #f0f0f0;
          font-size: 20px;
        }

        .quoteParagraph {
          font-size: 14px;
          padding: 16px;
        }

        mwc-icon {
          color: #000;
        }

        a {
          color: #444;
        }
      `,
    ];
  }

  static get properties() {
    return {
      grievanceData: { type: Object },
      fullView: { type: Boolean },
      responses: { type: Array },
      topicQuotes: { type: Array },
    };
  }

  render() {
    return html`
      <div class="mdc-card shadow-animation shadow-elevation-3dp" @click="${this._openGrievance}">
        <div class="mdc-card__primary-action">
          <div class="mdc-card__media mdc-card__media--16-9 my-media"></div>
          <div class="content">
            <h2 class="mdc-typography--title contentTitle">${this.grievanceData.title}</h2>
            <div class="mdc-typography--body1 subtext contentText">
              ${this.grievanceData.description}
            </div>
          </div>
          <canvas id="line-chart" width="800" height="200"></canvas>
          ${ (this.fullView && !this.topicQuotes) ? html`
            <mwc-linear-progress indeterminate></mwc-linear-progress>
          ` : html``}
          ${ this.topicQuotes ? html`
            <div class="layout-inline vertical center-center">
              <div class="quotesTitle">Random quotes</div>
              ${ this.topicQuotes.map( quote => {
              return html`
                <div class="quoteHeader">${quote.year}</div>
                <div class="quoteParagraph">${quote.paragraph}</div>
              `
              })}
            </div>` : html`` }
          <mdc-ripple></mdc-ripple>
        </div>
        ${this.fullView
          ? html`
              <mwc-icon
                @click="${() => {
                  this.fire('close-grievance');
                }}"
              >close</mwc-icon>
            `
          : null}
      </div>
    `;
  }

  _openGrievance() {
    if (!this.fullView) {
      this.fire('open-grievance', this.grievanceData);
    }
  }

  _normalizeMap(min, max) {
    const delta = max - min;
    return function (val) {
        return (val - min) / delta;
    };
  }

  _normalizeArray(array, min, max) {
    return array.map(this._normalizeArray(0,1))
  }

  // The cummulative new content for each year in bytes
  _normalizeDocCount(year, docCount) {
    const commonCrawlYearlyVolume = {
      2014: 17962282340,
      2015: 14729052874,
      2016: 13747297828,
      2017: 34805442487,
      2018: 33851429206,
      2019: 29302879071,
      2020: 24313704452
    }

    const fraction = docCount/(commonCrawlYearlyVolume[year]/13747297828);

    return fraction;
  }

  firstUpdated() {
    super.firstUpdated();
    const lineChartElement = this.shadowRoot.getElementById('line-chart');

    fetch(`/api/trends/getTopicTrends?topic=${this.grievanceData.topicName}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(responses => {
        responses.shift();
        this.responses = responses;
        const yearLabels = [];
        const counts = [];
        const years = {};

        for (let i = 0; i < responses.length; i++) {
          const yearLabel = responses[i].key_as_string.split('-')[0];
          yearLabels.push(yearLabel);
          const docCount = this._normalizeDocCount(parseInt(yearLabel), responses[i].doc_count);
          years[responses[i].key_as_string.split('-')[0]] = docCount;
          counts.push(docCount);
        }

        this.fire('years-and-counts', { topicName: this.grievanceData.topicName, years });

        new Chart(lineChartElement, {
          type: 'line',
          data: {
            labels: yearLabels,
            datasets: [
              {
                data: counts,
                label: `${this.grievanceData.topicName} - trend over time`,
                borderColor: this.grievanceData.dataSet.borderColor,
                fill: false,
              },
            ],
          },
          options: {
            plugins: {
              tooltip: {
                  enabled: false,
              }
            },
            scales: {
                y: {
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function(value, index, values) {
                            return "";
                        }
                    }
                }
            }
          }
        });
      });

    if (this.fullView) {
      fetch(`/api/trends/getTopicQuotes?topic=${this.grievanceData.topicName}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(topicQuotes => {
          const years = {
            "2013": "No data yet",
            "2014": "No data yet",
            "2015": "No data yet",
            "2016": "No data yet",
            "2017": "No data yet",
            "2018": "No data yet",
            "2019": "No data yet",
            "2020": "No data yet"
          }

          for (let i=0;i<topicQuotes.length;i++) {
            const yearPart = topicQuotes[i]._source.createdAt.split("-")[0];
            years[yearPart] = topicQuotes[i]._source.paragraph;
          }

          if (this.grievanceData.topicName=="Qanon") {
            years["2013"]="Not enough data";
            years["2014"]="Not enough data";
            years["2015"]="Not enough data";
            years["2016"]="Not enough data";
          }

          if (this.grievanceData.topicName=="Nanny state") {
            years["2013"]="Not enough data";
            years["2014"]="Not enough data";
            years["2015"]="Not enough data";
            years["2016"]="Not enough data";
            years["2017"]="Not enough data";
            years["2018"]="Not enough data";
            years["2019"]="Not enough data";
            console.error(this.grievanceData.topicName)
          }

          const flatTopicQuotes = [];
          for (const year in years) {
            flatTopicQuotes.push({ year: year, paragraph: years[year] });
          }

          this.topicQuotes = flatTopicQuotes;
        });
    }
  }

  updated(changedProps) {
    super.updated(changedProps);
    if (changedProps.has('responses')) {
      setTimeout(() => {
        //this._setupChart();
      }, 200);
    }
  }
}
