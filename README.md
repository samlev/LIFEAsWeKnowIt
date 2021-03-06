LIFE as we know it
==================
*A Cellular Automaton experiment.*

![LIFE as we know it](https://i.imgur.com/CC7Tlpp.png)

#### What is this?

This is a [Cellular Automaton](https://en.wikipedia.org/wiki/Cellular_automaton) experiment, loosely based on
[Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life). I made it in an afternoon because
I wanted to explore the concepts of mortality and fertility applying to cell age.

#### But why?

I've made a number of experiments with CGoL in the past, from a pretty shitty attempt at
[porting it into 3D](http://gameoflife.samuellevy.com/), to turning it into a
[competitive multiplayer game](http://gameoflifetotalwar.com/). I like experimenting with the edges of the core
concept, and exploring what's possible with small variations to the basic rule set.

#### What are the rules?

* An empty cell has a chance to breed if there are two or more neighbours of breeding age (10-65).
* The chance of breeding slightly decreases for every neighbouring cell that's over 35 (the older they are over that age, the lower the chance of breeding).
* All cells have a small chance of dying on any turn.
* Cells that are "children" (under 6) or "elderly" (over 65) have an increased chance of dying, depending on how young or old they are.
* Young and old cells have an increased chance of dying from loneliness (less than 2 neighbours), which increases based on how lonely they are.
* "Adult" cells (6-65) have an increased chance of dying from overcrowding (4+ neighbours), which increases based on how crowded they are.

#### Can I see this without having to clone it?

Sure. [Here it is](https://samlev.github.io/LIFEAsWeKnowIt/).

#### This is... pretty ugly...

Yes. It was built in an afternoon, with no real care about making it pretty. It works, though, and you can play
with the settings to find a way that works best. I'm mostly a backend developer - other people know how to make
things pretty, but I know how to make things work.

#### There's a distinct lack of error checking...

So... don't break it? Or do? I don't care. It works fine with the parameters that are in the the file, but feel
free to experiment with them. If it breaks, it's not like anything particularly bad will happen.

#### Who are you?

I'm Sam. I'm a web developer. I run a small company called
[Determined Development](https://www.determineddevelopment.com). You can hire me if you'd like. I specialize in
PHP development, but I'm also pretty handy with python, JavaScript, and a bunch of other languages. I also have
a [blog](http://blog.samuellevy.com/) that I rarely update.

#### Will you accept pull requests?

Maybe? Depends on the request. I mean... this was an afternoon project, so I don't care that much about it. It
was just a bit of fun that I thought others might enjoy.
