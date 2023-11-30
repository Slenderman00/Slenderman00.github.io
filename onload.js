

window.onload = function() {
    loadTimeline();
    loadBackground();

    //printing stuff
    window.old_print = window.print;
    window.print = function() {
        document.getElementById("github").innerHTML = "github.com/Slenderman00";

        window.old_print();
        window.location.reload();
    }
}