import Hello from "./components/Hello";

const list = ["a", "b", "c"];
const App = () => {
    return (
        <div>
            {list.map((i) => (
                <Hello name={i} />
            ))}
        </div>
    );
};

export default App;
