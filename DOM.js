/**
 * Creates DOM structures from a JS object (structure)
 * @author Lenin Compres <lenincompres@gmail.com>
 * @version 1.0.5
 * @repository https://github.com/lenincompres/DOM.create
 */

Element.prototype.get = function (station) {
  if (['content', 'inner', 'innerhtml', 'html'].includes(station)) station = 'innerHTML';
  if (['text'].includes(station)) station = 'innerText';
  if (['outer', 'self'].includes(station)) station = 'outerHTML';
  if (DOM.attributes.includes(station)) return this.getAttribute(station);
  if (DOM.isStyle(station, this)) return this.style[station];
  let output = station ? this[station] : this.value;
  if (output !== undefined && output !== null) return output;
  if(!station) this.innerHTML;
  output = [...this.querySelectorAll(':scope>' + station)];
  if (output.length) return output.length < 2 ? output[0] : output;
  output = [...this.querySelectorAll(station)];
  if (output.length) return output.length < 2 ? output[0] : output;
}

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
  const TAG = this.tagName.toLowerCase();
  const IS_HEAD = TAG === 'head';
  const CLEAR = argsType.boolean === true || argsType.string === 'content';
  let station = argsType.string; // original style|attr|tag|inner…|on…|name
  if ([undefined, 'model', 'inner'].includes(station)) station = 'content';
  const STATION = station;
  station = station.toLowerCase(); // station lowercase
  if (station === 'content' && TAG === 'meta') station = '*content'; // disambiguate
  if (DOM.reserveStations.includes(station)) return;
  const IS_CONTENT = station === 'content';
  const IS_LISTENER = DOM.listeners.includes(station);
  const PREPEND = argsType.boolean === false;
  const p5Elem = argsType.p5Element;
  if (modelType.function) {
    if (DOM.type(STATION).event) return this.addEventListener(STATION, model);
    else if (p5Elem && typeof p5Elem[STATION] === 'function') return p5Elem[STATION](model);
    else return this[STATION] = model;
  }
  if (model._bonds) model = model.bind();
  if (model.binders) return model.binders.forEach(binder => binder.bind(this, STATION, model.onvalue, model.listener));
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
  cls = cls.filter(c => c !== null);
  let id;
  if (tag.includes('#'))[tag, id] = tag.split('#');
  let lowTag = (model.tag ? model.tag : tag).toLowerCase();
  // camelCase tags are interpreted as id
  if (lowTag != tag && tag[0] === tag[0].toLowerCase()) {
    id = tag;
    tag = 'div';
  }
  tag = lowTag;
  if (model.id) id = model.id;
  let elt = modelType.p5Element ? model.elt : modelType.element;
  if (elt) {
    if (id) DOM.addID(id, elt);
    else if (tag != elt.tagName.toLowerCase()) DOM.addID(tag, elt);
    if (CLEAR) this.innerHTML = '';
    if (cls.length) elt.classList.add(...cls);
    return this[PREPEND ? 'prepend' : 'append'](elt);
  }
  if (TAG === 'style' && !model.content && !IS_PRIMITIVE) model = DOM.css(model);
  if (IS_CONTENT && !model.binders) {
    if (CLEAR) this.innerHTML = '';
    if (IS_PRIMITIVE) return this.innerHTML = model;
    let keys = PREPEND ? Object.keys(model).reverse() : Object.keys(model);
    keys.forEach(key => this.create(model[key], key, p5Elem, PREPEND ? false : undefined));
    return this;
  }
  if (modelType.array) {
    if (station === 'class') return model.forEach(c => c ? this.classList.add(c) : null);
    if (IS_LISTENER) return this.addEventListener(...model);
    let map = model.map(m => this.create(m, [tag, ...cls].join('.'), p5Elem, PREPEND ? false : undefined));
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
      if (station === 'title') return this.innerHTML += `<title>${model}</title>`;
      if (station === 'icon') return this.innerHTML += `<link rel="icon" href="${model}">`;
      if (station === 'charset') return this.innerHTML += `<meta charset="${model}">`;
      if (DOM.metaNames.includes(station)) return this.innerHTML += `<meta name="${station}" content="${model}">`;
      if (DOM.htmlEquivs.includes(STATION)) return this.innerHTML += `<meta http-equiv="${DOM.unCamel(STATION)}" content="${model}">`;
      if (station === 'font') return DOM.style({
        fontFace: {
          fontFamily: model.split('/').pop().split('.')[0],
          src: `url(${model})`
        }
      });
      const type = DOM.getDocumentType(model);
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
    if (model === 'test') console.log('test', model, done);
    if (DOM.type(STATION).attribute || station.includes('*')) done = !this.setAttribute(station.replace('*', ''), model);
    if (station === 'id') DOM.addID(model, this);
    if (done !== undefined) return;
  }
  let elem = (model.tagName || model.elt) ? model : false;
  if (!elem) {
    if (tag && tag.length) tag = tag.replace('*', '');
    if (!tag || !isNaN(tag) || !tag.length) tag = 'div';
    elem = p5Elem ? createElement(tag) : document.createElement(tag);
    elem.create(model, p5Elem);
  }
  elt = p5Elem ? elem.elt : elem;
  if (cls.length) elt.classList.add(...cls);
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
  let thisStyle = {};
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

// Update props of bound element when its value changes. Can also update other binders.
class Binder {
  constructor(val) {
    this._value = val;
    this._bonds = [];
    this._listeners = {};
    this._listenerCount = 0;
    this.onvalue = v => v;
    this.update = bond => {
      if (!bond.target) return;
      let val = bond.onvalue(this._value);
      if (bond.target.tagName) {
        if (bond.station === 'value') return bond.target.value != val ? bond.target.value = val : null;
        return bond.target.create(val, bond.station, true);
      }
      if (bond.target._bonds) bond.target.setter = this; // knowing the setter prevents co-binder's loop
      bond.target[bond.station] = val;
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
    onvalue = typeof (onvalue === 'function') ? onvalue : v => v;
    let station = argsType.string ? argsType.string : 'value';
    let doubleBound = station === 'value';
    let listener = argsType.number;
    if (!target) return DOM.bind(this, ...args, this.addListener(onvalue)); // bind() addListener if not in a model
    if (listener) this.removeListener(listener); // if in a model, this will remove the listener
    let bond = {
      binder: this,
      target: target,
      station: station,
      onvalue: onvalue,
      changeListerner: doubleBound ? target.addEventListener('change', e => this.value = target.value) : undefined
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
  static get(...args) {
    let argsType = DOM.type(...args);
    let station = argsType.string;
    let elt = argsType.element ? argsType.element : document.body;
    return elt.get(station)
  }
  static create(model, ...args) {
    let argsType = DOM.type(...args);
    let elt = argsType.element ? argsType.element : argsType.p5Element;
    if (elt) return elt.create(model, ...args);
    let headModel = {};
    let headTags = ['meta', 'link', 'title', 'font', 'icon', ...DOM.metaNames, ...DOM.htmlEquivs];
    Object.keys(model).forEach(key => {
      if (headTags.includes(key.toLowerCase())) {
        headModel[key] = model[key];
        delete model[key];
      }
    });
    document.head.create(headModel);
    if (document.body) return document.body.create(model, ...args);
    window.addEventListener('load', _ => document.body.create(model, ...args));
  }
  // returns a bind for element's props to use ONLY in a create() model
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
    if (!window['DOM_STYLED']) {
      window['DOM_STYLED'] = true;
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
      DOM.style(DOM.css(reset));
    }
    if (!style) return;
    if (Array.isArray(style)) return style.forEach(s => DOM.style(s));
    if (typeof style === 'string') return document.head.create({
      content: style
    }, 'style');
    DOM.style(DOM.css(style));
  }
  /* converts JSON to CSS, nestings and all. Models can have id: & class: properties to be added to the selector. "_" in selectors are turned into ".". Use trailing "_" to affect all selectors under the parent, instead of default immediate child (>).*/
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
      else if (['_', '.'].some(s => key.endsWith(s)) || style.all) xSel = `${sel} ${sub.substring(0, sub.length-1)}`;
      delete style.all;
      extra.push(DOM.css(xSel, style));
    }).join(' ');
    return (css ? `\n${sel} {\n ${css}}` : '') + extra.join(' ');
  }
  // auxiliary methods
  // returns html based on model without adding it to the document
  static html(model, tag = 'div') {
    let output;
    DOM.create({
      content: model,
      onready: elt => {
        output = elt.outerHTML;
        elt.remove();
      }
    }, tag);
    return output;
  }
  // returns querystring as a structural object 
  static querystring() {
    var qs = location.search.substring(1);
    if (!qs) return Object();
    if (qs.includes('=')) return JSON.parse('{"' + decodeURI(location.search.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
    return qs.split('/');
  }
  static getQuerystring() {
    return DOM.querystring();
  }
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
  static isStyle = (str, elt) => ((elt ? elt : document.body ? document.body : document.createElement('div')).style)[str] !== undefined;
  static events = ['abort', 'afterprint', 'animationend', 'animationiteration', 'animationstart', 'beforeprint', 'beforeunload', 'blur', 'canplay', 'canplaythrough', 'change', 'click', 'contextmenu', 'copy', 'cut', 'dblclick', 'drag', 'dragend', 'dragenter', 'dragleave', 'dragover', 'dragstart', 'drop', 'durationchange', 'ended', 'error', 'focus', 'focusin', 'focusout', 'fullscreenchange', 'fullscreenerror', 'hashchange', 'input', 'invalid', 'keydown', 'keypress', 'keyup', 'load', 'loadeddata', 'loadedmetadata', 'loadstart', 'message', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseover', 'mouseout', 'mouseup', 'offline', 'online', 'open', 'pagehide', 'pageshow', 'paste', 'pause', 'play', 'playing', 'progress', 'ratechange', 'resize', 'reset', 'scroll', 'search', 'seeked', 'seeking', 'select', 'show', 'stalled', 'submit', 'suspend', 'timeupdate', 'toggle', 'touchcancel', 'touchend', 'touchmove', 'touchstart', 'transitionend', 'unload', 'volumechange', 'waiting', 'wheel'];
  static attributes = ['accept', 'accept-charset', 'accesskey', 'action', 'align', 'alt', 'async', 'autocomplete', 'autofocus', 'autoplay', 'bgcolor', 'border', 'charset', 'checked', 'cite', 'class', 'color', 'cols', 'colspan', 'content', 'contenteditable', 'controls', 'coords', 'data', 'datetime', 'default', 'defer', 'dir', 'dirname', 'disabled', 'download', 'draggable', 'enctype', 'for', 'form', 'formaction', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'http-equiv', 'id', 'ismap', 'kind', 'lang', 'list', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'multiple', 'muted', 'name', 'novalidate', 'open', 'optimum', 'pattern', 'placeholder', 'poster', 'preload', 'readonly', 'rel', 'required', 'reversed', 'rows', 'rowspan', 'sandbox', 'scope', 'selected', 'shape', 'size', 'sizes', 'spellcheck', 'src', 'srcdoc', 'srclang', 'srcset', 'start', 'step', 'style', 'tabindex', 'target', 'title', 'translate', 'type', 'usemap', 'value', 'wrap', 'width'];
  static pseudoClasses = ['active', 'checked', 'disabled', 'empty', 'enabled', 'first-child', 'first-of-type', 'focus', 'hover', 'in-range', 'invalid', 'last-of-type', 'link', 'only-of-type', 'only-child', 'optional', 'out-of-range', 'read-only', 'read-write', 'required', 'root', 'target', 'valid', 'visited', 'lang', 'not', 'nth-child', 'nth-last-child', 'nth-last-of-type', 'nth-of-type'];
  static pseudoElements = ['after', 'before', 'first-letter', 'first-line', 'selection'];
  static metaNames = ['viewport', 'keywords', 'description', 'author', 'refresh', 'application-name', 'generator'];
  static htmlEquivs = ['contentSecurityPolicy', 'contentType', 'defaultStyle', 'content-security-policy', 'content-type', 'default-style', 'refresh'];
  static reserveStations = ['tag', 'id', 'onready', 'ready', 'done', 'ondone'];
  static listeners = ['addevent', 'addeventlistener', 'eventlistener', 'listener', 'on'];
  static getDocumentType = str => typeof str === 'string' ? new Object({
    css: 'stylesheet',
    sass: 'stylesheet/sass',
    scss: 'stylesheet/scss',
    less: 'stylesheet/less',
    js: 'text/javascript',
    ico: 'icon'
  })[str.split('.').pop()] : undefined;
}
