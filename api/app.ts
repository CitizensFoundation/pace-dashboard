import express from 'express';
import bodyParser from 'body-parser';
import * as path from 'path';

export class App {
  public app: express.Application;
  public port: number;

  constructor(controllers: Array<any>, port: number) {
    this.app = express();
    this.port =  parseInt(process.env.PORT || "8000");

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(express.static(path.join(__dirname, '/../web-app')));

  }

  private initializeControllers(controllers: Array<any>) {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }
}
