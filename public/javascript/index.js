const baseUrl = "http://localhost:4000/api/v1";
const projectsContainer = document.querySelector('#projects');

// Asycn stuff. Fetching data for the page
const getProjects = async () => {


    projectsContainer.innerHTML = "";

    try {
        const url = `${baseUrl}/project`;

        const projectList = await (await fetch(url)).json();
        console.log(projectList)

        for (let project of projectList) {
            const projectEl = `
                <div class="project" id="${project.id}">
                    <h3 class="project-title">${project.name}</h3>
                    <div class="project-extra">
                        <h5>Boards: <span>${project.boardCount}<span></h5>
                        <h5>Date Created: <span>${project.date_created.split('T')[0]}</span></h5>
                    </div>
                </div>

                `
            projectsContainer.innerHTML += projectEl
        }
        setupDOMInteraction();

    } catch (err) {
        console.log(err)
    }


}

function setupClickOnProjects(projects){
    //send user to detail page whenever a project project is clicked on
    for (let project of projects) {
        project.addEventListener('click', function () {
            location.href = `./project_detail.html?id=${project.id}`;
        });
    }

}

const setupDOMInteraction = () => {
    const addProjectToggle = document.getElementById('add-project-btn');
    const formContainer = document.getElementById('add-project-form-container')
    const addProjectSubmitBtn = document.getElementById('project-submit-btn')
    const newProjectNameEl = document.getElementById('new-project-name');

    const projects = document.getElementsByClassName('project')

    setupClickOnProjects(projects);

    
    // toggle the form to display form to add new projects
    addProjectToggle.addEventListener('click', function () {
        formContainer.classList.toggle('disappear');
    });


    const errorEl = document.querySelector('.error-msg');
    addProjectSubmitBtn.addEventListener('click', async () => {
        if (newProjectNameEl.value != '') {
            errorEl.classList.add('disappear');

            // add new project to the database  
            try {
                const project =  await (await fetch(`${baseUrl}/project`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ projectName: newProjectNameEl.value })
                })).json();

                console.log("newlyadded project: " + project)
                newProjectNameEl.value = "";

                const projectEl = `
                <div class="project" id="${project.id}">
                    <h3 class="project-title">${project.name}</h3>
                    <div class="project-extra">
                        <h5>Boards: <span>${project.board_count}<span></h5>
                        <h5>Date Created: <span>${project.date_created.split('T')[0]}</span></h5>
                    </div>
                </div>
                `

                projectsContainer.innerHTML += projectEl
                // must redefine event handling for the project divs each time a project is added to the DOM
                setupClickOnProjects(projects);


            } catch (error) {
                console.log(error)
            }

        } else {
            errorEl.classList.remove('disappear');
        }
    })
}


function main() {
    getProjects()
}

main();