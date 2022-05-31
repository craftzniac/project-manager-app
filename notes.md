# Notes

## Creating functions that are called where they are defined
```js
// this function is run immediately after it is defined
(function(name){
    console.log(name)
}) ('victor');
// the first () holds the function definition like this: (function(){})  
// and the second () is used to call the function, passing the arguments if the function needs any like this: ('victor')
```

## Get the child elements inside a parent element from js using the `childNodes` property
```html
<div class="project">
    <textarea> Hello</textarea>
    <button>Edit</button>
</div>
```

```js
const projects = document.querySelector(".projects");
const children = projects.childNodes
const nameEl = children[1]
const editBtn = children[3]
```

**Warning:** Note that a new line inside a HTML container element like a `<div>` is considered its own element and it is an Instance of `Text` and not an instance of  `HTMLElement` like other html elements. To get only html elements from the `childNodes` property, do this instead:

```js
const projects = document.querySelector(".project");
const childNodes = (function (container) {
        const children = []
        // filter out all childNodes that are not actual HTML Elements by checking that they are instances of HTMLElement
        container.childNodes.forEach(child => {
            if (child instanceof HTMLElement) {
                children.push(child)
            }
        })

        return children;
        
    })(projects);
console.log(childNodes)
```

## Make a textbox non-editable using the `readOnly` HTML attribute
```html
<textarea readOnly>some text </textarea>
```

```js
const textEl = document.getElementByTagName('textarea')
textEl.readOnly = false; //makes it editable again
```

## Performing a redirect from browser javascript
Use the `location.href` property
```js
console.log(location.href); //outputs the url of the current page

location.href = '/projects/new'; //sets url of current page effectively redirecting the page. You can also specify an absolute url like `https://freecodecamp.org`
```

## How to print an object to the console like a var_dump() from php
```js
console.log(" %o ", someObject)
```

## Setup cors for nodejs server
> Setting up cors in the nodejs server making request to the server from a browser

- Install cors package
`npm i cors`
- use it as a middleware in express
```js
import cors from 'cors';
import { Router } from 'express'

const router = Router();

//call the cors() function from the cors package
router.use(cors())
``` 

## Get data passed in a post request in a client on the server
```js
// in client fetch
fetch(someAPIEndpoint, {
    // some other parameters
    body: JSON.stringify({ projectId })
})


// get the value passed in the server code
projectRouter.post('/id',  function(req, res){
    console.log(req.body.projectId)
})

```

## Prevent the child(ren) of a flexbox from overflowing the parent container
```css
parent { 
    display: flex;
}

child{
    min-width: 0;
}
```

## Make a HTML element editable
```html
<h3 contenteditable="true">this content becomes editable</h3>
```

## Remove a specific child element from a parent element using `removeChild()` method
```js
parentDiv.removeChild(firstEl)
```

## Know if a checkbox has been checked or not using its **checked** property
```js
const checkBox = document.querySelector(".checkbox")
checkBox.addEventListener('change', () => {
    console.log(checkBox.checked)
})
```