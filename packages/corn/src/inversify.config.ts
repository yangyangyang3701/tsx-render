import "reflect-metadata";
import { Container } from "inversify";
import Corn from "./Corn";
import TYPES from "./types";

var container = new Container();
container.bind<Corn>(TYPES.Corn).to(Corn);

export default container;
