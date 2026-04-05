async function incarcaPersoane() {
    let container = document.getElementById("tabel-date");
    container.innerHTML = "<p class='loading'>Se incarca datele...</p>";

    try {
        let response = await fetch("/resurse/persoane.xml");
        let str = await response.text();
        
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(str, "text/xml");

        let table = "<table class='tabel-persoane'>";
        table += "<tr><th>ID</th><th>Nume</th><th>Prenume</th><th>Varsta</th><th>Adresa</th></tr>";

        let persoane = xmlDoc.getElementsByTagName("persoana");
        
        for (let i = 0; i < persoane.length; i++) {
            let id = persoane[i].getAttribute("id");
            let nume = persoane[i].getElementsByTagName("nume")[0].textContent;
            let prenume = persoane[i].getElementsByTagName("prenume")[0].textContent;
            let varsta = persoane[i].getElementsByTagName("varsta")[0].textContent;
            
            let strada = persoane[i].getElementsByTagName("strada")[0].textContent;
            let numar = persoane[i].getElementsByTagName("numar")[0].textContent;
            let localitate = persoane[i].getElementsByTagName("localitate")[0].textContent;
            
            let adresaCompleta = strada + " " + numar + ", " + localitate;

            table += "<tr><td>" + id + "</td><td>" + nume + "</td><td>" + prenume + "</td><td>" + varsta + "</td><td>" + adresaCompleta + "</td></tr>";
        }
        
        table += "</table>";
        container.innerHTML = table;
        
    } catch (error) {
        console.dir(error);
        container.innerHTML = "<p>Eroare la incarcare date.</p>";
    }
}

incarcaPersoane();