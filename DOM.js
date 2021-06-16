/**
 * Creates DOM structures from a JS object (structure)
 * @author Lenin Compres <lenincompres@gmail.com>
 * @version 1.0
 * @repository https://github.com/lenincompres/DOM.create
 */

Element.prototype.create = function (model, ...args) {
  if ([null, undefined].includes(model)) return;
  if (Array.isArray(model.content)) return model.content.forEach(item => {
    if ([null, undefined].includes(item)) return;
    let individual = Object.assign({}, model);
    individual.content = item;
    this.create(individual, ...args);
  });
  let argsType = DOM.type(...args);
  let modelType = DOM.type(model);
  let station = argsType.string; // style|attr|tag|inner…|on…|name
  const TAG = this.tagName.toLowerCase();
  const IS_HEAD = TAG === 'head';
  const PREPEND = argsType.boolean === false;
  const IS_CONTENT = station && station.toLowerCase() === 'content';
  const CLEAR = argsType.boolean === true || IS_CONTENT;
  if (IS_CONTENT && TAG === 'meta') station = '*content'; // disambiguate 
  if (!station) station = 'content';
  const STATION = station; // STATION is the original station
  station = station.toLowerCase(); // station is always lowercase
  if (['model', 'inner'].includes(station)) station = 'content';
  let p5Elem = argsType.p5Element;
  if (modelType.function) {
    if (DOM.type(STATION).event) return this.addEventListener(STATION, model);
    else if (p5Elem && typeof p5Elem[STATION] === 'function') return p5Elem[STATION](model);
    else return this[STATION] = model;
  }
  if (model._bonds) model = model.bind();
  if (model.binders) return model.binders.forEach(binder => binder.bind(this, STATION, model.onvalue, model.listener));
  if (DOM.reserveStations.includes(station)) return;
  if (station === 'css') return this.css(model);
  if (['text', 'innertext'].includes(station)) return this.innerText = model;
  if (['html', 'innerhtml'].includes(station)) return this.innerHTML = model;
  if (IS_HEAD) {
    if (station === 'font' && modelType.object) return DOM.style({
      fontFace: model
    });
    if (station === 'style' && !model.content) return DOM.style(model);
    if (station === 'keywords' && Array.isArray(model)) model = model.join(',');
    if (station === 'viewport' && modelType.object) model = Object.entries(model).map(([key, value]) => `${DOM.unCamel(key)}=${value}`).join(',');
    modelType = DOM.type(model);
  }
  const IS_PRIMITIVE = modelType.primitive !== undefined;
  let [tag, ...cls] = STATION.split('_');
  if (STATION.includes('.')) {
    cls = STATION.split('.');
    tag = cls.shift();
  }
  let id;
  if (tag.includes('#'))[tag, id] = tag.split('#');
  let lowTag = (model.tag ? model.tag : tag).toLowerCase();
  if (lowTag != tag && tag[0] === tag[0].toLowerCase()) id = tag; // camelCase tags are interpreted as id (TEST THIS)
  tag = lowTag;
  if (model.id) id = model.id;
  let elt = modelType.p5Element ? model.elt : modelType.element;
  if (elt) {
    if (id) DOM.addID(id, elt);
    else if (tag != elt.tagName.toLowerCase()) DOM.addID(tag, elt);
    if (CLEAR) this.innerHTML = '';
    if (cls) cls.forEach(c => c ? elt.classList.add(c) : null);
    return this[PREPEND ? 'prepend' : 'append'](elt);
  }
  if (TAG === 'style' && !model.content && !IS_PRIMITIVE) model = DOM.css(model);
  if (station === 'content' && !model.binders) {
    if (CLEAR) this.innerHTML = '';
    if (IS_PRIMITIVE) return this.innerHTML = model;
    let keys = PREPEND ? Object.keys(model).reverse() : Object.keys(model);
    keys.forEach(key => this.create(model[key], key, p5Elem, PREPEND ? false : undefined));
    return this;
  }
  const IS_LISTENER = DOM.listenerStations.includes(station);
  if (modelType.array) {
    if (station === 'class') return model.forEach(c => c ? this.classList.add(c) : null);
    if (IS_LISTENER) return this.addEventListener(...model);
    let map = model.map(m => this.create(m, tag + cls.join('.'), p5Elem, PREPEND ? false : undefined));
    if (id) DOM.addID(id, map);
    return map;
  }
  if (IS_LISTENER) {
    if (model.event) model.type = model.event;
    if (model.function) model.listener = model.function;
    if (model.method) model.listener = model.method;
    if (model.call) model.listener = model.call;
    if (model.options) return this.addEventListener(model.type, model.listener, model.options);
    return this.addEventListener(model.type, model.listener, model.useCapture, model.wantsUntrusted);
  }
  if (station === 'style') {
    if (IS_PRIMITIVE && !IS_HEAD) return this.setAttribute(station, model);
    if (!model.content) {
      if (CLEAR) this.setAttribute(station, '');
      return Object.entries(model).forEach(([key, value]) => this.create(value, key));
    }
    if (DOM.type(model.content).object) model.content = DOM.css(model.content);
  }
  if (IS_PRIMITIVE) {
    if (IS_HEAD) {
      const type = DOM.getDocumentType(model);
      if (station === 'title') return this.innerHTML += `<title>${model}</title>`;
      if (station === 'icon') return this.innerHTML += `<link rel="icon" href="${model}">`;
      if (station === 'charset') return this.innerHTML += `<meta charset="${model}">`;
      if (DOM.htmlEquivs.includes(STATION)) return this.innerHTML += `<meta http-equiv="${DOM.unCamel(STATION)}" content="${model}">`;
      if (DOM.metaNames.includes(station)) return this.innerHTML += `<meta name="${station}" content="${model}">`;
      if (station === 'font') return DOM.style({
        fontFace: {
          fontFamily: model.split('/').pop().split('.')[0],
          src: `url(${model})`
        }
      });
      if (station === 'link') return this.create({
        rel: type,
        href: model
      }, station);
      if (station === 'script') return this.create({
        type: type,
        src: model
      }, station);
    }
    let done = DOM.isStyle(STATION, this) ? this.style[STATION] = model : undefined;
    if (DOM.type(STATION).attribute || station.includes('*')) done = !this.setAttribute(station.replace('*', ''), model);
    if (station === 'id') DOM.addID(model, this);
    if (done !== undefined) return;
  }
  let elem = (model.tagName || model.elt) ? model : false;
  if (!elem) {
    if (!tag || !isNaN(tag)) tag = 'div';
    tag = tag.replace('*', '');
    elem = p5Elem ? createElement(tag) : document.createElement(tag);
    elem.create(model, p5Elem);
  }
  elt = p5Elem ? elem.elt : elem;
  if (cls) cls.forEach(c => c ? elt.classList.add(c) : null);
  if (id) elt.setAttribute('id', id);
  this[PREPEND ? 'prepend' : 'append'](elt);
  if (model.ready) model.ready(elem);
  if (model.onready) model.onready(elem);
  if (model.done) model.done(elem);
  if (model.ondone) model.ondone(elem);
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
    this._listeners = {};
    this._listenerCount = 0;
    this.onvalue = v => v;
    this.update = bond => {
      if (!bond.target) return;
      let theirValue = bond.onvalue(this._value);
      if (bond.target.tagName) return bond.target.create(theirValue, bond.station);
      if (bond.target._bonds) bond.target.setter = this; // knowing the setter prevents co-binder's loop
      bond.target[bond.station] = theirValue;
    }
  }
  addListener(func) {
    if (typeof func !== 'function') return;
    this._listeners[this._listenerCount] = func;
    return this._listenerCount++;
  }
  removeListener(countIndex) {
    delete this._listeners[countIndex];
  }
  bind(...args) {
    let argsType = DOM.type(...args);
    let target = argsType.element ? argsType.element : argsType.binder;
    let onvalue = argsType.function;
    let station = argsType.string;
    let listener = argsType.number;
    if (!target) return DOM.bind(this, ...args, this.addListener(onvalue)); // bind() addListener if not in a model
    if (listener) this.removeListener(listener); // if in a model, this will remove the listener
    let bond = {
      binder: this,
      target: target,
      station: station ? station : 'value',
      onvalue: onvalue ? onvalue : v => v
    }
    this._bonds.push(bond);
    this.update(bond);
  }
  set value(val) {
    this._value = val;
    this._bonds.forEach(bond => bond.target !== this.setter ? this.update(bond) : null);
    this.onvalue(val);
    Object.values(this._listeners).forEach(func => func(val));
    this.setter = undefined;
  }
  get value() {
    return this._value;
  }
}

// global static methods to handle the DOM
class DOM {
  static STYLE = 'DOM_STYLE';
  static SET = 'DOM_SET';
  static isSet = b => typeof b === 'boolean' ? window[DOM.SET] = b : !!window[DOM.SET];
  static isStyled = b => typeof b === 'boolean' ? window[DOM.STYLE] = b : !!window[DOM.STYLE];
  // created the element and props in the  body or an element passed
  static create(model, ...args) {
    let argsType = DOM.type(...args);
    let elt = argsType.element ? argsType.element : argsType.p5Element;
    if (elt) return elt.create(model, ...args);
    let headModel = {};
    let headTags = ['meta', 'link', 'title', 'font', 'icon', ...DOM.metaNames, ...DOM.htmlEquivs];
    Object.keys(model)
      .filter(key => headTags.includes(key.toLocaleLowerCase()))
      .forEach(key => {
        headModel[key] = model[key];
        delete model[key];
      });
    document.head.create(headModel);
    if (!document.body) window.addEventListener('load', _ => document.body.create(model, ...args));
    else document.body.create(model, ...args);
  }
  // returns a bind for element's props to use ONLY whithin a create() model
  static bind(binders, onvalue = v => v, listener) {
    if (!Array.isArray(binders)) binders = [binders];
    if (binders.some(binder => !Array.isArray(binder._bonds))) return console.log(binders, 'Non-binder found.');
    return {
      listener: listener,
      binders: binders,
      onvalue: _ => onvalue(...binders.map(binder => binder.value))
    }
  }
  // adds styles to the head as global CSS
  static style(style) {
    if (!DOM.isStyled()) {
      DOM.isStyled(true);
      let reset = {
        '*': {
          boxSizing: 'border-box',
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
          backgroundColor: 'transparent',
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
        a: {
          textDecoration: 'none',
          cursor: 'pointer',
          color: 'blue',
        },
        'input, button, select': {
          padding: '0.25em',
          margin: '0.25em',
          borderRadius: '0.25em',
          border: 'solid 1px gray',
        },
        'button, input[type= "button"]': {
          cursor: 'pointer',
          color: 'blue',
          borderColor: 'blue',
          minWidth: '4em'
        }
      };
      const H = 6;
      (new Array(H)).fill().forEach((_, i) => reset[`h${i + 1}`] = new Object({
        fontSize: `${Math.round(100 * (2 - i / H)) / 100}em`,
      }));
      DOM.style(reset);
    }
    if (!style) return;
    if (Array.isArray(style)) return style.forEach(s => DOM.style(s));
    if (typeof style === 'string') return document.head.create({
      content: style
    }, 'style');
    if (Object.keys(style).some(key => DOM.isStyle(key))) DOM.create(style);
    DOM.style(DOM.css(style));
  }
  /* converts JSON to CSS, nestings and all. Models can have id: & class: properties to be added to the selector.
  "_" in selectors are turned into ".". Use a trailing "_" to affect any selector under the parent, instead of default immediate child (>), or add an "all: true" property.*/
  static css(sel, model) {
    const assignAll = (arr = [], dest = {}) => {
      arr.forEach(prop => Object.assign(dest, prop));
      return dest;
    }
    if (typeof sel !== 'string') {
      if (!sel) return;
      if (Array.isArray(sel)) sel = assignAll(sel);
      if (sel.tag || sel.id || sel.class) return DOM.css(sel.tag ? sel.tag : '', sel);
      return Object.entries(sel).map(([key, value]) => DOM.css(key, value)).join(' ');
    }
    let extra = [];
    let cls = sel.split('_');
    sel = cls.shift();
    if (sel === 'h') {
      cls = cls.length ? ('.' + cls.join('.')) : '';
      sel = Array(6).fill().map((_, i) => 'h' + (i + 1) + cls).join(', ');
      cls = [];
    }
    if (sel.toLowerCase() === 'fontface') sel = '@font-face';
    if (DOM.type(model).primitive !== undefined) return `${DOM.unCamel(sel)}: ${model};\n`;
    //if (Array.isArray(model)) model = assignAll(model);
    if (Array.isArray(model)) return model.map(m => DOM.css(sel, m)).join(' ');
    if (model.class) cls.push(...model.class.split(' '));
    if (model.id) sel += '#' + model.id;
    delete model.class;
    delete model.id;
    if (cls.length) sel += '.' + cls.join('.');
    let css = Object.entries(model).map(([key, style]) => {
      if (style === undefined || style === null) return;
      if (DOM.type(style).primitive !== undefined) return DOM.css(key, style);
      let sub = DOM.unCamel(key.split('(')[0]);
      let xSel = `${sel}>${key}`;
      let subType = DOM.type(sub);
      if (subType.pseudoClass) xSel = `${sel}:${sub}`;
      else if (subType.pseudoElement) xSel = `${sel}::${sub}`;
      else if (['_', '.'].some(s => key.startsWith(s))) xSel = `${sel}${sub}`;
      else if (['_', '.'].some(s => key.endsWith(s)) || style.all) xSel = `${sel} ${sub}`;
      delete style.all;
      extra.push(DOM.css(xSel, style));
    }).join(' ');
    return (css ? `\n${sel} {\n ${css}}` : '') + extra.join(' ');
  }
  //creates an element and returns the html code for it
  static html(model, tag = 'div') {
    let output;
    let elt = DOM.create({
      content: model,
      onready: e => output = e.outerHTML
    }, tag);
    document.body.removeChild(elt);
    return output;
  }
  static querystring() {
    var qs = location.search.substring(1);
    if (!qs) return Object();
    if (qs.includes('=')) return JSON.parse('{"' + decodeURI(location.search.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
    return qs.split('/');
  }
  // auxiliary methods
  static addID = (id, elt) => {
    if (Array.isArray(elt)) return elt.forEach(e => DOM.addID(id, e));
    if (!window[id]) return window[id] = elt;
    if (Array.isArray(window[id])) return window[id].push(elt);
    window[id] = [window[id], elt];
  };
  static type = (...args) => {
    if (args === undefined) return;
    let output = {};
    args.forEach(item => {
      let type = typeof item;
      if (type === 'string') {
        output.strings ? output.strings.push(item) : output.strings = [item];
        if (DOM.events.includes(item)) output.events ? output.events.push(item) : output.events = [item];
        if (DOM.attributes.includes(item)) output.attributes ? output.attributes.push(item) : output.attributes = [item];
        if (DOM.pseudoClasses.includes(item)) output.pseudoClasses ? output.pseudoClasses.push(item) : output.pseudoClasses = [item];
        if (DOM.pseudoElements.includes(item)) output.pseudoElements ? output.pseudoElements.push(item) : output.pseudoElements = [item];
        if (DOM.isStyle(item)) output.styles ? output.styles.push(item) : output.styles = [item];
      }
      if (type === 'number') output.numbers ? output.numbers.push(item) : output.numbers = [item];
      if (type === 'boolean') output.booleans ? output.booleans.push(item) : output.booleans = [item];
      if (['boolean', 'number', 'string'].includes(type)) return output.primitives ? output.primitives.push(item) : output.primitives = [item];
      if (type === 'function') return output.functions ? output.functions.push(item) : output.functions = [item];
      if (Array.isArray(item)) return output.arrays ? output.arrays.push(item) : output.arrays = [item];
      if (item) {
        output.objects ? output.objects.push(item) : output.objects = [item];
        if (item.tagName) return output.elements ? output.elements.push(item) : output.elements = [item];
        if (item.elt) return output.p5Elements ? output.p5Elements.push(item) : output.p5Elements = [item];
        if (item._bonds) return output.binders ? output.binders.push(item) : output.binders = [item];
      }
    });
    if (output.strings) output.string = output.strings[0];
    if (output.numbers) output.number = output.numbers[0];
    if (output.booleans) output.boolean = output.booleans[0];
    if (output.primitives) output.primitive = output.primitives[0];
    if (output.arrays) output.array = output.arrays[0];
    if (output.functions) output.function = output.functions[0];
    if (output.objects) output.object = output.objects[0];
    if (output.elements) output.element = output.elements[0];
    if (output.p5Elements) output.p5Element = output.p5Elements[0];
    if (output.binders) output.binder = output.binders[0];
    if (output.events) output.event = output.events[0];
    if (output.attributes) output.attribute = output.attributes[0];
    if (output.pseudoClasses) output.pseudoClass = output.pseudoClasses[0];
    if (output.pseudoElements) output.pseudoElement = output.pseudoElements[0];
    if (output.styles) output.style = output.styles[0];
    return output;
  };
  static unCamel = str => str.replace(/([A-Z])/g, '-' + '$1').toLowerCase();
  static isStyle = (str, elt) => Object.keys((elt ? elt : document.body ? document.body : document.createElement('div')).style).includes(str);
  static events = ['abort', 'afterprint', 'animationend', 'animationiteration', 'animationstart', 'beforeprint', 'beforeunload', 'blur', 'canplay', 'canplaythrough', 'change', 'click', 'contextmenu', 'copy', 'cut', 'dblclick', 'drag', 'dragend', 'dragenter', 'dragleave', 'dragover', 'dragstart', 'drop', 'durationchange', 'ended', 'error', 'focus', 'focusin', 'focusout', 'fullscreenchange', 'fullscreenerror', 'hashchange', 'input', 'invalid', 'keydown', 'keypress', 'keyup', 'load', 'loadeddata', 'loadedmetadata', 'loadstart', 'message', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseover', 'mouseout', 'mouseup', 'offline', 'online', 'open', 'pagehide', 'pageshow', 'paste', 'pause', 'play', 'playing', 'progress', 'ratechange', 'resize', 'reset', 'scroll', 'search', 'seeked', 'seeking', 'select', 'show', 'stalled', 'submit', 'suspend', 'timeupdate', 'toggle', 'touchcancel', 'touchend', 'touchmove', 'touchstart', 'transitionend', 'unload', 'volumechange', 'waiting', 'wheel'];
  static attributes = ['accept', 'accept-charset', 'accesskey', 'action', 'align', 'alt', 'async', 'autocomplete', 'autofocus', 'autoplay', 'bgcolor', 'border', 'charset', 'checked', 'cite', 'class', 'color', 'cols', 'colspan', 'content', 'contenteditable', 'controls', 'coords', 'data', 'datetime', 'default', 'defer', 'dir', 'dirname', 'disabled', 'download', 'draggable', 'enctype', 'for', 'form', 'formaction', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'http-equiv', 'id', 'ismap', 'kind', 'lang', 'list', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'multiple', 'muted', 'name', 'novalidate', 'open', 'optimum', 'pattern', 'placeholder', 'poster', 'preload', 'readonly', 'rel', 'required', 'reversed', 'rows', 'rowspan', 'sandbox', 'scope', 'selected', 'shape', 'size', 'sizes', 'spellcheck', 'src', 'srcdoc', 'srclang', 'srcset', 'start', 'step', 'style', 'tabindex', 'target', 'title', 'translate', 'type', 'usemap', 'value', 'wrap', 'width'];
  static pseudoClasses = ['active', 'checked', 'disabled', 'empty', 'enabled', 'first-child', 'first-of-type', 'focus', 'hover', 'in-range', 'invalid', 'last-of-type', 'link', 'only-of-type', 'only-child', 'optional', 'out-of-range', 'read-only', 'read-write', 'required', 'root', 'target', 'valid', 'visited', 'lang', 'not', 'nth-child', 'nth-last-child', 'nth-last-of-type', 'nth-of-type'];
  static pseudoElements = ['after', 'before', 'first-letter', 'first-line', 'selection'];
  static metaNames = ['viewport', 'keywords', 'description', 'author', 'refresh', 'application-name', 'generator'];
  static htmlEquivs = ['contentSecurityPolicy', 'contentType', 'defaultStyle', 'content-security-policy', 'content-type', 'default-style', 'refresh'];
  static reserveStations = ['tag', 'id', 'onready', 'ready', 'done', 'ondone'];
  static listenerStations = ['addevent', 'addeventlistener', 'eventlistener', 'listener', 'on'];
  static getDocumentType = str => typeof str === 'string' ? new Object({
    css: 'stylesheet',
    sass: 'stylesheet/sass',
    scss: 'stylesheet/scss',
    less: 'stylesheet/less',
    js: 'text/javascript',
    ico: 'icon'
  })[str.split('.').pop()] : undefined;
}
