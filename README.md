# DOM.create
by Lenin Compres

The DOM.create function creates the DOM elements in the document.body. 
If called before the body is loaded, it waits for the window "load" event to execute. 
It returns the container element, in this case document.body.

```javascript
DOM.create({
  header: {
    h1: 'Page built with DOM.create'
  },
  main: {
    article: {
      h2: 'Basic DOM created element',
      p: '<b>This</b> is a paragraph.'
    }
  },
  footer: {
    p: 'Made with DOM.create'
  }
});
```
You may provide the element where the structure should be created a following argument.

```javascript
DOM.create({
  h1: 'Hello world',
  p: 'This <b>is</b> a paragraph.'
}, someElement, true);
```

A true boolean may indicate the new structure should replace any existing one in the element, instead of the default append mode.
Specifying **false** here will prepend the struture instead.

You may also provide a string to indicate the tag of a new element where the DOM structure will be created.
The following example creates a main element with the domified structure. It returns this main element, and prepends it in someElement.

```javascript
DOM.create({
  h1: 'Hello world',
  p: 'This is <b>a</b> paragraph.'
}, 'main', someElement);
```

DOM.create is agnostic about the order of the arguments that follow the first one:
* A boolean is a flag to clear the element.
* A String is a the tag for a new element.
* An element is where the model should be created.

## Create: an element method

You may call create as an element method.

```javascript
someElement.create({
  h1: 'Hello world',
  p: 'This is a <b>paragraph</b>.'
});
```

### Attributes, Event Handlers and More

DOM.create recognizes property names as attributes or event handlers for the element.

```javascript
DOM.create({
  input: {
    id: 'myInput',
    placeholder: 'Type value here',
    onchange: (event) => alert(myInput.value)
  },
  button: {
    id: 'goBtn',
    innetText : 'Go',
    addEventListener: {
      type: 'click', 
      listerner: (event) => myInput.value = 'Button pressed'
    }
  }
});

myInput.style.border = 'none';
goBtn.click();
```

NOTE:
* Giving an element an id creates a global variable (of the same name) to hold this element.
* Use text: or innerText:, and content:, html: or innerHTML: for the element's content.

### Array of elements

Use arrays to create multiple elements of the same tag.

```javascript
DOM.create({
  ul: {
    li: [
      'first item',
      'second item',
      'a third for good meassure'
    ]
  }
});
```

The array could be in a content property. This allows for setting attributes for all the elements in the list. If an id if given, it becomes global name for an array of elements.

```javascript
DOM.create({
  ul: {
    li: {
      id: 'listedThings',
      style: 'font-weight:bold',
      content : [
        'first item',
        'second item',
        'a third for good meassure'
      ]
    }
  }
});

listedThings[1].style.backgroundColor = 'yellow';
```

## Styling elements with DOM.create

If a strign is assigned as the style property, this becomes the value of the style attribute of the element—replacing any previous value.

```javascript
document.body.create({
  main:{
    style: 'margin: 20px; font-family: Tahoma; background-color: gray;',
    content: 'This style is in the attribute of this main element.'
  }
});
```
If the style property is a structural object, styles of the element are updated individually—using JS names (in camelCase).

```javascript
document.body.create({
  main: {
    style: {
      margin: '20px',
      fontFamily: 'Tahoma',
      backgroundColor: 'gray'
    },
    content: 'This manages the style values individually.'
  }
});
```

If the style is a structural object with a content property, a style tag with proper CSS language is created.

```javascript
document.body.create({
  main: {
    style: {
      lang: 'css',
      content: 'main { margin: 20px; font-family: Tahoma; color:gray; }';
    },
    content: 'This style is applied to all main tags in the page.'
  }
});
```

This is not recommended. Instead, add global styles using DOM.style, which adds these css style to the head, and even turns structural sty objects into css—nesting and all.

```javascript
DOM.style({
  main: { 
    margin: '20px',
    fontFamily: 'Tahoma',
    color: 'gray'
  },
  'p, article>*': {
    margin: '2em'
  },
  nav: {
    a: {
      color: 'blue',
      hover: {
        backgroundColor: 'yellow'
      }
    }
  }
};
```

DOM.stile recognizes pseudo-elements and pseudo-classes when converting CSS. And selectors written with underscores (_) are interpreted as such: (.). In this sense _warning becomes (.warning).

## Initializing

Just as any other element, you may call the create method of the head element.

```javascript
document.head.create({
  title: 'Title of the webpage',
  meta: {
    charset: 'UTF-8'
  },
  link : [{
    rel: 'icon',
    href: 'icon.ico'
  }, {
    rel: 'style',
    href: 'style.css'
  }], 
  style: {
    type: 'css',
    content: CSS
  },
  script: {
    type: 'module',
    src: 'main.js' 
  }
});
```

## Binding

Any element's attribute, content, style, etc., can be bound to a Binder object. When the value property of this binder changes, it automatically updates all elements bound to it.

```javascript
let myBinder = DOM.binder('Default value');

DOM.create({
  button: {
    text : 'Go',
    onclick: (event) => myBinder.value = 'Button pressed'
  },
  input: {
    value: DOM.bind(myBinder),
  },
  p: {
    content: DOM.bind(myBinder),
  }
});
```

Give the bind a function to be called whenever the value changes so that it returns the correct value to assign to the element's property.

```javascript
let fieldEnabled = new Binder(false); // Note: you may create binders using the Binder class.

DOM.create({
  div: {
    padding: '20px',
    background: DOM.bind(fieldEnabled, value => value ? 'lime': 'red')
    },
    button : {
      text: 'toggle',
      onclick: () => fieldEnabled.value = !fieldEnabled.value
    },
    input: {
      enabled: fieldEnabled.bind(), // Note: you may call bind on the binder itself.
      value: fieldEnabled.bind(value => value ? 'Enabled' : 'Disabled')
    }
  }
});
```

Provide DOM.bind an array of binders to create logic based on the value of all binders.

```javascript
enabled: DOM.bind([fieldEnabled, timeOfDay], (enabled, time) => enabled && time < 12)
```

Also note that style properties may be assigned without the *style* emcompasing object. The *style* object, same as the *content* object, are useful to organize and be specific abouit our model structures. DOM.create will interpret the structure and property names matching them to attributes, style properties, event handlers and element tags.

## Other Uses of DOM.create

DOM.create allows you to modify attributes and styles in your elements using just one method (create).

```javascript
myElement.create({
  padding: '0.5em 2em',
  backgroundColor: 'lavender',
  text: 'Some text'
});

/* it even works for single values */

myElement.create('bold', 'fontWeight');

goBtn.create('Go', 'text');

goBtn.create(true, 'disabled');
```

## P5 JS

DOM.create works for P5 as well.

```javascript
p5Element.create({
  h1: 'Hello world',
  p: 'This is a paragraph.'
});
```

When called from a p5, all new elements given an id are created as p5.Elements. 

```javascript
p5.create({
  h1: 'Hello world',
  button: {
    id: goBtn,
    text: 'Go',
    mouseClicked: handlerFunction
  }
);
/* goBtn is a p5 Element. */
```

## Have fun!
