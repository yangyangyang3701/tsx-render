# Solidjs Reactivity to Rendering 翻译

> From https://indepth.dev/posts/1289/solidjs-reactivity-to-rendering

[反应性]: reactivity

We've seen reactivity make its mark in several JavaScript UI frameworks from React to Angular and everything in between.

我们已经看到[反应性]从 React 到 Angular 等多个库之间留下了印记

Perhaps you've used MobX in a React project, or wired up reactive templates in Vue.

也许你在 React 项目中使用过 MobX，或者在 Vue 中使用过响应式模板。

Maybe you've used RxJS with Angular.

也许你已经在 Angular 中使用过 RxJS。

Or had Svelte compile its reactive system into your unsuspecting code.

或者让 Svelte 将其反应式系统编译成你信任的代码。

SolidJS is a UI rendering library that takes the unique approach of being completely built on top of a reactive system.

SolidJS 是一个 UI 渲染库，它采用完全建立在反应式系统之上的独特方法。

It isn't just some way to automate state management.

这不仅仅是自动化状态管理的某种方式。

It is the renderer, the components, every aspect of how the library works.

它是渲染器、组件以及库工作方式的各个方面。

As it turns out this approach is performant. I mean really performant:
事实证明，这种方法是高效的。 我的意思是真正的高性能：

Note: VanillaJS and WASM-Bindgen are both reference implementations for JavaScript and WASM respectively. 

注意：VanillaJS 和 WASM-Bindgen 分别是 JavaScript 和 WASM 的参考实现。

They use the most optimal handcrafted code to perform the benchmarks without using a library.
他们使用最优化的手工代码在不使用库的情况下执行基准测试。

It also lends to really powerful composition patterns. 
它还提供了非常强大的构图模式。

Each reactive primitive is atomic and composable. 
每个反应原语都是原子的和可组合的。

But more importantly only accountable to the reactive life-cycle.
但更重要的是只对反应式生命周期负责。

So no "Hook Rules". No this bindings. No consideration around stale closures.
所以没有“钩子规则”。 没有这些绑定。 不考虑过时的关闭。

But it is often unclear how we can get from the easy example of automatically triggering a console.log to fully updating views.

So today I want to show you how you can build a whole renderer with nothing but a reactive system. How we can go from that intro article demo to a full featured library like Solid:

```
const Greeting = (props) => (
  <>Hi <span>{props.name}</span></>
);

const App(() => {
  const [visible, setVisible] = createSignal(false),
    [name, setName] = createSignal("Josephine");

  return (
    <div onClick={() => setName("Geraldine")}>{
      visible() && <Greeting name={ name } />
    }</div>
  );
});

render(App, document.body);
```

Reactive Effects
The first thing to know is that reactivity is not in itself a system or solution. It's a means to modelling a problem. You can solve many problems with reactivity and those solutions may have their advantages or disadvantages depending on the chosen solution.

So there is no silver bullet here. It isn't something that is innate to reactivity. Reactivity has real performance cost at creation time and if you are not careful can turn your software into an imploding mess of cascading updates. But more on that later.

Hopefully you've had a chance to try out a reactivity system so that this example looks familiar to you:

```
const [name, setName] = createSignal("John");

createEffect(() => console.log(`Hi ${name()}`)); // prints: Hi John

setName("Julia") // prints: Hi Julia

setName("Janice") // prints: Hi Janice
```

I'm using Solid's syntax here but Vue, MobX, React, Knockout, and Svelte all have variations. We create a simple reactive atom(signal) with the value of "John". We then create a side effect producing computation that tracks whenever name updates and logs to the console a greeting. At the time we set a new name value that effect re-runs logging new greetings in our console.

If this looks unfamiliar or you are interested in how that works please check out Finding Fine-Grained Reactive Programming.

So if we are going to render the DOM really we should just view it too as a side effect:

```
const [name, setName] = createSignal("John");

const el = document.createElement("div");
createEffect(() => el.textContent = `Hi ${name()}`);
// <div>Hi John</div>

setName("Julia") // <div>Hi Julia</div>

setName("Janice") // <div>Hi Janice</div>
```

In some ways that's the whole story. We created a DOM element and wire the updates. If we wanted to update an attribute or a class we could do something very similar.

```
const [selected, setSelected] = createSignal(false);

const el = document.createElement("div");
createEffect(() => el.className = selected() ? "selected" : "");
// <div></div>

setSelected(true) // <div class="selected"></div>
```

Of course, this experience would not lend particularly well to large complicated applications. We need to address a few more things before we'd be able to call this a renderer.

Composition
The first problem is that this doesn't really scale if we can not modularize the approach. While we can create DOM elements and effects to update these elements, eventually we are going to hit a point where where we need to conditionally append or remove elements.

```
const [visible, setVisible] = createSignal(false);

const el = document.createElement("div");
createEffect(() => {
  if (visible()) {
    const text = document.createTextNode("Hi "),
      el2 = document.createElement("span");
    el2.textContent = "Joseph";
    el.appendChild(text);
    el.appendChild(el2);
  } else el.textContent = "";
});
// <div></div>

setVisible(true); // <div>Hi <span>Joseph</span></div>
setVisible(false); // <div></div>
```

If we want we can even abstract that out to a function. A component of sorts. In the following our component even has the ability to pass the name in to be rendered:

```
function Greeting(props) {
  const text = document.createTextNode("Hi "),
    el = document.createElement("span");
  el.textContent = props.name;
  return [text, el]; // A fragment... :)
}

const [visible, setVisible] = createSignal(false);

const el = document.createElement("div");
createEffect(() => {
  if (visible()) {
    el.append(...Greeting({ name: "Joseph" }));
  } else el.textContent = "";
});
// <div></div>

setVisible(true); // <div>Hi <span>Joseph</span></div>
setVisible(false); // <div></div>
```

And this brings us to our first challenge. What if we wish the name to be changed dynamically?

Well, we need to make the name into a signal so that we can track the change. But this has some repercussions when the greeting is visible. Simply tracking and updating will trigger the whole effect. Re-running it will recreate the component and append the nodes again! We need to avoid this.

Where a Virtual DOM library like Vue could just recreate the virtual representation and diff it at will we have a real cost here of creating DOM nodes. While we could always just replace the content on update this would be very expensive comparatively.

Libraries like Svelte handle this by compiling each component into basically 2 functions. A create path and an update path. So on create it runs the initial code. But whenever the reactive system triggers it runs the update path instead.

This as a compiled approach can work well but it requires more consideration around components since when executed a child component is either created, marked for update due to prop changes, or left as is. This is because dynamic children's creation code execution may still fall under their parents update path.

Alternatively, the easiest way to solve this issue, which many reactive systems support naturally, is to nest effects. Since the reactive scope is more or less a stack it is only the currently running computation that is actually tracking. So we could update our component to:

```
function Greeting(props) {
  const text = document.createTextNode("Hi "),
    el = document.createElement("span");
  createEffect(() => el.textContent = props.name());
  return [text, el]; // A fragment... :)
}
```

This does have one gotcha. The observer pattern as used by these reactive libraries has the potential to produce memory leaks. Computations that subscribe to signals that out live them are never released as long as the signal is still in use. Whenever the signal updates these computations will execute again even if not referenced anywhere.

This also has the downside of keeping old DOM element references in closures when it comes to DOM side effects. So we need to manage their disposal. But luckily this isn't the hardest problem to solve.

Reactive Roots
If you think about it, every time the parent effect re-runs we will be re-creating everything created during that function's execution. So on creation we can register all computations created under that scope the same way we track dependencies. And on re-running or disposal in the same way we unsubscribe from all dependencies we dispose those computations as well.

We can do this mostly transparently from the end consumer as long as we have a way to gather top-level computations. For this we need our application to be run within a reactive root:

```
function Greeting(props) {
  const text = document.createTextNode("Hi "),
    el = document.createElement("span");
  createEffect(() => el.textContent = props.name());
  return [text, el]; // A fragment... :)
}

const rendered = createRoot(() => {
  const [visible, setVisible] = createSignal(false),
    [name, setName] = createSignal("Josephine");

  const el = document.createElement("div");
  createEffect(() => {
    if (visible()) {
      el.append(...Greeting({ name }));
    } else el.textContent = "";
  });

  return el;
});

document.body.appendChild(rendered);
```

Roots also give us the ability to arbitrarily control disposal by injecting themselves as owner. For Solid the dispose method is an optional parameter of the createRoot function. This can be useful more complicated memoization.

```
let dispose = [],
  mapped = [],
  prevList = [];

onCleanup(() => {
  for(const d of dispose) d();
});

let parent = document.createElement("div");
createEffect(() => {
  const list = signal(),
    nextDispose,
    nextMapped;
  for(const [index, item] of list.entries()) {
    const prevIndex = prevList.findIndex(item);

    // move to new position
    if (prevIndex > -1) {
      nextMapped[index] = mapped[prevIndex];
      nextDispose[index] = dispose[prevIndex];
      dispose[prevIndex] = null;
    } else {
      // create new row
      createRoot(disposer => {
        dispose[index] = disposer;
        nextMapped[index] = createFn(item);
      });
    }
  }
  // cleanup unused nodes skipping holes
  for(const d of dispose) d && d();

  dispose = nextDispose;
  mapped = nextMapped;
  prevList = list;

  // naive replace
  parent.textContent = "";
  parent.append(...mapped);
})
```

Above is a very naive implementation of a reactive map like that you would use to map over a list of items and turn them into DOM nodes in a view. This effect runs over and over whenever the list changes but it is careful not to recreate DOM nodes that have been created in previous runs.

Usually re-running the effect would release all child computations but because each is created in its own root we manually control the disposal of only rows that were removed.

In addition, this example introduces onCleanup, a method to schedule disposal when the parent is disposed of or re-runs. This small tie in to the reactive execution life-cycle gives us the final piece to manage other side effects of the reactive system that live outside of the core rendering.

At this point we have most of the tools we need to efficiently render our views. We can:

Handle creation and update of DOM nodes
Handle the disposal of nested conditional and dynamic flows
Have the means to modularize our code
However, there are still improvements that can be made to enhance performance and experience.

Reactive Memoization
Derivations are common in reactive libraries as they give us the ability to automatically derive a value from other signals. In many libraries these are called computed's since they are a pure computation that returns a new value.

But from a nested rendering perspective you can view them a bit differently. Upon executing when re-evaluating an effect these functions don't re-run and just return the cached value from their previous run. This is why in Solid I refer to them as memos.

While they are mostly unnecessary from the perspective that if they are being read from an effect anyway there is no need to wrap in an additional reactive primitive, they let us do expensive work once. This is great for things like DOM or component creation.

```
function MyList() {
  const [list, setList] = createSignal(["Anita", "Andrew", "A.J."]),
    [visible, setVisible] = createSignal(false),
    nodes = createMemo(map(list, (item) => {
      const li = document.createElement("li");
      li.textContent = item;
      return li;
    }));

  const el = document.createElement("ul");
  createEffect(() => {
    if (visible()) {
      el.append(...nodes());
    } else el.textContent = "";
  });
  return el;
}
```

Imagine map is a function similar to the last example of the previous section that reactively mapped a list to DOM nodes. But instead of appending them it returns those nodes in a function call.

Without the createMemo every time visible's value changes to true we'd be re-running the function. Sure it might not find any differences and not create any new DOM nodes but it would still iterate over that list and do all the lookups and comparisons.

Instead whenever visible changes to true and nodes is called it just returns the results of the last run. It is only when list changes is the more expensive routine is run again.

Returning to our original example. Consider what happens if we use a condition instead of a simple boolean:

```
const rendered = createRoot(() => {
  const [count, setCount] = createSignal(0),
    [name, setName] = createSignal("Josephine");

  const el = document.createElement("div");
  createEffect(() => {
    if (count() > 5) {
      el.append(...Greeting({ name }));
    } else el.textContent = "";
  });

  return el;
});

document.body.appendChild(rendered);
```

Every time count changes we re-run the effect. Sure when it is under 6 we aren't doing much damage, but 6, 7, 8, 9... We keep on recreating the child component and those DOM nodes.

A more interesting use of memos are when configured to only notify when their value changes they can be used in the exact opposite way. They serve as powerful tool to isolate cheaper calculations that are nested inside more expensive computations that don't wish to re-run unless things have actually changed.

```
const rendered = createRoot(() => {
  const [count, setCount] = createSignal(0),
    [name, setName] = createSignal("Josephine"),
    // memo with equality comparator
    visible = createMemo(() => count() > 5, undefined, (a, b) => a === b);

  const el = document.createElement("div");
  createEffect(() => {
    if (visible()) {
      el.append(...Greeting({ name }));
    } else el.textContent = "";
  });

  return el;
});

document.body.appendChild(rendered);
```

This more or less gets us back to the original behavior where only when count passes the threshold and the results change from false to true or vice versa do we re-run our effect.

Components
We have already explored composition a bit earlier but we should revisit it at this point using what we've learned so far. So what is a component in a system like this?

Well you've already seen them. Simply a function. This pattern of composing reactive primitives in the same way one composes Hooks is all you really need. onCleanup gives us the ability to handle life cycles.

All a component is, is a factory function that generates DOM nodes that are tied to state through function closures of effectful functions. But there are a few other considerations here.

Reactive Isolation
Earlier when we first looked at making our Greeting component update its name dynamically we thought about doing the following but it had the side effect of recreating our component each time:

```
function Greeting(props) {
  const text = document.createTextNode("Hi "),
    el = document.createElement("span");
  el.textContent = props.name(); // reactive access will be tracked upstream
  return [text, el]; // A fragment... :)
}
```

We should consider protecting against that. Most reactive libraries have an ignore or untracked function. In Solid I call it sample. This function creates a new scope where reactive signals are not tracked. It is useful to use this as a way to ensure access outside of your effects and memos do not trigger upstream re-rendering replacing who knows how much of your view on a whim.

So wrapping your components in sample is definitely a prudent precaution. It also let's you safely access reactive variables not under an effect if you desire them to intentionally not be dynamic.

Universal Props
What if the consumer of your Greeting component doesn't have a need for a dynamic name and just passes a string. Well it's a bit awkward to check everywhere if it's a function or not. What if you want to use more modern reactive accessors like proxies?

Well one approach that many libraries do is encourage checking with an isObservable function. But it still requires consideration. An approach that lets the component author not worry about this would be to regulate the props object.

Simply mapping wrapped functions to getters on the props allows universal access. Consider:

```
const props1 = {
  name: "Jacob"
}

const [name, setName] = createSignal("Jacob");
const props2 = {
  get name() { return name() }
}

function Greeting(props) {
  const text = document.createTextNode("Hi "),
    el = document.createElement("span");
  createEffect(() => el.textContent = props.name);
  return [text, el]; // A fragment... :)
}

Greeting(props1); // <div>Hi <span>Jacob</span></div>

Greeting(props2); // <div>Hi <span>Jacob</span></div>
```

The component writer decides if props.name is to be used dynamically but accesses it the same way. The consumer passes in props in a consistent way. Now you are probably thinking that you could avoid creating that effect altogether if you know the prop isn't dynamic but we can also tell that when no subscriptions are made after first execution. This effect can never update so it can be removed.

Still wrapping seems like work. But we can accomplish that (and sample) with a helper. Either explicitly or through detecting functions we can transform our props and call our component as desired.

```
function dynamicProperty(props, key) {
  const src = props[key];
  Object.defineProperty(props, key, {
    get() {
      return src();
    },
    enumerable: true
  });
}

function createComponent(Comp, props, dynamicKeys) {
  if (dynamicKeys) {
    for (let i = 0; i < dynamicKeys.length; i++)
      dynamicProperty(props, dynamicKeys[i]);
  }
  return sample(() => Comp(props));
}
```

Dynamic Components
If our pattern is to create real DOM nodes and effects and return those nodes one might wonder how do you ever return something that can change without having access to the parent?

Like any runtime function based creation method, like HyperScript, or React.createElement things get executed inside out. Or in another words we generally finish creating the children before the parent.

The answer to this, like everything else as you soon will see, is to lazy evaluate. Simply returning a function gives control back to the parent when to create is incredibly powerful.

```
// conditional component that renders props.children
// when props.test === true
function iff(props) {
  comst cond = createMemo(() => props.test, undefined, (a, b) => a === b);

  return () => cond() ? props.children : undefined;
}

iff({ test: () => count() > 5, children: () => Greeting({ name }) })
```

Of course this means our el.append won't hold up any longer. So let's look at how we put this all together.

Templating
Right about now we actually have pretty much all we need to wire up some performant reactive views by hand. But let's face it. That's a lot of work. At this point we could probably just use plain old vanilla JavaScript and wire up these examples easy enough.

So the final piece is templating to make our lives easier so we don't have to manually write all this code. There a few options.

We can wrap all element and Component creation in a HyperScript h function and it can determine from the input what code path in web of iteration and conditionals to run, for a purely runtime approach.
We can at runtime analyze a string or Tagged Template Literal to using dynamic code generation to create code that resembles the examples above.
We can use a Custom Parser or JSX template at compile time to generate code similar to what we've seen so far.
With Solid I support all 3. But they each have their own tradeoffs.

The first is definitely the simplest but will always be a dog to other optimized runtime only approaches since you do all the same things but pay higher creation cost. Nothing can be inferred as you only realize structure as functions execute. Also it's just JavaScript so you end up wiring a bit more yourself.

The second always has feasible limitations. Using strings you have a restrictive DSL especially for expressions unless you are bringing in your own sophisticated parser which costs bytes. Tagged Template Literals put expression execution out in the open, so you still have to careful to wrap your own expressions.

For this reason a custom DSL or JSX is highly desirable because through analysis we can generate almost verbatim the code in these examples. We can automatically handle identifying and wrapping dynamic expressions. We can detect which code is used to selectively import it to utilize tree-shaking. This approach is both the smallest and the fastest.

But I'm not going to take you through creating a Babel plugin. Instead we are going to look at the last few helpers necessary to support all these approaches.

Insert
The first is how we insert content. As mentioned element.append won't hold up. Things are definitely more complicated when there are ranges under the same parent but I'm going to keep my code examples to the simple case.

We can insert text, a node, a function, or an array of those. Text and nodes are pretty simple. We can just replace what is there with the new value.

```
function insert(parent, value, current) {
  if (value === current) return current;
  const t = typeof value;

  if (t === "string" || t === "number") {
    if (t === "number") value = value.toString();
    current = parent.textContent = value;
  } else if (value == null || t === "boolean") {
    current = parent.textContent = "";
  /*... Handle functions and arrays ... */
  } else if (value instanceof Node) {
    if (Array.isArray(current)) {
      parent.textContent = "";
      parent.appendChild(value);
    } else if (current == null || current === "") {
      parent.appendChild(value);
    } else parent.replaceChild(value, parent.firstChild);
    current = value;
  } else console.warn(`Skipped inserting ${value}`);

  return current;
}
```

However functions and arrays are trickier. Mostly because functions are trickier and arrays can contain them.

Arrays do need to be reconciled and there are number of algorithms out there. Since this is a piece that all rendering approaches (VDOM, Single Pass Reconciling, or Reactive) have in common I won't cover it here.

But functions are really the key to putting this all together. As I mentioned earlier most runtime techniques execute inside out more or less.

VDOM libraries don't care since after they create the Virtual DOM they do a second pass to diff. Single Pass Reconcilers tend to put heavy boundaries on components so they can break apart execution so they have clear top down anchor points.

But for reactivity that needs to run under a scope we need a different way. The approach I use is recursive reactive layering. Consider that the function part of the insert function looks like:

```
// at top of function:
while (typeof current === "function") current = current();

// in the conditional
if (t === "function") {
  createEffect(() => (current = insert(parent, value(), current)));
  return () => current;
}
```

If you pass a function in it creates an effect that tracks it's own child insert. In so regardless what the function returns it knows how to handle inserting the new value.

But what gets interesting is what if that function also returns a function. We end up nesting effects isolating their updates from each other like we did earlier and they are executing in top down order. So no matter how many nested dynamic components there are stacked they will each only re-evaluate at their level and downwards.

Arrays with dynamic parts work similarly except we attempt to flatten the values at each level into a single array. This where memos are especially useful since if a layer updates due to one branch of the fragment you don't want to re-evaluate the others necessarily.

At the deepest layer where all values are resolved we can then diff with the DOM and apply our changes.

Spread
This is the other runtime method with some complexity. While named properties that are passed can be analyzed spreads have to be done at runtime. Which means they are always dynamic in some sense. You loop over long set of conditionals that perform various updates all wrapped in an effect.

```
function spread(node, props) {
  let = prevProps = {};
  createEffect(() => {
    let info,
      p = props();
    for (const prop in p) {
      if (prop === "children") {
        insert(node, props.children);
        continue;
      }
      const value = props[prop];
      if (value === prevProps[prop]) continue;
      if (prop === "style") {
        style(node, value, prevProps[prop]);
      } else if (prop === "ref") {
        value(node);
      } else if ((info = Attributes[prop])) {
        if (info.type === "attribute") {
          node.setAttribute(prop, value);
        } else node[info.alias] = value;
      } else if (prop.indexOf("-") > -1 || prop.indexOf(":") > -1) {
        node.setAttribute(
          prop.replace(/([A-Z])/g, g => `-${g[0].toLowerCase()}`),
          value
        );
      } else node[prop] = value;
    }
    prevProps = p;
  });
}
```

There is a helper here to handle diffing style objects and we use insert here to handle children. There is a lookup for known attribute names like class or for to properly set them.

In the case of compiled approaches like JSX unless the end-user spreads on HTMLElements we do not need to include this code. But with what we have it's pretty easy to make a simple HyperScript h function.

```
function h(...args) {
  let e;
  function item(l) {
    const type = typeof l;
    if (l == null) void 0;
    else if ("string" === type) {
      // create element tag
      if (!e) e = document.createElement(l);
      // create child text node
      else e.appendChild(document.createTextNode(l));
    // simple non-string value
    } else if ("number" === type ||
      "boolean" === type ||
      l instanceof Date ||
      l instanceof RegExp) {
      e.appendChild(document.createTextNode(l.toString()));
    // insert element or array
    } else if (l instanceof Element || Array.isArray(l)) {
      insert(e, l);
    // spread element attributes
    } else if ("object" === type) {
      spread(e, l);
    } else if ("function" === type) {
      // component
      if (!e) {
        let props = {}, dynamic = [], next = args[0];
        // grab props object if present
        if (
          typeof next === "object"
          && !Array.isArray(next)
          && !(next instanceof Element)
        )
          props = args.shift();

        // test for dynamic expressions
        for (const k in props) {
          if (typeof props[k] === "function") dynamic.push(k);
        }

        // handle children
        props.children = args.length > 1 ? args : args[0];
        if (
          props.children
          && typeof props.children === "function"
          && !props.children.length
        )
          dynamic.push("children");

        // create the component
        e = createComponent(l, props, dynamic);
        args = [];
      // dynamic function expression
      } else insert(e, l);
    }
  }

  // evaluate arguments
  while (args.length) item(args.shift());
  // return element
  return e;
}
```

That's more or less it. Using insert, spread, and createComponent we have what we need to finish our template DSL.

And now we can update our example to HyperScript and add a click handler for good measure:

```
function Greeting(props) {
  return ["Hi ", h("span", () => props.name)];
}

const rendered = createRoot(() => {
  const [visible, setVisible] = createSignal(false),
    [name, setName] = createSignal("Josephine");

  return h(
    "div",
    { onclick: () => setName("Geraldine")},
    () => visible() && h(Greeting, { name })
  );
});

document.body.appendChild(rendered);
```

Not exactly the JSX as seen at the beginning of the article, but more or less the same thing. We'd need to get into compilation which seems a good topic for another a day.

Wrap Up
Well color me impressed. You've made it to the end. We've created a reactive renderer with a runtime-only HyperScript template DSL.

You now hopefully have a better idea of how a reactive renderer can work. It's a lot of pattern matching, breaking things apart, and setting up safeguards for efficient rendering.

The code in this article won't all just piece together and work on its own either. I've cut a few places for simplicity and removed all the optimizations. But I believe we have covered all the core pieces.

Even compiled approaches like Solid's JSX and Svelte have similar code and tackle the same problems. They are just able to optimize more effectively. They can detect reactive expression, identify certain expression grammar, and group instructions in the most efficient way.

Well, it's been a long journey. Until next time.
