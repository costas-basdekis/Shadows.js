Shadows.js
==

2D shadows, drawn using [paper.js]  
Inspired by the soldiers' view field in Commandos, I wanted to implement it for the general case. 

See the [demo page]  
Run the [tests]  

Finally working!
==

It's in a fully functional state, and demo allows the user to move the light source, in several rooms.

Todo:
--
1. Fix bugs
2. Optimize
3. Simplify
4. Allow user to add shapes/lines in the demo app
5. Remove python.js


Python.js
--
At least for the core (Shadows), I am using Python style functions and
invocation, meaning the ability to pass by name, argument checking, class
methods bound to object, class inheritance.

Q: What?  
A: Is what a scripting language?

Q: Why?  
A: I like python, I hate that Javascript does not errors when passing an incorrect amount of arguments

Q: How?  
A: Not too complex, Javascript already has the infastructure to enforce these

Q: What do you achieve with this?  
A: Probably the glory of Satan

Q: Is this real?  
A: Yes, but as the demo app shows, it has huge overhead (~50% at the current commit). But it allows for common, easily avoidable mistakes/typos, as all languages. But probably nobody want's to work on this. But it's a cool experiment.

[paper.js]:http://paperjs.org/
[demo page]:http://costas-basdekis.github.io/Shadows.js/
[tests]:http://costas-basdekis.github.io/Shadows.js/tests/tests.html
