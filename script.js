let tasks = [];

function addTask() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (text) {
    tasks.push({ text, done: false });
    input.value = '';
    renderTasks();
  }
}

function toggleTask(index) {
  tasks[index].done = !tasks[index].done;
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  renderTasks();
}

function moveTaskUp(index) {
  if (index > 0) {
    [tasks[index - 1], tasks[index]] = [tasks[index], tasks[index - 1]];
    renderTasks();
  }
}

function moveTaskDown(index) {
  if (index < tasks.length - 1) {
    [tasks[index], tasks[index + 1]] = [tasks[index + 1], tasks[index]];
    renderTasks();
  }
}


function downloadIt() {
  const notepadContent = document.getElementById('notepad').value;
  const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(notepadContent);
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "notepad.txt");
  dlAnchor.click();
}

function renderTasks() {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    if (task.done) li.classList.add('done');

    const span = document.createElement('span');
    span.textContent = task.text;
    span.onclick = () => toggleTask(index);

    const upButton = document.createElement('button');
    upButton.textContent = '↑';
    upButton.onclick = () => moveTaskUp(index);

    const downButton = document.createElement('button');
    downButton.textContent = '↓';
    downButton.onclick = () => moveTaskDown(index);

    const delButton = document.createElement('button');
    delButton.textContent = '✕';
    delButton.onclick = () => deleteTask(index);

    const buttonGroup = document.createElement('div');
    buttonGroup.style.display = 'flex';
    buttonGroup.style.gap = '4px';
    buttonGroup.appendChild(upButton);
    buttonGroup.appendChild(downButton);
    buttonGroup.appendChild(delButton);

    li.appendChild(span);
    li.appendChild(buttonGroup);
    taskList.appendChild(li);
  });


}

document.addEventListener('DOMContentLoaded', renderTasks);
