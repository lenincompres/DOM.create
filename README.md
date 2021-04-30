# DOM.create
by Lenin Compres

The DOM.create function creates DOM elements in the *document.body*.
If called before the body is loaded, it waits for the window *load* event before executing. 
It returns the container element, in this case document.body.
Click here to learn [what is the DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction).

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
You may provide the element where the structure should be created as a following argument.

```javascript
DOM.create({
  h1: 'Hello world',
  p: 'This <b>is</b> a paragraph.'
}, someElement, true);
```

A *true* boolean may be passed too, to indicate the new structure should **replace** any existing one in the element, instead of the default **append** mode.
Specifying *false* here will **prepend** the struture instead.

You may also provide a string to indicate the tag for a new element, where the DOM structure will be created.
The following example creates a *main* element inside the *someElement*. It returns this *main* element.

```javascript
DOM.create({
  h1: 'Hello world',
  p: 'This is <b>a</b> paragraph.'
}, 'main', someElement);
```

DOM.create is agnostic about the order of the arguments that follow the first (model) one:
* A **boolean** is a *replace/prepend* flag, intead of **append** mode.
* A **string** is a the tag for a new element, or an element's property/attribute to be updated.
* An **element** is where the model should be created instead of the *document.body*.

## Create: as an Element Method

You may call directly on and DOM element.

```javascript
someElement.create({
  h1: 'Hello world',
  p: 'This is a <b>paragraph</b>.'
});
```

### Attributes, Event Handlers and More

DOM.create recognizes properties in the model structure as attributes or event handlers of the element.

```javascript
DOM.create({
  input: {
    id: 'myInput',
    placeholder: 'Type value here',
    onchange: (event) => alert(myInput.value)
  },
  button: {
    id: 'goBtn',
    innerText : 'Go',
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
* Giving an element an id creates a global variable (of the same name) to hold the element.
* Use *text:* or *innerText:*, *html:* or *innerHTML:*, or simply *content:* for the element's inner content.

### Updating the Head

Just as any other element, you may call the **create** method of the head element.

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

### Array of Elements

Use arrays to create multiple consecutive elements of the same tag.

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

Declaring the array as *content:* allows you to set other attributes for all the elements in the list.
If an *id* is given, it creates a global variable holding the array of elements.

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
// the second element is made yellow
```

## Styling Elements with DOM.create

### Method 1
Asign a string to the *style:* property to update the inline style of the element—replacing any previous value.

```javascript
document.body.create({
  main:{
    style: 'margin: 20px; font-family: Tahoma; background-color: gray;',
    content: 'This style is in the style attribute of the main element.'
  }
});
```

### Method 2
Asign a structural object to the *style:* to update individual style properties—use names (in camelCase).

```javascript
document.body.create({
  main: {
    style: {
      margin: '20px',
      fontFamily: 'Tahoma',
      backgroundColor: 'gray'
    },
    content: {
      h1: 'Styled Main Element',
      p: 'This manages the style values individually.'
     }
  }
});
```

This is equivalent to using the [style property of DOM element](https://www.w3schools.com/jsref/prop_html_style.asp). 

Style properties may be assigned without an emcompasing *style:* object.
The *style:* object, same as the *content:* object, are useful to organize and be specific about our model structure.
Yet the previous code could be written as follows.

```javascript
document.body.create({
  main: {
    margin: '20px',
    fontFamily: 'Tahoma',
    backgroundColor: 'gray',
    h1: 'Styled Main Element',
    p: 'This manages the style values individually.'
  }
});
```

**DOM.create** interprets structural properties to match attributes, styles, event handlers and element tags.

### Method 3
If *style:* contains *content:* property, a style tag with proper CSS language is created.

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

This is not recommended, since it will affect all elements in the DOM.
Instead, add global styles using **DOM.style**.
This method adds the CSS to the head, and can interpret structural objects into CSS—nesting and all.

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
      backgroundColor: 'silver',
      hover: {
        backgroundColor: 'gold'
      }
    }
  }
};
```

**DOM.style** recognizes pseudo-elements and pseudo-classes when converting CSS.
And selectors containing underscores (\_) are interpreted as periods (.).
In this sense *button_warning:* becomes *button.warning*.

Lastly

### Method 4
Instead of *style:*, you may use *css:* in a DOM.create structural model to indicate CSS styles that will apply **only** to this and child elements.

```javascript
document.body.create({
  main: {
    css: {
      margin: '20px',
      fontFamily: 'Tahoma',
      backgroundColor: 'gray',
      a: {
        backgroundColor: 'silver',
        hover: {
          backgroundColor: 'gold'
        }
      }
    },
    nav: {
      a: [
        {
          href: 'home.html',
          content: 'HOME'
        }, {
          href: 'gallery.html',
          content: 'GALLERY'
        }
      ]
    }
  }
});
```

These styles are added to the document.head's style element, under the *id* of the element where they are created.
If the element doesn't have an *id*, a unique is provided.

## Binding

Any element's attribute, content, style, content or event handler can be **bound** to a *Binder* object.
When the *value* property of this object changes, it will automatically update all elements bound to it.

```javascript
let myBinder = DOM.binder('Default value');

DOM.create({
  button: {
    text : 'Go',
    onclick: (event) => myBinder.value = 'Go was pressed'
  },
  input: {
    value: DOM.bind(myBinder),
  },
  p: {
    content: DOM.bind(myBinder),
  }
});
```

### Binding with a Method

Give binds a function to be called when its value changes, so that it returns the correct value to assign to the element's property.

```javascript
let fieldEnabled = new Binder(false); // You may create binders using the Binder class too.

DOM.create({
  div: {
    style: {
      padding: '20px',
      background: DOM.bind(fieldEnabled, value => value === true ? 'green': 'red')
    },
    button : {
      text: 'toggle',
      onclick: () => fieldEnabled.value = !fieldEnabled.value
    },
    input: {
      enabled: fieldEnabled.bind(), // You may call the bind method on the binder itself.
      value: fieldEnabled.bind(value => value ? 'This field is enabled' : 'This field is disabled')
    }
  }
});
```

### Binding to Multiple Binders

Provide DOM.bind with an array of binders to create logic based on the value of all binders.

```javascript
enabled: DOM.bind([fieldEnabled, timeOfDay], (enabled, time) => enabled && time < 12)
```

## Other Uses of DOM.create

DOM.create allows you to create or modify attributes and styles in your elements in just one call.

```javascript
myElement.create({
  padding: '0.5em 2em',
  backgroundColor: 'lavender',
  text: 'Some text'
});
```

This even works for single values, if you indicate the property to be updated in a following *string*.

```javascript
myElement.create('bold', 'fontWeight');

goBtn.create('Go', 'text');

goBtn.create(true, 'disabled');
```

## DOM.create and P5.js

Yes, DOM.create works for P5.js elements. Don't know about P5.js? You should [remedy that](https://p5js.org/).

```javascript
p5Element.create({
  h1: 'Hello world',
  p: 'This is a paragraph.'
});
```

When called from p5 or a p5 element, all new elements given an id are created as p5 elements. 

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
