// Testing dataBase
const _itemsJson = [
    {"id":1, "name":"car", "image":"orice.jpg", "stock":1, "price":35000, "currency":"EUR"},
    {"id":2, "name":"pistol", "image":"orice.jpg", "stock":5, "price":600, "currency":"EUR"},
    {"id":3, "name":"casa", "image":"orice.jpg", "stock":1, "price":350000, "currency":"EUR"},
    {"id":4, "name":"No wanted level", "image":"orice.jpg", "stock":5, "price":69420, "currency":"EUR"}
];
const _itemsJsonCount = _itemsJson.length;

const workerPath = "/js/worker.js"

// Interface for both types of storage
class StorageBase {
    async save(list) {}
    async load() { return []; }
}

// Local data storage (browser)
class LocalStore extends StorageBase {
    async save(list) {
        localStorage.setItem("cosul_meu_salvat", JSON.stringify(list));
    }
    async load() {
        let data = localStorage.getItem("cosul_meu_salvat");
        return data ? JSON.parse(data) : [];
    }
}

// Persistent data storage (dataBase)
class IndexedStore extends StorageBase {
    constructor() {
        super();
        this.dbName = "MagazinDB";
        this.storeName = "cos";
    }
    initDB() {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(this.dbName, 1);
            request.onupgradeneeded = e => {
                let db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: "id" });
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    async save(list) {
        let db = await this.initDB();
        return new Promise((resolve, reject) => {
            let tx = db.transaction(this.storeName, "readwrite");
            let store = tx.objectStore(this.storeName);
            store.clear();
            list.forEach(item => {
                if (item && item.id) {
                    let itemData = _itemsJson.find(i => i.id === item.id);
                    if(itemData) {
                        store.put({ 
                            id: item.id, 
                            nume: itemData.name, 
                            cantitate: item.quantity,
                            pret_total: item.quantity * itemData.price
                        });
                    }
                }
            });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
    async load() {
        let db = await this.initDB();
        return new Promise((resolve, reject) => {
            let tx = db.transaction(this.storeName, "readonly");
            let store = tx.objectStore(this.storeName);
            let request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}


// Class for defining the primary functions of a shop item
class Item {
    constructor(id, quantity) {
        this.id = id;
        this.quantity = quantity;
    }

    // Adds quantity to an item
    addQuantity(quantity) {
        this.quantity += quantity;
    }

    // Decreases quantity of an item
    rmQuantity(quantity) {
        this.quantity -= quantity;
    }

    // Returns a total price of the items bought
    calcPrice() {
        let itemData = _itemsJson.find(item => item.id === this.id);
        return itemData ? this.quantity * itemData.price : 0;
    }
}

// Class that manages the list of items in cart
class ItemList {

    constructor() {
        this.list = [];
        this.storage = new LocalStore();
    }

    // Inits the type of storage
    async initStorage() {
        let select = document.getElementById("tipStocare");
        if (select) {
            this.storage = select.value === "indexed" ? new IndexedStore() : new LocalStore();
        }
        await this.loadFromBrowser();
    }

    // Change storage type by option
    async changeStorageMethod(type) {
        this.storage = type === "indexed" ? new IndexedStore() : new LocalStore();
        await this.saveToBrowser();
    }

    // Adds object type Item to the list
    async addItem(item) {
        this.list.push(item);
        await this.saveToBrowser();
    }

    // Removes object type Item from the list
    async rmItem(item) {
        let index = this.list.indexOf(item);
        if (index !== -1) {
            this.list.splice(index, 1);
            await this.saveToBrowser();
        }
    }

    // Collects items with 0 quantity
    async garbageCollector() {
        this.list = this.list.filter(element => element.quantity > 0);
        await this.saveToBrowser();
    }   

    // Save to browser
    async saveToBrowser() {
        await this.storage.save(this.list);
    }


    // Load from browser
    async loadFromBrowser() {
        let data = await this.storage.load();
        this.list = data.map(obj => new Item(obj.id, obj.quantity || obj.cantitate));
        updateCartUI();
    }
}

// Class for interactions with a variety of workers
class WorkerOptions { 
    
    constructor(path) {
        this.worker = new Worker(path);
    }

    // Send data to worker
    sendPing(message) {
        console.log("[cumparaturi.js]: Sending...")
        this.worker.postMessage(message);
    }

    // Receive data from worker
    receivePong(callback) {
        this.worker.onmessage = event => {
        console.log("[cumparaturi.js]: Acknowledge!");
        callback(event.data);
        }
    }
}

// Used to interact with a quantity item
class QuantityOptions {
    
    constructor(inputElement) {
        this.component = inputElement;        
    }

    // Increase value by 1
    addItem() {
        let valoareCurenta = parseInt(this.component.value) || 0;
        this.component.value = (valoareCurenta < 999) ? valoareCurenta + 1 : 999;
    }

    // Decrease value by 1
    rmItem() {
        let valoareCurenta = parseInt(this.component.value) || 0;
        this.component.value = (valoareCurenta > 0) ? valoareCurenta - 1 : 0;
    }

    buyItems(worker, id, name) {
        //Metoda de buy
        let valoareCurenta = parseInt(this.component.value) || 0;
        if(valoareCurenta > 0) {
            worker.sendPing({
                id: id,
                nume: name,
                cantitate: valoareCurenta
            });
            this.component.value = 0;
        }
    }
}

// Creates a table cell
class ItemCell {

    // Stores the parameters 
    constructor(id,clsName,name,image,stock,price,currency) {
        this.name = name;
        this.image = image;
        this.stock = stock;
        this.price = price;
        this.currency = currency;
        this.id = id;
        this.clsName = clsName;
    }

    // Creates cell
    createCell(){
        let cell = document.createElement('td');
        cell.id = "item_" + this.id;
        cell.className = this.clsName;
        this.cell = cell;
    }

    //Create img
    createImg(){
        let img = document.createElement('img');
        img.src = this.image; 
        img.alt = "Not found";
        img.width = 214;
        img.height = 120;
        
        let imgSection = document.createElement('section');
        imgSection.id = "img-section";
        imgSection.appendChild(img);
        this.imgSection = imgSection;
    }
    
    //Create info
    createInfo(){
        let h1 = document.createElement('h1');
        let h20 = document.createElement('h2');
        let h21 = document.createElement('h2');
        let h3 = document.createElement('h3');
        
        h1.textContent = this.name;
        h20.textContent = "Price: " + this.price;
        h21.textContent = "Currency: " + this.currency; 
        h3.textContent = "Stock: " + this.stock;
        
        let infoSection = document.createElement('section');
        infoSection.id = "info-section";   
        infoSection.appendChild(h1);
        infoSection.appendChild(h20);
        infoSection.appendChild(h21);
        infoSection.appendChild(h3);

        this.infoSection = infoSection;
    }

    // Create transaction
    createTransaction(){
        let input = document.createElement('input');
        input.type = 'number';
        input.value = 0; 
        input.id = this.id;

        this.options = new QuantityOptions(input);

        let btnMinus = document.createElement('button');
        let btnPlus = document.createElement('button');
        let btnBuy = document.createElement('button');
        
        btnMinus.textContent = '-';
        btnMinus.type = 'button';
        btnMinus.onclick = () => this.options.rmItem(); 
            
        btnPlus.textContent = '+';
        btnPlus.type = 'button';
        btnPlus.onclick = () => this.options.addItem(); 

        btnBuy.textContent = 'Cumpara';
        btnBuy.type = 'button';
        btnBuy.onclick = () => this.options.buyItems(myWorker, this.id, this.name);

        let transactionSection = document.createElement('section');
        transactionSection.id = "transaction-section";
        transactionSection.appendChild(btnMinus);
        transactionSection.appendChild(input);
        transactionSection.appendChild(btnPlus);
        transactionSection.appendChild(btnBuy);

        this.transactionSection = transactionSection;
    }

    // Unifies all sections
    unify(){
        let mainSection = document.createElement('section');
        mainSection.id = "main-section";
        mainSection.appendChild(this.imgSection);
        mainSection.appendChild(this.infoSection);
        mainSection.appendChild(this.transactionSection);

        this.mainSection = mainSection;
    }

    // Completes the final cell
    ingest(){
        this.cell.appendChild(this.mainSection);
    }

    // Creates and return a working cell element
    create(){
        this.createCell();
        this.createImg();
        this.createInfo();
        this.createTransaction();
        this.unify();
        this.ingest();
        return this.cell; 
    }
}

// Creates table rows using custom given cells
class ItemRow {

    // Sets the parameters
    constructor(maxCells,id) {
        this.row = document.createElement('tr');
        this.cells = []
        this.cellCount = 0;
        this.maxCells = maxCells;
        this.id = id;
    }

    // Adds a cell to the current row
    addCell(cell) {
        if(this.cellCount < this.maxCells) {
            this.cells.push(cell);
            this.cellCount++;
        }
    }

    // Ingests every cell into a single row
    ingest() {
        this.cells.forEach(element => {
            this.row.appendChild(element.create());
        });
    }

    // Fetches the row element
    fetchRow() {
        return this.row;
    }
}

// Creates an item table using custom given rows
class ItemTable {

    // Sets the parameters
    constructor(maxRows) {
        this.table = document.createElement('table');
        this.rows = [];
        this.maxRows = maxRows;
        this.rowCount = 0;
    }

    // Adds a custom row
    addRow(row) {
        if(this.rowCount < this.maxRows) {
            this.rows.push(row)
            this.rowCount++;
        }
    }

    // Ingests every row as a child of a table
    ingest() {
        this.rows.forEach( element => {
            this.table.appendChild(element.fetchRow());
        });
    }

    // Fetches the current table
    fetchTable() {
        return this.table;
    }
}

// Manifests each cell in a visible matrix
class ShowcaseTable { 
    constructor(maxRows,maxCells,itemCount) {
        this.maxRows = maxRows;
        this.maxCells = maxCells;
        this.itemCount = itemCount;
        
        let cellIndex = 0;
        let rowIndex = 0;
        let curCell;
        let curRow = new ItemRow(maxCells,rowIndex);
        let mainTable = new ItemTable(maxRows);

        _itemsJson.forEach( element =>{
            if(cellIndex > 0 && cellIndex % maxCells == 0) {
                curRow.ingest();
                mainTable.addRow(curRow);
                rowIndex++;
                curRow = new ItemRow(maxCells,rowIndex);
            }
                
            curCell = new ItemCell(
                element.id, 
                "itemBox", 
                element.name,
                element.image,
                element.stock, 
                element.price, 
                element.currency
            )

            curRow.addCell(curCell);
            cellIndex++;
            
        });

        if(curRow.cellCount > 0) {
            curRow.ingest();
            mainTable.addRow(curRow);
        }

        mainTable.ingest();
        
        let shopContainer = document.getElementById("shop");
        if (shopContainer) {
            shopContainer.appendChild(mainTable.fetchTable());
        }
    }
}

const shoppingCart = new ItemList();
const myWorker = new WorkerOptions(workerPath);
let showcase;

setTimeout(() => {
    showcase = new ShowcaseTable(5, 3, _itemsJsonCount);
    shoppingCart.initStorage();
}, 50);

// Pong's trap
myWorker.receivePong(async (data) => {
    let existingItem = shoppingCart.list.find(item => item.id === data.id);

    if (existingItem) {
        existingItem.quantity += data.cantitate; 
        await shoppingCart.saveToBrowser();
    } else {
        let newItem = new Item(data.id, data.cantitate);
        await shoppingCart.addItem(newItem);
    }

    await shoppingCart.garbageCollector(); 
    updateCartUI(); 
});

// Function to toggle shopping cart's popup
function toggleCart() {
    let popup = document.getElementById("popup-cos");
    if (popup) {
        popup.style.display = (popup.style.display === "block") ? "none" : "block";
    }
}

// Takes current option from element
function schimbaStocarea() {
    let select = document.getElementById("tipStocare");
    if (select) {
        shoppingCart.changeStorageMethod(select.value);
    }
}

// Adjusts quantity of an element while in popup
async function schimbaCantitateCos(id, delta) {
    let item = shoppingCart.list.find(i => i.id === id);
    if (item) {
        if (delta > 0) {
            item.addQuantity(delta);
        } else {
            item.rmQuantity(Math.abs(delta));
        }
        await shoppingCart.garbageCollector();
        updateCartUI();
    }
}

// Class for CartUI logic
function updateCartUI() {
    let tbody = document.getElementById("cart-body");
    
    if(!tbody) return; 

    tbody.innerHTML = ""; 

    let totalMoney = 0;
    let totalItems = 0;

    shoppingCart.list.forEach(element => {
        let itemData = _itemsJson.find(i => i.id === element.id);
        
        if(itemData) {
            let tr = document.createElement('tr');
            
            let tdName = document.createElement('td');
            tdName.textContent = itemData.name;

            let tdQuantity = document.createElement('td');
            
            let btnMinus = document.createElement('button');
            btnMinus.textContent = '-';
            btnMinus.style.marginRight = "8px";
            btnMinus.style.cursor = "pointer";
            btnMinus.style.borderRadius = "50%";
            btnMinus.style.border = "1px solid #ccc";
            btnMinus.style.background = "white";
            btnMinus.style.width = "25px";
            btnMinus.style.height = "25px";
            btnMinus.onclick = () => schimbaCantitateCos(element.id, -1);

            let spanQty = document.createElement('span');
            spanQty.textContent = " " + element.quantity + " ";

            let btnPlus = document.createElement('button');
            btnPlus.textContent = '+';
            btnPlus.style.marginLeft = "8px";
            btnPlus.style.cursor = "pointer";
            btnPlus.style.borderRadius = "50%";
            btnPlus.style.border = "1px solid #ccc";
            btnPlus.style.background = "white";
            btnPlus.style.width = "25px";
            btnPlus.style.height = "25px";
            btnPlus.onclick = () => schimbaCantitateCos(element.id, 1);

            tdQuantity.appendChild(btnMinus);
            tdQuantity.appendChild(spanQty);
            tdQuantity.appendChild(btnPlus);

            let price = element.calcPrice(); 
            let tdPrice = document.createElement('td');
            tdPrice.textContent = price + " EUR";

            tr.appendChild(tdName);
            tr.appendChild(tdQuantity);
            tr.appendChild(tdPrice);

            tbody.appendChild(tr);

            totalMoney += price;
            totalItems += element.quantity;
        }
    });

    let totalEl = document.getElementById("cart-total");
    let countEl = document.getElementById("cart-count");
    if(totalEl) totalEl.textContent = "Total: " + totalMoney + " EUR";
    if(countEl) countEl.textContent = totalItems;
}