import newDiagramXML from './newDiagram.bpmn';
import $ from 'jquery';
import ColorPickerModule from '..';
import resizeAllModule from '../resizer';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'toolcool-color-picker';

const container = $('.modeler');
const errors = document.querySelector('.errors');
const canvas = document.querySelector('#canvas');

const modeler = new BpmnModeler({
  container: canvas,
  additionalModules: [
    ColorPickerModule,
    resizeAllModule
  ],
  keyboard: {
    bindTo: window
  }
});

async function openDiagram(file) {
  try {
    await modeler.importXML(file);
    container.removeClass('with-error').addClass('with-diagram');
  } catch (err) {
    errors.textContent = err.message;
    container.removeClass('with-diagram').addClass('with-error');
    errors.textContent = `Error open diagram: ${err}`;
  }
}

function createDiagram() {
  openDiagram(newDiagramXML);
}

function registerFileDrop(container, callback) {
  function handleFileSelect(e) {
    e.stopPropagation();
    e.preventDefault();

    let files = e.dataTransfer.files;
    let file = files[0];
    let reader = new FileReader();

    reader.onload = function(e) {
      let xml = e.target.result;
      callback(xml);
    };

    reader.readAsText(file);
  }

  function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  container.get(0).addEventListener('dragover', handleDragOver, false);
  container.get(0).addEventListener('drop', handleFileSelect, false);
}

function debounce(fn, timeout) {
  let timer;

  return function() {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(fn, timeout);
  };
}

if (!window.FileList || !window.FileReader) {
  window.alert(
    'Looks like you use an older browser that does not support drag and drop. ' +
    'Try using Chrome, Firefox or the Internet Explorer > 10.');
} else {
  registerFileDrop(container, openDiagram);
}

$(function() {
  $('#js-create-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    createDiagram();
  });

  let downloadLink = $('#js-download-diagram');
  let downloadSvgLink = $('#js-download-svg');

  $('.buttons a').click(function(e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  function setEncoded(link, name, data) {
    let encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass('active').attr({
        'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
    }
  }

  let exportArtifacts = debounce(async function() {
    try {
      const { svg } = await modeler.saveSVG();
      setEncoded(downloadSvgLink, 'diagram.svg', svg);
    } catch (err) {
      console.error('Error happened saving svg: ', err);
      errors.textContent = `Error happened saving svg: ${err}`;
      setEncoded(downloadSvgLink, 'diagram.svg', null);
    }

    try {
      const { xml } = await modeler.saveXML({ format: true });
      setEncoded(downloadLink, 'diagram.bpmn', xml);
    } catch (err) {
      console.error('Error happened saving XML: ', err);
      errors.textContent = `Error happened saving XML: ${err}`;
      setEncoded(downloadLink, 'diagram.bpmn', null);
    }
  }, 500);

  modeler.on('commandStack.changed', exportArtifacts);
});