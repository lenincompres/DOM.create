# DOM.create
by Lenin Compres

The following is all the HTML we are going to need for the entirety of this documentation. It is our *index.html* file. The rest of our code will be in the javaScript (*main.js*). We will not need CSS either.

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdn.jsdelivr.net/gh/lenincompres/DOM.create@latest/DOM.js"></script>
  </head>
  <body>
    <script src="main.js"></script>
  </body>
</html>
```

## The DOM.create Method 
This library allows you to create DOM elements using a structural JavaScript object (or JSON) as a model.
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
If called before the body is loaded, **DOM.create** waits for the window *load* event before executing.

You may also invoke *create* directly on an element to model it.

```javascript
someElement.create({
  class: 'some-class',
  h1: 'Hello world',
  p: 'This is a <b>paragraph</b>.'
});
```

---

<details>
  <summary>Other ways to invoke DOM.create</summary>
  
  You may provide DOM.create with an element where the model structure should be created.

  ```javascript
  DOM.create({
    h1: 'Hello world',
    p: 'This <b>is</b> a paragraph.'
  }, someElement, true);
  ```

  A *true* boolean may indicate that the new structure should **replace** any existing one.
  Specify *false* here to **prepend** instead; or nothing for the default **append** mode

  You may also provide a *string* to indicate the tag for a new element where the DOM structure will be created.
  The following example creates a *main* element inside the *someElement*. It returns this *main* element.

  ```javascript
      DOM.create({
        h1: 'Hello world',
        p: 'This is <b>a</b> paragraph.'
  }, 'main', someElement);
  ```

  DOM.create is agnostic about the order of the arguments that follow the first (model structure):
  * An **element** is where the model should be created instead of *document.body*.
  * A **boolean** is a *replace/prepend* flag.
  * A **string** is a tag for a new element to be created.
  
</details>

---

### Properties: Attributes, Events and More

DOM.create recognizes **properties** in the model structure, such as attributes or event handlers.

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
* Giving an element an *id:* creates a global variable (with that name) holding that element.
* Use *text:* or *innerText:*, *html:* or *innerHTML:*, or simply *content:* for the element's inner content.

### Create the Head

Just as any element, you may invoke **create** on the head element.

```javascript
document.head.create({
  title: 'Title of the webpage',
  charset: 'UTF-8',
  icon: 'icon.ico',
  keywords: 'website,multiple,keywords',
  description: 'Website created with DOM.create',
  meta: {
    name: 'color-scheme',
    content: 'dark'
  },
  link : {
    rel: 'style',
    href: 'style.css'
  }, 
  style: {
    type: 'css',
    content: 'body{ margin:0; backgroundColor: gray; }'
  },
  script: {
    type: 'module',
    src: 'main.js' 
  }
});
```

Note how **create** recognizes common head information (icon, charset, keywords, description, etc).
In fact, the **DOM.create** method recognizes these as well, and adds them on the *document.head* instead of the *body*.

```javascript
DOM.create({
  title: 'Title of the webpage',
  charset: 'UTF-8',
  icon: 'icon.ico',
  keywords: 'website,multiple,keywords',
  description: 'Website created with DOM.create',
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


### Create an Array of Elements

Use arrays to create multiple consecutive elements of the same kind.

```javascript
DOM.create({
  ul: {
    li: [
      'First item',
      'Second item',
      'A third one, for good meassure'
    ]
  }
});
```

Declaring the array inside a *content:* property allows you to set other properties for all the elements in the array.

```javascript
DOM.create({
  ul: {
    li: {
      id: 'listedThings',
      style: 'font-weight:bold',
      height: '20px',
      content : [
        'first item',
        'second item',
        'a third for good meassure'
      ]
    }
  }
});

// Makes the second element yellow
listedThings[1].style.backgroundColor = 'yellow';
```

When an *id* is provided, a global variable holding the array of elements is created. 
In fact, if you give several elements the same *id*, DOM.create will group them in one global array.

---

## Styling Elements with DOM.create

### Style Attribute
Asign a string to the *style:* property to update the inline style of the element—replacing any previous value.

```javascript
document.body.create({
  main:{
    style: 'margin: 20px; font-family: Tahoma; background-color: gray;',
    content: 'The style is in the style attribute of the main element.'
  }
});
```

### Style Properties
Asign a structural object to the *style:* to update individual style properties—use names in camelCase.

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

This is equivalent to using the [style property of DOM elements](https://www.w3schools.com/jsref/prop_html_style.asp). 

NOTE: Styles may be assigned without an emcompasing *style:* object. The previous code could be written as follows.

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

The *style:* and *content:* properties are useful for organizing the model structure. 
Yet, **DOM.create** interprets structural properties to match attributes, styles, event handlers and element tags.

### Style Element
If *style:* has a *content:* property, an element with a style tag and CSS content is created. Click here to [learn about CSS](https://www.w3schools.com/css/css_intro.asp).

```javascript
document.body.create({
  main: {
    style: {
      lang: 'scss',
      content: 'main { margin: 20px; font-family: Tahoma; color: gray; }';
    },
    content: 'This style is applied to all MAIN elements in the page.'
  }
});
```

This method is discouraged, since it will affect all elements in the DOM not just the one invoking **create**.
Instead, create global styles using **DOM.style**, which adds the CSS to the head, and can interpret structural objects into CSS—nesting and all.

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
});
```

**DOM.style** even recognizes pseudo-elements and pseudo-classes when converting CSS.
And selectors containing underscores (\_) are interpreted as periods (.); so, *button_warning:* becomes *button.warning*.

Lastly,

### CSS Property
Use *css:* in your model structure to create styling rules that apply **only** to the current element and its children.

```javascript
document.body.create({
  main: {
    css: {
      margin: '20px',
      fontFamily: 'Tahoma',
      backgroundColor: 'gray',
      nav: {
        a: {
          backgroundColor: 'silver',
          hover: {
            backgroundColor: 'gold'
          }
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

The CSS is added to the document.head's style element under the *id* of the element where it is created.
If the element doesn't have an *id*, a unique one is provided for it.

Elements also have a **css** method you may use to asigned their style. So the previous code could also be written as:

```javascript
document.body.create({
  main: {
    id: 'mainArea',
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

mainArea.css({
  margin: '20px',
  fontFamily: 'Tahoma',
  backgroundColor: 'gray',
  a: {
    backgroundColor: 'silver',
    hover: {
      backgroundColor: 'gold'
    }
  }
});
```

---

## Binding

Any element's property (attribute, content, style, content or event handler) can be **bound** to a *Binder* object.
When the *value* property of this object changes, it automatically updates all element properties' bound to it.

```javascript
let myBinder = new Binder('Default value');

DOM.create({
  input: {
    value: myBinder,
  },
  p: {
    text: myBinder,
  },
  button: {
    text : 'Go',
    onclick: (event) => myBinder.value = 'Go was clicked.'
  }
});
```

### Binding Functions

You may provide a function that returns the correct value to assign to the element's property based on the value of the binder.

```javascript
let fieldEnabled = new Binder(false);

DOM.create({
  div: {
    style: {
      background: fieldEnabled.bind(value => value === true ? 'green': 'gray')
    },
    input: {
      enabled: fieldEnabled,
      value: fieldEnabled.bind(value => value ? 'The field is enabled.' : 'The field is disabled.')
    },
    button : {
      text: 'toggle',
      onclick: () => fieldEnabled.value = !fieldEnabled.value
    }
  }
});
```

### Binding outside a create model

You may call the *bind* method of a binder and provide the element and property to be bound to it.

```javascript
fieldEnabled.bind(someElement, 'text', value => value ? 'field is enabled' : 'field is disabled');
```

The *bind* method is agnostic about the order of the arguments provided. 
An *element* is the target, a *string* the property to bind, and a *function* will return the appropriate value to update the element.

#### Binding binders

You may update the value of other binders by binding them.

```javascript
fieldEnabled.bind(someOtherBinder, value => value ? 'red' : 'blue');
```

#### Listening to binders

You may add listerner methods to be called when a binder updates.

```javascript
fieldEnabled.addListener(value => alert('The listener was updated to: ' + value));
```

---

## DOM.create extra features

The **create** method allows you to modify attributes, styles, event handlers, and content of your elements with just one call.

```javascript
myElement.create({
  padding: '0.5em 2em',
  backgroundColor: 'lavender',
  text: 'Some text'
});
```

### DOM.get() and element.get()

This method returns a value based on the *string* provided, it tries to match it to an attribute, style property, element tag (in the scope), or a query selector. If no station is given, it returns the value property or the innerHTML (in it's deffect).

```javascript
DOM.get('backgroundColor'); // returns the body's background color

document.body.get('backgroundColor'); // same as before

myElement.get('class');

myElement.get(); // returns the value (if there is one) or the innerHTML

myElement.get('text');  // returns the innerText

myElement.get('article');  // returns the array of article tag elements within someElement's immediate scope (or the one article element when there's just one)

myElement.get('.nice'); // similar to myElement.querySelectorAll(), but returns an array of elements.
```

---

## DOM.create and P5.js

Yes, DOM.create works for P5.js elements. If you are not familiar with P5.js? [Remedy that](https://p5js.org/).

```javascript
p5.create({
  h1: 'Hello world',
  p: 'This is a paragraph.'
});
```

When called from p5 or a p5 element, all elements given an id are created as p5 elements, and can execute p5 methods. 

```javascript
someP5Element.create({
  h1: 'Hello world',
  button: {
    id: 'goBtn',
    text: 'Go',
    mouseClicked: e => alert('Go was clicked.')
  }
);

/* goBtn is a p5 Element. */

goBtn.addClass('nice-button');
```

## Have fun!
