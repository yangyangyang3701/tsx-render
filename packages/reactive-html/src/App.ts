import { createSignal } from "@idealjs/corn";
import Hello from "./components/Hello";
import { hyperX } from "./lib/hyper";

const App = () => {
    const [name] = createSignal<string>("App");
    const el = hyperX(Hello, () => ({
        children: ["I am ", name()],
    }));
    return el;
};

export default App;
