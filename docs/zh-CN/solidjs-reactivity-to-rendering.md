# Solidjs Reactivity to Rendering 翻译

> From https://indepth.dev/posts/1289/solidjs-reactivity-to-rendering

[响应性]: reactivity

We've seen reactivity make its mark in several JavaScript UI frameworks from React to Angular and everything in between.

包括 React 和 Angular 在内的许多 JavaScript UI 框架都使用了响应性的概念。

Perhaps you've used MobX in a React project, or wired up reactive templates in Vue.

也许你已在 React 项目中使用过 MobX，或者在 Vue 中使用过响应式模板。

Maybe you've used RxJS with Angular.

甚至你也在 Angular 中使用过 RxJS。

Or had Svelte compile its reactive system into your unsuspecting code.

或者使用 Svelte 编译器将其响应式系统编译为值得信赖的代码。

SolidJS is a UI rendering library that takes the unique approach of being completely built on top of a reactive system.

SolidJS 是一个 UI 渲染库，它完全基于响应式系统而构建。

It isn't just some way to automate state management.

这不仅是一种自动管理状态的方式。

It is the renderer, the components, every aspect of how the library works.

它还是渲染器、组件以及库在运行时的各个依赖。

As it turns out this approach is performant. I mean really performant:

事实证明，此方式是高效的，而且是真正的高效：

Note: VanillaJS and WASM-Bindgen are both reference implementations for JavaScript and WASM respectively. 

注意：VanillaJS 和 WASM-Bindgen 分别是 JavaScript 和 WASM 的一种参考实现。

They use the most optimal handcrafted code to perform the benchmarks without using a library.

它们使用最优的手工代码执行基准测试，而非使用库。

It also lends to really powerful composition patterns. 

SolidJS 还提供了非常强大的组合模式。

Each reactive primitive is atomic and composable. 

每个响应式原语都是原子性且可组合的。

But more importantly only accountable to the reactive life-cycle.

更重要的它是只对响应式的生命周期负责。

So no "Hook Rules". No this bindings. No consideration around stale closures.

所以 SolidJS 没有“Hooks”规则， 没有this指针的绑定，也不考虑闭包。

But it is often unclear how we can get from the easy example of automatically triggering a console.log to fully updating views.

举例而言，我们通常不清楚如何通过自动触发一个`console.log` 来完全更新视图。

So today I want to show you how you can build a whole renderer with nothing but a reactive system. How we can go from that intro article demo to a full featured library like Solid:

在此，将介绍如何使用响应式系统来构建一个完整的渲染器，即从演示demo到一个类似Solid具备完整功能的库。以下是一个 Solid 程序例子：

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

首先应理解的是，响应式本身并非一个系统或解决方案，它是一种对问题进行建模的方法。我们可以用响应式解决许多问题，这些解决方案有其各自的优缺点。

So there is no silver bullet here. It isn't something that is innate to reactivity. Reactivity has real performance cost at creation time and if you are not careful can turn your software into an imploding mess of cascading updates. But more on that later.

对响应式而言，不存在通用的灵丹妙药。响应式方法在创建时便有性能开销，如果你不小心，可能会把你的软件变成一系列混乱部件的级联。下文会详细介绍此部分。

Hopefully you've had a chance to try out a reactivity system so that this example looks familiar to you:

如果已经有尝试过创建响应式系统，这个例子看起来会很熟悉:

```
const [name, setName] = createSignal("John");

createEffect(() => console.log(`Hi ${name()}`)); // prints: Hi John

setName("Julia") // prints: Hi Julia

setName("Janice") // prints: Hi Janice
```

I'm using Solid's syntax here but Vue, MobX, React, Knockout, and Svelte all have variations. We create a simple reactive atom(signal) with the value of "John". We then create a side effect producing computation that tracks whenever name updates and logs to the console a greeting. At the time we set a new name value that effect re-runs logging new greetings in our console.

我在此处使用的是Solid语法，Vue、MobX、React、Knockout和Svelte都有相应的变体。我们用“John”的值创建一个简单的响应式原子。然后，程序产生了一个副作用，该副作用追踪`name`何时更新，并将日志发送到控制台。当我们创建一个新的`name`值时，此副作用会向控制台重新发送记录。

If this looks unfamiliar or you are interested in how that works please check out Finding Fine-Grained Reactive Programming.

如果你对此部分内容不熟悉，或者对其工作原理感兴趣，请查看博客Finding Fine-Grained Reactive Programming。

So if we are going to render the DOM really we should just view it too as a side effect:

所以如果要渲染DOM，我们也应该把它看作是一个副作用:

```
const [name, setName] = createSignal("John");

const el = document.createElement("div");
createEffect(() => el.textContent = `Hi ${name()}`);
// <div>Hi John</div>

setName("Julia") // <div>Hi Julia</div>

setName("Janice") // <div>Hi Janice</div>
```

In some ways that's the whole story. We created a DOM element and wire the updates. If we wanted to update an attribute or a class we could do something very similar.

在某种程度上，这便是整个内容。我们创建了一个DOM元素并连接更新。如果我们想要更新属性或类，可以做一些类似的操作：

```
const [selected, setSelected] = createSignal(false);

const el = document.createElement("div");
createEffect(() => el.className = selected() ? "selected" : "");
// <div></div>

setSelected(true) // <div class="selected"></div>
```

Of course, this experience would not lend particularly well to large complicated applications. We need to address a few more things before we'd be able to call this a renderer.

当然，这种方式不适用于大型复杂的应用。在我们调用这个渲染器之前，我们需要解决更多的事情。

Composition
The first problem is that this doesn't really scale if we can not modularize the approach. While we can create DOM elements and effects to update these elements, eventually we are going to hit a point where where we need to conditionally append or remove elements.

首要的问题是，如果我们不能将方法模块化，就不能真正地进行扩展。虽然我们可以创建DOM元素和effects来更新这些元素，但最终我们仍需要有条件地添加或移除元素。

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

如果我们愿意，甚至可以将其抽象成一个函数，即某种组成成分。在下面的组件中，甚至能够传递`name`来进行渲染:

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

这就给带来了第一个挑战：如果我们希望动态地更改名称，该怎么办?

Well, we need to make the name into a signal so that we can track the change. But this has some repercussions when the greeting is visible. Simply tracking and updating will trigger the whole effect. Re-running it will recreate the component and append the nodes again! We need to avoid this.

我们得把`name`变成signal，这样我们就能追踪变化。但当greeting可见时，这会产生一些影响。简单地追踪和更新将触发整个页面的效果。重新运行它将会在此创建组件并再次添加节点。我们需要避免这种情况。

Where a Virtual DOM library like Vue could just recreate the virtual representation and diff it at will we have a real cost here of creating DOM nodes. While we could always just replace the content on update this would be very expensive comparatively.

我们在创建DOM节点时有实际成本，虽然我们可以在更新时替换内容，但相对而言，代价是非常昂贵的，而像Vue这样使用虚拟DOM的库可以重新创建DOM的虚拟表示并判断出变化。

Libraries like Svelte handle this by compiling each component into basically 2 functions. A create path and an update path. So on create it runs the initial code. But whenever the reactive system triggers it runs the update path instead.

像Svelte这样的库通过将每个组件编译成两个函数来处理这个问题：创建路径和更新路径。在创建时，它运行初始代码；当响应式系统被触发时，它就会转而运行更新路径。

This as a compiled approach can work well but it requires more consideration around components since when executed a child component is either created, marked for update due to prop changes, or left as is. This is because dynamic children's creation code execution may still fall under their parents update path.

这种编译方式可以很好地运行，但它需要对组件进行更多的考虑，因为当执行时，子组件要么被创建，要么因prop的变化而被标记为更新，要么保持原样。这是因为动态子程序的创建代码可能仍然在其父程序的更新路径之下。

Alternatively, the easiest way to solve this issue, which many reactive systems support naturally, is to nest effects. Since the reactive scope is more or less a stack it is only the currently running computation that is actually tracking. So we could update our component to:

或者，解决这个问题的最简单的方法是嵌套effect，这是许多响应式系统天生支持的。由于响应作用域是一个堆栈，实际上只追踪当前运行的计算。所以我们可以将组件更新为:

```
function Greeting(props) {
  const text = document.createTextNode("Hi "),
    el = document.createElement("span");
  createEffect(() => el.textContent = props.name());
  return [text, el]; // A fragment... :)
}
```

This does have one gotcha. The observer pattern as used by these reactive libraries has the potential to produce memory leaks. Computations that subscribe to signals that out live them are never released as long as the signal is still in use. Whenever the signal updates these computations will execute again even if not referenced anywhere.

这存在一个问题。这些响应式库使用的观察者模式有可能产生内存泄漏问题。只要signal仍在使用，就不会释放订阅信号signal的计算资源。每当signal更新时，这些计算将再次执行，即使没有任何引用。

This also has the downside of keeping old DOM element references in closures when it comes to DOM side effects. So we need to manage their disposal. But luckily this isn't the hardest problem to solve.

这也有一个缺点，当涉及DOM的副作用时，会将旧的DOM元素引用保留在闭包中。所以我们需要对它们进行清理。但幸运的是，这并不是最难解决的问题。

Reactive Roots
If you think about it, every time the parent effect re-runs we will be re-creating everything created during that function's execution. So on creation we can register all computations created under that scope the same way we track dependencies. And on re-running or disposal in the same way we unsubscribe from all dependencies we dispose those computations as well.

如果仔细思考，每次父效果重新运行时，我们都会重新创建在函数执行期间所创建的所有东西。所以在创建时，我们可以注册作用域中创建的所有计算，就像追踪依赖项一样。以同样的方式重新运行或处理时，我们取消所有依赖，也处理那些计算。

We can do this mostly transparently from the end consumer as long as we have a way to gather top-level computations. For this we need our application to be run within a reactive root:

只要我们有办法收集顶级计算，我们就可以从终端用户那里透明地完成这项工作。为此，我们需要我们的应用程序运行在一个响应式root:

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

Roots 还使我们能够任意控制disposal。对于Solid, dispose方法是createRoot函数的可选参数。这对于更复杂的记忆十分有用。

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

上面是响应式映射的一个非常简单的实现，您可以使用它来映射项目列表并将它们转换为视图中的DOM节点。每当列表更改时，这种效果就会重新运行，但它不重新创建在已存在的DOM节点。

Usually re-running the effect would release all child computations but because each is created in its own root we manually control the disposal of only rows that were removed.

通常，重新运行该效果会释放所有子计算，但因为每个子计算都是在自己的根中创建的，所以我们只能手动控制被删除的行的相关disposal。

In addition, this example introduces onCleanup, a method to schedule disposal when the parent is disposed of or re-runs. This small tie in to the reactive execution life-cycle gives us the final piece to manage other side effects of the reactive system that live outside of the core rendering.

此外，本例还引入了`onCleanup`方法，该方法用于在父进程被释放或重新运行时调度disposal。作为一个响应式执行生命周期的关联，它使我们能够管理核心渲染之外的响应式系统的副作用。

At this point we have most of the tools we need to efficiently render our views. We can:

在这一点上，我们已经拥有了有效渲染视图所需的大多数工具。我们可以:

Handle creation and update of DOM nodes

处理DOM节点的创建和更新

Handle the disposal of nested conditional and dynamic flows

处理嵌套条件流和动态流

Have the means to modularize our code

模块化我们的代码

However, there are still improvements that can be made to enhance performance and experience.

但是，仍然可以做一些改进来增强性能和体验。

Reactive Memoization
Derivations are common in reactive libraries as they give us the ability to automatically derive a value from other signals. In many libraries these are called computed's since they are a pure computation that returns a new value.

派生在响应式库中很常见，因为它们使我们能够从其它signal自动派生值。在许多库中，这些被称为`computed`，因为它们是返回新值的纯计算。

But from a nested rendering perspective you can view them a bit differently. Upon executing when re-evaluating an effect these functions don't re-run and just return the cached value from their previous run. This is why in Solid I refer to them as memos.

但是从嵌套渲染的角度来看，您可能会有一些不同的看法。在执行时，当重新计算effect时，这些函数不会重新运行，而只是返回上一次运行时缓存的值。这就是为什么在Solid中我把它们称为memos。

While they are mostly unnecessary from the perspective that if they are being read from an effect anyway there is no need to wrap in an additional reactive primitive, they let us do expensive work once. This is great for things like DOM or component creation.

尽管从此角度来看，它们一般不是必要的，如果它们是无论如何都要从effect中读取的，那么就不需要包装在额外的响应式原语中，但它们让我们一次性完成复杂的工作。这对于像DOM或组件创建来说非常有用。

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

假设`map`是一个类似于上一节最后一个示例中的函数，它响应式地将列表映射到DOM节点。但是，它不是将它们附加在函数调用中，而是通过函数调用将这些节点返回。

Without the createMemo every time visible's value changes to true we'd be re-running the function. Sure it might not find any differences and not create any new DOM nodes but it would still iterate over that list and do all the lookups and comparisons.

如果没有`createMemo`，那么每次`visible`的值变为true时，我们都会重新运行这个函数。当然，它可能不会发现任何差异，也不会创建任何新的DOM节点，但它仍然会遍历该列表，并进行所有的查找和比较。

Instead whenever visible changes to true and nodes is called it just returns the results of the last run. It is only when list changes is the more expensive routine is run again.

相反，当`visible`更改为`true`且节点被调用时，它只返回上次运行的结果。只有当列表发生变化时，开销更大的进程才会再次运行。

Returning to our original example. Consider what happens if we use a condition instead of a simple boolean:

回到我们最初的例子。考虑一下如果我们使用一个条件而不是一个简单的布尔值会发生什么:

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

每次`count`改变时，我们都会重新运行该效果。当然，当它低于6时，我们不会造成太大的破坏，但是当它为6、7、8、9……时，我们会持续重新创建子组件和那些DOM节点。

A more interesting use of memos are when configured to only notify when their value changes they can be used in the exact opposite way. They serve as powerful tool to isolate cheaper calculations that are nested inside more expensive computations that don't wish to re-run unless things have actually changed.

memos的一个更有趣的用法是，当它被配置为只在其值发生变化才通知时，它们可以以完全相反的方式使用。它们是一种强大的工具，可以将廉价计算从复杂计算内部中隔离开来，除非发生了变化，否则不会重新运行这些计算。

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

这或多或少地让我们回到最初的行为，只有当count通过阈值，结果从false变为true，或反之，我们才重新运行我们的效果。

Components
We have already explored composition a bit earlier but we should revisit it at this point using what we've learned so far. So what is a component in a system like this?

我们早前已经探讨过组件，但现在我们应该使用到目前为止所学的内容重新审视组件。在这样的系统中什么是组件?

Well you've already seen them. Simply a function. This pattern of composing reactive primitives in the same way one composes Hooks is all you really need. onCleanup gives us the ability to handle life cycles.

你已经见过了，即简单的一个函数。您真正需要的就是以与组合hook相同的方式组合响应式原语的模式。onCleanup提供了处理生命周期的能力。

All a component is, is a factory function that generates DOM nodes that are tied to state through function closures of effectful functions. But there are a few other considerations here.

组件只是一个工厂函数，它通过函数闭包生成与状态绑定的DOM节点。但这里还有一些其它需考虑的点。

Reactive Isolation
Earlier when we first looked at making our Greeting component update its name dynamically we thought about doing the following but it had the side effect of recreating our component each time:

早些时候，当我们第一次看到让Greeting组件动态更新它的名称时，我们想做以下操作，但这存在重新创建组件的副作用:

```
function Greeting(props) {
  const text = document.createTextNode("Hi "),
    el = document.createElement("span");
  el.textContent = props.name(); // reactive access will be tracked upstream
  return [text, el]; // A fragment... :)
}
```

We should consider protecting against that. Most reactive libraries have an ignore or untracked function. In Solid I call it sample. This function creates a new scope where reactive signals are not tracked. It is useful to use this as a way to ensure access outside of your effects and memos do not trigger upstream re-rendering replacing who knows how much of your view on a whim.

我们应该防范这种情况。大多数响应式库都有一个忽略或未跟踪的函数。在`Solid`中，我称之为`sample`。这个函数创建一个新的作用域，在这个作用域中没有响应式`signal`被跟踪。这是一种有用的方法，以确保访问外部的effect和memos不会触发上游重渲染。

So wrapping your components in sample is definitely a prudent precaution. It also let's you safely access reactive variables not under an effect if you desire them to intentionally not be dynamic.

因此，在`simple`中包装组件绝对是一种谨慎的预防措施。如果你有意不希望它们是动态的，它可以让你安全地访问不受影响的响应式变量。

Universal Props
What if the consumer of your Greeting component doesn't have a need for a dynamic name and just passes a string. Well it's a bit awkward to check everywhere if it's a function or not. What if you want to use more modern reactive accessors like proxies?

如果`Greeting`组件的消费者不需要动态名称，而只是传递一个字符串，该怎么办?要到处检查它是不是一个函数有点尴尬。如果您想使用更现代的响应式访问器(如代理)，该怎么办?

Well one approach that many libraries do is encourage checking with an isObservable function. But it still requires consideration. An approach that lets the component author not worry about this would be to regulate the props object.

很多库采用的一种方法是鼓励使用`isObservable`函数进行检查。但这仍然需要考虑。有一种方法可以让组件作者不必担心这个问题，那就是规范`props`对象。

Simply mapping wrapped functions to getters on the props allows universal access. Consider:

简单地将包装的函数映射到`props`上的`getter`就可以实现通用访问。请思考:

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

组件编写器决定是否动态地使用`props.name`，且以相同的方式访问它。消费者以一致的方式传递`props`。现在您可能会想，如果您知道`prop`不是动态的，那么就可以完全避免产生这种效果，但我们还可以判断第一次执行后什么时候没有订阅。这个效果永远不会更新，所以它可以被删除。

Still wrapping seems like work. But we can accomplish that (and sample) with a helper. Either explicitly or through detecting functions we can transform our props and call our component as desired.

仍然包装似乎可行。但是我们可以通过一个助手来完成。无论是显式的还是通过检测函数，我们都可以转换`props`并根据需要调用组件。

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

如果我们的模式是创建真正的DOM节点和`effect`并返回这些节点，那么您可能会想，如何返回可以在不访问父节点的情况下更改的内容呢?

Like any runtime function based creation method, like HyperScript, or React.createElement things get executed inside out. Or in another words we generally finish creating the children before the parent.

就像任何基于运行时函数的创建方法，如HyperScript或`React.createElement`，由内而外执行。换句话说，我们通常在父结点之前完成子结点的创建。

The answer to this, like everything else as you soon will see, is to lazy evaluate. Simply returning a function gives control back to the parent when to create is incredibly powerful.

这个问题的答案，就像你很快就会看到的其它事情一样，是懒评估。简单地返回一个函数就可以在创建时将控制权交还给父级，这是非常强大的。

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

当然这意味着`el.Append`撑不下去了。让我们来看看我们是如何把这些组合在一起的。

Templating
Right about now we actually have pretty much all we need to wire up some performant reactive views by hand. But let's face it. That's a lot of work. At this point we could probably just use plain old vanilla JavaScript and wire up these examples easy enough.

现在，我们实际上已经有了我们需要手工连接一些性能响应视图的所有东西。但让我们面对现实吧，工作量很大啊。此时，我们可能只需要使用普通的JavaScript，并简单地将这些示例连接起来。

So the final piece is templating to make our lives easier so we don't have to manually write all this code. There a few options.

最后一部分是模板，让我们的生活更简单，这样我们就不必手动编写所有这些代码。有几个选择：

1.We can wrap all element and Component creation in a HyperScript h function and it can determine from the input what code path in web of iteration and conditionals to run, for a purely runtime approach.

我们可以将所有元素和组件创建包装在HyperScript `h`函数中，它可以从输入中确定web的迭代和条件运行的代码路径，这是一种纯粹的运行时方法。

2.We can at runtime analyze a string or Tagged Template Literal to using dynamic code generation to create code that resembles the examples above.

我们可以在运行时分析字符串或Tagged Template Literal，从而使用动态代码生成来创建类似上述示例的代码。

3.We can use a Custom Parser or JSX template at compile time to generate code similar to what we've seen so far.

我们可以在编译时使用自定义解析器或JSX模板来生成与我们目前看到的代码类似的代码。

With Solid I support all 3. But they each have their own tradeoffs.

Solid 支持上述所有选项。但它们都有各自的权衡。

The first is definitely the simplest but will always be a dog to other optimized runtime only approaches since you do all the same things but pay higher creation cost. Nothing can be inferred as you only realize structure as functions execute. Also it's just JavaScript so you end up wiring a bit more yourself.

第一种方法绝对是最简单的，但与其它优化运行时方法相比，总是逊色很多，因为你做的都是同样的事情，但需要支付更高的创建成本。不能推断出任何东西，因为您只将结构实现为执行的函数。而且它只是JavaScript，所以你需要自己完成一些连接。

The second always has feasible limitations. Using strings you have a restrictive DSL especially for expressions unless you are bringing in your own sophisticated parser which costs bytes. Tagged Template Literals put expression execution out in the open, so you still have to careful to wrap your own expressions.

第二种方法总是有可行的局限。使用字符串有一个限制性的DSL，特别是表达式，除非你引入自己的复杂的解析器，这需要占用存储字节。带标签的模板文字将表达式的执行置于公开状态，因此您仍然需要小心地包装自己的表达式。

For this reason a custom DSL or JSX is highly desirable because through analysis we can generate almost verbatim the code in these examples. We can automatically handle identifying and wrapping dynamic expressions. We can detect which code is used to selectively import it to utilize tree-shaking. This approach is both the smallest and the fastest.

出于这个原因，我们非常需要定制DSL或JSX，因为通过分析，我们几乎可以逐字生成这些示例中的代码。我们可以自动处理标识和包装动态表达式。我们可以检测哪些代码被用来有选择地导入它来利用tree-shaking。这种方法是最小的，也是最快的。

But I'm not going to take you through creating a Babel plugin. Instead we are going to look at the last few helpers necessary to support all these approaches.

但我不会带你创建一个Babel 插件。相反，我们将看看支持所有这些方法所必需的最后几个助手。

Insert
The first is how we insert content. As mentioned element.append won't hold up. Things are definitely more complicated when there are ranges under the same parent but I'm going to keep my code examples to the simple case.

首先是如何插入内容。正如前面提到的`element.append`不能维持下去。当在同一个父节点下有范围时，事情肯定会更加复杂，但我将保持我的代码示例为简单的情况。

We can insert text, a node, a function, or an array of those. Text and nodes are pretty simple. We can just replace what is there with the new value.

我们可以插入文本、节点、函数或数组。文本和节点非常简单。我们可以用新值替换原来的值。

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

然而，函数和数组要复杂一些。主要是因为函数比较复杂，数组可以包含它们。

Arrays do need to be reconciled and there are number of algorithms out there. Since this is a piece that all rendering approaches (VDOM, Single Pass Reconciling, or Reactive) have in common I won't cover it here.

数组确实需要协调，有很多算法。因为这是所有渲染方法(VDOM、单通道协调或响应式)的共同点，所以我就不在这里讨论了。

But functions are really the key to putting this all together. As I mentioned earlier most runtime techniques execute inside out more or less.

但函数是把这些整合到一起的关键。正如我前面提到的，大多数运行时技术或多或少都是由内而外执行的。

VDOM libraries don't care since after they create the Virtual DOM they do a second pass to diff. Single Pass Reconcilers tend to put heavy boundaries on components so they can break apart execution so they have clear top down anchor points.

VDOM库并不关心这些，因为在创建虚拟DOM之后，它们会对diff进行第二次传递。Single Pass reconciler倾向于在组件上设置严格的边界，这样它们就可以分解执行，从而拥有清晰的自上而下锚点。

But for reactivity that needs to run under a scope we need a different way. The approach I use is recursive reactive layering. Consider that the function part of the insert function looks like:

但对于需要在一个范围内运行的reactivity，我们需要一种不同的方式。我使用的方法是递归响应式分层。假设`insert`的函数部分是这样的:

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

如果你传入一个函数，它会创建一个跟踪它自己的子`insert`的效果。因此，不管函数返回什么，它都知道如何插入新值。

But what gets interesting is what if that function also returns a function. We end up nesting effects isolating their updates from each other like we did earlier and they are executing in top down order. So no matter how many nested dynamic components there are stacked they will each only re-evaluate at their level and downwards.

但有趣的是，如果这个函数也返回一个函数。我们结束了嵌套效果，将它们的更新彼此隔离，就像我们之前做的那样，它们按照自上而下的顺序执行。因此，无论堆叠了多少嵌套的动态组件，它们都只会在各自的层次和向下重新计算。

Arrays with dynamic parts work similarly except we attempt to flatten the values at each level into a single array. This where memos are especially useful since if a layer updates due to one branch of the fragment you don't want to re-evaluate the others necessarily.

具有动态部分的数组工作方式类似，只是我们试图将每一层的值flatten化为单个数组。这是备忘录特别有用的地方，因为如果一个层由于片段的一个分支而更新，你不必重新评估其它的必要。

At the deepest layer where all values are resolved we can then diff with the DOM and apply our changes.

在最深层，所有值都被解析完毕，我们可以与DOM进行对比并应用我们的更改。

Spread
This is the other runtime method with some complexity. While named properties that are passed can be analyzed spreads have to be done at runtime. Which means they are always dynamic in some sense. You loop over long set of conditionals that perform various updates all wrapped in an effect.

这也是另一个有些复杂的运行时方法。虽然传递的被命名属性可以被解析，但扩展必须在运行时完成。这意味着它们在某种意义上总是动态的。循环使用一组条件语句，这些条件语句执行包装在effect中的各种更新。

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

这里有一个处理不同样式对象的助手我们使用insert来处理子对象。可以查找已知的属性名，如`class`或`for`以正确设置它们。

In the case of compiled approaches like JSX unless the end-user spreads on HTMLElements we do not need to include this code. But with what we have it's pretty easy to make a simple HyperScript h function.

对于编译过的方法如JSX，除非最终用户在`HTMLElement`上传播，否则我们不需要包含这些代码。但有了这些，就很容易做一个简单的HyperScript `h`函数。

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

差不多就是这样。使用insert、spread和createComponent，我们就有了完成模板DSL所需的东西。

And now we can update our example to HyperScript and add a click handler for good measure:

现在我们可以将示例更新到HyperScript，并添加一个点击事件处理程序:

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

不完全是本文开头看到的JSX，但或多或少是类似的东西。我们需要进入汇编，这也是一个很好的话题。

Wrap Up
Well color me impressed. You've made it to the end. We've created a reactive renderer with a runtime-only HyperScript template DSL.

让我印象深刻。你坚持到了最后。我们已经创建了一个响应式渲染器，其中包含一个运行时专用的HyperScript模板DSL。

You now hopefully have a better idea of how a reactive renderer can work. It's a lot of pattern matching, breaking things apart, and setting up safeguards for efficient rendering.

现在，希望您对响应式渲染器如何工作有了更好的了解。这需要大量的模式匹配，将内容分解，并设置有效的渲染保障措施。

The code in this article won't all just piece together and work on its own either. I've cut a few places for simplicity and removed all the optimizations. But I believe we have covered all the core pieces.

本文中的代码也不会拼凑在一起而是单独运行。为了简单起见，我删除了一些地方，并删除了所有的优化。但我相信我们已经涵盖了所有核心部分。

Even compiled approaches like Solid's JSX and Svelte have similar code and tackle the same problems. They are just able to optimize more effectively. They can detect reactive expression, identify certain expression grammar, and group instructions in the most efficient way.

即使是编译过的方法，如 Solid 的 JSX 和 Svelte ，也有类似的代码和处理相同的问题。它们只是能够更有效地优化。它们可以检测响应式的表达式，识别特定的表达式语法，并以最有效的方式对指令进行分组。

Well, it's been a long journey. Until next time.

这真是一段漫长的旅程。下次见。
