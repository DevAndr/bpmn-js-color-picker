import {
  domify
} from 'min-dom';

const COLORS = [ {
  label: 'Default',
  fill: undefined,
  stroke: undefined,
  color: '#000',
  'border-color': 'red'
}, {
  label: 'Blue',
  fill: '#BBDEFB',
  stroke: '#0D4372',
  text: '#000',
  'border-color': 'red'
}, {
  label: 'Orange',
  fill: '#FFE0B2',
  stroke: '#6B3C00',
  color: '#000',
  'border-color': 'red'
}, {
  label: 'Green',
  fill: '#C8E6C9',
  stroke: '#205022',
  color: '#000',
  'border-color': 'red'
}, {
  label: 'Red',
  fill: '#FFCDD2',
  stroke: '#831311',
  color: '#000',
  'border-color': 'red'
}, {
  label: 'Purple',
  fill: '#E1BEE7',
  stroke: '#5B176D',
  color: '#000',
  'border-color': 'red'
} ];


export default function ColorPopupProvider(config, bpmnRendererConfig, popupMenu, modeling, translate) {
  this._popupMenu = popupMenu;
  this._modeling = modeling;
  this._translate = translate;

  this._colors = config && config.colors || COLORS;
  this._defaultFillColor = bpmnRendererConfig && bpmnRendererConfig.defaultFillColor || 'white';
  this._defaultStrokeColor = bpmnRendererConfig && bpmnRendererConfig.defaultStrokeColor || 'rgb(34, 36, 42)';
  this._defaultTextColor = bpmnRendererConfig && bpmnRendererConfig.defaultTextColor || 'black';

  this._popupMenu.registerProvider('color-picker', this);
}


ColorPopupProvider.$inject = [
  'config.colorPicker',
  'config.bpmnRenderer',
  'popupMenu',
  'modeling',
  'translate'
];


ColorPopupProvider.prototype.getEntries = function(elements) {
  var self = this;

  var colorIcon = domify(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="100%">
      <rect rx="2" x="1" y="1" width="22" height="22" fill="var(--fill-color)" color="var(--text-color)" stroke="var(--stroke-color)" style="stroke-width:2"></rect>
    </svg>
  `);

  var entries = this._colors.map(function(color) {

    colorIcon.style.setProperty('--fill-color', color.fill || self._defaultFillColor);
    colorIcon.style.setProperty('--stroke-color', color.stroke || self._defaultStrokeColor);
    colorIcon.style.setProperty('--text-color', color.text || self._defaultTextColor);
    colorIcon.style.setProperty('--color', color.text || self._defaultTextColor);
    colorIcon.style.setProperty('color', color.text || self._defaultTextColor);

    return {
      title: self._translate(color.label),
      id: color.label.toLowerCase() + '-color',
      imageUrl: `data:image/svg+xml;utf8,${ encodeURIComponent(colorIcon.outerHTML) }`,
      action: createAction(self._modeling, elements, color)
    };
  });

  return entries;
};


function createAction(modeling, element, color) {
  return function() { 
    modeling.setColor(element, color);
  };
}