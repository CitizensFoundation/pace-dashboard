import express from "express";
//import Post from './post.interface';
const { Client } = require("@elastic/elasticsearch");

export class TrendsController {
  public path = "/api/trends";
  public router = express.Router();
  public esClient: typeof Client;

  /*private posts: Post[] = [
    {
      author: 'Marcin',
      content: 'Dolor sit amet',
      title: 'Lorem Ipsum',
    }
  ];*/

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.path + "/getTopicTrends", this.getTopicTrends);
    //    this.router.post(this.path, this.createAPost);
  }

  public setEsClient(esClient: typeof Client) {
    this.esClient = esClient;
  }

  getTopicTrends = async (
    request: express.Request,
    response: express.Response
  ) => {
    const body: any = {
      aggs: {
        "2": {
          date_histogram: {
            field: "createdAt",
            calendar_interval: "1y",
            time_zone: "Atlantic/Reykjavik",
            min_doc_count: 1,
          },
        },
      },
      size: 0,
      stored_fields: ["*"],
      script_fields: {},
      docvalue_fields: [{ field: "createdAt", format: "date_time" }],
      _source: { excludes: [] },
      query: {
        bool: {
          must: [],
          filter: [
            { match_all: {} },
            { match_phrase: { topic: request.query.topic } },
            {
              range: {
                createdAt: {
                  gte: "2006-03-01T01:57:35.660Z",
                  lte: "2021-03-01T01:57:35.660Z",
                  format: "strict_date_optional_time",
                },
              },
            },
          ],
          should: [],
          must_not: [],
        },
      },
    };

    try {
      const result = await this.esClient.search({
        index: "urls",
        body: body,
      });
      response.send(result.body.aggregations["2"].buckets);
      console.log(result);
    } catch (ex) {
      console.error(ex);
      response.sendStatus(500);
    }

  };

  createAPost = (request: express.Request, response: express.Response) => {
    //    const post: Post = request.body;
    //    this.posts.push(post);
    //    response.send(post);
  };
}
