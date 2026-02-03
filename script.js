
const newTaskButton = document.getElementById("newTaskBtn");
const modal = document.getElementById("newTaskModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const newTaskForm = document.getElementById("newTaskForm");

const openModal = () => {
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
};

const closeModal = () => {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  newTaskForm.reset();
};

newTaskButton.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

const downloadButton = document.getElementById("loadTasksBtn");

const loadTasks = async () => {
  const tableBody = document.getElementById("tasksTableBody");
  tableBody.innerHTML = "<tr><td colspan=\"11\" class=\"table-empty\">Loading...</td></tr>";

  // Use an assigneeId that matches what you stored in Cosmos (from your test item)
  const assigneeId = "user-001";
  // console.log(encodeURIComponent(assigneeId));

  try {
    const resp = await fetch(`/api/tasks?assigneeId=${assigneeId}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const tasks = await resp.json();
    console.log(tasks);

    if (!tasks.length) {
      tableBody.innerHTML = "<tr><td colspan=\"11\" class=\"table-empty\">No tasks found</td></tr>";
      return;
    }

    const fragment = document.createDocumentFragment();

    tasks.forEach((task) => {
      const row = document.createElement("tr");
      const cells = [
        task.id,
        task.assigneeId,
        task.userName,
        task.userEmail,
        task.taskName,
        task.priority,
        task.period,
        task.stardDate,
        task.dueDate,
        task.status,
      ];

      cells.forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value || "";
        row.appendChild(cell);
      });

      const actionCell = document.createElement("td");
      actionCell.innerHTML = `<button class="btn btn-secondary" type="button" onclick="alert('Edit functionality not implemented yet')">Edit</button>`;
      row.appendChild(actionCell);

      fragment.appendChild(row);
    });

    tableBody.innerHTML = "";
    tableBody.appendChild(fragment);
  } catch (err) {
    console.error(err);
    tableBody.innerHTML = "<tr><td colspan=\"11\" class=\"table-empty\">Failed to load tasks</td></tr>";
  }
};

downloadButton.addEventListener("click", loadTasks);

newTaskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const task = {
    id: document.getElementById("taskId").value.trim(),
    assigneeId: document.getElementById("assigneeId").value.trim(),
    userName: document.getElementById("userName").value.trim(),
    userEmail: document.getElementById("userEmail").value.trim(),
    taskName: document.getElementById("taskName").value.trim(),
    priority: document.getElementById("priority").value.trim(),
    period: document.getElementById("period").value.trim(),
    stardDate: document.getElementById("stardDate").value,
    dueDate: document.getElementById("dueDate").value,
    status: document.getElementById("status").value.trim(),
  };

  console.log("Submitting new task:", task);

  try {
    const resp = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });

    if (!resp.ok) {
      const text = await resp.text();   // <- backend usually returns details here
      console.error("POST /api/tasks failed:", resp.status, text);
      throw new Error(`HTTP ${resp.status} - ${text}`);
    }

    closeModal();
    await loadTasks();
  } catch (err) {
    console.error(err);
    alert("Failed to save task");
  }
});