// Testing dataBase
const _itemsJson = [
    {"id":1, "name":"car", "image":"orice.jpg", "stock":1, "price":35000, "currency":"EUR"},
    {"id":2, "name":"pistol", "image":"orice.jpg", "stock":5, "price":600, "currency":"EUR"},
    {"id":3, "name":"casa", "image":"orice.jpg", "stock":1, "price":350000, "currency":"EUR"},
    {"id":4, "name":"No wanted level", "image":"orice.jpg", "stock":5, "price":69420, "currency":"EUR"}
];
const _itemsJsonCount = _itemsJson.length;

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

    buyItems() {
        //Metoda de buy
        //... 
        this.component.value = 0;
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
        btnBuy.onclick = () => this.options.buyItems();

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
        document.getElementById("shop").appendChild(mainTable.fetchTable());
    }
}

new ShowcaseTable(5,3,_itemsJsonCount);