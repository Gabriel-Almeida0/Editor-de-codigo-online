let editor;
let selectedLanguage = 'javascript';
let filesData = {};
let foldersData = {};

function initialize() {
  document.getElementById('editor-container').classList.add('hidden');
  document.getElementById('language-selection').classList.remove('hidden');

  document.getElementById('load-project-btn').addEventListener('click', function() {
    document.getElementById('file-input').click();
  });

  document.getElementById('start-editor-btn').addEventListener('click', function() {
    const language = document.getElementById('language-select').value;
    selectedLanguage = language;
    startEditor(language);
  });

  document.getElementById('file-input').addEventListener('change', function(e) {
    const files = e.target.files;
    if (files.length > 0) {
      loadFiles(files);
    }
  });
}

function startEditor(language) {
  document.getElementById('language-selection').classList.add('hidden');
  document.getElementById('editor-container').classList.remove('hidden');
  const initialCode = (language === 'python') ? 'print("Olá Mundo!")' : 'console.log("Olá Mundo!")';

  require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.39.0/min/vs' } });
  require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('editor'), {
      value: initialCode,
      language: language,
      theme: 'vs-dark',
    });

    document.getElementById('language-display').textContent = `Linguagem: ${capitalizeFirstLetter(language)}`;
  });

  document.getElementById('run-btn').addEventListener('click', function() {
    const code = editor.getValue();
    runCode(code, language);
  });
}

function logError(errorMessage) {
  const outputDiv = document.getElementById('output');
  const line = document.createElement('div');
  line.classList.add('terminal-line');
  line.classList.add('error-output');
  line.textContent = `> Erro: ${errorMessage}`;
  outputDiv.appendChild(line);
  outputDiv.scrollTop = outputDiv.scrollHeight;
}

function runCode(code, language) {
  let output = '';
  let errors = '';

  document.getElementById('output').innerHTML = '<div class="terminal-line">> Executando...</div>';

  if (language === 'javascript') {
    try {
      eval(code);
    } catch (error) {
      logError(error.message);
    }
  } else if (language === 'python') {
    try {
      brython({ debug: 1 });
      eval(code);
    } catch (error) {
      logError(error.message);
    }
  } else {
    logError('Linguagem não suportada para execução no navegador.');
  }
}

function loadFiles(files) {
  const fileListContainer = document.getElementById('file-list');
  fileListContainer.innerHTML = '';

  const fileTree = {};

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const path = file.webkitRelativePath.split('/');
    const fileName = path.pop();
    const folderPath = path.join('/');

    if (!fileTree[folderPath]) {
      fileTree[folderPath] = [];
    }
    fileTree[folderPath].push({ fileName, file });

    const fileExtension = fileName.split('.').pop().toLowerCase();
    let language = 'javascript';
    if (fileExtension === 'py') {
      language = 'python';
    } else if (fileExtension === 'cpp') {
      language = 'cpp';
    } else if (fileExtension === 'java') {
      language = 'java';
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      filesData[file.name] = e.target.result;
    };
    reader.readAsText(file);
  }

  for (const folder in fileTree) {
    const folderElement = document.createElement('div');
    folderElement.textContent = folder;
    folderElement.classList.add('folder-item');
    folderElement.addEventListener('click', function() {
      toggleFolder(folder);
    });

    fileListContainer.appendChild(folderElement);

    const folderContent = document.createElement('div');
    folderContent.classList.add('folder-content');

    fileTree[folder].forEach(file => {
      const fileItem = document.createElement('div');
      fileItem.textContent = file.fileName;
      fileItem.classList.add('file-item');
      fileItem.addEventListener('click', function() {
        openFile(file.fileName);
      });

      folderContent.appendChild(fileItem);
    });

    fileListContainer.appendChild(folderContent);
  }
}

function toggleFolder(folderPath) {
  const folderContent = Array.from(document.querySelectorAll('.folder-content'));
  folderContent.forEach(content => {
    if (content.previousSibling.textContent === folderPath) {
      content.classList.toggle('hidden');
    }
  });
}

function openFile(fileName) {
  const fileContent = filesData[fileName];
  editor.setValue(fileContent);
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
