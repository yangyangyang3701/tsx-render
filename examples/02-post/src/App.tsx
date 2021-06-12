const list = ["a", "b", "c"];
const App = () => {
    return (
        <div>
            {list.map((i) => (
                <div key={i}>{i}</div>
            ))}
        </div>
    );
};

export default App;
