// toggle info field of installer
let toggleBtns = document.getElementsByClassName('toggle')

for (var i = 0; i < toggleBtns.length; i++) {
    toggleBtns[i].addEventListener('click', toggle);
}

function toggle(evt) {
    evt.preventDefault();
    
    var infoEl = document.getElementById(evt.target.getAttribute('data-target'));

    if (infoEl.style.display === 'none' || !infoEl.style.display) {
        infoEl.style.display = 'block';
    } else {
        infoEl.style.display = 'none';
    }
}
