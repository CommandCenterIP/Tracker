const downloadButton = document.getElementById("loadTasksBtn")
downloadButton.addEventListener("click", async () => {
  const tasksList = document.getElementById("tasksList");
  tasksList.innerHTML = "<li>Loading...</li>";

  // Use an assigneeId that matches what you stored in Cosmos (from your test item)
  const assigneeId = "user-001";

  try {
    const resp = await fetch(`/api/tasks?assigneeId=${encodeURIComponent(assigneeId)}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const tasks = await resp.json();
    console.log(tasks)

    if (!tasks.length) {
      tasksList.innerHTML = "<li>No tasks found</li>";
      return;
    }

    tasksList.innerHTML = tasks
      .map(t => `<li>${t.taskName}, ${t.userName}, ${t.id}, ${t.assigneeId}</li>`)
      .join("");
  } catch (err) {
    console.error(err);
    tasksList.innerHTML = "<li>Failed to load tasks</li>";
  }
});