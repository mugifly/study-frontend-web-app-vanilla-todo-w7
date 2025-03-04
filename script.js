let taskListElem;

let tasks = [];

window.addEventListener("load", function () {
  // リストを取得
  taskListElem = document.querySelector("#taskList");
  // LocalStorageから配列を読み込む
  loadTasks();
  // 描画
  renderTasks();
});

function renderTasks() {
  // ul要素の中身をクリア
  taskListElem.innerHTML = "";

  let numOfCompletedTasks = 0;
  console.log(tasks);
  // 操作された内容で再度li要素を追加
  for (let task of tasks) {
    // リストの項目を作成
    let taskContainerElem = document.createElement("div");
    let taskElem = document.createElement("input");
    taskElem.type = "checkbox";
    taskElem.id = "check" + task.name;
    let taskLabelElem = document.createElement("label");
    taskLabelElem.htmlFor = "check" + task.name;
    taskLabelElem.innerText = task.name;

    // 項目をクリックされたときの動作を設定
    taskElem.addEventListener("change", function () {
      // リストの項目をクリックされたときは、タスクの完了状態を設定
      window.setTimeout(() => {
        setTaskComplete(task.name, this.checked);
      }, 100);
    });

    // 項目をダブルクリックされたときの動作を設定
    taskLabelElem.addEventListener("dblclick", function () {
      // リストの項目をダブルクリックされたときは、タスクを削除
      deleteTask(task.name);
    });

    // タスクの完了状態に応じて項目にチェックと取り消し線を入れる
    if (task.isCompleted) {
      taskLabelElem.style.textDecorationLine = "line-through";
      taskElem.checked = true;
      numOfCompletedTasks++;
    } else {
      taskLabelElem.style.textDecorationLine = "none";
      taskElem.checked = false;
    }

    // 期限表示を作成
    let taskDueDateElem = document.createElement("span");
    taskDueDateElem.style.fontSize = "0.8rem";
    taskDueDateElem.style.fontStyle = "italic";
    taskDueDateElem.style.marginLeft = "1rem";
    if (task.dueDate) {
      taskDueDateElem.innerText = task.dueDate;
    } else {
      taskDueDateElem.innerText = "";
    }

    // 期限に応じて文字色を変える
    compareDueDate(task, taskDueDateElem);

    // 期限の残日数を表示する
    let taskRemainingDaysElm = document.createElement("span");
    let nowDateTime = new Date().getTime();
    let taskDateTime = new Date(task.dueDate).getTime();

    let nowDate = new Date();
    let taskDate = new Date(task.dueDate);

    let dateTimeDifference = taskDateTime - nowDateTime + 86400000;
    let taskRemainingDays = dateTimeDifference / 86400000;
    taskRemainingDays = Math.floor(taskRemainingDays);

    let isOverdue =
      nowDateTime - taskDateTime < 0 ||
      nowDate.toLocaleDateString() == taskDate.toLocaleDateString();

    if (task.dueDate && isOverdue) {
      taskRemainingDaysElm.innerText = "残り日数:" + taskRemainingDays + "日";
    } else {
      taskRemainingDaysElm.innerText = "";
    }

    taskRemainingDaysElm.style.marginLeft = "1rem";

    // 項目に対し、期限表示を追加
    taskLabelElem.appendChild(taskDueDateElem);

    // 項目に対し、残日数を追加
    taskLabelElem.appendChild(taskRemainingDaysElm);

    // リストに対し、項目を追加
    taskContainerElem.appendChild(taskElem);
    taskContainerElem.appendChild(taskLabelElem);
    taskListElem.appendChild(taskContainerElem);
  }

  // 全タスクの件数を更新
  let numOfTasksElm = document.querySelector("#numOfTasks");
  numOfTasksElm.innerText = tasks.length;
  // 完了済みの件数を更新
  let numOfCompletedTasksElm = document.querySelector("#numOfCompletedTasks");
  numOfCompletedTasksElm.innerText = numOfCompletedTasks;

  // 期日に応じて文字色を変える
  function compareDueDate(task, taskDueDateElem) {
    let nowDate = new Date();
    let taskDate = new Date(task.dueDate);
    if (nowDate.toLocaleDateString() == taskDate.toLocaleDateString()) {
      taskDueDateElem.style.color = "#f9ca24";
    } else if (nowDate > taskDate) {
      taskDueDateElem.style.color = "#EA2027";
    } else {
      taskDueDateElem.style.color = "black";
    }
  }
}

function addTask(taskName, taskDueDate) {
  let isDuplicate = false;

  for (let task of tasks) {
    if (task.name == taskName) {
      isDuplicate = true;
    }
  }

  if (isDuplicate) {
    // 配列にすでに同じ名前の項目がある
    alert("すでに登録済みです");
    return;
  }
  // 配列に対し、項目を追加　【変更点】
  tasks.push({
    name: taskName,
    isCompleted: false,
    dueDate: taskDueDate,
  });
  // LocalStorage へ配列を保存
  saveTasks();

  // 配列からリストを再出力
  renderTasks();

  // フォームをリセット
  let taskFormElm = document.querySelector("#taskForm");
  taskFormElm.reset();
}

function deleteTask(taskName) {
  // 【変更点】
  // 新しい配列を用意
  let newTasks = [];
  // 現状の配列を反復
  for (let task of tasks) {
    // 【変更点】
    if (task.name != taskName) {
      // 【変更点】
      // 削除したいタスク名でなければ、新しい配列へ追加
      newTasks.push(task); // 【変更点】
    }
  }
  // 現状の配列を新しい配列で上書き
  tasks = newTasks;
  // LocalStorage へ配列を保存
  saveTasks();
  // 配列からリストを再出力
  renderTasks();
}

function setTaskComplete(taskName, isCompleted) {
  // 現状の配列を反復
  for (let task of tasks) {
    if (task.name == taskName) {
      // 対象のタスク名ならば、完了状態を設定
      task.isCompleted = isCompleted;
      break;
    }
  }
  // LocalStorage へ配列を保存
  saveTasks();
  // 配列からリストを再出力
  renderTasks();
}

function loadTasks() {
  let jsonString = window.localStorage.getItem("tasks");
  if (jsonString) {
    tasks = JSON.parse(jsonString);
  }
}

function saveTasks() {
  let jsonString = JSON.stringify(tasks);
  window.localStorage.setItem("tasks", jsonString);
}

// CSV出力機能
function csvExport() {
  // タスクが登録されていない場合、警告を出す
  if (tasks.length == 0) {
    alert("出力するタスクがありません。");
    return;
  }
  let fileName = "export.csv";
  let outputString = "タスク名,期日,進捗状況\n";
  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);

  for (let task of tasks) {
    let completedString = "";
    if (task.isCompleted) {
      completedString = "済";
    } else {
      completedString = "未";
    }
    outputString =
      outputString +
      task.name +
      "," +
      task.dueDate +
      "," +
      completedString +
      "\n";
  }
  const blob = new Blob([bom, outputString], { type: "text/csv" });
  //IE10/11用(download属性が機能しないためmsSaveBlobを使用）
  if (window.navigator.msSaveBlob) {
    window.navigator.msSaveBlob(blob, fileName);
  } else {
    //BlobからオブジェクトURLを作成する
    const url = (window.URL || window.webkitURL).createObjectURL(blob);
    //ダウンロード用にリンクを作成する
    const download = document.createElement("a");
    //リンク先に上記で生成したURLを指定する
    download.href = url;
    //download属性にファイル名を指定する
    download.download = fileName;
    //作成したリンクをクリックしてダウンロードを実行する
    download.click();
    //createObjectURLで作成したオブジェクトURLを開放する
    (window.URL || window.webkitURL).revokeObjectURL(url);
  }
}

function csvImport() {
  console.log(event);
  const file = event.target.files[0]; // File オブジェクト
  const reader = new FileReader();

  console.log("file", file);

  if (
    file.type &&
    file.type != "text/csv" &&
    file.type != "application/vnd.ms-excel"
  ) {
    window.alert("CSVファイルではありません");
    return;
  }

  reader.onload = () => {
    console.log(reader.result);
    let importTasks = reader.result.split(/\r\n|\r|\n/);
    for (let rawTask of importTasks) {
      let taskArray = rawTask.split(",");
      if (taskArray.length != 3) {
        continue;
      }
      let isCompleted = taskArray[2] == "済";
      let task = {
        name: taskArray[0],
        dueDate: taskArray[1],
        isCompleted: isCompleted,
      };
      if (task.name == "タスク名") {
        continue;
      }
      let taskIndex = getIndexTasks(task.name);
      if (taskIndex != -1) {
        tasks[taskIndex] = task;
      } else {
        tasks.push(task);
      }
    }
    saveTasks();
    renderTasks();
  };

  reader.readAsText(file);
}

function getIndexTasks(taskName) {
  let index = 0;
  for (let task of tasks) {
    if (task.name == taskName) {
      return index;
    }
    index++;
  }
  return -1;
}
