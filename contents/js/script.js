window.addEventListener("load", initPage);

changeContent('acasa');

function initPage() {
    setInterval(ceas, 1000);
}

async function changeContent(pathway, jscriptpath=null) {
    try {
        const response = await fetch("/" + pathway + ".html");
        
        if (!response.ok) {
            throw new Error("Pagina nu a fost gasita");
        }

        const html = await response.text();
        document.getElementById("contentx").innerHTML = html;
        
        if (pathway === "invat") {
            setTimeout(() => {
                incarcaInfoSistem();
                let canvas = document.getElementById("zonaDesen");
                if (canvas) canvas.addEventListener("mousedown", deseneazaDreptunghi);

                let btnRand = document.getElementById("btnRand");
                if (btnRand) btnRand.addEventListener("click", adaugaRand);

                let btnColoana = document.getElementById("btnColoana");
                if (btnColoana) btnColoana.addEventListener("click", adaugaColoana);
            }, 50);
        }

        if (jscriptpath) {
            let scriptId = "script-" + pathway;
            
            if (!document.getElementById(scriptId)) {
                var elementScript = document.createElement('script');
                elementScript.id = scriptId;
                elementScript.src = "/" + jscriptpath + ".js";
                document.body.appendChild(elementScript);
            } else {
                if (pathway === "cumparaturi" && typeof ShowcaseTable !== "undefined") {
                    setTimeout(() => {
                        showcase = new ShowcaseTable(5, 3, _itemsJsonCount);
                        shoppingCart.initStorage();
                    }, 50);
                }
            }
        }
    } 
    catch (error) {
        console.log("Eroare la incarcare:", error);
        document.getElementById("contentx").innerHTML = "Nu am gasit continutul.";
    }
}

function ceas() {
    let oraElement = document.getElementById("ora");
    if (oraElement) {
        oraElement.innerHTML = 
            "Ceas<br>"  + new Date().getHours() + ":" 
            + new Date().getMinutes() + ":" + new Date().getSeconds() + "<hr>";
    }
}

function incarcaInfoSistem() {
    let info = "Adresa URL: " + window.location.href + "<br>";
    info += "Browser: " + navigator.appName + " (" + navigator.appVersion + ")<br>";
    info += "Sistem Operare: " + navigator.platform + "<br>";
    
    let sysElement = document.getElementById("info-sistem");
    if (sysElement) {
        sysElement.innerHTML = info;
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                sysElement.innerHTML += 
                "<br>Locatie (Lat, Long): " + position.coords.latitude + ", " + position.coords.longitude;
            });
        }
    }
}

function deseneazaDreptunghi(event) {
    let isDrawing = false;
    let canvas = document.getElementById("zonaDesen");
    if (!canvas) return;
    let ctx = canvas.getContext("2d");
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    let startX, startY;

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
    if (!tabel) return;
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
    if (!tabel) return;
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

async function verificaLogin() {
    let numeIntrodus = document.getElementById("user").value;
    let parolaIntrodusa = document.getElementById("pswd").value;

    try {
        let response = await fetch("/resurse/utilizatori.json");
        let text = await response.text();
        let utilizatori = JSON.parse(text);
        
        let gasit = false;
        for (let i = 0; i < utilizatori.length; i++) {
            if (utilizatori[i].utilizator === numeIntrodus && utilizatori[i].parola === parolaIntrodusa) {
                gasit = true;
                break;
            }
        }
        
        let statusElement = document.getElementById("status");
        if (statusElement) {
            if (gasit) {
                statusElement.textContent = "Success!";
            } else {
                statusElement.textContent = "Eroare!";
            }
        }
        
    } catch (e) {
        console.log("Eroare la citire JSON:", e);
    }
}

async function trimiteInregistrare() {
    let nume = document.getElementById("username").value;
    let parola = document.getElementById("parola").value;
    
    let dateFormular = {
        utilizator: nume,
        parola: parola
    };
    
    await fetch("/api/utilizatori", {
        method: "POST",
        body: JSON.stringify(dateFormular)
    });
    
    alert("Utilizator inregistrat cu succes!");
    document.getElementById("username").value = "";
    document.getElementById("parola").value = "";
}