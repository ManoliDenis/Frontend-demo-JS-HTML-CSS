_itemsJson = 
        [
            {"id":1,"name":"car","image":"car","stock":1,"price":35000,"currency":"EUR"},
            {"id":2,"name":"pistol","image":"pistol","stock":5,"price":600,"currency":"EUR"},
            {"id":3,"name":"casa","image":"casa","stock":1,"price":350000,"currency":"EUR"},
            {"id":4,"name":"No wanted level","image":"secret","stock":5,"price":69420,"currency":"EUR"}
        ]
    
    

class ShowcaseItems
{
    ShowcaseItems(items,numElements)
    {   var index = 0;
        var col;
        var row;
        table = document.createElement('table');
        items.forEach(element => {
            if(index%numElements == 0)
                row = document.createElement('tr');
                
            
            col  = document.createElement('td');
            col.id = "itemBox";
            img = document.createElement('img');
            img.src = "/imagini/" + element.image;
            h1 = document.createElement('h1');
            h1.text = element.name;
            h2 = document.createElement('h2');
            h2.text = element.price;
            h21 = document.createElement('h2');
            h21.text = element.currency;
            h3 = document.createElement('h3');
            h3.text = element.stock;
            btnMinus = document.createElement('button')
            btnMinus.text = '-';
            btnMinus.type = 'button';
            btnPlus = document.createElement('button');
            btnPlus.text = '+';
            btnPlus.type = 'button';
            inputVal = document.createElement('input');
            inputVal.type = 'number';

            
            col.appendChild(img);
            col.appendChild(h1);
            col.appendChild(h2);
            col.appendChild(h21);
            col.appendChild(h3);
            col.appendChild(btnMinus);
            col.appendChild(inputVal);
            col.appendChild(btnPlus);

            row.appendChild(col);
            
        });
    }
}
function initShop()
{

}

function OnBtnPlus(qty)
{

}
function OnBtnMinus(qty)
{
    
}