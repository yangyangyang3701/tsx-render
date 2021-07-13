import "reflect-metadata";
import { Container } from "inversify";
import Corn from "./Corn";
import Dispatcher from "./Dispatcher";
import TYPES from "./types";

var container = new Container();
container.bind<Corn>(TYPES.Corn).to(Corn);
container.bind<Dispatcher>(TYPES.Dispatcher).to(Dispatcher);

export default container;
