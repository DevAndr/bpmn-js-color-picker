import {
  domify
} from 'min-dom';
import Pickr from '@simonwep/pickr';
import tinycolor from 'tinycolor2';

const COLORS = [
  {
    label: 'Default',
    fill: undefined,
    stroke: undefined,
    color: '#000',
  },
  {
    label: 'Blue',
    fill: '#BBDEFB',
    stroke: '#2a98f2',
    text: '#000',
  },
  {
    label: 'Orange',
    fill: '#FFE0B2',
    stroke: '#ffa219',
    color: '#000',
  },
  {
    label: 'Green',
    fill: '#C8E6C9',
    stroke: '#5fb662',
    color: '#000',
  },
  {
    label: 'Red',
    fill: '#FFCDD2',
    stroke: '#ff3448',
    color: '#000',
  },
  {
    label: 'Purple',
    fill: '#E1BEE7',
    stroke: '#ad4ebe',
    color: '#000',
  },
  {
    label: 'Other',
    fill: '#c5b8d7',
    stroke: '#2c136f',
    color: '#000',
  }
];

export default function ColorPopupProvider(config, bpmnRendererConfig, popupMenu, modeling, translate, canvas, editorActions, eventBus, commandStack) {
  let self = this;
  this._popupMenu = popupMenu;
  this._modeling = modeling;
  this._translate = translate;
  this._canvas = canvas;
  this._eventBus = eventBus;
  this._commandStack = commandStack;

  this._colors = config && config.colors || COLORS;
  this._defaultFillColor = bpmnRendererConfig && bpmnRendererConfig.defaultFillColor || 'white';
  this._defaultStrokeColor = bpmnRendererConfig && bpmnRendererConfig.defaultStrokeColor || 'rgb(34, 36, 42)';
  this._defaultTextColor = bpmnRendererConfig && bpmnRendererConfig.defaultTextColor || 'black';

  editorActions.register({
    togglePicker: function() {
      self.toggle(canvas);
    }
  });

  this._eventBus.on('selection.changed', function(e) {
    self.selectedElement = e.newSelection[0];
    self.selectedElements = e.newSelection;
  });

  this._popupMenu.registerProvider('color-picker', this);
}


ColorPopupProvider.$inject = [
  'config.colorPicker',
  'config.bpmnRenderer',
  'popupMenu',
  'modeling',
  'translate',
  'canvas',
  'editorActions',
  'eventBus',
  'commandStack'
];

ColorPopupProvider.prototype.getEntries = function(elements) {
  let self = this;

  let colorIcon = domify(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="100%">
      <rect rx="2" x="1" y="1" width="22" height="22" fill="var(--fill-color)" stroke="var(--stroke-color)" style="stroke-width:2"></rect>
    </svg>
  `);

  const pickerIconSvg = domify(`
  <svg fill="#000000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" height="100%"><path d="M27.7,3.3c-1.5-1.5-3.9-1.5-5.4,0L17,8.6l-1.3-1.3c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4l1.3,1.3L5,20.6c-0.6,0.6-1,1.4-1.1,2.3C3.3,23.4,3,24.2,3,25c0,1.7,1.3,3,3,3c0.8,0,1.6-0.3,2.2-0.9C9,27,9.8,26.6,10.4,26L21,15.4l1.3,1.3c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3c0.4-0.4,0.4-1,0-1.4L22.4,14l5.3-5.3C29.2,7.2,29.2,4.8,27.7,3.3z M9,24.6c-0.4,0.4-0.8,0.6-1.3,0.5c-0.4,0-0.7,0.2-0.9,0.5C6.7,25.8,6.3,26,6,26c-0.6,0-1-0.4-1-1c0-0.3,0.2-0.7,0.5-0.8c0.3-0.2,0.5-0.5,0.5-0.9c0-0.5,0.2-1,0.5-1.3L17,11.4l2.6,2.6L9,24.6z"/></svg>
  `);

  let entries = this._colors.map(function(color) {

    colorIcon.style.setProperty('--fill-color', color.fill || self._defaultFillColor);
    colorIcon.style.setProperty('--stroke-color', color.stroke || self._defaultStrokeColor);

    if (color.label === 'Other') {
      return {
        title: self._translate(color.label),
        id: color.label.toLowerCase() + '-color',
        imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(pickerIconSvg.outerHTML)}`,
        action: () => {
          // const id = elements[0].id;
          // const elem = document.querySelector(`[data-element-id="${id}"]`);
          self.toggle(self._canvas);
        }
      };
    }

    return {
      title: self._translate(color.label),
      id: color.label.toLowerCase() + '-color',
      imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(colorIcon.outerHTML)}`,
      action: createAction(self._modeling, elements, color)
    };
  });

  return entries;
};

ColorPopupProvider.prototype.addPicker = function(container) {
  let self = this;
  let pickerColor = '#FF0000';

  let pipette = `<svg id="btn_pickrPickColor" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eyedropper" viewBox="0 0 16 16">
  <path d="M13.354.646a1.207 1.207 0 0 0-1.708 0L8.5 3.793l-.646-.647a.5.5 0 1 0-.708.708L8.293 5l-7.147 7.146A.5.5 0 0 0 1 12.5v1.793l-.854.853a.5.5 0 1 0 .708.707L1.707 15H3.5a.5.5 0 0 0 .354-.146L11 7.707l1.146 1.147a.5.5 0 0 0 .708-.708l-.647-.646 3.147-3.146a1.207 1.207 0 0 0 0-1.708l-2-2zM2 12.707l7-7L10.293 7l-7 7H2v-1.293z"/>
</svg>`;

  let drag = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAABmJLR0QA/wD/AP+gvaeTAAABEUlEQVRIieXWMU4DMRCF4Y9AAkq4EwhRUiBuAzSIC9BQQwPZSCBREAoaUDgXSSg2RrDyLnHirXjSa+zx/PKM12vStIsJHtBLXLu0+vjAfOEndHNDNheJ5xXfYSMn6CoCCT7PBTnCrAE0xWEO0H0DJHj4V5LU+s5XXd9JBK2sGOgYozVyDnHQFLClPF2h8TFVe1MXM8WlSGn7eF4ySUrMI3bCxABvkSS5/Bpg7y1CgkedWB1b0IyydJMWdzPGdiAO8FIJiCn1MNyK3PBdXGcCfeK0Zv5bJyjWAA2xXx38H3ddVYX6UoXxulInaU/Z3NZ/fHDWALrIBaFs+k0EUmihz12/X0JjLb7tesrvpPDjWllGX3IcvacjOopwAAAAAElFTkSuQmCC"/>';
  let closeIcon = `<svg id="btn_close_picker" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
</svg>`;

  let markup = '<section id="pickr" class="colorpickr-container">' +
    '<div class="header">' +
    '<div id="tools1">' + pipette + '</div>' +
    '<div id="pickrheader">' + drag + '</div>' +
    '<div id="tools2">' + closeIcon + '</div>' +
    '</div></section>';

  let pickerElement = domify(markup);
  container.appendChild(pickerElement);

  let newElement = document.createElement('div');
  pickerElement.appendChild(newElement);
  newElement.setAttribute('id', 'pickrwrapper');
  newElement.setAttribute('class', 'pickr');

  this.pickr = new Pickr({
    el: newElement,
    container: newElement,
    default: pickerColor,
    theme: 'classic',
    lockOpacity: true,
    showAlways: true,
    useAsButton: true,

    swatches: [
      'rgba(244, 67, 54, 1)',
      'rgba(233, 30, 99, 1)',
      'rgba(156, 39, 176, 1)',
      'rgba(103, 58, 183, 1)',
      'rgba(63, 81, 181, 1)',
      'rgba(33, 150, 243, 1)',
      'rgba(3, 169, 244, 1)',
      'rgba(0, 188, 212, 1)',
      'rgba(0, 150, 136, 1)',
      'rgba(76, 175, 80, 1)',
      'rgba(139, 195, 74, 1)',
      'rgba(205, 220, 57, 1)',
      'rgba(255, 235, 59, 1)',
      'magenta'
    ],

    components: {
      preview: true,
      opacity: false,
      hue: true,

      interaction: {
        hex: true,
        rgba: false,
        hsla: false,
        hsva: false,
        cmyk: false,
        input: true,
        clear: true,
        save: true
      }
    }
  });


  this.pickr.on('save', (color, instance) => {
    console.log('save');
    if (self.selectedElements != null) {
      let strokeString = '#000000FF';
      if (color != null) {
        strokeString = tinycolor(color.toHEXA().toString()).darken(30).toString();
      }

      self.selectedElements.forEach(function(selElem) {
        self._commandStack.execute('element.setColor', {
          elements: [ selElem ],
          colors: { fill: color != null ? color.toHEXA().toString() : '#FFFFFFFF', stroke: strokeString }
        });
      });
    }
  }).on('changestop', (source, instance) => {
    let color = instance._color;
    console.log('Event: "changestop"', source, self.selectedElement, self, this, color.toHEXA().toString());

    if (self.selectedElements != null) {
      let strokeString = '#000000FF';
      if (color != null) {
        strokeString = tinycolor(color.toHEXA().toString()).darken(30).toString();
      }

      self.selectedElements.forEach(function(selElem) {
        self._commandStack.execute('element.setColor', {
          elements: [ selElem ],
          colors: { fill: color != null ? color.toHEXA().toString() : '#FFFFFFFF', stroke: strokeString }
        });
      });
    }
  });

  dragElement(pickerElement);
  setButtons(this.pickr, self);
};

ColorPopupProvider.prototype.toggle = function(canvas) {
  if (this.isActive) {
    this.pickr.destroyAndRemove();
    document.getElementById('pickr').remove();
    this.pickr = null;
    this.isActive = false;
  } else {
    this.isActive = true;
    this.addPicker(canvas.getContainer().parentNode);
  }
};

ColorPopupProvider.prototype._getColorFill = function(element) {
  if (element != null) {
    if (element.di != null && element.di.fill != null) {
      return element.di.fill;
    }
  }
  return null;
};

ColorPopupProvider.prototype._getColorStroke = function(element) {
  if (element != null) {
    if (element.di != null && element.di.stroke != null) {
      return element.di.stroke;
    }
  }
  return null;
};

function dragElement(elmnt) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + 'header')) {
    document.getElementById(elmnt.id + 'header').onmousedown = dragMouseDown;
  } else {
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    pos3 = parseInt(e.clientX);
    pos4 = parseInt(e.clientY);
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
    return false;
  }

  function elementDrag(e) {
    e = e || window.event;
    pos1 = pos3 - parseInt(e.clientX);
    pos2 = pos4 - parseInt(e.clientY);
    pos3 = parseInt(e.clientX);
    pos4 = parseInt(e.clientY);
    elmnt.style.top = (elmnt.offsetTop - pos2) + 'px';
    elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px';
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function setButtons(pickr, self) {
  document.getElementById('btn_pickrPickColor').onclick = pickColor;
  document.getElementById('btn_close_picker').onclick = close;

  function close(e) {
    self.toggle(self._canvas);
  }
  function pickColor(e) {
    console.log('btn_pickrPickColor', e.target);

    e.target.setAttribute('class', 'active-btn');

    let colorFill = ColorPopupProvider.prototype._getColorFill(self.selectedElement);
    self.colorFill = colorFill != null ? colorFill : 'white';
    if (pickr != null) {
      if (!self.mode_pickrStroke) pickr.setColor(self.colorFill, true);
    }

    let colorStroke = ColorPopupProvider.prototype._getColorStroke(self.selectedElement);
    self.colorStroke = colorStroke != null ? colorStroke : 'black';
    if (pickr != null) {
      if (self.mode_pickrStroke) {
        pickr.setColor(self.colorStroke, true);
        e.target.removeAttribute('class');
      }
    }

    return false;
  }
}

function createAction(modeling, element, color) {
  return function() {
    modeling.setColor(element, color);
  };
}