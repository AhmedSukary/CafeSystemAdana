class EmployeeCard extends HTMLElement {

    constructor() {
        super();

        this.innerHTML = `
            <div class="employee-card">
                <div class="employee-name"></div>
                <div class="employee-salary"></div>

                <button class="edit">Edit</button>
                <button class="delete">Delete</button>
            </div>
        `;

        this.querySelector(".delete")
            .addEventListener("click", () => {
                this.deleteEmployee();
            });

        this.querySelector(".edit")
            .addEventListener("click", () => {
                this.editEmployee();
            });
    }

    set employee(value) {
        this._employee = value;

        this.querySelector(".employee-name").textContent =
            value.name;

        this.querySelector(".employee-salary").textContent =
            value.salary;
    }

    async deleteEmployee() {
        const id = this._employee.id;

        await fetch(`/api/employees/${id}`, {
            method: "DELETE"
        });

        this.remove();
    }

    editEmployee() {
        console.log("Edit", this._employee);
    }
}

customElements.define("employee-card", EmployeeCard);