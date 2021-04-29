/**
 * DOM.create
 * Creates DOM structures from a JS object (model structure)
 * @author Lenin Compres <lenincompres@gmail.com>
 */

Element.prototype.create = function (model, ...args) {
  if ([null, undefined].includes(model)) return;
  // The station is a string for the style, attr, tag, inner[content], on[event]or name to receive the model
  let station = args.filter(a => typeof a === 'string')[0];
  if (['tag', 'onready', 'id'].includes(station)) return;
  if (typeof model === 'string' && model.endsWith('.json')) return DOM.request(model, data => this.create(JSON.parse(data), ...args), _ => console.log('Unable to load JSON file: ', model));
  if (['text', 'innerText'].includes(station)) return this.innerText = model;
  if (['html', 'innerHTML'].includes(station)) return this.innerHTML = model;
  if (station === 'css') return this.css(model);
  if (Array.isArray(model.content)) {
    let map = model.content.map(item => {
      let individual = Object.assign({}, model);
      delete individual.id;
      individual.content = item;
      this.create(individual, ...args);
    });
    if (model.id) window[model.id] = map;
    return map;
  }
  const IS_PRIMITIVE = ['boolean', 'number', 'string'].includes(typeof model);
  const TAG = this.tagName.toLowerCase();
  const CLEAR = args.filter(a => typeof a === 'boolean')[0];
  const PREPEND = CLEAR === false;
  let p5Elem = args.filter(a => a && a.elt)[0];
  if (TAG === 'style' && !model.content && !IS_PRIMITIVE) model = DOM.css(model);
  if (!station || (station === 'content' && !model.binders && TAG !== 'meta')) {
    if (station === 'content') this.innerHTML = '';
    if (IS_PRIMITIVE) return this.innerHTML = model;
    let keys = Object.keys(model);
    if (PREPEND) keys = key.reverse();
    keys.forEach(key => this.create(model[key], key, p5Elem, PREPEND ? false : undefined));
    return this;
  }
  // Interprets the station: obtains tag, id and classes in case a new element is created.
  station = station.replace('_', '.');
  let [tag, ...cls] = station.split('.');
  let id = cls[0];
  if (tag.includes('#'))[tag, id] = tag.split('#');
  if (model.id) id = model.id;
  tag = (model.tag ? model.tag : tag).toLowerCase();
  if (Array.isArray(model)) {
    if (station === 'class') return model.forEach(c => c ? this.classList.add(c) : null);
    if (station === 'addEventListener') return this.addEventListener(...model);
    let map = model.map(m => this.create(m, tag + cls.join('.'), p5Elem, PREPEND ? false : undefined));
    if (id) window[id] = map;
    return map;
  }
  if (station === 'addEventListener') return model.options ?
    this.addEventListener(model.type, model.listener, model.options) :
    this.addEventListener(model.type, model.listener, model.useCapture, model.wantsUntrusted);
  if (model.binders) return model.binders.forEach(binder => binder.bind(this, station, model.onvalue));
  const IS_HEAD = TAG === 'head';
  if (tag === 'style') {
    if (IS_PRIMITIVE && !IS_HEAD) return this.setAttribute(tag, model);
    if (IS_HEAD && !model.content) {
      model = {
        content: model
      };
    }
    if (!model.content) {
      if (CLEAR) this.style = '';
      return Object.keys(model).forEach(k => {
        let value = model[k];
        value && value.binders ? value.binders.forEach(binder => binder.bind(this, k, value.onvalue)) : this.style[k] = value;
      });
    }
    if (!['boolean', 'number', 'string'].includes(typeof model.content)) model.content = DOM.css(model.content);
  }
  if (typeof model === 'function') {
    if (p5Elem && typeof p5Elem[station] === 'function') return p5Elem[station](model);
    return this[station] = model;
  }
  if (IS_PRIMITIVE) {
    if (IS_HEAD) {
      let extension = typeof model === 'string' ? model.split('.').slice(-1)[0] : 'none';
      if (tag === 'title') return this.innerHTML += `<title>${model}</title>`;
      if (tag === 'link') {
        let rel = {
          none: '',
          css: 'stylesheet',
          sass: 'stylesheet/sass',
          scss: 'stylesheet/scss',
          less: 'stylesheet/less',
          ico: 'icon'
        };
        return this.create({
          link: {
            rel: rel[extension],
            href: model
          }
        });
      }
      if (tag === 'script' && extension === 'js') return this.create({
        script: {
          src: model
        }
      });
    }
    let done;
    if(this.style[station] !== undefined) done = this.style[station] = model;
    const IS_ATTRIBUTE = ['accept', 'accept-charset', 'accesskey', 'action', 'align', 'alt', 'async', 'autocomplete', 'autofocus', 'autoplay', 'bgcolor', 'border', 'charset', 'checked', 'cite', 'class', 'color', 'cols', 'colspan', 'content', 'contenteditable', 'controls', 'coords', 'data', 'datetime', 'default', 'defer', 'dir', 'dirname', 'disabled', 'download', 'draggable', 'enctype', 'for', 'form', 'formaction', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'http-equiv', 'id', 'ismap', 'kind', 'lang', 'list', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'multiple', 'muted', 'name', 'novalidate', 'open', 'optimum', 'pattern', 'placeholder', 'poster', 'preload', 'readonly', 'rel', 'required', 'reversed', 'rows', 'rowspan', 'sandbox', 'scope', 'selected', 'shape', 'size', 'sizes', 'spellcheck', 'src', 'srcdoc', 'srclang', 'srcset', 'start', 'step', 'style', 'tabindex', 'target', 'title', 'translate', 'type', 'usemap', 'value', 'wrap', 'width'].includes(station);
    if(IS_ATTRIBUTE) dome = !this.setAttribute(station, model);
    if (station === 'id') window[station] = this;
    if (done !== undefined) return;
  }
  let elem = (model.tagName || model.elt) ? model : false;
  if (!elem) {
    if (!tag) tag = 'div';
    elem = p5Elem ? createElement(tag) : document.createElement(tag);
    elem.create(model);
  }
  elt = p5Elem ? elem.elt : elem;
  if (cls) cls.forEach(c => c ? elt.classList.add(c) : null);
  if (id) elt.setAttribute('id', id);
  if (model.css) {
    elt.css(model.css);
    delete model.css;
  }
  this[PREPEND ? 'prepend' : 'append'](elt);
  if (model.onready) model.onready(elem);
  return elem;
};

// Adds css to the head under a element's ID
Element.prototype.css = function (style) {
  if (this === document.head) return DOM.style(style);
  thisStyle = {};
  let id = this.id;
  if (!id) {
    if (!window.domids) window.domids = [];
    id = 'domid' + window.domids.length;
    this.setAttribute('id', id);
    window.domids.push(id);
  }
  thisStyle[`#${id}`] = style;
  DOM.style(thisStyle);
}

// Adds the create method to P5 elements
if (typeof p5 !== 'undefined') {
  p5.create = (...args) => DOM.create(...args, createDiv());
  p5.Element.prototype.create = function (...args) {
    return this.elt.create(...args, this);
  }
}

// Binders updates the props of elements whenever its value changes. It can also update other binders, and pros in other objects.
class Binder {
  constructor(val) {
    this._value = val;
    this._bonds = [];
    this.update = bond => {
      let theirValue = bond.onvalue(this._value);
      if (bond.target.tagName) return bond.target.create(theirValue, bond.property);
      bond.target[bond.property] = theirValue
    }
  }
  bind(target, ...args) {
    if (typeof target === 'function') return DOM.bind(this, target);
    let onvalue = args.filter(a => typeof a === 'function')[0];
    let property = args.filter(a => typeof a === 'string')[0];
    let bond = {
      target: target,
      property: property ? property : 'value',
      onvalue: onvalue ? onvalue : val => val
    }
    this._bonds.push(bond);
    this.update(bond);
  }
  set value(val) {
    if (val === this._value) return; // No change in value
    this._value = val;
    this._bonds.forEach(bond => this.update(bond));
  }
  get value() {
    return this._value;
  }
}

// Global static methods to handle the DOM
class DOM {

  // Creates element model structure in the body (or in an element).
  static create(...args) {
    let elt = args.filter(a => a && a.tagName)[0];
    if (!elt) elt = document.body;
    if (elt) return elt.create(...args);
    window.addEventListener('load', _ => DOM.create(...args));
  }

  // Returns a new Binder.
  static binder(value) {
    return new Binder(value);
  }

  // Creates a bind for elements' props. Use ONLY whithin create().
  static bind(binders, onvalue) {
    if (!Array.isArray(binders)) binders = [binders];
    if (binders.some(binder => !Array.isArray(binder._bonds))) return console.log(binders, 'Non-binder found.');
    return {
      binders: binders,
      onvalue: _ => onvalue(...binders.map(binder => binder.value))
    }
  }

  // Makes an XMLHttpRequest using POST. To use GET, make data = false.
  static request(url, data, onsuccess = _ => null, onerror = _ => null) {
    if (!url) return;
    const GET = data === false;
    if (typeof data === 'function') {
      onerror = onsuccess;
      onsuccess = data;
      data = {};
    }
    let xobj = new XMLHttpRequest();
    xobj.onreadystatechange = _ => xobj.readyState == 4 && xobj.status == '200' ? onsuccess(xobj.responseText) : onerror(xobj.status);
    xobj.open(GET ? 'POST' : 'GET', url, true);
    xobj.send(data);
  }

  // Creates a bind for an element's prop, which will be updated by an XMNHttpRequest. Use ONLY whithin a create().
  static load(url, onload, value) {
    let binder = new Binder();
    let bind = binder.bind(onload, value);
    DOM.request(url, data => binder.value = data);
    return bind;
  }

  // Convert an obj to CSS (nestings and all). Selectors' "_" become ".".
  static css(sel, obj) {
    const assignAll = (arr = [], dest = {}) => {
      arr.forEach(prop => Object.assign(dest, prop));
      return dest;
    }
    if (typeof sel !== 'string') {
      if (!sel) return;
      if (Array.isArray(sel)) sel = assignAll(sel);
      return Object.keys(sel).map(key => DOM.css(key, sel[key])).join(' ');
    }
    const unCamel = (str) => str.replace(/([A-Z])/g, '-' + '$1').toLowerCase();
    let extra = [];
    let cls = sel.split('_');
    sel = cls.shift();
    if (sel.toLowerCase() === 'fontface') sel = '@font-face';
    if (cls.length) sel += '.' + cls.join('.');
    if (['boolean', 'number', 'string'].includes(typeof obj)) return `${unCamel(sel)}: ${obj};\n`;
    if (Array.isArray(obj)) obj = assignAll(obj);
    let css = Object.keys(obj).map(key => {
      let style = obj[key];
      if (style === undefined || style === null) return;
      if (['boolean', 'number', 'string'].includes(typeof style)) return DOM.css(key, style);
      let sub = unCamel(key.split('(')[0]);
      let xSel = `${sel} ${key}`;
      if (['active', 'checked', 'disabled', 'empty', 'enabled', 'first-child', 'first-of-type', 'focus', 'hover', 'in-range', 'invalid', 'last-of-type', 'link', 'only-of-type', 'only-child', 'optional', 'out-of-range', 'read-only', 'read-write', 'required', 'root', 'target', 'valid', 'visited', 'lang', 'not', 'nth-child', 'nth-last-child', 'nth-last-of-type', 'nth-of-type'].includes(sub)) xSel = `${sel}:${key}`;
      else if (['after', 'before', 'first-letter', 'first-line', 'selection'].includes(sub)) xSel = `${sel}::${key}`;
      else if (['_', '.'].some(s => key.startsWith(s))) xSel = `${sel}${key}`;
      else if (obj.immediate) xSel = `${sel}>${key}`;
      extra.push(DOM.css(xSel, style));
    }).join(' ');
    return (css ? `\n${sel} {\n ${css}}` : '') + extra.join(' ');
  }

  // Adds global CSS to a head's style tag.
  static style(style) {
    const HEADSTYLE = 'createDOMStyle';
    if (!window[HEADSTYLE]) {
      // initializes the head's style tag, and reset the CSS accross browsers
      window[HEADSTYLE] = document.head.create({
        content: `/*
        Style by DOM.create
        Author: Lenin Compres
        Author URI: https://lenino.net/
        Version:	1.0
        */`
      }, 'style');
      let reset = {
        '*': {
          boxSizing: 'border-box',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          verticalAlign: 'baseline',
          lineHeight: '1.25em',
          fontSize: 'inherit',
          margin: 0,
          padding: 0,
          border: 0,
          borderSpacing: 0,
          borderCollapse: 'collapse',
          listStyle: 'none',
          quotes: 'none',
          content: 'none',
          fontWeight: 'normal',
        },
        body: {
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
        },
        'b, strong': {
          fontWeight: 'bold',
        },
        'i, em': {
          fontStyle: 'itallic',
        },
        'a, button': {
          textDecoration: 'none',
          cursor: 'pointer',
        }
      };
      // default heading font sizes: h1 to h6, 2em to 1em.
      const H = 6;
      (new Array(H)).fill().forEach((_, i) => reset[`h${i + 1}`] = new Object({
        fontSize: `${Math.round(100 * (2 - i / H)) / 100}em`,
      }));
      DOM.style(reset);
    }
    if (!style) return;
    if (Array.isArray(style)) return style.forEach(s => DOM.style(s));
    window[HEADSTYLE].innerHTML += DOM.css(style);
  }

  // Sets head and body with initial values from defaults, object or JSON file.
  static setup(ini) {
    if (typeof ini === 'string' && ini.endsWith('.json')) return DOM.request(ini, data => DOM.setup(JSON.parse(data)));
    else ini = {};
    // Default initial values
    const INI = {
      title: 'Site built with DOM.create',
      charset: 'UTF-8',
      viewport: 'width=device-width, minimum-scale=1.0, maximum-scale=1.0',
      icon: false,
      meta: [], // Any of these can be a single value or an array
      link: [], // DOM.create insterprets links'extensions
      font: [], // Any fontfaces to be added to the CSS
      style: [], // CSS style to be added to the head
      script: [], // Any scripts be added in head
      postscript: [], // Any scripts for the body (after the entry point)
      entry: false, // JS entry point's file path, to be added in body
      module: true, // Is the code is modular?
    };
    // Renames ini props to avoid misnames, spacing or case sensitivity.
    Object.keys(ini).forEach(key => {
      let val = ini[key];
      delete ini[key];
      ini[key.toLocaleLowerCase().replace(' ', '')] = val;
    });
    rename(ini, ['css', 'fontface', 'entrypoint'], ['style', 'font', 'entry']);
    function rename(obj, name, alias) {
      if (Array.isArray(name)) return name.forEach((n, i) => rename(obj, n, alias[i]));
      obj[alias] = obj[name];
      delete obj[name];
    }
    // Combines ini and INI into one settings object.
    let settings = Object.assign({}, INI);
    Object.assign(settings, ini);
    // Function that turns an object into an array if it's not one already.
    const asArray = foo => Array.isArray(foo) ? foo : [foo];
    // sets up the head.
    document.head.create({
      title: settings.title,
      meta: [{
        charset: settings.charset
      }, {
        name: 'viewport',
        content: settings.viewport
      }, ...asArray(settings.meta)],
      link: [settings.icon ? {
        rel: 'icon',
        href: settings.icon
      } : undefined, ...asArray(settings.link)],
      script: asArray(settings.script)
    });
    // Sets up head style css and adds fonts.
    DOM.style([{
      fontFace: (Array.isArray(settings.font) ? settings.font : [settings.font]).map(font => typeof font === 'string' ? new Object({
        fontFamily: font.split(/[\/,.]+/).slice(-2)[0],
        src: `url(${font})`
      }) : font)
    }, asArray(settings.style)]);
    // Adds the js entry point and postcripts to the body
    settings.entry = settings.entry ? undefined : new Object({
      type: settings.module ? 'module' : undefined,
      src: settings.entry
    })
    DOM.create({
      script: [settings.entry, ...asArray(settings.postscript)]
    });
    // Makes any remaining props in ini a prop for the body. This allows setting up things like: backgroundColor, font, etc., or even create(models)
    Object.keys(ini).filter(key => INI[key] !== undefined).forEach(key => delete ini[key]);
    DOM.create(ini);
  }

}

// Calls DOM.setup() if there's a "create" attribute ANYWHERE in the head.
let ini = document.head.querySelector('[create]');
if (ini) DOM.setup(ini.getAttribute('create'));
