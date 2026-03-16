window.addEventListener("load", initPage)
function initPage()
{

}

function ceas()
{
    document.getElementById("ora").innerHTML = 
        "Ceas<br>"  + new Date().getHours() + ":" 
        + new Date().getMinutes() + ":" + new Date().getSeconds() + "<hr>";

}

setInterval(ceas,1000)