import Hello from "./components/Hello";

const list = ["a", "b", "c"];
const App = () => {
    return (
        <div>
            <Hello name="World" />
            {list.map((i) => (
                <div key={i}>{i}</div>
            ))}
        </div>
    );
};

export default App;
