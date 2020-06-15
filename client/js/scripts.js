// No modules for me, since I'm not using server :(
class CrewMember {
	baseURL = "/CrewMember";
	constructor(Origin) {
		this.ID 		= Origin.ID;
		this.birthday 	= Origin.birthday;
		this.cabin		= Number(Origin.cabin);
		this.jobID		= Number(Origin.jobID);
		this.name		= Origin.name;
		this.summary	= Origin.summary;
	}
	
	get URL() {
		if (this.ID != null) {
			return this.baseURL + "/" + this.ID;
		} else {
			return this.baseURL;
		}
	}
	
	get JSON() {
		return JSON.stringify(this, ['birthday', 'cabin', 'jobID', 'name', 'summary']);
	}
	
	Create() {
		return APIController.createItem(this);
	}
	
	Delete() {
		APIController.deleteItem(this.URL);
	}
	
	Edit() {
		return APIController.editItem(this);
	}
	
	createContainer(field) {
		let FieldContainer = document.createElement("td");
		FieldContainer.classList.add("record-field");
		FieldContainer.innerHTML = this[field];
		FieldContainer.setAttribute("data-label", field);
		return FieldContainer;
	}
	
	genTableRow() {
		let container = document.createElement("tr");
		container.classList.add("record-container");

		container.appendChild(this.createContainer("ID"));
		container.appendChild(this.createContainer("name"));
		container.appendChild(this.createContainer("birthday"));
		container.appendChild(this.createContainer("jobID"));
		container.appendChild(this.createContainer("cabin"));
		container.appendChild(this.createContainer("summary"));
		let actionsField = document.createElement("td");
		actionsField.innerHTML = `<a href="?id=` + this.ID + `#editPopup">✏️</a> <a href="?id=` + this.ID + `#deletePopup">🗑️</a>`;
		container.appendChild(actionsField);
		return container;
	}
}

class Team {
	#members;
	#step = 1000; // If there will be any need for several loadings
	#URL = "/CrewMember";
	#page = 0;
	#pageElements = 20;
	
	// This should be singletone
	static inst;
	constructor() {
		if (this.inst) {
			return this.inst;
		}
		
		this.inst = this;
		
		this.#members = [];
	}
	
	get size() {
		return this.#members.length;
	}
	
	async load() {
		let res = await APIController.getData(this.#URL, {count: this.#step, start_from: this.size});
		for (let initMember of res) {
			let newMember = new CrewMember(initMember);
			this.#members.push(newMember);
		}
	}
	
	setPage(newPage) {
		this.#page = newPage;
		this.UpdateTable();
	}
	
	NextPage() {
		if (this.size > (this.#page + 1) * this.#pageElements) {
			this.setPage(this.#page + 1);
		}
	}
	PrevPage() {
		if (this.#page > 0) {
			this.setPage(this.#page - 1);
		}
	}
	
	UpdateTable() {
		let table = document.getElementById("MembersTable");
		table.innerHTML = '';
		for (let member of this.#members.slice(this.#page * this.#pageElements, (this.#page + 1) * this.#pageElements)) {
			table.appendChild(member.genTableRow());
		}
		let pageCounter = document.getElementById("PageInfo");
		pageCounter.innerHTML = "Page " + this.#page;
	}
	
	FillEditPopup(ID) {
		for (let member of this.#members) {
			if (member.ID === ID) {
				
				document.getElementById("eName").value 		=  member.name;
				document.getElementById("eBirthday").value 	=  member.birthday;
				document.getElementById("eJob").value 		=  member.jobID;
				document.getElementById("eCabin").value 	=  member.cabin;
				document.getElementById("eSummary").value 	=  member.summary;
				return;
			}
		}
	}
	
	Delete(id) {
		for (let member in this.#members) {
			if (this.#members[member].ID === id) {
				try {
					this.#members[member].Delete();
				} catch (e) {
					alert("Error deleting element " + e);
				}
				this.#members.splice(member, 1);
				return;
			}
		}
	}
	
	async Add(newData) {
		try {
			await newData.Create();
		} catch (e) {
			alert(e);
			return;
		}
		
		this.#members.push(newData);
		this.UpdateTable();
		closePopups();
	}
	async Edit(newData) {
		for (let member in this.#members) {
			if (this.#members[member].ID === newData.ID) {
				try {
					await newData.Edit();
				} catch (e) {
					alert("Error editing element " + e);
				}
				this.#members.splice(member, 1, newData);
				this.UpdateTable();
				closePopups();
				return;
			}
		}
	}
}

class APIController {
	static baseURL = "http://localhost";
	
	static async deleteItem(subUrl) {
		let url = APIController.baseURL + subUrl;
		let res;
		try {
			res = await fetch(url, {method: 'DELETE'});
		} catch (e) {
			alert("Internet: " + e);
		}
		if (res.ok) { 

		} else {
		  alert("HTTP-Error: " + res.status);
		}
	}
	static async getData(subUrl, params) {
		let url = APIController.baseURL + subUrl;
		if (params != null) {
			url += "?"
			for (let i in params) {
				url += i + "=" + params[i] + "&"
			}
		} 
		
		let res;
		try {
			res = await fetch(url);
		} catch (e) {
			alert("Internet: " + e);
		}
		if (res.ok) { 
		  let json = await res.json();
		  return json;
		} else {
		  alert("HTTP-Error: " + res.status);
		}
	}
	
	static async createItem(newItem) {
		let url = APIController.baseURL + newItem.URL;
		let res;
		try {
			res = await fetch(url, {method: 'POST', body: newItem.JSON});
		} catch (e) {
			alert("Internet: " + e);
		}
		if (res.ok) { 
		  let json = await res.json();
		  return json;
		} else {
		  alert("HTTP-Error: " + res.status);
		}
	}
	
	static async editItem(newItem) {
		let url = APIController.baseURL + newItem.URL;
		let res;
		try {
			res = await fetch(url, {method: 'PUT', body: newItem.JSON});
		} catch (e) {
			alert("Internet: " + e);
		}
		if (res.ok) { 
		  return
		} else {
		  alert("HTTP-Error: " + res.status);
		}
	}
}

let t;

function closePopups() {
	window.location = "#";
}

function clickOutside(evt) {
	if (evt.target !== this)
		return;
	closePopups();
}

function checkEsc(evt) {
		evt = evt || window.event;
		var isEscape = false;
		if ("key" in evt) {
			isEscape = (evt.key === "Escape" || evt.key === "Esc");
		} else {
			isEscape = (evt.keyCode === 27);
		}
		if (isEscape) {
			closePopups();
		}
	};
	
function deleteMember() {
	let searchParams = new URLSearchParams(window.location.search);
	let id = searchParams.get('id');
	
	t.Delete(id);
	t.UpdateTable();
	closePopups();
}
function editMember() {
	let searchParams = new URLSearchParams(window.location.search);
	let id = searchParams.get('id');
	let newData = new CrewMember({
		ID: id,
		name: document.getElementById("eName").value,
		birthday: document.getElementById("eBirthday").value,
		jobID: document.getElementById("eJob").value,
		summary: document.getElementById("eSummary").value,
		cabin: document.getElementById("eCabin").value,
	});
	
	t.Edit(newData);
}
function addMember() {
	let newData = new CrewMember({
		ID: null,
		name: document.getElementById("nName").value,
		birthday: document.getElementById("nBirthday").value,
		jobID: document.getElementById("nJob").value,
		summary: document.getElementById("nSummary").value,
		cabin: document.getElementById("nCabin").value,
	});
	
	t.Add(newData);
	
}

async function Init() {
	document.onkeydown = checkEsc;
	document.getElementById("newPopup").onclick = clickOutside; 
	document.getElementById("editPopup").onclick = clickOutside;
	document.getElementById("deletePopup").onclick = clickOutside;
	
	
	t = new Team();
	await t.load();
	t.UpdateTable();
	
	let searchParams = new URLSearchParams(window.location.search)
	t.FillEditPopup(searchParams.get('id'));
}
