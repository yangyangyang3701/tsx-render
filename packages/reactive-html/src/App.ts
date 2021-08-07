import Hello from "./components/Hello";
import { hyperX } from "./lib/hyper";

const App = () => {
    const el = hyperX(Hello);
    return el;
};

export default App;
