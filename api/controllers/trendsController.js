"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrendsController = void 0;
const express_1 = __importDefault(require("express"));
//import Post from './post.interface';
class TrendsController {
    /*private posts: Post[] = [
      {
        author: 'Marcin',
        content: 'Dolor sit amet',
        title: 'Lorem Ipsum',
      }
    ];*/
    constructor() {
        this.path = '/api/trends';
        this.router = express_1.default.Router();
        this.getAllPosts = (request, response) => {
            //    response.send(this.posts);
        };
        this.createAPost = (request, response) => {
            //    const post: Post = request.body;
            //    this.posts.push(post);
            //    response.send(post);
        };
        this.intializeRoutes();
    }
    intializeRoutes() {
        //    this.router.get(this.path, this.getAllPosts);
        //    this.router.post(this.path, this.createAPost);
    }
}
exports.TrendsController = TrendsController;
