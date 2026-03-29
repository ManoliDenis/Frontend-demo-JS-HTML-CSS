window.addEventListener("load", initPage);
let paginaCurenta = window.location.pathname.split("/").pop();
let startX, startY;
let isDrawing = false;

function initPage() {
    
    setInterval(ceas, 1000);
     if(paginaCurenta == "invat.html"){
    incarcaInfoSistem();

    let canvas = document.getElementById("zonaDesen");
    canvas.addEventListener("mousedown", deseneazaDreptunghi);

    document.getElementById("btnRand").addEventListener("click", adaugaRand);
    document.getElementById("btnColoana").addEventListener("click", adaugaColoana);
     }
}

function ceas() {
    document.getElementById("ora").innerHTML = 
        "Ceas<br>"  + new Date().getHours() + ":" 
        + new Date().getMinutes() + ":" + new Date().getSeconds() + "<hr>";
}

function incarcaInfoSistem() {
    if(paginaCurenta == "invat.html"){
    let info = "Adresa URL: " + window.location.href + "<br>";
    info += "Browser: " + navigator.appName + " (" + navigator.appVersion + ")<br>";
    info += "Sistem Operare: " + navigator.platform + "<br>";
    
    document.getElementById("info-sistem").innerHTML = info;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            document.getElementById("info-sistem").innerHTML += 
            "<br>Locatie (Lat, Long): " + position.coords.latitude + ", " + position.coords.longitude;
        });
    }
    }
}

function deseneazaDreptunghi(event) {
    let canvas = document.getElementById("zonaDesen");
    let ctx = canvas.getContext("2d");
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    if (!isDrawing) {
        startX = x;
        startY = y;
        isDrawing = true;
    } else {
        let culoareContur = document.getElementById("culoareContur").value;
        let culoareUmplere = document.getElementById("culoareUmplere").value;
        let latime = x - startX;
        let inaltime = y - startY;

        ctx.beginPath();
        ctx.rect(startX, startY, latime, inaltime);
        ctx.fillStyle = culoareUmplere;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = culoareContur;
        ctx.stroke();

        isDrawing = false;
    }
}

function adaugaRand() {
    let tabel = document.getElementById("tabelTaxe");
    let pozitie = parseInt(document.getElementById("pozitieTabel").value);
    let culoare = document.getElementById("culoareTabel").value;

    if (pozitie < 0 || pozitie > tabel.rows.length) {
        pozitie = tabel.rows.length;
    }

    let randNou = tabel.insertRow(pozitie);
    let numarColoane = tabel.rows[0].cells.length;

    for (let i = 0; i < numarColoane; i++) {
        let celulaNoua = randNou.insertCell(i);
        celulaNoua.innerHTML = "Linie Noua";
        celulaNoua.style.backgroundColor = culoare;
    }
}

function adaugaColoana() {
    let tabel = document.getElementById("tabelTaxe");
    let pozitie = parseInt(document.getElementById("pozitieTabel").value);
    let culoare = document.getElementById("culoareTabel").value;

    if (pozitie < 0 || (tabel.rows.length > 0 && pozitie > tabel.rows[0].cells.length)) {
        pozitie = tabel.rows[0].cells.length;
    }

    for (let i = 0; i < tabel.rows.length; i++) {
        let celulaNoua = tabel.rows[i].insertCell(pozitie);
        celulaNoua.innerHTML = "Col Noua";
        celulaNoua.style.backgroundColor = culoare;
    }
}