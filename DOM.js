/**
 * Creates DOM structures from a JS object (structure)
 * @author Lenin Compres <lenincompres@gmail.com>
 */

 Element.prototype.create = function (model, ...args) {
  if ([null, undefined].includes(model)) return;
  let station = args.filter(a => typeof a === 'string')[0]; // style|attr|tag|inner…|onEvent|name
  if (['tag', 'onready', 'id'].includes(station)) return;
  const IS_ATTRIBUTE = ['accept', 'accept-charset', 'accesskey', 'action', 'align', 'alt', 'async', 'autocomplete', 'autofocus', 'autoplay', 'bgcolor', 'border', 'charset', 'checked', 'cite', 'class', 'color', 'cols', 'colspan', 'content', 'contenteditable', 'controls', 'coords', 'data', 'datetime', 'default', 'defer', 'dir', 'dirname', 'disabled', 'download', 'draggable', 'enctype', 'for', 'form', 'formaction', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'http-equiv', 'id', 'ismap', 'kind', 'lang', 'list', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'multiple', 'muted', 'name', 'novalidate', 'open', 'optimum', 'pattern', 'placeholder', 'poster', 'preload', 'readonly', 'rel', 'required', 'reversed', 'rows', 'rowspan', 'sandbox', 'scope', 'selected', 'shape', 'size', 'sizes', 'spellcheck', 'src', 'srcdoc', 'srclang', 'srcset', 'start', 'step', 'style', 'tabindex', 'target', 'title', 'translate', 'type', 'usemap', 'value', 'wrap', 'width'].includes(station);
  if (model.binders) return model.binders.forEach(binder => binder.bind(this, station, model.onvalue));
  if (['text', 'innerText'].includes(station)) return this.innerText = model;
  if (['html', 'innerHTML'].includes(station)) return this.innerHTML = model;
  if (station === 'css') return this.css(model);
  if (Array.isArray(model.content)) return model.content.forEach(item => {
    let individual = Object.assign({}, model);
    individual.content = item;
    this.create(individual, ...args);
  });
  const IS_PRIMITIVE = ['boolean', 'number', 'string'].includes(typeof model);
  const TAG = this.tagName.toLowerCase();
  const CLEAR = args.filter(a => typeof a === 'boolean')[0];
  const PREPEND = CLEAR === false;
  let p5Elem = args.filter(a => a && a.elt)[0];
  if (TAG === 'style' && !model.content && !IS_PRIMITIVE) model = DOM.css(model);
  if (!station || (station === 'content' && !model.binders && TAG !== 'meta')) {
    if (station === 'content') this.innerHTML = '';
    if (IS_PRIMITIVE) return this.innerHTML = model;
    if (model.tagName) return this[PREPEND ? 'prepend' : 'append'](model);
    if (model.elt) return this[PREPEND ? 'prepend' : 'append'](model.elt);
    let keys = PREPEND ? Object.keys(model).reverse() : Object.keys(model);
    keys.forEach(key => this.create(model[key], key, p5Elem, PREPEND ? false : undefined));
    return this;
  }
  let [tag, ...cls] = station.split('_');
  let id = cls[0];
  if (station.includes('.')) {
    cls = station.split('.');
    tag = cls.shift();
  }
  if (tag.includes('#'))[tag, id] = tag.split('#');
  if (model.id) id = model.id;
  tag = (model.tag ? model.tag : tag).toLowerCase();
  const addID = (id, elt) => {
    if (Array.isArray(elt)) return elt.forEach(e => addID(id, e));
    if (!window[id]) return window[id] = elt;
    if (Array.isArray(window[id])) window[id].push(elt);
    window[id] = [window[id], elt];
  }
  if (Array.isArray(model)) {
    if (station === 'class') return model.forEach(c => c ? this.classList.add(c) : null);
    if (station === 'addEventListener') return this.addEventListener(...model);
    let map = model.map(s => this.create(s, tag + cls.join('.'), p5Elem, PREPEND ? false : undefined));
    if (id) addID(id, map);
    return map;
  }
  if (station === 'addEventListener') return model.options ? this.addEventListener(model.type, model.listener, model.options) : this.addEventListener(model.type, model.listener, model.useCapture, model.wantsUntrusted);
  const IS_HEAD = TAG === 'head';
  if (tag === 'style') {
    if (IS_PRIMITIVE && !IS_HEAD) return this.setAttribute(tag, model);
    if (IS_HEAD && !model.content) {
      model = {
        content: model
      };
    }
    if (!model.content) {
      if (CLEAR) this.setAttribute(tag, '');
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
    let done = (this.style[station] !== undefined) ? (this.style[station] = model) : undefined;
    done = IS_ATTRIBUTE ? !this.setAttribute(station, model) : done;
    if (station === 'id') addID(model, this);
    if (done !== undefined) return;
  }
  let elem = (model.tagName || model.elt) ? model : false;
  if (!elem) {
    if (!tag) tag = 'div';
    elem = p5Elem ? createElement(tag) : document.createElement(tag);
    elem.create(model, p5Elem);
  }
  elt = p5Elem ? elem.elt : elem;
  if (cls) cls.forEach(c => c ? elt.classList.add(c) : null);
  if (id) elt.setAttribute('id', id);
  this[PREPEND ? 'prepend' : 'append'](elt);
  if (model.onready) model.onready(elem);
  return elem;
};

// Adds create methdod to P5 elements
if (typeof p5 !== 'undefined') {
  p5.create = (...args) => DOM.create(...args, createDiv());
  p5.Element.prototype.create = function (...args) {
    return this.elt.create(...args, this);
  }
}

// Adds css to the head under the element's ID
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

// Used to update the props of an element when the binder's value changes. It can also update other binders' values.
class Binder {
  constructor(val) {
    this._value = val;
    this._bonds = [];
    this.onvalue = v => v;
    this.update = bond => {
      if (!bond.target) return;
      let theirValue = bond.onvalue(this._value);
      if (bond.target.tagName) return bond.target.create(theirValue, bond.property);
      bond.target[bond.property] = theirValue
    }
  }
  bind(...args) {
    let target = args.filter(a => a.tagName || a._bonds)[0];
    if (!target) return DOM.bind(this, ...args);
    let onvalue = args.filter(a => typeof a === 'function')[0];
    let property = args.filter(a => typeof a === 'string')[0];
    let bond = {
      target: target,
      property: property ? property : 'value',
      onvalue: onvalue ? onvalue : v => v
    }
    this._bonds.push(bond);
    this.update(bond);
  }
  set value(val) {
    if (val === this._value) return;
    this._value = val;
    this.onvalue(val);
    this._bonds.forEach(bond => this.update(bond));
  }
  get value() {
    return this._value;
  }
}

// global static methods to handle the DOM
class DOM {

  // created the element and props in the  body or an element passed
  static create(...args) {
    let elt = args.filter(a => a && a.tagName)[0];
    if (!elt) elt = document.body;
    if (elt) return elt.create(...args);
    window.addEventListener('load', _ => DOM.create(...args));
  }

  // returns a bind for element's props to use ONLY whithin a create() model
  static bind(binders, onvalue = v => v) {
    if (!Array.isArray(binders)) binders = [binders];
    if (binders.some(binder => !Array.isArray(binder._bonds))) return console.log(binders, 'Non-binder found.');
    return {
      binders: binders,
      onvalue: _ => onvalue(...binders.map(binder => binder.value))
    }
  }

  // returns a new bind for element's props whithin a create() model, to be updated after a XMLHttpRequest
  static load(url, onload, parseJSON = false) {
    let binder = new Binder();
    let obj = binder.bind(onload);
    DOM.request(url, data => data !== undefined ? binder.value = parseJSON ? JSON.parse(data) : data : null);
    return obj;
  }

  // returns a new bind for element's props whithin a create() model, to be updated after a JSON PARSED XMLHttpRequest
  static loadJSON(url, onload) {
    return DOM.load(url, onload, true);
  }

  // makes a XMLHttpRequest using POST, make (data = false) for GET method
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

  // same as before bu terurns a JSON object
  static requestJSON(url, data, onsuccess = _ => null, onerror = _ => null) {
    if (typeof data === 'function') {
      onerror = onsuccess;
      onsuccess = data;
      data = {};
    }
    DOM.request(url, data, d => onsuccess(JSON.parse(d)), onerror);
  };

  // adds styles to the head as global CSS
  static style(style) {
    if (window.domstyleElem === undefined) {
      window.domstyleElem = document.head.create({
        content: '/* Created with DOM.js style */'
      }, 'style');
      let reset = {
        '*': {
          boxSizing: 'border-box',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          verticalAlign: 'baseline',
          lineHeight: '1.25em',
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
      // adds default heading styles (h1 ... h6) 
      const H = 6;
      (new Array(H)).fill().forEach((_, i) => reset[`h${i + 1}`] = new Object({
        fontSize: `${Math.round(100 * (2 - i / H)) / 100}em`,
      }));
      DOM.style(reset);
    }
    if (!style) return;
    if (Array.isArray(style)) return style.forEach(s => DOM.style(s));
    if (typeof style !== 'string') style = DOM.css(style);
    document.head.create({
      content: style
    }, 'style');
  }

  // converts JSON to CSS, nestings and all. "_" in selectors is turned to "."
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
      if (['active', 'checked', 'disabled', 'empty', 'enabled', 'first-child', 'first-of-type', 'focus', 'hover', 'in-range', 'invalid', 'last-of-type', 'link', 'only-of-type', 'only-child', 'optional', 'out-of-range', 'read-only', 'read-write', 'required', 'root', 'target', 'valid', 'visited', 'lang', 'not', 'nth-child', 'nth-last-child', 'nth-last-of-type', 'nth-of-type'].includes(sub)) xSel = `${sel}:${sub}`;
      else if (['after', 'before', 'first-letter', 'first-line', 'selection'].includes(sub)) xSel = `${sel}::${sub}`;
      else if (['_', '.'].some(s => key.startsWith(s))) xSel = `${sel}${sub}`;
      else if (obj.immediate) xSel = `${sel}>${sub}`;
      extra.push(DOM.css(xSel, style));
    }).join(' ');
    return (css ? `\n${sel} {\n ${css}}` : '') + extra.join(' ');
  }

  //creates an element and returns the html code for it
  static html(model, tag = 'div'){
    let output;
    let elt = DOM.create({
      content: model,
      onready: e => output = e.outerHTML
    }, tag);
    document.body.removeChild(elt);
    return output;
  }

  // initializes the head and body from model with initial values or json file
  static setup(ini) {
    if (ini === undefined) return;
    if (typeof ini === 'boolean' || !ini.length) ini = {};
    if (typeof ini === 'string') {
      if (ini.endsWith('.json')) return DOM.request(ini, data => DOM.setup(data));
      ini = JSON.parse(ini);
    }
    // default values for initialization
    const INI = {
      title: 'A Domified Site',
      charset: 'UTF-8',
      viewport: 'width=device-width, minimum-scale=1.0, maximum-scale=1.0',
      icon: false,
      meta: [],
      link: [],
      reset: true,
      font: [],
      style: [],
      css: [],
      script: [],
      entry: false,
      module: true,
      postscript: []
    };
    // renames ini props to avoid misnaming of misspells
    const rename = (obj, name, newName) => {
      if (obj[name] === undefined) return;
      if (Array.isArray(name)) return name.forEach((n, i) => rename(obj, n, newName[i]));
      obj[newName] = obj[name];
      delete obj[name];
    }
    rename(ini, ['fontFace', 'fontface', 'entryPoint', 'entryPoint'], ['font', 'font', 'entry', 'entry']);
    // combines ini and INI into settings
    let settings = Object.assign({}, INI);
    Object.assign(settings, ini);
    // make a value into an array if it's not one already
    const asArray = foo => Array.isArray(foo) ? foo : [foo];
    // sets up the head
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
    // sets up head style css
    DOM.style([{
      fontFace: (Array.isArray(settings.font) ? settings.font : [settings.font]).map(font => typeof font === 'string' ? new Object({
        fontFamily: font.split(/[\/,.]+/).slice(-2)[0],
        src: `url(${font})`
      }) : font)
    }, asArray(settings.style), asArray(settings.css)]);
    // sets up the body
    settings.entry = settings.entry ? undefined : new Object({
      type: settings.module ? 'module' : undefined,
      src: settings.entry
    })
    DOM.create({
      script: [settings.entry, ...asArray(settings.postscript)]
    });
    // anything else passed in ini will become a body prop
    Object.keys(ini).filter(key => INI[key] !== undefined).forEach(key => delete ini[key]);
    DOM.create(ini);
  }

  static querystring(){
    var qs = location.search.substring(1);
    if(!qs) return Object();
    if(qs.includes('=')) return JSON.parse('{"' + decodeURI(location.search.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
    return qs.split('/');
  }

}

// calls DOM.setup() is the has an "setup" attribute anywhere in the head
let ini = document.head.querySelector('[setup]');
if (ini) DOM.setup(ini.getAttribute('setup'));
