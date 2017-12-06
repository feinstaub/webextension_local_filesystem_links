// toggle info field of installer
document.getElementById('toggleInfo').addEventListener('click', toggle);

function toggle() {
    var infoEl = document.getElementById('info');

    if (infoEl.style.display === 'none' || !infoEl.style.display) {
        document.getElementById('info').style.display = 'block';
    } else {
        document.getElementById('info').style.display = 'none';
    }
}
