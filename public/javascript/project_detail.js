const baseUrl = "http://localhost:4000/api/v1";

// get project id from the url
const keyvalue = location.href.split("?")[1];
let projectId = keyvalue.split("=")[1];

// removes '#' if it appears at the end of the id string
if (projectId.search("#") != -1) {
     projectId = projectId.substring(0, projectId.length - 1);
}

const boardsEl = document.querySelector(".boards");
const boardCountEl = document.getElementById("board-count");

//get the data for the project from the api
const getProjectDetails = async () => {
     try {
          const project = await (
               await fetch(`${baseUrl}/project/id`, {
                    method: "POST",
                    headers: {
                         Accept: "application/json",
                         "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ projectId }),
               })
          ).json();

          console.log(project);

          // set project-title and date elements
          const titleContainer = document.getElementById(
               "project-title-container"
          );

          const projectTitleEl = `<h1><a href="." id="project-title" class="id-${
               project.id
          }">${String(project.name)}</a></h1>`;
          const creationDateEl = `<p>created on: <span id="project-creation-date">${
               project.dateCreated.split("T")[0]
          }</span></p>`;
          titleContainer.innerHTML += projectTitleEl;
          titleContainer.innerHTML += creationDateEl;

          // update current board count
          boardCountEl.textContent = project.boardCount;

          // rendering  boards from the project
          for (let board of project.boards) {
               const boardEl = createBoardEl(board);

               boardsEl.innerHTML += boardEl;

               if (board.cards.length > 0) {
                    const cards = board.cards;
                    const boardEl = document.querySelector(`#b-${board.id}`);
                    const cardsContainer = boardEl.querySelector(".cards");
                    for (let card of cards) {
                         const cardEl = createCardEl(card);
                         cardsContainer.append(cardEl);
                         const descriptionEl =
                              cardEl.querySelector(".card-description");
                         strikeThroughCompletedCard(card, descriptionEl);
                    }
               }
          }

          setupDOMInteraction();
     } catch (err) {
          console.log(err);
     }
};

// template to create boardEls to be added to innerHTML of board container
const createBoardEl = (board) => {
     return `
        <div class="board ${board.project_id}" id="b-${board.id}" >
            <div class="board-header">
                <h3 class="board-title">${board.title}</h3>
                <div class="board-header-settings">
                    <a class="edit-board-title"><img src="./assets/edit-btn.svg" class="svg svg-icon-md"></a>
                    <a class="delete-board"><img class="svg svg-icon-md" src="./assets/delete-btn.svg"></a>
                </div>
            </div>
            <div class="board-body">
                <div class="cards">
                </div>
            </div>
            <div class="board-footer">
                <div class="add-card-form" action="#" method="POST">
                    <input class="new-card-text" type="text" placeholder="New todo">
                    <button class="add-card-btn" type="submit" value="submit-new-card">+</button>
                </div>
            </div>
        </div>
        `;
};

// transforms marked state of card from db to actual marking of the checkbox in HTML
function isChecked(card) {
     if (card.is_completed == true) return "checked";
}

// template to create cardElements to be added to innerHTML of card container
const createCardEl = (card) => {
     const cardEl = document.createElement("div");
     cardEl.classList.add("card");
     cardEl.id = `c-${card.id}`;

     cardEl.innerHTML = `
            <input type="checkbox" class="card-completed" ${isChecked(card)}>
            <p class="card-description">${card.description}</p>
            <div class="card-settings">
                <a class="card-edit-btn"><img class="svg svg-icon-sm" src="./assets/edit-btn.svg"></a>
                <a class="card-delete-btn"><img class="svg svg-icon-sm" src="./assets/delete-btn.svg"></a>
            </div>
        `;
     return cardEl;
};

// runs after remote resources have been gotten from the database
const setupDOMInteraction = () => {
     const addBoardBtn = document.getElementById("add-board-btn");
     const addBoardForm = document.getElementById("add-board-form-container");
     const deleteBtn = document.getElementById("delete-project-btn");

     addBoardBtn.addEventListener("click", function () {
          addBoardForm.classList.toggle("disappear");
     });

     // delete project from database
     deleteBtn.addEventListener("click", async function () {
          const message = await (
               await fetch(`${baseUrl}/project`, {
                    method: "DELETE",
                    headers: {
                         Accept: "application/json",
                         "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ projectId }),
               })
          ).json();

          location.href = "./index.html";
     });

     const errorEl = document.querySelector(".error-msg");
     const createBoardBtn = document.getElementById("create-board-btn");
     const newBoardInputEl = document.getElementById("new-board-text-input");

     createBoardBtn.addEventListener("click", async () => {
          if (newBoardInputEl.value != "") {
               errorEl.classList.add("disappear");

               // add new board to the database
               try {
                    const { board, projectBoardCount } = await (
                         await fetch(`${baseUrl}/project/board`, {
                              method: "POST",
                              headers: {
                                   Accept: "application/json",
                                   "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                   boardName: newBoardInputEl.value,
                                   projectId: projectId.replaceAll("#", ""),
                              }),
                         })
                    ).json();

                    newBoardInputEl.value = "";

                    const boardEl = createBoardEl(board);

                    boardsEl.innerHTML += boardEl;

                    //update board count
                    boardCountEl.textContent = projectBoardCount;

                    // setup event listener for each board whenever new board is added
                    setupEventListenersForEachBoard(boardsEl);
               } catch (error) {
                    console.log(error);
               }
          } else {
               errorEl.classList.remove("disappear");
          }
     });

     setupEventListenersForEachBoard(boardsEl);
};

// filter out all childNodes that are not actual HTML Elements by checking that they are instances of HTMLElemen
function getValidChildEls(parent) {
     const children = [];
     parent.childNodes.forEach((child) => {
          if (child instanceof HTMLElement) {
               children.push(child);
          }
     });
     return children;
}

const setupEventListenersForEachBoard = (boardsEl) => {
     const boards = getValidChildEls(boardsEl);

     // setup event listener for the edit and delete buttons of each board
     boards.forEach((board) => {
          let editBtn = board.querySelector(".edit-board-title");
          let deleteBtn = board.querySelector(".delete-board");
          let boardTitleEl = board.querySelector(".board-title");

          editBtn.addEventListener("click", () => {
               boardTitleEl.classList.add("highlight");
               boardTitleEl.contentEditable = "true";
          });

          deleteBtn.addEventListener("click", async () => {
               const result = await (
                    await fetch(`${baseUrl}/project/board`, {
                         method: "DELETE",
                         headers: {
                              Accept: "application/json",
                              "Content-Type": "application/json",
                         },
                         body: JSON.stringify({
                              boardId: board.id.split("-")[1],
                              projectId: projectId.replaceAll("#", ""),
                         }),
                    })
               ).json();

               if (result.status == "success") {
                    //update board count
                    boardCountEl.textContent = result.projectBoardCount;
                    // remove deleted board from DOM
                    boardsEl.removeChild(board);
               }
          });

          boardTitleEl.addEventListener("focusout", async () => {
               boardTitleEl.contentEditable = "false";
               boardTitleEl.classList.remove("highlight");

               try {
                    const { oldTitle, newTitle } = await (
                         await fetch(`${baseUrl}/project/board`, {
                              method: "PUT",
                              headers: {
                                   Accept: "application/json",
                                   "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                   boardId: board.id.split("-")[1],
                                   newTitle: boardTitleEl.textContent,
                                   projectId: projectId.replaceAll("#", ""),
                              }),
                         })
                    ).json();

                    boardTitleEl.textContent = newTitle;
               } catch (err) {
                    console.log(err);
               }
          });

          // setup event listener for the add card btn
          const addCardBtn = board.querySelector(".add-card-btn");
          const newCardTextEl = board.querySelector(".new-card-text");
          const cardsEl = board.querySelector(".cards");

          addCardBtn.addEventListener("click", async () => {
               const cardData = newCardTextEl.value;
               if (cardData != "") {
                    const newCard = await (
                         await fetch(`${baseUrl}/project/board/card`, {
                              method: "POST",
                              headers: {
                                   Accept: "application/json",
                                   "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                   boardId: board.id.split("-")[1],
                                   description: cardData,
                              }),
                         })
                    ).json();

                    console.log(newCard);
                    newCardTextEl.value = "";
                    const cardEl = createCardEl(newCard);
                    cardsEl.append(cardEl);

                    // setup event listeners for each card on the board everytime a new card is added to board
                    setupEventListenersForEachCard(board);
               }
          });

          // setup event listener on cards of board
          setupEventListenersForEachCard(board);
     });
};

const setupEventListenersForEachCard = (board) => {
     const cardsEl = board.querySelector(".cards");
     const cards = getValidChildEls(cardsEl);
     cards.forEach((card) => {
          const checkBox = card.querySelector(".card-completed");
          const descriptionEl = card.querySelector(".card-description");
          const editBtn = card.querySelector(".card-edit-btn");
          const deleteBtn = card.querySelector(".card-delete-btn");

          editBtn.addEventListener("click", () => {
               descriptionEl.contentEditable = true;
               descriptionEl.classList.add("highlight");
          });

          descriptionEl.addEventListener("focusout", async () => {
               descriptionEl.contentEditable = false;
               descriptionEl.classList.remove("highlight");
               try {
                    const modified = await (
                         await fetch(`${baseUrl}/project/board/card`, {
                              method: "PUT",
                              headers: {
                                   Accept: "application/json",
                                   "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                   id: card.id.split("-")[1],
                                   isCompleted: checkBox.checked,
                                   description: descriptionEl.textContent,
                              }),
                         })
                    ).json();

                    descriptionEl.textContent = modified.description;
                    strikeThroughCompletedCard(modified, descriptionEl);
               } catch (err) {
                    console.log(err);
               }
          });

          checkBox.addEventListener("change", async () => {
               try {
                    const modified = await (
                         await fetch(`${baseUrl}/project/board/card`, {
                              method: "PUT",
                              headers: {
                                   Accept: "application/json",
                                   "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                   id: card.id.split("-")[1],
                                   isCompleted: checkBox.checked,
                                   description: descriptionEl.textContent,
                              }),
                         })
                    ).json();

                    descriptionEl.textContent = modified.description;
                    // if (modified.is_completed == 1) {
                    //      descriptionEl.style.textDecoration = "line-through";
                    // } else {
                    //      descriptionEl.style.textDecoration = "none";
                    // }
                    strikeThroughCompletedCard(modified, descriptionEl);
               } catch (err) {
                    console.log(err);
               }
          });

          deleteBtn.addEventListener("click", async () => {
               try {
                    const result = await (
                         await fetch(`${baseUrl}/project/board/card`, {
                              method: "DELETE",
                              headers: {
                                   Accept: "application/json",
                                   "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                   id: card.id.split("-")[1],
                              }),
                         })
                    ).json();

                    console.log(result);
                    if ((result.status = "success")) {
                         cardsEl.removeChild(card);
                    }
               } catch (err) {
                    console.log(err);
               }
          });
     });
};

function strikeThroughCompletedCard(card, cardDescriptionEl) {
     // console.log(card);
     if (card.is_completed == 1) {
          cardDescriptionEl.style.textDecoration = "line-through";
     } else {
          cardDescriptionEl.style.textDecoration = "none";
     }
}

function main() {
     getProjectDetails();
}

main();
